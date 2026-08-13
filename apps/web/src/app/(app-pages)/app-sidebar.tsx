
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { createSupabaseClient } from '@/supabase-clients/server';
import {
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AppSidebarContent } from './app-sidebar-client';



async function SidebarHeaderContent() {
  return <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Sparkles className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">JobMatchAI</span>
              <span className="truncate text-xs text-muted-foreground">
                AI Job Matcher
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>

}



async function SidebarContentWrapper() {
  const { user } = await getCachedLoggedInVerifiedSupabaseUser();

  // Fetch user profile for quota display
  let remainingQuota = 500;
  let subscriptionStatus = 'inactive';
  try {
    const supabase = await createSupabaseClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('monthly_quota, free_searches_remaining, subscription_status')
      .eq('id', user.id)
      .single();

    if (profile) {
      subscriptionStatus = profile.subscription_status;
      remainingQuota = subscriptionStatus === 'active' ? profile.monthly_quota : (profile.free_searches_remaining || 0);
    }
  } catch {
    // Profile may not exist yet
  }

  return <AppSidebarContent user={user} remainingQuota={remainingQuota} subscriptionStatus={subscriptionStatus} />
}


export async function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeaderContent />
      <Suspense fallback={null}>
        <SidebarContentWrapper />
      </Suspense>
    </Sidebar>
  );
}
