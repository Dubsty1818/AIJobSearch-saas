'use client';

import { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/supabase-clients/client';
import { useWizard } from './WizardContext';

interface CvInputStepProps {
  userId: string;
  onContinue: () => void;
}

export function CvInputStep({ userId, onContinue }: CvInputStepProps) {
  const { state, updateState } = useWizard();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const filePath = `${userId}/${Date.now()}_cv.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      toast.info('PDF uploaded! Please paste your CV text manually for best results.');
    } catch (error) {
      toast.error('Failed to upload PDF');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Add Your CV</h3>
        <p className="text-muted-foreground text-sm">
          Paste your CV text below. The AI will use this to match and score jobs for you.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload PDF
        </Button>
      </div>

      <Textarea
        value={state.cvText}
        onChange={(e) => updateState({ cvText: e.target.value })}
        placeholder="Paste your CV / resume text here...

Include your:
• Work experience
• Skills & technologies
• Education"
        className="min-h-[300px] resize-y text-sm leading-relaxed font-mono"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{state.cvText.length.toLocaleString()} characters</span>
        {state.cvText.trim().length > 0 && (
          <span className="flex items-center gap-1 text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            CV provided
          </span>
        )}
      </div>

      <Button onClick={onContinue} disabled={!state.cvText.trim()} className="w-full hidden">
        Continue
      </Button>
    </div>
  );
}
