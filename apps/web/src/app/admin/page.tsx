import { createSupabaseClient } from '@/supabase-clients/server';
import { AdminDashboardClient } from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseClient();

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [
    { count: totalUsers },
    { data: activeUsers },
    { data: dailyMetrics },
    { data: allMatches }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('daily_active_users').select('user_id').gte('date', yesterday),
    supabase.from('daily_metrics').select('*').gte('date', sevenDaysAgo),
    supabase.from('job_matches').select('matched_status, application_status')
  ]);

  // DAU calculation
  const uniqueUsers = new Set((activeUsers || []).map(e => e.user_id));
  const dau = uniqueUsers.size;

  // Search Velocity (Last 7 Days)
  const velocityMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    velocityMap[d] = 0;
  }
  
  let totalWizardCompletions = 0;
  dailyMetrics?.forEach(m => {
    // Parse Postgres date output (YYYY-MM-DD)
    const [year, month, day] = m.date.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (velocityMap[d] !== undefined) {
      velocityMap[d] += (m.searches_run || 0);
    }
    totalWizardCompletions += (m.wizard_completions || 0);
  });
  
  const searchVelocity = Object.entries(velocityMap).map(([date, count]) => ({ date, count }));

  // Match vs Reject Ratio
  const matchCount = { Approved: 0, Rejected: 0, Pending: 0 };
  let totalApproved = 0;
  const pipelineCount = { Applied: 0, Interview: 0, Offer: 0 };

  allMatches?.forEach(m => {
    if (m.matched_status === 'approved') {
      matchCount.Approved++;
      totalApproved++;
      // Pipeline metrics
      if (m.application_status === 'applied') pipelineCount.Applied++;
      else if (m.application_status === 'interview' || m.application_status === 'interview_2') pipelineCount.Interview++;
      else if (m.application_status === 'offer') pipelineCount.Offer++;
    }
    else if (m.matched_status === 'rejected') matchCount.Rejected++;
    else matchCount.Pending++;
  });

  const matchRatio = [
    { status: 'Approved', count: matchCount.Approved },
    { status: 'Rejected', count: matchCount.Rejected },
    { status: 'Pending', count: matchCount.Pending }
  ].filter(x => x.count > 0);

  const funnel = [
    { stage: 'Approved', value: totalApproved },
    { stage: 'Applied', value: pipelineCount.Applied },
    { stage: 'Interview', value: pipelineCount.Interview },
    { stage: 'Offer', value: pipelineCount.Offer }
  ];

  const wizardRate = (totalUsers && totalUsers > 0) ? (totalWizardCompletions / totalUsers) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Engine</h1>
        <p className="text-muted-foreground mt-2">
          Internal tracking of SaaS growth, search velocity, and conversion pipelines.
        </p>
      </div>

      <AdminDashboardClient 
        metrics={{
          totalUsers: totalUsers || 0,
          dau,
          wizardCompletionRate: wizardRate
        }}
        charts={{
          searchVelocity,
          matchRatio,
          funnel
        }}
      />
    </div>
  );
}
