'use client';

import { JobMatchesTable } from '@/components/dashboard/JobMatchesTable';
import { useRealtimeJobMatches, type JobMatch } from '@/hooks/useRealtimeJobMatches';
import { Briefcase, Wifi, WifiOff } from 'lucide-react';

interface JobMatchesPageClientProps {
  profile: { id: string };
  initialMatches: JobMatch[];
}

export function JobMatchesPageClient({ profile, initialMatches }: JobMatchesPageClientProps) {
  const { matches, isConnected, newMatchIds } = useRealtimeJobMatches(profile.id);

  // Use realtime matches if available, else initial
  const displayMatches = matches.length > 0 ? matches : initialMatches;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
            <p className="text-muted-foreground text-sm">
              {displayMatches.length} total matches
            </p>
          </div>
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-500">
            <Wifi className="h-3.5 w-3.5" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            Connecting...
          </span>
        )}
      </div>

      <JobMatchesTable matches={displayMatches} newMatchIds={newMatchIds} />
    </div>
  );
}
