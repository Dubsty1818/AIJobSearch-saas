'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Check, X, ExternalLink } from 'lucide-react';
import type { JobMatch } from '@/hooks/useRealtimeJobMatches';
import { createClient } from '@/supabase-clients/client';
import { toast } from 'sonner';

interface JobDetailsModalProps {
  job: JobMatch | null;
  isOpen: boolean;
  onClose: () => void;
  isEditable?: boolean;
  onStatusChange?: (jobId: string, newStatus: 'approved' | 'rejected' | 'pending') => void;
  onJobUpdated?: (updatedJob: JobMatch) => void;
}

const getScoreBgClass = (score: number | null, status?: string | null) => {
  if (status === 'processing') return 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (score === null || score === -1) return 'bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
  if (score >= 8) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
  if (score >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
};

export function JobDetailsModal({
  job,
  isOpen,
  onClose,
  isEditable = false,
  onStatusChange,
  onJobUpdated
}: JobDetailsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [editedJob, setEditedJob] = useState<Partial<JobMatch>>({});

  useEffect(() => {
    if (job) {
      setEditedJob({
        location: job.location || '',
        expected_salary: job.expected_salary || '',
        user_notes: job.user_notes || '',
      });
    }
  }, [job]);

  if (!job) return null;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('job_matches')
      .update({
        location: editedJob.location,
        expected_salary: editedJob.expected_salary,
        user_notes: editedJob.user_notes,
      })
      .eq('id', job.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved');
      if (onJobUpdated) {
        onJobUpdated({ ...job, ...editedJob });
      }
    }
    setIsSaving(false);
  };

  const handleAction = async (action: 'approved' | 'rejected' | 'pending') => {
    if (isActioning) return;
    setIsActioning(true);
    const supabase = createClient();
    const updateData: any = { matched_status: action === 'pending' ? null : action };
    
    // Optimistic UI callback
    if (onStatusChange) {
      onStatusChange(job.id, action);
    }
    
    await supabase.from('job_matches').update(updateData).eq('id', job.id);
    setIsActioning(false);
    setTimeout(() => onClose(), 400); // Auto-close with a slight delay
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-5xl md:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border-border"
        onInteractOutside={(e) => {
          if (isEditable) {
            e.preventDefault();
            handleSave().then(() => onClose());
          }
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Top Banner for Score */}
        <div className={`p-8 w-full flex items-center justify-between ${getScoreBgClass(job.score, job.status)}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-3xl font-bold">
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:no-underline text-inherit">
                    {job.job_title}
                  </a>
                ) : (
                  job.job_title
                )}
              </DialogTitle>
              {job.url && (
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/10" asChild>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-lg opacity-90 font-medium">
              {job.url ? (
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:no-underline text-inherit">
                  {job.company_name}
                </a>
              ) : (
                job.company_name
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {!isEditable && (
              <div className="flex items-center gap-3 mr-4">
                <Button
                  size="icon"
                  className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
                    job.matched_status === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-transparent border-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                  onClick={() => handleAction('approved')}
                  disabled={isActioning}
                >
                  <Check className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
                    job.matched_status === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-transparent border-2 border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                  onClick={() => handleAction('rejected')}
                  disabled={isActioning}
                >
                  <X className="h-6 w-6" />
                </Button>
                {job.matched_status && (
                  <Button
                    variant="ghost"
                    className="h-12 rounded-full hover:bg-muted text-muted-foreground ml-2"
                    onClick={() => handleAction('pending')}
                    disabled={isActioning}
                  >
                    Reset Status
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-col items-end">
               <div className="text-5xl font-black tabular-nums tracking-tighter">
                 {job.score !== null ? `${job.score}/10` : 'N/A'}
               </div>
               <div className="text-sm font-semibold uppercase tracking-widest mt-1 opacity-80">
                 AI Match Score
               </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Location</h5>
              {isEditable ? (
                <Input 
                  value={editedJob.location || ''} 
                  onChange={e => setEditedJob(prev => ({...prev, location: e.target.value}))}
                  className="h-8 text-sm font-semibold mt-1"
                />
              ) : (
                <p className="text-sm font-semibold">{job.location || 'Not specified'}</p>
              )}
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Salary</h5>
              {isEditable ? (
                <Input 
                  value={editedJob.expected_salary || ''} 
                  onChange={e => setEditedJob(prev => ({...prev, expected_salary: e.target.value}))}
                  className="h-8 text-sm font-semibold mt-1"
                />
              ) : (
                <p className="text-sm font-semibold">{job.expected_salary || 'Not specified'}</p>
              )}
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Work Type</h5>
              <p className="text-sm font-semibold">{job.is_remote ? 'Remote' : (job.location?.toLowerCase().includes('hybrid') ? 'Hybrid' : 'On-site')}</p>
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Platform</h5>
              <p className="text-sm font-semibold capitalize">{job.platform}</p>
            </div>
          </div>

          {job.status === 'processing' ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-50" />
              <p className="text-lg font-medium">AI is currently analyzing this role...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {job.reasoning && (
                <div>
                  <h4 className="font-bold text-lg mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                    AI Reasoning
                  </h4>
                  <div className="text-base text-foreground leading-relaxed bg-muted/30 p-5 rounded-xl border-l-4 border-l-indigo-500">
                    {job.reasoning}
                  </div>
                </div>
              )}

              {job.analysis && (
                <div>
                  <h4 className="font-bold text-lg mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-emerald-500" />
                    Fit Analysis
                  </h4>
                  <div className="text-base text-foreground leading-relaxed bg-muted/30 p-5 rounded-xl border-l-4 border-l-emerald-500">
                    {job.analysis}
                  </div>
                </div>
              )}
              
              {isEditable && (
                <div>
                  <h4 className="font-bold text-lg mb-3">User Notes</h4>
                  <Textarea
                    value={editedJob.user_notes || ''}
                    onChange={e => setEditedJob(prev => ({...prev, user_notes: e.target.value}))}
                    placeholder="Add personal notes, interview details, or thoughts about this role..."
                    className="min-h-[100px] text-base"
                    maxLength={2000}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {job.job_description && (
                <div>
                  <h4 className="font-bold text-lg mb-3">Original Job Description</h4>
                  <div className="text-sm text-foreground/80 leading-relaxed bg-card border rounded-xl p-6 max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono">
                    {job.job_description}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
