'use client';

import { useCallback, useState } from 'react';
import { RulesConfigurator, type Rule } from '@/components/rules/RulesConfigurator';
import { updateCustomRulesAction, updateMaxScoreLimitAction } from '@/data/user/profile';
import { Sliders } from 'lucide-react';
import { toast } from 'sonner';


import { ContextualSidebar } from '@/components/dashboard/ContextualSidebar';
import { createClient } from '@/supabase-clients/client';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface RulesPageClientProps {
  initialRules: Rule[];
  initialMaxScoreLimit: number;
}

export function RulesPageClient({ initialRules, initialMaxScoreLimit }: RulesPageClientProps) {
  const [maxScoreLimit, setMaxScoreLimit] = useState(initialMaxScoreLimit);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const checkActiveSearch = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { count } = await supabase
      .from('job_matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing']);
    return (count || 0) > 0;
  };

  const handleRulesChange = useCallback(async (rules: Rule[]) => {
    if (await checkActiveSearch()) {
      toast.error('Search is actively running. Please wait until it finishes.', { duration: 4000 });
      return;
    }
    setSaveStatus('saving');
    try {
      await updateCustomRulesAction({ rules });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      toast.error('Failed to save rules');
    }
  }, []);

  const handleMaxScoreLimitChange = useCallback(async (limit: number) => {
    if (await checkActiveSearch()) {
      toast.error('Search is actively running. Please wait until it finishes.', { duration: 4000 });
      return;
    }
    setMaxScoreLimit(limit);
    setSaveStatus('saving');
    try {
      await updateMaxScoreLimitAction({ limit });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      toast.error('Failed to update limit');
      setMaxScoreLimit(maxScoreLimit); // Revert on failure
    }
  }, [maxScoreLimit]);

  const sidebarItems = [
    {
      title: 'Examples',
      type: 'tip' as const,
      content: 'E.g. Must have Next.js experience (+3), No remote work (-5)'
    },
    {
      title: 'Conflicts',
      type: 'warning' as const,
      content: 'Avoid creating rules that contradict each other.'
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
            <Sliders className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scoring Rules</h1>
            <p className="text-muted-foreground text-sm">
              Define how the AI should score and rank job matches.
            </p>
          </div>
        </div>
        
        {/* Subtle Save Indicator */}
        <div className="flex items-center justify-end min-w-[100px] h-10">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-500 transition-opacity duration-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
      <div className="lg:col-span-3 rounded-xl border shadow-sm bg-card p-6">
        <RulesConfigurator
          initialRules={initialRules}
          onRulesChange={handleRulesChange}
          maxScoreLimit={maxScoreLimit}
          onMaxScoreLimitChange={handleMaxScoreLimitChange}
        />
      </div>
      
      <div className="lg:col-span-1">
        <ContextualSidebar items={sidebarItems} />
      </div>
      </div>
    </div>
  );
}
