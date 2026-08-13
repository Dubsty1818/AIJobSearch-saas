'use client';

import { Loader2, CheckCircle2, Sparkles, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export type SearchPhase = 'idle' | 'searching' | 'found' | 'scoring' | 'done' | 'error';

export interface SearchProgressData {
  phase: SearchPhase;
  totalJobs: number; // New jobs to score
  rawJobsFound: number; // Jobs returned from JSearch
  scoredJobs: number;
  errorMessage?: string;
}

interface SearchProgressTrackerProps {
  progress: SearchProgressData;
}

export function SearchProgressTracker({ progress }: SearchProgressTrackerProps) {
  if (progress.phase === 'idle') return null;

  const { phase, totalJobs, rawJobsFound, scoredJobs, errorMessage } = progress;

  let icon = <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />;
  let title = 'Searching...';
  let message = 'Connecting to JSearch...';
  let progressValue = 0;
  let isIndeterminate = false;

  if (phase === 'error') {
    icon = <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center"><span className="text-red-500 text-xs font-bold">!</span></div>;
    title = 'Search Failed';
    message = errorMessage || 'An unexpected error occurred.';
    progressValue = 100;
  } else if (phase === 'searching') {
    icon = <Search className="h-5 w-5 text-indigo-500 animate-pulse" />;
    title = 'Searching for jobs...';
    message = 'Querying OpenWeb Ninja API';
    isIndeterminate = true;
  } else if (phase === 'found') {
    icon = <Sparkles className="h-5 w-5 text-amber-500" />;
    title = `${rawJobsFound} jobs found`;
    message = `${totalJobs} new jobs to score with AI...`;
    progressValue = 0;
  } else if (phase === 'scoring') {
    icon = <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />;
    title = `Scoring ${scoredJobs}/${totalJobs} new jobs...`;
    message = 'Evaluating against your profile';
    progressValue = totalJobs > 0 ? (scoredJobs / totalJobs) * 100 : 0;
  } else if (phase === 'done') {
    icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    title = 'Complete!';
    message = `Successfully scored ${totalJobs} jobs.`;
    progressValue = 100;
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
      
      <div className="w-full relative h-2">
        {isIndeterminate ? (
          <div className="absolute inset-0 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/50">
            <div className="h-full bg-indigo-500 animate-[indeterminate_1.5s_infinite_linear] rounded-full w-1/3" />
          </div>
        ) : (
          <Progress 
            value={progressValue} 
            className="h-2 transition-all duration-500 ease-in-out" 
          />
        )}
      </div>
    </div>
  );
}
