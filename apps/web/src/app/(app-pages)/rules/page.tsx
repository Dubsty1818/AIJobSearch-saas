import { getUserProfile } from '@/data/user/profile';
import { RulesPageClient } from './RulesClient';
import { type Rule } from '@/components/rules/RulesConfigurator';

export default async function RulesPage() {
  const profile = await getUserProfile();
  const rules = (profile.custom_rules || []) as unknown as Rule[];

  return <RulesPageClient initialRules={rules} initialMaxScoreLimit={profile.max_score_limit || 10} />;
}
