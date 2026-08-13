'use client';

import { createClient } from '@/supabase-clients/client';
import { useEffect, useState, useCallback } from 'react';

export interface JobMatch {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  score: number | null;
  reasoning: string | null;
  analysis: string | null;
  job_description: string;
  url: string;
  platform: string;
  location: string | null;
  expected_salary: string | null;
  date: string;
  search_keywords: string;
  created_at: string;
  min_salary: number | null;
  max_salary: number | null;
  salary_period: string | null;
  job_publisher: string | null;
  is_remote: boolean | null;
  job_benefits: any | null;
  status: string | null;
}

export function useRealtimeJobMatches(userId: string | null) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newMatchIds, setNewMatchIds] = useState<Set<string>>(new Set());

  // Load initial matches
  const loadMatches = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_matches')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      const fetchedJobs = data as JobMatch[];
      
      setMatches(prev => {
        // If this is the initial load (prev is empty), just load all without stagger
        if (prev.length === 0) {
          return fetchedJobs;
        }

        const prevIds = new Set(prev.map(m => m.id));
        const newJobs = fetchedJobs.filter(m => !prevIds.has(m.id));
        
        // Update existing jobs
        const updatedPrev = prev.map(p => {
          const fetchedVersion = fetchedJobs.find(f => f.id === p.id);
          return fetchedVersion ? fetchedVersion : p;
        });

        // Queue new jobs to be added with a 300ms stagger
        if (newJobs.length > 0) {
          newJobs.forEach((job, index) => {
            setTimeout(() => {
              setMatches(current => {
                if (current.some(m => m.id === job.id)) return current;
                return [job, ...current].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              });
              setNewMatchIds(oldIds => new Set(oldIds).add(job.id));
              
              setTimeout(() => {
                setNewMatchIds(oldIds => {
                  const nextIds = new Set(oldIds);
                  nextIds.delete(job.id);
                  return nextIds;
                });
              }, 3000);
            }, index * 300);
          });
        }

        return updatedPrev;
      });
    }
  }, [userId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Subscribe to realtime inserts
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel('job_matches_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'job_matches',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newMatch = payload.new as JobMatch;
          
          // Never show pending jobs on the UI
          if (newMatch.status === 'pending') {
            setMatches((prev) => prev.filter(m => m.id !== newMatch.id));
            return;
          }

          if (payload.eventType === 'INSERT') {
            setMatches((prev) => [newMatch, ...prev]);
            setNewMatchIds((prev) => new Set(prev).add(newMatch.id));
  
            // Clear the "new" highlight after 3 seconds
            setTimeout(() => {
              setNewMatchIds((prev) => {
                const next = new Set(prev);
                next.delete(newMatch.id);
                return next;
              });
            }, 3000);
          } else if (payload.eventType === 'UPDATE') {
            setMatches((prev) => {
              const exists = prev.some(m => m.id === newMatch.id);
              if (exists) {
                return prev.map(match => match.id === newMatch.id ? newMatch : match);
              } else {
                return [newMatch, ...prev];
              }
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { matches, isConnected, newMatchIds, refresh: loadMatches, setMatches };
}
