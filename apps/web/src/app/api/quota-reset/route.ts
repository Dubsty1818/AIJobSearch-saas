import { createSupabaseAdminClient } from '@/supabase-clients/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // Reset quota for active subscribers whose quota was last reset 7+ days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        monthly_quota: 500,
        quota_reset_at: new Date().toISOString(),
      })
      .eq('subscription_status', 'active')
      .lt('quota_reset_at', sevenDaysAgo.toISOString())
      .select('id');

    if (error) {
      console.error('Quota reset error:', error);
      return NextResponse.json(
        { error: 'Quota reset failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users_reset: data?.length || 0,
    });
  } catch (error) {
    console.error('Quota reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
