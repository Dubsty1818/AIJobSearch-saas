import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export const maxDuration = 300; // Extend Vercel timeout to 300s

const ScoringSchema = z.object({
  score: z.number(),
  reasoning: z.string(),
  analysis: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { search_keywords, search_limit = 10 } = body;
    const limit = search_limit;

    if (!search_keywords || typeof search_keywords !== 'string') {
      return NextResponse.json(
        { error: 'Search keywords are required' },
        { status: 400 }
      );
    }

    // Fetch user profile for validation
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Validate CV
    if (!profile.cv_text || profile.cv_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'CV text is empty. Please add your CV first.' },
        { status: 400 }
      );
    }

    // Validate rules
    const rules = (profile.custom_rules as Array<{ text: string; value: number }>) || [];
    const maxScoreLimit = profile.max_score_limit || 10;

    // Validate quota
    const freeSearches = profile.free_searches_remaining || 0;
    const monthlyQuota = profile.monthly_quota || 0;

    let quotaTypeToDeduct: 'free_searches_remaining' | 'monthly_quota' = 'free_searches_remaining';

    if (freeSearches <= 0) {
      if (monthlyQuota <= 0) {
        return NextResponse.json(
          { error: 'Search quota exhausted. Please upgrade to continue.' },
          { status: 403 }
        );
      }
      quotaTypeToDeduct = 'monthly_quota';
    }

    // --- STEP 1: Smart Queue Check DB ---
    const { data: dbJobs, error: dbError } = await supabase
      .from('job_matches')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .not('job_description', 'is', null)
      .limit(limit);

    if (dbError) {
      console.error("Error fetching db jobs:", dbError);
    }

    let jobsToProcess: any[] = dbJobs || [];
    const needed = limit - jobsToProcess.length;
    let totalJobsFound = jobsToProcess.length;

    // --- STEP 2 & 3: Fetch from API if needed & Filter strictly ---
    if (needed > 0) {
      const queryTerms = search_keywords;
      const numPages = Math.max(1, Math.ceil(needed / 10));

      const jsearchUrl = new URL('https://api.openwebninja.com/jsearch/search-v2');
      jsearchUrl.searchParams.append('query', queryTerms);
      jsearchUrl.searchParams.append('num_pages', numPages.toString());
      jsearchUrl.searchParams.append('date_posted', 'month');
      jsearchUrl.searchParams.append('country', 'de');
      jsearchUrl.searchParams.append('language', 'de');

      // ===== LOG REQUEST DETAILS =====
      console.log('\n========== JSEARCH REQUEST ==========');
      console.log(`[JSearch] Keywords: "${queryTerms}"`);
      console.log(`[JSearch] Requested limit: ${limit}, Pending in DB: ${jobsToProcess.length}, Needed from API: ${needed}`);
      console.log(`[JSearch] num_pages: ${numPages}`);
      console.log(`[JSearch] Full URL: ${jsearchUrl.toString()}`);
      console.log('=====================================\n');

      const getResponse = await fetch(jsearchUrl.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': process.env.RAPIDAPI_KEY || '',
        }
      });

      if (!getResponse.ok) {
        const errBody = await getResponse.text();
        console.error("[JSearch] API FAILED:", getResponse.status, errBody);
        throw new Error("Failed to fetch jobs from JSearch");
      }

      const getResult = await getResponse.json();
      const jobItems = getResult.data?.jobs || [];
      totalJobsFound += jobItems.length;

      // ===== RAW JSEARCH LOGGING =====
      console.log('\n========== JSEARCH RAW RESPONSE ==========');
      console.log(`[JSearch] Status: ${getResult.status}`);
      console.log(`[JSearch] Total jobs returned: ${jobItems.length}`);
      jobItems.forEach((job: any, idx: number) => {
        console.log(`  [${idx + 1}] "${job.job_title}" @ ${job.employer_name} | URL: ${job.job_apply_link || job.job_google_link || 'N/A'} | Desc length: ${job.job_description?.length || 0}`);
      });
      console.log('==========================================\n');

      // Filter out empty descriptions
      const validJobItems = jobItems.filter((job: any) => 
        job.job_description && 
        typeof job.job_description === 'string' && 
        job.job_description.trim() !== ''
      );
      console.log(`[JSearch] After filtering empty descriptions: ${validJobItems.length} valid jobs`);

      const topJobs = validJobItems.slice(0, needed);

      // --- STEP 3.5: Deduplicate against existing DB records by URL ---
      const candidateUrls = topJobs
        .map((job: any) => job.job_apply_link || job.job_google_link || '')
        .filter((url: string) => url.length > 0);

      let existingUrls = new Set<string>();
      if (candidateUrls.length > 0) {
        const { data: existingJobs } = await supabase
          .from('job_matches')
          .select('url')
          .eq('user_id', user.id)
          .in('url', candidateUrls);

        existingUrls = new Set((existingJobs || []).map((j: any) => j.url));
        console.log(`[Dedup] Found ${existingUrls.size} existing URLs out of ${candidateUrls.length} candidates`);
      }

      const newJobs = topJobs.filter((job: any) => {
        const url = job.job_apply_link || job.job_google_link || '';
        return url.length > 0 && !existingUrls.has(url);
      });
      console.log(`[Dedup] ${topJobs.length - newJobs.length} duplicates skipped, ${newJobs.length} new jobs to insert`);

      // --- STEP 4: Save valid NEW jobs to Supabase with status 'pending' ---
      for (const job of newJobs) {
        const { data: inserted, error: insertError } = await supabase
          .from('job_matches')
          .insert({
            user_id: user.id,
            search_keywords,
            platform: "JSearch",
            url: job.job_apply_link || job.job_google_link || "",
            job_title: job.job_title || "Unknown Title",
            job_description: job.job_description,
            company_name: job.employer_name || "Unknown Company",
            date: job.job_posted_at_datetime_utc || new Date().toISOString(),
            location: job.job_city || job.job_country || "Unknown Location",
            expected_salary: job.job_min_salary ? `${job.job_min_salary} - ${job.job_max_salary}` : null,
            employer_image_url: job.employer_logo || null,
            contract_type: job.job_employment_type || null,
            time_ago: job.job_posted_at || null,
            score: null,
            reasoning: null,
            analysis: null,
            min_salary: job.job_min_salary || null,
            max_salary: job.job_max_salary || null,
            salary_period: job.job_salary_period || null,
            job_publisher: job.job_publisher || null,
            is_remote: job.job_is_remote || false,
            job_benefits: job.job_benefits || null,
            status: 'pending'
          })
          .select('*')
          .single();
          
        if (insertError) {
          console.error("[Insert] Error for job:", job.job_title, insertError);
        } else if (inserted) {
          console.log(`[Insert] ✓ Inserted: "${inserted.job_title}" (${inserted.id})`);
          jobsToProcess.push(inserted);
        }
      }
    }

    if (jobsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No job results found.' },
        { status: 404 }
      );
    }

    // 4. Process jobs sequentially for AI Scoring in the background
    const processJobs = async () => {
      let successfulScoresCount = 0;

      // Bulk update all jobs to 'processing' so they appear in the UI immediately
      if (jobsToProcess.length > 0) {
        const jobIds = jobsToProcess.map(j => j.id);
        await supabase
          .from('job_matches')
          .update({ status: 'processing' })
          .in('id', jobIds);
      }

      for (let i = 0; i < jobsToProcess.length; i++) {
        const job = jobsToProcess[i];

        try {
          const systemPrompt = `You're an intelligent bot rating how closely a job listing is to a candidates skill set, on a score of ${maxScoreLimit}. Please add up all the points and create a total out of ${maxScoreLimit}.

Here are the user's custom scoring rules:
${rules.map((r, idx) => `${String.fromCharCode(97 + idx)}) ${r.value > 0 ? '+' : ''}${r.value} points: ${r.text}`).join('\n')}

Calculate the reasoning step by step, then output the score, reasoning, and analysis.`;

          const userPrompt = `Here's the job listing details:
Job Title: ${job.job_title}
Company: ${job.company_name}
Salary: ${job.job_min_salary ? `${job.job_min_salary} - ${job.job_max_salary}` : 'Not provided'}
Location: ${job.job_city || job.job_country || 'Unknown'}
Job type/term: ${job.contract_type || 'Unknown'}
Job Description:
${job.job_description}

Here is the candidates skill set:
${profile.cv_text}`;

          const completion = await openai.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: zodResponseFormat(ScoringSchema, "scoring"),
          });

          const parsed = completion.choices[0].message.parsed;

          if (parsed) {
            // Update existing job match
            const { error: updateError } = await supabase
              .from('job_matches')
              .update({
                score: parsed.score,
                reasoning: parsed.reasoning,
                analysis: parsed.analysis,
                status: 'completed'
              })
              .eq('id', job.id);
              
            if (!updateError) {
               successfulScoresCount++;
            } else {
               console.error("Update error for job:", updateError);
            }
          }
        } catch (err) {
          console.error("AI scoring failed for job index", i, err);
          // Revert to pending on failure
          await supabase
            .from('job_matches')
            .update({ status: 'pending' })
            .eq('id', job.id);
        }

        // 10-second delay between jobs, except for the last one
        if (i < jobsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      // 5. Exact Quota & Deduction Math at the end of background processing
      if (successfulScoresCount > 0) {
        if (quotaTypeToDeduct === 'free_searches_remaining') {
          // Robust DB count for Free users
          const FREE_TIER_LIMIT = 5000;
          const { count, error: countError } = await supabase
            .from('job_matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('score', 'is', null);
            
          if (!countError && count !== null) {
            const newQuotaValue = Math.max(0, FREE_TIER_LIMIT - count);
            const { error: quotaError } = await supabase
              .from('user_profiles')
              .update({ free_searches_remaining: newQuotaValue })
              .eq('id', user.id);
            if (quotaError) console.error('Quota deduction error:', quotaError);
          }
        } else {
          // Robust DB count for Pro users
          const startOfCycle = profile.quota_reset_at ? new Date(profile.quota_reset_at) : new Date();
          startOfCycle.setMonth(startOfCycle.getMonth() - 1);
          
          const { count, error: countError } = await supabase
            .from('job_matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('score', 'is', null)
            .gte('created_at', startOfCycle.toISOString());
            
          if (!countError && count !== null) {
            const monthlyLimit = 500; // Standard Pro Limit
            const newQuotaValue = Math.max(0, monthlyLimit - count);
            const { error: quotaError } = await supabase
              .from('user_profiles')
              .update({ monthly_quota: newQuotaValue })
              .eq('id', user.id);
            if (quotaError) console.error('Quota deduction error:', quotaError);
          }
        }
      }
    };

    // Record search history
    await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        keywords: search_keywords,
        search_limit: limit,
      });

    // Start background processing without awaiting
    processJobs().catch(console.error);

    return NextResponse.json({
      success: true,
      jobCount: jobsToProcess.length, // The number of actual new/pending jobs we'll score
      totalJobsFound: totalJobsFound, // The number of raw jobs found (e.g. from JSearch)
      message: `Found ${jobsToProcess.length} jobs. Scoring in progress...`
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search request failed' },
      { status: 500 }
    );
  }
}
