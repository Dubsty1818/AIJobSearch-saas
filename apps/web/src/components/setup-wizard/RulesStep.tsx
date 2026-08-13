'use client';

import { RulesConfigurator } from '@/components/rules/RulesConfigurator';
import { useWizard } from './WizardContext';

export function RulesStep({ onContinue }: { onContinue: () => void }) {
  const { state, updateState } = useWizard();

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Configure Scoring Rules</h3>
        <p className="text-muted-foreground text-sm">
          Define how the AI should score job matches. Positive rules must total exactly 10 points.
        </p>
      </div>

      <RulesConfigurator
        initialRules={state.rules}
        onRulesChange={(rules) => updateState({ rules })}
      />
    </div>
  );
}
