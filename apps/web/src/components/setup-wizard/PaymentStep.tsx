'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Sparkles, Shield, Zap, Gift } from 'lucide-react';
import { useState } from 'react';

interface PaymentStepProps {
  isActive: boolean;
  onFinish: () => void;
  isSaving: boolean;
}

export function PaymentStep({ isActive, onFinish, isSaving }: PaymentStepProps) {
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');

  const handleSubscribe = async () => {
    setIsLoadingStripe(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setIsLoadingStripe(false);
    }
  };

  if (isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold">Pro Subscription Active</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You're all set with your AI Job Matcher Pro subscription. You have 500 job matches per week.
        </p>
        <Button onClick={onFinish} disabled={isSaving} className="mt-4">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Complete Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Your Plan</h3>
        <p className="text-muted-foreground text-sm">
          Select a plan to start using JobMatchAI. You can upgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Plan */}
        <div 
          onClick={() => setSelectedPlan('free')}
          className={`relative rounded-xl border-2 p-5 space-y-4 cursor-pointer transition-all ${
            selectedPlan === 'free' 
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md' 
              : 'border-border hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className={`h-5 w-5 ${selectedPlan === 'free' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
            <h4 className="font-semibold">Free Trial</h4>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">€0</span>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              50 Free Searches Total
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Custom Scoring Rules
            </li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div 
          onClick={() => setSelectedPlan('pro')}
          className={`relative rounded-xl border-2 p-5 space-y-4 cursor-pointer transition-all ${
            selectedPlan === 'pro' 
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md' 
              : 'border-border hover:border-indigo-500/50'
          }`}
        >
          <div className="absolute -top-3 right-4">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className={`h-5 w-5 ${selectedPlan === 'pro' ? 'text-indigo-500' : 'text-muted-foreground'}`} />
            <h4 className="font-semibold">Pro Plan</h4>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">€10</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
              500 Searches Per Week
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
              Real-time WebSocket Results
            </li>
          </ul>
        </div>
      </div>

      {selectedPlan === 'free' ? (
        <Button
          onClick={onFinish}
          disabled={isSaving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
        >
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          Complete Setup (Free)
        </Button>
      ) : (
        <Button
          onClick={handleSubscribe}
          disabled={isLoadingStripe || isSaving}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 h-12 text-base"
        >
          {isLoadingStripe ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Redirecting to payment...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Subscribe & Complete Setup
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
