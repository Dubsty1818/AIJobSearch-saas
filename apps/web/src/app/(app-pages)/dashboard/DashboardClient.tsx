'use client';

import { useState, useEffect } from 'react';
import { SearchControls } from '@/components/dashboard/SearchControls';
import { JobMatchesTable } from '@/components/dashboard/JobMatchesTable';
import { SetupWizard } from '@/components/setup-wizard/SetupWizard';
import { useRealtimeJobMatches } from '@/hooks/useRealtimeJobMatches';
import { SearchProgressTracker, type SearchProgressData } from '@/components/dashboard/SearchProgressTracker';
import { Loader2, Wifi, WifiOff, BarChart3, TrendingUp, Target } from 'lucide-react';
import type { Rule } from '@/components/rules/RulesConfigurator';
import { createClient } from '@/supabase-clients/client';
import { useTranslations } from 'next-intl';

interface UserProfile {
  id: string;
  cv_text: string;
  custom_rules: Rule[];
  target_keywords: string;
  subscription_status: string;
  setup_completed: boolean;
  monthly_quota: number;
  free_searches_remaining: number;
}

interface DashboardClientPageProps {
  profile: UserProfile;
  searchHistory: Array<{ id: string; keywords: string; created_at: string }>;
  initialSetupStep?: number;
}

export function DashboardClientPage({
  profile: initialProfile,
  searchHistory,
  initialSetupStep,
}: DashboardClientPageProps) {
  const t = useTranslations('Dashboard');
  const [profile, setProfile] = useState(initialProfile);
  const [searchProgress, setSearchProgress] = useState<SearchProgressData>({
    phase: 'idle',
    totalJobs: 0,
    rawJobsFound: 0,
    scoredJobs: 0
  });
  const { matches, isConnected, newMatchIds, refresh } = useRealtimeJobMatches(
    profile.id
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('public:user_profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `id=eq.${profile.id}` },
        (payload) => {
          setProfile((prev) => ({
            ...prev,
            monthly_quota: payload.new.monthly_quota,
            free_searches_remaining: payload.new.free_searches_remaining,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  const handleSearchStarted = () => {
    setSearchProgress({ phase: 'searching', totalJobs: 0, rawJobsFound: 0, scoredJobs: 0 });
  };

  const handleSearchComplete = (jobCount: number, rawJobsFound: number) => {
    setSearchProgress(prev => ({ ...prev, phase: 'found', totalJobs: jobCount, rawJobsFound: rawJobsFound }));
    // Safety timeout to avoid getting stuck if no jobs arrive
    setTimeout(() => {
      setSearchProgress(prev => (prev.phase !== 'idle' ? { ...prev, phase: 'idle' } : prev));
    }, 300_000);
  };

  const handleSearchError = (errorMsg: string) => {
    setSearchProgress(prev => ({ ...prev, phase: 'error', errorMessage: errorMsg }));
    setTimeout(() => {
      setSearchProgress(prev => ({ ...prev, phase: 'idle' }));
    }, 5000);
  };

  // Poll for new matches every 3 seconds while a search is active
  useEffect(() => {
    if (searchProgress.phase === 'idle' || searchProgress.phase === 'done' || searchProgress.phase === 'error') return;
    const interval = setInterval(() => {
      refresh();
    }, 3000);
    return () => clearInterval(interval);
  }, [searchProgress.phase, refresh]);

  // Auto-resume search progress if user refreshes the page mid-loading
  useEffect(() => {
    if (searchProgress.phase !== 'idle' || matches.length === 0) return;
    
    const activeJobs = matches.filter(m => m.status === 'processing' || m.status === 'pending').length;
    if (activeJobs > 0) {
      setSearchProgress({
        phase: 'scoring',
        totalJobs: activeJobs,
        rawJobsFound: activeJobs,
        scoredJobs: 0
      });
    }
  }, [matches, searchProgress.phase]);

  // Derive scoring progress from matches array
  useEffect(() => {
    if (searchProgress.phase === 'idle' || searchProgress.phase === 'error' || searchProgress.phase === 'searching') return;

    const activeJobs = matches.filter(m => m.status === 'processing' || m.status === 'pending').length;
    
    if (searchProgress.phase === 'found' && activeJobs > 0) {
      setSearchProgress(prev => ({ ...prev, phase: 'scoring' }));
    }

    if (searchProgress.phase === 'scoring') {
      const scoredJobs = Math.max(0, searchProgress.totalJobs - activeJobs);
      
      setSearchProgress(prev => {
        if (prev.scoredJobs !== scoredJobs) {
          return { ...prev, scoredJobs };
        }
        return prev;
      });

      // Auto-stop when all done
      if (activeJobs === 0 && searchProgress.totalJobs > 0) {
        setSearchProgress(prev => ({ ...prev, phase: 'done', scoredJobs: prev.totalJobs }));
        setTimeout(() => {
          setSearchProgress(prev => ({ ...prev, phase: 'idle' }));
        }, 4000); // Wait 4 seconds to read the success message
      }
    }
  }, [matches, searchProgress.phase, searchProgress.totalJobs]);

  const handleSetupComplete = () => {
    setProfile((prev) => ({ ...prev, setup_completed: true }));
    window.location.reload();
  };

  const isPro = profile.subscription_status === 'active';
  const remainingQuota = isPro ? profile.monthly_quota : profile.free_searches_remaining;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full overflow-x-hidden">
      {/* Setup Wizard */}
      {!profile.setup_completed && (
        <SetupWizard
          profile={profile}
          initialStep={initialSetupStep}
          onComplete={handleSetupComplete}
        />
      )}

      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle')}
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
              <Wifi className="h-3.5 w-3.5" />
              {t('live')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" />
              {t('connecting')}
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{matches.length}</p>
            <p className="text-xs text-muted-foreground">{t('totalMatches')}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {matches.filter(m => m.score !== null).length > 0
                ? (matches.filter(m => m.score !== null).reduce((s, m) => s + (m.score || 0), 0) / matches.filter(m => m.score !== null).length).toFixed(1)
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">{t('avgScore')}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
            <Target className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{remainingQuota}</p>
            <p className="text-xs text-muted-foreground">{isPro ? t('monthlyQuotaLeft') : t('freeSearchesLeft')}</p>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <SearchControls
        remainingQuota={remainingQuota}
        searchHistory={searchHistory}
        onSearchStarted={handleSearchStarted}
        onSearchComplete={handleSearchComplete}
        onSearchError={handleSearchError}
        initialKeywords={profile.target_keywords || searchHistory[0]?.keywords || ''}
        isSearchActive={searchProgress.phase !== 'idle'}
      />

      {/* Unified Search Progress Tracker */}
      <SearchProgressTracker progress={searchProgress} />

      {/* Job Matches Table */}
      <JobMatchesTable matches={matches} newMatchIds={newMatchIds} />
    </div>
  );
}
