import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    /* 
      ================================================================
      DATA RETENTION LOGIC - ATS PIPELINE OVERHAUL V4
      ================================================================
      
      Requirements:
      1. Delete ANY job where `matched_status = 'rejected'` older than 7 days.
      2. Delete ANY job where `matched_status IS NULL` (pending) older than:
         - 7 days for Free tier users
         - 30 days for Premium users
      3. Jobs where `matched_status = 'approved'` (Applied/Interview/etc) are kept indefinitely.

      This logic will be executed via a pg_cron job calling this Edge Function daily.
    */

    // 1. Delete rejected jobs older than 7 days
    const { data: rejectedDeleted, error: rejectError } = await supabaseClient
      .from('job_matches')
      .delete()
      .eq('matched_status', 'rejected')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (rejectError) throw rejectError;

    // 2. Delete pending jobs for FREE users (older than 7 days)
    // First, we need to find free users
    const { data: freeUsers } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .neq('subscription_status', 'active');
      
    if (freeUsers && freeUsers.length > 0) {
      const freeUserIds = freeUsers.map(u => u.id);
      await supabaseClient
        .from('job_matches')
        .delete()
        .is('matched_status', null)
        .in('user_id', freeUserIds)
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    }

    // 3. Delete pending jobs for PREMIUM users (older than 30 days)
    const { data: premiumUsers } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .eq('subscription_status', 'active');

    if (premiumUsers && premiumUsers.length > 0) {
      const premiumUserIds = premiumUsers.map(u => u.id);
      await supabaseClient
        .from('job_matches')
        .delete()
        .is('matched_status', null)
        .in('user_id', premiumUserIds)
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    return new Response(
      JSON.stringify({ 
        message: 'Cleanup successful', 
        timestamp: new Date().toISOString() 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
