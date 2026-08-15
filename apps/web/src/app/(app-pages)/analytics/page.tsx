import { getCachedIsUserLoggedIn, getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const isLoggedIn = await getCachedIsUserLoggedIn();
  if (!isLoggedIn) {
    redirect('/login');
  }

  const { user } = await getCachedLoggedInVerifiedSupabaseUser();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground mt-2">
          Gain deeper insights into your job search and application pipeline.
        </p>
      </div>
      
      <AnalyticsClient userId={user.id} />
    </div>
  );
}
