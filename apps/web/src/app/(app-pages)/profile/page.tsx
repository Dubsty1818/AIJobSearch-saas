import { getUserProfile } from '@/data/user/profile';
import { ProfileClient } from './ProfileClient';

export default async function ProfilePage() {
  const profile = await getUserProfile();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Search Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your CV and the target keywords used to match jobs.
        </p>
      </div>

      <ProfileClient 
        initialCvText={profile.cv_text || ''} 
        initialKeywords={profile.target_keywords || ''} 
      />
    </div>
  );
}
