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
import { Loader2, Sparkles, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { TagInput } from '@/components/ui/tag-input';

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
  const t = useTranslations('SearchControls');
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
        <div className="flex-1">
          <TagInput
            value={keywords}
            onChange={setKeywords}
            placeholder={t('placeholder')}
            suggestions={searchHistory.map(h => h.keywords.split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i && v.trim().length > 0).slice(0, 5)}
          />
        </div>

        {/* Controls (Right) */}
        <div className="w-full md:w-72 flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t('maxResults')}
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
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40"
          >
          {isSearchActive ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('searching')}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t('runSearch')}
            </>
          )}
          </Button>
        </div>
      </div>
    </div>
  );
}
