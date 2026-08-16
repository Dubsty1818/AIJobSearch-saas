'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  Search,
  ExternalLink,
  List
} from 'lucide-react';
import type { JobMatch } from '@/hooks/useRealtimeJobMatches';
import { createClient } from '@/supabase-clients/client';
import { toast } from 'sonner';
import { JobDetailsModal } from '@/components/dashboard/JobDetailsModal';

interface PipelineClientProps {
  userId: string;
}

const statusColors: Record<string, string> = {
  'applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  'rejection': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  'ignored': 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400',
  'interview': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  'interview_2': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  'offer': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
};

const statusRowColors: Record<string, string> = {
  'applied': 'bg-blue-900/5 hover:bg-blue-900/10 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
  'rejection': 'bg-red-900/5 hover:bg-red-900/10 dark:bg-red-900/20 dark:hover:bg-red-900/30',
  'ignored': 'bg-gray-900/5 hover:bg-gray-900/10 dark:bg-gray-900/20 dark:hover:bg-gray-900/30',
  'interview': 'bg-green-900/5 hover:bg-green-900/10 dark:bg-green-900/20 dark:hover:bg-green-900/30',
  'interview_2': 'bg-emerald-900/5 hover:bg-emerald-900/10 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30',
  'offer': 'bg-yellow-900/10 hover:bg-yellow-900/15 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/40',
};

export function PipelineClient({ userId }: PipelineClientProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [tabFilter, setTabFilter] = useState<'approved' | 'rejected'>('approved');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('job_matches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setMatches(data as JobMatch[]);
      }
    };
    fetchPipeline();
  }, [userId]);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const isApplied = newStatus === 'applied';
    
    // Optimistic update
    setMatches(prev => prev.map(m => 
      m.id === jobId 
        ? { 
            ...m, 
            application_status: newStatus as any,
            application_date: isApplied ? new Date().toISOString() : m.application_date
          } 
        : m
    ));

    // DB Update
    const supabase = createClient();
    const updateData: any = { application_status: newStatus };
    if (isApplied) {
      updateData.application_date = new Date().toISOString();
    }

    const { error } = await supabase.from('job_matches').update(updateData).eq('id', jobId);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
    }
  };

  const handleJobUpdated = (updatedJob: JobMatch) => {
    setMatches(prev => prev.map(m => m.id === updatedJob.id ? updatedJob : m));
  };

  const handleModalStatusChange = (jobId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    setMatches(prev => prev.map(m => m.id === jobId ? { ...m, matched_status: newStatus === 'pending' ? null : newStatus } : m));
    if (newStatus !== tabFilter && selectedMatch) {
      setSelectedMatch(null);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(m => m.matched_status === tabFilter);
  }, [matches, tabFilter]);

  const columns = useMemo<ColumnDef<JobMatch>[]>(
    () => [
      {
        accessorKey: 'company_name',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 font-semibold hover:bg-transparent">
            Company <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue('company_name')}</span>,
      },
      {
        accessorKey: 'job_title',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 font-semibold hover:bg-transparent">
            Job Title <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm max-w-[200px] truncate" title={row.getValue('job_title')}>
            {row.getValue('job_title')}
          </div>
        ),
      },
      {
        accessorKey: 'score',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 font-semibold hover:bg-transparent">
            Score <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-bold">{row.getValue('score') !== null ? `${row.getValue('score')}/${row.original.score_max || 10}` : 'N/A'}</span>
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
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.getValue('expected_salary') || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'user_notes',
        header: 'Notes',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground max-w-[150px] truncate" title={row.getValue('user_notes') || ''}>
            {row.getValue('user_notes') || '—'}
          </div>
        ),
      },
      {
        id: 'application_status',
        accessorKey: 'application_status',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 font-semibold hover:bg-transparent">
            Status <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const currentStatus = row.getValue('application_status') as string || 'ignored';
          return (
            <div className="w-[180px]" onClick={e => e.stopPropagation()}>
              <Select value={currentStatus} onValueChange={(val) => handleStatusChange(row.original.id, val)}>
                <SelectTrigger className={`h-8 border-0 shadow-none focus:ring-0 ${statusColors[currentStatus] || statusColors['ignored']}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ignored">No Action</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="interview_2">2nd+ Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejection">Rejection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          row.original.url && (
            <div onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={row.original.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )
        ),
      },
    ],
    []
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
            <List className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Application Pipeline</h1>
            <p className="text-muted-foreground text-sm">
              Manage and track your matched jobs
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <Tabs value={tabFilter} onValueChange={(val: any) => setTabFilter(val)} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="approved">Approved Matches ({matches.filter(m => m.matched_status === 'approved').length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected Matches ({matches.filter(m => m.matched_status === 'rejected').length})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex-1 sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter pipeline..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50 border-b-0">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs uppercase tracking-wider h-10">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                    const currentStatus = row.original.application_status || 'ignored';
                    const rowColorClass = statusRowColors[currentStatus] || statusRowColors['ignored'];
                    
                    return (
                      <TableRow 
                        key={row.id} 
                        className={`cursor-pointer transition-colors border-b border-border/50 ${rowColorClass}`}
                        onClick={() => setSelectedMatch(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 opacity-30" />
                        <p>No jobs found in this pipeline.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <JobDetailsModal 
        job={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        isEditable={true}
        onJobUpdated={handleJobUpdated}
        onStatusChange={handleModalStatusChange}
      />
    </>
  );
}
