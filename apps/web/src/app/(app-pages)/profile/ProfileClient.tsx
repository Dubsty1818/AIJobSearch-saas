'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { updateCvTextAction, updateTargetKeywordsAction } from '@/data/user/profile';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Save } from 'lucide-react';

const SUGGESTED_TAGS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Remote', 
  'Frontend', 'Backend', 'Fullstack', 'Senior', 'Lead'
];

interface ProfileClientProps {
  initialCvText: string;
  initialKeywords: string;
}

import { ContextualSidebar } from '@/components/dashboard/ContextualSidebar';

export function ProfileClient({ initialCvText, initialKeywords }: ProfileClientProps) {
  const [cvText, setCvText] = useState(initialCvText);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateCvTextAction({ cvText }),
        updateTargetKeywordsAction({ keywords })
      ]);
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = cvText !== initialCvText || keywords !== initialKeywords;

  const sidebarItems = [
    {
      title: 'How AI Scores Work',
      type: 'info' as const,
      content: 'The AI uses your Target Keywords as a preliminary filter. If a job contains those keywords, it then reads your CV and the Job Description, and applies your Scoring Rules to calculate a final score out of 10.'
    },
    {
      title: 'Best Practices for Keywords',
      type: 'tip' as const,
      content: 'Keep your Target Keywords broad but relevant. Instead of "Senior Frontend Developer React Nextjs", use separate tags: "React", "Next.js", "Frontend", "Senior".'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <div className="lg:col-span-3 space-y-8">
        <div className="space-y-4 p-6 border rounded-xl bg-card">
          <div>
            <h3 className="text-lg font-semibold">Target Keywords</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These keywords guide the AI's search before scoring.
            </p>
            <TagInput 
              value={keywords}
              onChange={setKeywords}
              suggestions={SUGGESTED_TAGS}
              placeholder="e.g. React TypeScript remote"
            />
          </div>
        </div>

        <div className="space-y-4 p-6 border rounded-xl bg-card">
          <div>
            <h3 className="text-lg font-semibold">Your CV</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI compares job descriptions against this text to generate match scores.
            </p>
            <Textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="min-h-[400px] font-mono text-sm leading-relaxed"
              placeholder="Paste your CV here..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <ContextualSidebar items={sidebarItems} />
      </div>
    </div>
  );
}
