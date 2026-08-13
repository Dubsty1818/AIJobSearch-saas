'use client';

import { useState } from 'react';
import { PaymentStep } from '@/components/setup-wizard/PaymentStep';
import { Settings, CreditCard, Sliders, Globe, Palette, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/data/auth/sign-out';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

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
  const [language, setLanguage] = useState(
    typeof document !== 'undefined' 
      ? document.cookie.includes('NEXT_LOCALE=de') ? 'de' : 'en'
      : 'en'
  );
  
  const t = useTranslations('Settings');

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
          <Settings className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('description')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" /> {t('preferences')}
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> {t('billing')}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 rounded-xl border bg-card p-6">
          <TabsContent value="preferences" className="mt-0 space-y-8">
            
            {/* Theme Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  {t('appearance')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('appearanceDesc')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  onClick={() => setTheme('light')}
                  className="w-32"
                >
                  {t('lightMode')}
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  onClick={() => setTheme('dark')}
                  className="w-32"
                >
                  {t('darkMode')}
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  onClick={() => setTheme('system')}
                  className="w-32"
                >
                  {t('system')}
                </Button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('language')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('languageDesc')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant={language === 'en' ? 'default' : 'outline'} 
                  onClick={() => handleLanguageChange('en')}
                  className="w-32"
                >
                  {t('english')}
                </Button>
                <Button 
                  variant={language === 'de' ? 'default' : 'outline'} 
                  onClick={() => handleLanguageChange('de')}
                  className="w-32"
                >
                  {t('german')}
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button variant="destructive" onClick={handleSignOut} disabled={isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? '...' : t('signOut')}
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
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
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
