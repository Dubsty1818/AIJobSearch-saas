'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobDetailsModal } from './JobDetailsModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpDown,
  ExternalLink,
  Search,
  Loader2,
  Clock,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import type { JobMatch } from '@/hooks/useRealtimeJobMatches';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/supabase-clients/client';

interface JobMatchesTableProps {
  matches: JobMatch[];
  newMatchIds: Set<string>;
}

function ScoreBadge({ score, status }: { score: number | null, status?: string | null }) {
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> AI Analyzing
      </span>
    );
  }
  
  if (status === 'pending' || score === -1 || score === null) {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-900/60 dark:text-gray-400 ring-1 ring-inset ring-gray-500/20">
        <Clock className="w-3 h-3 mr-1" /> In Queue
      </span>
    );
  }

  const getColor = (s: number) => {
    if (s >= 8) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 ring-emerald-500/20';
    if (s >= 6) return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 ring-blue-500/20';
    if (s >= 4) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 ring-amber-500/20';
    if (s >= 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 ring-orange-500/20';
    return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 ring-red-500/20';
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${getColor(score)}`}
    >
      {score}/10
    </span>
  );
}

const getScoreBgClass = (score: number | null, status?: string | null) => {
  if (status === 'processing') return 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (score === null || score === -1) return 'bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
  if (score >= 8) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
  if (score >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
};

export function JobMatchesTable({ matches, newMatchIds }: JobMatchesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);
  const [tabFilter, setTabFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());
  
  // Local state to eagerly remove rows on match/reject
  const [localMatches, setLocalMatches] = useState<JobMatch[]>(matches);

  // Sync localMatches when matches props change, but respect our optimistic updates
  useMemo(() => {
    setLocalMatches(matches);
  }, [matches]);

  const handleAction = async (e: React.MouseEvent, job: JobMatch, action: 'approved' | 'rejected') => {
    e.stopPropagation();
    if (actioningIds.has(job.id)) return;
    
    setActioningIds(prev => new Set(prev).add(job.id));
    
    setTimeout(async () => {
      // Optimistic UI update
      setLocalMatches(prev => prev.map(m => m.id === job.id ? { ...m, matched_status: action } : m));
      if (selectedMatch?.id === job.id) {
        setSelectedMatch(null);
      }
      
      // DB Update
      const supabase = createClient();
      await supabase.from('job_matches').update({ matched_status: action }).eq('id', job.id);
      
      setActioningIds(prev => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }, 300);
  };

  const filteredMatches = useMemo(() => {
    return localMatches.filter(m => {
      if (tabFilter === 'pending') return !m.matched_status;
      return m.matched_status === tabFilter;
    });
  }, [localMatches, tabFilter]);

  const columns = useMemo<ColumnDef<JobMatch>[]>(
    () => [
      {
        accessorKey: 'company_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Company
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('company_name')}</span>
        ),
      },
      {
        accessorKey: 'job_title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Job Title
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={row.getValue('job_title')}>
            {row.getValue('job_title')}
          </div>
        ),
      },
      {
        accessorKey: 'job_description',
        header: 'Job Description',
        cell: ({ row }) => (
          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
            {row.getValue('job_description') || 'No description available'}
          </p>
        ),
      },
      {
        accessorKey: 'score',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full"
          >
            Score <Sparkles className="ml-1.5 h-2.5 w-2.5 text-indigo-400/40 dark:text-indigo-600/40" />
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          if (row.original.status === 'processing') {
            return <Loader2 className="w-5 h-5 mx-auto animate-spin" />;
          }
          const score = row.getValue('score') as number | null;
          return (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-bold text-base">{score !== null ? `${score}/10` : 'N/A'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'reasoning',
        header: () => (
          <div className="flex items-center gap-1 font-semibold">
            Reasoning <Sparkles className="h-2.5 w-2.5 text-indigo-400/40 dark:text-indigo-600/40" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
            {row.original.status === 'processing' ? (
              <span className="flex items-center text-indigo-500/70"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing...</span>
            ) : row.getValue('reasoning')}
          </div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.getValue('location') || '—'}
          </span>
        ),
      },
      {
        id: 'match_action',
        header: 'Match Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {row.original.matched_status ? (
              <span className="text-xs font-semibold capitalize px-2 py-1 bg-muted rounded">
                {row.original.matched_status}
              </span>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={actioningIds.has(row.original.id)}
                  className="h-8 w-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  onClick={(e) => handleAction(e, row.original, 'approved')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={actioningIds.has(row.original.id)}
                  className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-600 dark:text-red-400"
                  onClick={(e) => handleAction(e, row.original, 'rejected')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {row.original.url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                asChild
              >
                <a
                  href={row.original.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [localMatches]
  );

  const table = useReactTable({
    data: filteredMatches,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <div className="space-y-4">
        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Tabs value={tabFilter} onValueChange={(val: any) => setTabFilter(val)} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="pending">Pending ({localMatches.filter(m => !m.matched_status).length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({localMatches.filter(m => m.matched_status === 'approved').length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({localMatches.filter(m => m.matched_status === 'rejected').length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-block">
              {table.getFilteredRowModel().rows.length} results
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap sm:hidden">
              {table.getFilteredRowModel().rows.length} results
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50 border-b-0">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs uppercase tracking-wider h-10">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => {
                      const isNew = newMatchIds.has(row.original.id);
                      return (
                        <motion.tr
                          key={row.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          onClick={() => setSelectedMatch(row.original)}
                          className={`border-b transition-colors cursor-pointer group ${
                            isNew
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/30'
                              : 'hover:bg-muted/50'
                          } ${actioningIds.has(row.original.id) ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const isScoreCell = cell.column.id === 'score';
                            return (
                              <TableCell 
                                key={cell.id} 
                                className={isScoreCell ? `p-0 w-[100px] h-full align-middle text-center ${getScoreBgClass(row.original.score, row.original.status)}` : "py-4"}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            );
                          })}
                        </motion.tr>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 opacity-30" />
                          <p>No job matches in this queue.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <JobDetailsModal 
        job={selectedMatch} 
        isOpen={!!selectedMatch} 
        onClose={() => setSelectedMatch(null)}
        isEditable={false}
        onStatusChange={(jobId, newStatus) => {
          setLocalMatches(prev => prev.map(m => m.id === jobId ? { ...m, matched_status: newStatus === 'pending' ? null : newStatus } : m));
        }}
      />
    </>
  );
}
