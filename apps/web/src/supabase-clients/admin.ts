import { createClient } from '@supabase/supabase-js';
import 'server-only';

/**
 * Creates a Supabase admin client using the service role key.
 * This bypasses RLS — use only for webhook handlers and cron jobs.
 */
export const createSupabaseAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
