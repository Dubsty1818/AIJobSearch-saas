'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Rule } from '@/components/rules/RulesConfigurator';

interface WizardState {
  cvText: string;
  keywords: string;
  rules: Rule[];
}

interface WizardContextType {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: WizardState;
}) {
  const [state, setState] = useState<WizardState>(initialState);

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <WizardContext.Provider value={{ state, updateState }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
