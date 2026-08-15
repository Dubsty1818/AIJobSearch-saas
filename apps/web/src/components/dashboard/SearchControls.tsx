'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Sparkles, Search, Clock } from 'lucide-react';

import { toast } from 'sonner';
import { TagInput } from '@/components/ui/tag-input';
import { incrementDailyMetricAction } from '@/data/user/profile';

const STATIC_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'DevOps', 'Cloud', 'AWS', 
  'Junior', 'Management', 'Python', 'Go', 'Kubernetes', 'Docker', 
  'Full Stack', 'Frontend', 'Backend', 'Data Science', 'Machine Learning', 
  'Rust', 'Vue', 'Angular', 'GraphQL', 'SQL', 'NoSQL', 'Remote'
];

interface SearchControlsProps {
  remainingQuota: number;
  searchHistory: Array<{ id: string; keywords: string; created_at: string }>;
  onSearchStarted: () => void;
  onSearchComplete: (jobCount: number, rawJobsFound: number) => void;
  onSearchError: (errorMsg: string) => void;
  initialKeywords?: string;
  isSearchActive?: boolean;
}

export function SearchControls({
  remainingQuota,
  searchHistory,
  onSearchStarted,
  onSearchComplete,
  onSearchError,
  initialKeywords = '',
  isSearchActive = false,
}: SearchControlsProps) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [limit, setLimit] = useState(10);
  const [isSearching, setIsSearching] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const maxLimit = Math.max(0, remainingQuota - (remainingQuota % 10)); // e.g. 35 -> 30

  // Ensure limit does not exceed maxLimit if quota drops
  useEffect(() => {
    if (limit > maxLimit && maxLimit >= 10) {
      setLimit(maxLimit);
    } else if (maxLimit < 10) {
      setLimit(10);
    }
  }, [maxLimit, limit]);

  const handleSearch = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter search keywords');
      return;
    }

    if (remainingQuota <= 0) {
      toast.error('Search quota exhausted. Please wait for reset or upgrade.');
      return;
    }
    
    if (isSearchActive) {
      toast.error('Please wait for the current search to finish processing.');
      return;
    }

    setIsSearching(true);
    onSearchStarted();
    
    // Log system event (fire and forget)
    incrementDailyMetricAction({ metricName: 'searches_run' }).catch(() => null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_keywords: keywords,
          search_limit: limit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onSearchError(data.error || 'Search failed');
        setIsSearching(false);
        return;
      }

      onSearchComplete(data.jobCount || 0, data.totalJobsFound || data.jobCount || 0);
    } catch (error) {
      onSearchError('Failed to start search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectHistoryItem = (kw: string) => {
    setKeywords(kw);
    setShowHistory(false);
  };

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Search className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Job Search</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          Quota: <strong className={remainingQuota > 0 ? 'text-emerald-500' : 'text-red-500'}>{remainingQuota}</strong>
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Keywords Input (Left) */}
        <div className="flex-1 space-y-3">
          <TagInput
            value={keywords}
            onChange={setKeywords}
            placeholder="Enter job titles, skills, or keywords..."
            suggestions={(() => {
              const activeWords = keywords.toLowerCase().split(/\s+/).filter(Boolean);
              return STATIC_SUGGESTIONS.filter(
                (s) => !activeWords.includes(s.toLowerCase())
              ).slice(0, 8);
            })()}
          />
          {searchHistory.length > 0 && !keywords && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="flex items-center text-muted-foreground font-medium mr-1">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Recent Searches:
              </span>
              {searchHistory.slice(0, 3).map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectHistoryItem(item.keywords)}
                  className="px-2 py-1 rounded-md border transition-all duration-200 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {item.keywords}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls (Right) */}
        <div className="w-full md:w-72 flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Max Results
            </span>
            <Slider
              value={[limit]}
              onValueChange={([val]) => setLimit(val)}
              min={10}
              max={maxLimit < 10 ? 10 : maxLimit}
              step={10}
              className="flex-1"
              disabled={maxLimit < 10}
            />
            <input
              type="number"
              value={limit}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 10 && val <= maxLimit) setLimit(val);
              }}
              step={10}
              min={10}
              max={maxLimit < 10 ? 10 : maxLimit}
              disabled={maxLimit < 10}
              className="w-16 h-8 text-sm px-2 border border-input rounded-md bg-transparent text-right"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || remainingQuota <= 0 || isSearchActive}
            variant="gradient"
            className="w-full"
          >
          {isSearchActive ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run Search
            </>
          )}
          </Button>
        </div>
      </div>
    </div>
  );
}
