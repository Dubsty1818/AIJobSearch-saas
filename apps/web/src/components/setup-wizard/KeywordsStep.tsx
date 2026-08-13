'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useWizard } from './WizardContext';

export function KeywordsStep({ onContinue }: { onContinue: () => void }) {
  const { state, updateState } = useWizard();

  const keywordTags = state.keywords
    .split(/\s+/)
    .filter((k) => k.trim().length > 0);

  const removeKeyword = (index: number) => {
    const newTags = [...keywordTags];
    newTags.splice(index, 1);
    updateState({ keywords: newTags.join(' ') });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Set Search Keywords</h3>
        <p className="text-muted-foreground text-sm">
          Enter keywords that describe your ideal job.
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={state.keywords}
            onChange={(e) => updateState({ keywords: e.target.value })}
            placeholder="e.g. React TypeScript frontend remote senior"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Separate keywords with spaces. You can change these later.
        </p>
      </div>

      {keywordTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
          {keywordTags.map((tag, i) => (
            <Badge
              key={`${tag}-${i}`}
              variant="secondary"
              className="gap-1 pl-2.5 pr-1.5 py-1 cursor-pointer hover:bg-destructive/10 transition-colors"
              onClick={() => removeKeyword(i)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
