'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowUpDown,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { JobMatch } from '@/hooks/useRealtimeJobMatches';

interface JobMatchesTableProps {
  matches: JobMatch[];
  newMatchIds: Set<string>;
}

function ScoreBadge({ score, status }: { score: number | null, status?: string | null }) {
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-500/20">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> AI Analyzing
      </span>
    );
  }
  
  if (status === 'pending' || score === -1 || score === null) {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20">
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
        accessorKey: 'analysis',
        header: () => (
          <div className="flex items-center gap-1 font-semibold">
            Analysis <Sparkles className="h-2.5 w-2.5 text-indigo-400/40 dark:text-indigo-600/40" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
            {row.original.status === 'processing' ? (
              <span className="flex items-center text-indigo-500/70"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing...</span>
            ) : row.getValue('analysis')}
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
        accessorKey: 'expected_salary',
        header: 'Salary',
        cell: ({ row }) => (
          <span className="text-sm font-medium whitespace-nowrap">
            {row.getValue('expected_salary') || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
    []
  );

  const table = useReactTable({
    data: matches,
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
      <div className="space-y-3">
        {/* Search & filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} results
          </span>
        </div>

        {/* Table */}
        <div className="rounded-lg border w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs uppercase tracking-wider">
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                    const isNew = newMatchIds.has(row.original.id);
                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => setSelectedMatch(row.original)}
                        className={`cursor-pointer transition-all duration-500 ${
                          isNew
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/30 animate-in slide-in-from-top-2'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isScoreCell = cell.column.id === 'score';
                          return (
                            <TableCell 
                              key={cell.id} 
                              className={isScoreCell ? `p-0 w-[100px] h-full align-middle text-center ${getScoreBgClass(row.original.score, row.original.status)}` : "py-3 h-[72px]"}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
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
                        <p>No job matches yet. Run a search to get started!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto">
          {selectedMatch && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-4 mt-4">
                  <div>
                    <SheetTitle className="text-xl">
                      {selectedMatch.job_title}
                    </SheetTitle>
                    <p className="text-muted-foreground mt-1">
                      {selectedMatch.company_name}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <ScoreBadge score={selectedMatch.score} status={selectedMatch.status} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total Match Score</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Location</h5>
                    <p className="text-sm font-medium">{selectedMatch.location || 'Not specified'}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Expected Salary</h5>
                    <p className="text-sm font-medium">{selectedMatch.expected_salary || 'Not specified'}</p>
                  </div>
                </div>

                {selectedMatch.status === 'processing' ? (
                  <div className="py-4 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                    <p className="text-sm">AI is currently analyzing this job...</p>
                  </div>
                ) : (
                  <>
                    {selectedMatch.reasoning && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">AI Reasoning</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedMatch.reasoning}
                        </p>
                      </div>
                    )}

                    {selectedMatch.analysis && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">Storyline / Analysis</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedMatch.analysis}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {selectedMatch.job_description && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Job Description</h4>
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                      {selectedMatch.job_description}
                    </div>
                  </div>
                )}

                {selectedMatch.url && (
                  <div className="pt-4 pb-8">
                    <Button asChild className="w-full">
                      <a
                        href={selectedMatch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Original Posting
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
