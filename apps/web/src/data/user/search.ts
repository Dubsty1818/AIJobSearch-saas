'use server';

import { createSupabaseClient } from '@/supabase-clients/server';

// ── Fetch Search History ────────────────────────────────────

export async function getSearchHistory() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message || 'Unknown error');
  return data;
}

// ── Fetch Job Matches ───────────────────────────────────────

export async function getJobMatches(searchKeywords?: string) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('job_matches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (searchKeywords) {
    query = query.eq('search_keywords', searchKeywords);
  }

  const { data, error } = await query.limit(500);

  if (error) throw new Error(error.message || 'Unknown error');
  return data;
}

// ── Delete Job Matches ──────────────────────────────────────

export async function deleteJobMatches(ids: string[]) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('job_matches')
    .delete()
    .eq('user_id', user.id)
    .in('id', ids);

  if (error) throw new Error(error.message || 'Unknown error');
  return { success: true };
}
