'use client';

import { useAction } from 'next-safe-action/hooks';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { signInWithProviderAction, signUpEmailOnlyAction } from '@/data/auth/auth';
import type { AuthProvider } from '@/types';
import { useCooldown } from '@/hooks/useCooldown';

interface SignUpProps {
  next?: string;
}

export function SignUp({ next }: SignUpProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const toastRef = useRef<string | number | undefined>(undefined);
  
  const { isCooldownActive, startCooldown } = useCooldown(5000);

  const { execute: executeSignUp, status: signUpStatus } = useAction(
    signUpEmailOnlyAction,
    {
      onExecute: () => {
        startCooldown();
        toastRef.current = toast.loading('Creating account...');
      },
      onSuccess: () => {
        toast.success('Account created!', { id: toastRef.current });
        toastRef.current = undefined;
        setSuccessMessage('A confirmation link has been sent to your email!');
      },
      onError: ({ error }) => {
        let errorMessage = error.serverError ?? 'Failed to create account';
        if (errorMessage.toLowerCase().includes('already registered')) {
          errorMessage = 'Email already in use. Please sign in.';
        }
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        startCooldown();
        toastRef.current = toast.loading('Requesting login...');
      },
      onSuccess: ({ data }) => {
        toast.success('Redirecting...', { id: toastRef.current });
        toastRef.current = undefined;
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? 'Failed to login';
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    }
  );

  if (successMessage) {
    return (
      <div className="container flex items-center justify-center text-left max-w-lg mx-auto overflow-auto h-full min-h-[470px]">
        <EmailConfirmationPendingCard
          type="sign-up"
          heading="Confirmation Link Sent"
          message={successMessage}
          resetSuccessMessage={setSuccessMessage}
        />
      </div>
    );
  }

  const isExecuting = signUpStatus === 'executing' || providerStatus === 'executing';
  const disabled = isExecuting || isCooldownActive;

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-[80vh] items-center max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border bg-card my-8">
      {/* Visual Accent Side */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-zinc-50 h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-violet-900/40 z-0" />
        <div className="relative z-10 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">JobSearchAI</span>
        </div>
        <div className="relative z-10 space-y-6 max-w-md mt-auto">
          <h2 className="text-4xl font-semibold tracking-tight">Automate your job search today.</h2>
          <p className="text-lg text-zinc-400">
            Set your rules once. Let our AI do the heavy lifting. Wake up to pre-screened job matches every day.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-16 h-full bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to get started. No password required yet.
            </p>
          </div>

          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (disabled) return;
                executeSignUp({ email });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={disabled}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={disabled}>
                {isExecuting ? 'Creating account...' : 'Continue with Email'}
                {!isExecuting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <RenderProviders
              providers={['google', 'github', 'twitter']}
              isLoading={disabled}
              onProviderLoginRequested={(provider: Extract<AuthProvider, 'google' | 'github' | 'twitter'>) => {
                if (disabled) return;
                executeProvider({ provider, next });
              }}
            />

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
