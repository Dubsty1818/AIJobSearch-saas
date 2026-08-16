'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, GripVertical, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Rule {
  id?: string;
  text: string;
  value: number;
}

const DEFAULT_RULES: Rule[] = [
  { id: '1', text: '+2 points: If the job description prioritizes English in any way, shape, or form holding it over other languages, mentioned first, or is the only one mentioned.', value: 2 },
  { id: '2', text: '+3 points: Job strictly states fully remote without any hybrid/office requirements.', value: 3 },
  { id: '3', text: '+5 points: Stack explicitly mentions React and TypeScript as core daily technologies.', value: 5 },
  { id: '4', text: '-4 points: Explicitly mentions "unpaid", "internship", or requires a student status.', value: -4 },
];

interface RulesConfiguratorProps {
  initialRules?: Rule[];
  onRulesChange: (rules: Rule[]) => void;
  compact?: boolean;
  maxScoreLimit?: number;
  onMaxScoreLimitChange?: (limit: number) => void;
}

interface SortableRuleItemProps {
  rule: Rule;
  index: number;
  updateRule: (index: number, field: keyof Rule, value: string | number) => void;
  removeRule: (index: number) => void;
  commitRules: () => void;
  getValueLabel: (value: number) => string;
}

function SortableRuleItem({ rule, index, updateRule, removeRule, commitRules, getValueLabel }: SortableRuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id || String(index) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 p-3 rounded-lg border bg-card transition-all duration-200 ${
        isDragging ? 'border-primary shadow-md z-10' : 'hover:border-primary/30'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-foreground mt-2.5 shrink-0 text-muted-foreground/40 outline-none">
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 space-y-3">
        <Textarea
          value={rule.text}
          onChange={(e) => updateRule(index, 'text', e.target.value)}
          onBlur={commitRules}
          placeholder="Describe your rule..."
          className="text-sm min-h-[60px] resize-y bg-transparent"
        />

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Slider
              value={[rule.value]}
              onValueChange={([val]) => updateRule(index, 'value', val)}
              onValueCommit={commitRules}
              min={-10}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
          <span
            className={`text-sm font-bold min-w-[36px] text-center rounded-md px-2 py-0.5 ${
              rule.value > 0
                ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50'
                : rule.value < 0
                  ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/50'
                  : 'text-muted-foreground bg-secondary'
            }`}
          >
            {getValueLabel(rule.value)}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeRule(index)}
        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function RulesConfigurator({
  initialRules,
  onRulesChange,
  compact = false,
  maxScoreLimit = 10,
  onMaxScoreLimitChange,
}: RulesConfiguratorProps) {
  const [rules, setRules] = useState<Rule[]>(
    initialRules && initialRules.length > 0 
      ? initialRules.map((r, i) => ({...r, id: r.id || String(i)})) 
      : DEFAULT_RULES
  );
  
  const commitRules = useCallback((currentRules: Rule[]) => {
    onRulesChange(currentRules);
  }, [onRulesChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const positiveSum = rules
    .filter((r) => r.value > 0)
    .reduce((sum, r) => sum + r.value, 0);
  const negativeSum = rules
    .filter((r) => r.value < 0)
    .reduce((sum, r) => sum + r.value, 0);
  const isValid = positiveSum === maxScoreLimit;



  const updateRule = useCallback((index: number, field: keyof Rule, value: string | number) => {
    setRules((prev) =>
      prev.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      )
    );
  }, []);

  const removeRule = useCallback((index: number) => {
    setRules((prev) => {
      const newRules = prev.filter((_, i) => i !== index);
      commitRules(newRules);
      return newRules;
    });
  }, [commitRules]);

  const addRule = useCallback(() => {
    setRules((prev) => {
      const newRules = [...prev, { id: `new-${Date.now()}`, text: '', value: 0 }];
      commitRules(newRules);
      return newRules;
    });
  }, [commitRules]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setRules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newRules = arrayMove(items, oldIndex, newIndex);
        commitRules(newRules);
        return newRules;
      });
    }
  };

  const getValueLabel = (value: number) => {
    if (value > 0) return `+${value}`;
    return `${value}`;
  };

  const progressPercent = Math.min((positiveSum / maxScoreLimit) * 100, 100);
  const progressColor =
    positiveSum === maxScoreLimit
      ? 'bg-emerald-500'
      : positiveSum > maxScoreLimit
        ? 'bg-red-500'
        : positiveSum >= maxScoreLimit * 0.7
          ? 'bg-amber-500'
          : 'bg-blue-500';

  return (
    <div className={`space-y-4 ${compact ? '' : 'space-y-6'}`}>
      {/* Configuration Header */}
      {onMaxScoreLimitChange && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-dashed">
          <div>
            <h4 className="font-medium text-sm">Max Score Limit</h4>
            <p className="text-xs text-muted-foreground">Override the standard 10-point limit.</p>
          </div>
          <select 
            value={maxScoreLimit} 
            onChange={(e) => onMaxScoreLimitChange(Number(e.target.value))}
            className="text-sm bg-background border rounded-md px-2 py-1"
          >
            <option value={10}>10 Points</option>
            <option value={15}>15 Points</option>
            <option value={20}>20 Points</option>
          </select>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Positive points: <strong className="text-foreground">{positiveSum}</strong> / {maxScoreLimit}
          </span>
          {isValid ? (
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Valid
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500 font-medium animate-pulse">
              <AlertCircle className="h-4 w-4" />
              Must equal {maxScoreLimit}
            </span>
          )}
        </div>
        <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
          {/* Tick marks */}
          {[...Array(maxScoreLimit)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-background/30"
              style={{ left: `${(i + 1) * (100 / maxScoreLimit)}%` }}
            />
          ))}
        </div>
        {negativeSum < 0 && (
          <p className="text-xs text-muted-foreground">
            Negative penalties: <span className="text-red-500 font-medium">{negativeSum}</span> (subtracted from score)
          </p>
        )}
      </div>

      {/* Rules List */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3">
          <SortableContext 
            items={rules.map(r => r.id!)}
            strategy={verticalListSortingStrategy}
          >
            {rules.map((rule, index) => (
              <SortableRuleItem
                key={rule.id || index}
                rule={rule}
                index={index}
                updateRule={updateRule}
                removeRule={removeRule}
                commitRules={() => commitRules(rules)}
                getValueLabel={getValueLabel}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Add Rule Button */}
      <Button
        variant="outline"
        onClick={addRule}
        className="w-full border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Rule
      </Button>
    </div>
  );
}
