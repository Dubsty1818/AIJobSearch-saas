import { getJobMatches } from '@/data/user/search';
import { getUserProfile } from '@/data/user/profile';
import { JobMatchesPageClient } from './JobMatchesClient';

export default async function JobMatchesPage() {
  const profile = await getUserProfile();
  const matches = await getJobMatches();

  return <JobMatchesPageClient profile={profile} initialMatches={matches} />;
}
