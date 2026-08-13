'use client';

import { useCallback, useState } from 'react';
import { RulesConfigurator, type Rule } from '@/components/rules/RulesConfigurator';
import { updateCustomRulesAction, updateMaxScoreLimitAction } from '@/data/user/profile';
import { Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { ContextualSidebar } from '@/components/dashboard/ContextualSidebar';

interface RulesPageClientProps {
  initialRules: Rule[];
  initialMaxScoreLimit: number;
}

export function RulesPageClient({ initialRules, initialMaxScoreLimit }: RulesPageClientProps) {
  const t = useTranslations('RulesConfigurator');
  const [maxScoreLimit, setMaxScoreLimit] = useState(initialMaxScoreLimit);

  const handleRulesChange = useCallback(async (rules: Rule[]) => {
    try {
      await updateCustomRulesAction({ rules });
      toast.success('Rules saved');
    } catch {
      toast.error('Failed to save rules');
    }
  }, []);

  const handleMaxScoreLimitChange = useCallback(async (limit: number) => {
    setMaxScoreLimit(limit);
    try {
      await updateMaxScoreLimitAction({ limit });
      toast.success('Max score limit updated');
    } catch {
      toast.error('Failed to update limit');
      setMaxScoreLimit(maxScoreLimit); // Revert on failure
    }
  }, [maxScoreLimit]);

  const sidebarItems = [
    {
      title: t('examplesTitle'),
      type: 'tip' as const,
      content: t('examplesContent')
    },
    {
      title: t('conflictTitle'),
      type: 'warning' as const,
      content: t('conflictContent')
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
            <Sliders className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6">
          <RulesConfigurator
            initialRules={initialRules}
            onRulesChange={handleRulesChange}
            maxScoreLimit={maxScoreLimit}
            onMaxScoreLimitChange={handleMaxScoreLimitChange}
          />
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <ContextualSidebar items={sidebarItems} />
      </div>
      </div>
    </div>
  );
}
