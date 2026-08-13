import { getUserProfile } from '@/data/user/profile';
import { SettingsClientPage } from './SettingsClient';

export default async function SettingsPage() {
  const profile = await getUserProfile();

  return <SettingsClientPage initialProfile={profile} />;
}
