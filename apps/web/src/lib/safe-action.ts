import { createSupabaseClient } from '@/supabase-clients/server';
import { createSafeActionClient } from 'next-safe-action';
import 'server-only';

export const actionClient = createSafeActionClient().use(
  async ({ next }) => next()
);

export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return await next({
    ctx: {
      userId: user.id,
    },
  });
});
