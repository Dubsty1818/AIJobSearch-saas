'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { createClient } from '@/supabase-clients/client';
import { toast } from 'sonner';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as any;
  const next = searchParams.get('next') || '/dashboard';

  const handleVerify = async () => {
    if (!token_hash || !type) {
      setError('Invalid verification link. Missing token or type.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (verifyError) {
      setError(verifyError.message);
      setIsVerifying(false);
      return;
    }

    toast.success('Successfully verified!');
    
    if (type === 'signup') {
      router.push('/auth/set-password');
    } else {
      router.push(next);
    }
  };

  if (!token_hash || !type) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Invalid Link</h1>
        <p className="text-muted-foreground">The verification link is missing required parameters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <ShieldCheck className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Secure Verification</h1>
        <p className="text-muted-foreground">
          Please click the button below to securely verify your email and sign in.
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md w-full max-w-sm">
          {error}
        </div>
      )}

      <Button onClick={handleVerify} disabled={isVerifying} className="w-full max-w-sm h-11 text-base">
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Email'
        )}
      </Button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="container flex items-center justify-center min-h-[60vh] max-w-lg mx-auto py-12">
      <div className="bg-card w-full p-8 rounded-2xl border shadow-sm">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <VerifyOTPContent />
        </Suspense>
      </div>
    </div>
  );
}
