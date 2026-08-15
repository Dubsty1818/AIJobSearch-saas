'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

export function TagInput({ value, onChange, suggestions = [], className, placeholder, ...props }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const tags = value.split(/\s+/).filter((t) => t.trim().length > 0);

  const addTag = (tag: string) => {
    const newTag = tag.trim();
    if (!newTag) return;
    
    // Check if tag already exists (case insensitive)
    if (tags.some(t => t.toLowerCase() === newTag.toLowerCase())) {
      setInputValue('');
      return;
    }

    const newTags = [...tags, newTag];
    onChange(newTags.join(' '));
    setInputValue('');
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags.join(' '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative flex flex-wrap items-center min-h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring">
        <div className="flex flex-wrap gap-1.5 w-full items-center">
          {tags.map((tag, i) => (
            <Badge 
              key={`${tag}-${i}`} 
              variant="secondary"
              className="gap-1 pl-2.5 pr-1.5 font-normal text-xs animate-in zoom-in-50 duration-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            {...props}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(inputValue)}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent outline-none min-w-[120px] text-sm"
          />
        </div>
      </div>
      
      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="flex items-center text-muted-foreground font-medium mr-1">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
            Suggested:
          </span>
          {suggestions.filter(s => !tags.some(t => t.toLowerCase() === s.toLowerCase())).map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addTag(suggestion)}
              className="px-2 py-1 rounded-md border transition-all duration-200 bg-background hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
