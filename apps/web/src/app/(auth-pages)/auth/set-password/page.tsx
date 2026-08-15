'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/supabase-clients/client';
import { useCooldown } from '@/hooks/useCooldown';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isCooldownActive, startCooldown } = useCooldown(5000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    startCooldown();
    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || 'Failed to update password');
      return;
    }

    toast.success('Password set successfully!');
    router.push('/dashboard');
  };

  const disabled = isSubmitting || isCooldownActive;

  return (
    <div className="container flex items-center justify-center min-h-[60vh] max-w-lg mx-auto py-12">
      <div className="bg-card w-full p-8 md:p-12 rounded-2xl border shadow-sm space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Set your password</h1>
            <p className="text-sm text-muted-foreground">
              Secure your account by choosing a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={disabled}
              className="h-11"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={disabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Password
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
