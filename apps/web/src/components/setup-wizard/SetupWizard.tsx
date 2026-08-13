'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  FileText,
  Sliders,
  Search,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { PaymentStep } from './PaymentStep';
import { CvInputStep } from './CvInputStep';
import { RulesStep } from './RulesStep';
import { KeywordsStep } from './KeywordsStep';
import { toast } from 'sonner';
import type { Rule } from '@/components/rules/RulesConfigurator';
import { WizardProvider, useWizard } from './WizardContext';
import { updateCvTextAction, updateTargetKeywordsAction, updateCustomRulesAction, markSetupCompleteAction } from '@/data/user/profile';

interface UserProfile {
  id: string;
  cv_text: string;
  custom_rules: Rule[];
  target_keywords: string;
  subscription_status: string;
  setup_completed: boolean;
  monthly_quota: number;
}

interface SetupWizardProps {
  profile: UserProfile;
  initialStep?: number;
  onComplete: () => void;
  forceOpen?: boolean;
}

const STEPS = [
  { label: 'CV', icon: FileText, key: 'cv' },
  { label: 'Keywords', icon: Search, key: 'keywords' },
  { label: 'Rules', icon: Sliders, key: 'rules' },
  { label: 'Billing', icon: CreditCard, key: 'payment' },
] as const;

function WizardContent({ profile, onComplete, initialStep, setIsOpen, showCloseButton }: { profile: UserProfile, onComplete: () => void, initialStep: number, setIsOpen: (o: boolean) => void, showCloseButton: boolean }) {
  const { state } = useWizard();
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return state.cvText && state.cvText.trim().length > 0;
      case 1:
        return state.keywords && state.keywords.trim().length > 0;
      case 2: {
        const rules = state.rules || [];
        const positiveSum = rules
          .filter((r: Rule) => r.value > 0)
          .reduce((sum: number, r: Rule) => sum + r.value, 0);
        return positiveSum === 10;
      }
      case 3:
        // Free trial (default) or active subscription counts as complete
        return true;
      default:
        return false;
    }
  };

  const allComplete = STEPS.every((_, i) => isStepComplete(i));
  const progressPercent = (STEPS.filter((_, i) => isStepComplete(i)).length / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (allComplete) {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Save all state to DB
      await updateCvTextAction({ cvText: state.cvText });
      await updateTargetKeywordsAction({ keywords: state.keywords });
      await updateCustomRulesAction({ rules: state.rules });
      
      await markSetupCompleteAction({});
      toast.success('Setup complete! Welcome to JobMatchAI 🎉');
      setIsOpen(false);
      onComplete();
    } catch {
      toast.error('Failed to complete setup');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-background border-b px-6 pt-6 pb-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Setup Your Account
            </DialogTitle>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 animate-in fade-in duration-1000"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="mt-4 flex items-center gap-1">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const complete = isStepComplete(index);
            const active = index === currentStep;
            return (
              <button
                key={step.key}
                onClick={() => setCurrentStep(index)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : complete
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                }`}
              >
                {complete ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
        <Progress value={progressPercent} className="mt-3 h-1.5" />
      </div>

      <div className="px-6 py-6 min-h-[300px]">
        {currentStep === 0 && (
          <CvInputStep
            userId={profile.id}
            onContinue={handleNext}
          />
        )}
        {currentStep === 1 && (
          <KeywordsStep
            onContinue={handleNext}
          />
        )}
        {currentStep === 2 && (
          <RulesStep
            onContinue={handleNext}
          />
        )}
        {currentStep === 3 && (
          <PaymentStep
            isActive={profile.subscription_status === 'active'}
            onFinish={handleFinish}
            isSaving={isSaving}
          />
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0 || isSaving}
        >
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={!isStepComplete(currentStep)}>
            Continue
          </Button>
        ) : (
          <div /> // The Payment step has its own Finish button
        )}
      </div>
    </>
  );
}

export function SetupWizard({
  profile,
  initialStep,
  onComplete,
  forceOpen = false,
}: SetupWizardProps) {
  const [isOpen, setIsOpen] = useState(forceOpen || !profile.setup_completed);
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowCloseButton(true), 500);
      return () => clearTimeout(timer);
    } else if (!profile.setup_completed && !forceOpen) {
      // If user closes wizard prematurely, mark setup complete (defaults to free tier)
      markSetupCompleteAction({}).then(() => onComplete());
    }
  }, [isOpen]);

  const initialState = {
    cvText: profile.cv_text || '',
    keywords: profile.target_keywords || '',
    rules: profile.custom_rules || [],
  };

  return (
    <>
      <WizardProvider initialState={initialState}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <WizardContent 
              profile={profile} 
              onComplete={onComplete} 
              initialStep={initialStep ?? 0}
              setIsOpen={setIsOpen}
              showCloseButton={showCloseButton}
            />
          </DialogContent>
        </Dialog>
      </WizardProvider>

      {!isOpen && !profile.setup_completed && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/30 animate-in slide-in-from-bottom-4 duration-500"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Complete Setup
        </Button>
      )}
    </>
  );
}
