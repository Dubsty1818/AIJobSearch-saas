'use client';

import { useState } from 'react';
import { PaymentStep } from '@/components/setup-wizard/PaymentStep';
import { Settings, CreditCard, Sliders, Globe, Palette, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/data/auth/sign-out';
import { useTransition } from 'react';


interface SettingsClientPageProps {
  initialProfile: {
    id: string;
    subscription_status: string;
  };
}

export function SettingsClientPage({ initialProfile }: SettingsClientPageProps) {
  const [profile] = useState(initialProfile);
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();


  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }


  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account preferences and billing.
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Billing
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 rounded-xl border bg-card p-6">
          <TabsContent value="preferences" className="mt-0 space-y-8">
            
            {/* Theme Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Appearance
                </h3>
                <p className="text-muted-foreground text-sm">
                  Customize how the application looks on your device.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  onClick={() => setTheme('light')}
                  className="w-32"
                >
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  onClick={() => setTheme('dark')}
                  className="w-32"
                >
                  Dark
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  onClick={() => setTheme('system')}
                  className="w-32"
                >
                  System
                </Button>
              </div>
            </div>



            <div className="pt-6 border-t">
              <Button variant="destructive" onClick={handleSignOut} disabled={isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? '...' : 'Sign Out'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-6">
                <div>
                  <h3 className="font-semibold text-lg">Subscription Status</h3>
                  <p className="text-muted-foreground text-sm">
                    Current plan and usage limits.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    profile.subscription_status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {profile.subscription_status.toUpperCase()}
                  </span>
                </div>
              </div>

              <PaymentStep
                isActive={profile.subscription_status === 'active'}
                onFinish={() => {}}
                isSaving={false}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
