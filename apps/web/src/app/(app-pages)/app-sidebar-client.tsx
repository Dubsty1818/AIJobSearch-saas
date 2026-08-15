'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { signOutAction } from "@/data/auth/sign-out";
import { User } from "@supabase/supabase-js";
import { ChevronUp, Home, Briefcase, Sliders, Settings, LogOut, Sparkles, Gauge, List, TrendingUp, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Progress } from "@/components/ui/progress";

const navigationItems: { title: string; url: string; icon: React.ElementType }[] = [
  {
    title: 'Find Jobs',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Job Matches',
    url: '/job-matches',
    icon: List,
  },
  {
    title: 'AI Score Rules',
    url: '/rules',
    icon: Sliders,
  },
  {
    title: 'Profile & Search',
    url: '/profile',
    icon: Briefcase,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

interface AppSidebarContentProps {
  user: User;
  remainingQuota?: number;
  subscriptionStatus?: string;
  role?: string;
}

export function AppSidebarContent({ user, remainingQuota = 500, subscriptionStatus = 'inactive', role = 'user' }: AppSidebarContentProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  const userEmail = user?.email || 'user@example.com';
  const userName = user?.user_metadata?.name || user.email?.split('@')[0];
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const maxQuota = subscriptionStatus === 'active' ? 500 : 50;
  const quotaPercent = Math.round((remainingQuota / maxQuota) * 100);

  return <><SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url}>
                    <Icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    {/* Quota Display */}
    <SidebarGroup>
      <SidebarGroupLabel>{subscriptionStatus === 'active' ? 'Monthly Quota' : 'Free Searches'}</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="px-2 py-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium">{remainingQuota} / {maxQuota}</span>
          </div>
          <Progress value={quotaPercent} className="h-1.5" />
          {subscriptionStatus === 'active' ? (
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <Sparkles className="h-3 w-3" />
              Pro Plan Active
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Gauge className="h-3 w-3" />
              No Active Plan
            </div>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? 'Signing out...' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </>

}
