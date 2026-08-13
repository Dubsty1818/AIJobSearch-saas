import { getUserProfile } from '@/data/user/profile';
import { getSearchHistory } from '@/data/user/search';
import { DashboardClientPage } from './DashboardClient';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const params = await searchParams;

  let profile;
  try {
    profile = await getUserProfile();
  } catch {
    // Profile might not exist yet (race condition with trigger)
    // Return a loading state
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  let searchHistory;
  try {
    searchHistory = await getSearchHistory();
  } catch {
    searchHistory = [];
  }

  // Determine initial wizard step from URL params
  let initialSetupStep: number | undefined;
  if (params.setup === 'continue') {
    initialSetupStep = 1; // Skip to CV step after payment
  } else if (params.setup === 'payment') {
    initialSetupStep = 0;
  }

  return (
    <DashboardClientPage
      profile={profile}
      searchHistory={searchHistory}
      initialSetupStep={initialSetupStep}
    />
  );
}
