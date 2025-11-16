"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zkLoginService } from '@/services/zklogin-service';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get JWT from URL hash (Google OAuth returns id_token in hash)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');

        if (!idToken) {
          throw new Error('No ID token found in callback');
        }

        // Complete login flow
        await zkLoginService.completeLoginFlow(idToken);

        setStatus('success');

        // Redirect to home page after 1 second
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error) {
        console.error('Authentication failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');

        // Redirect to home after 3 seconds even on error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
              <h2 className="text-2xl font-bold text-foreground">
                Authenticating...
              </h2>
              <p className="mt-2 text-muted-foreground">
                Please wait while we complete your login
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-block h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Login Successful!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Redirecting you to the app...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-block h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Authentication Failed
              </h2>
              <p className="mt-2 text-muted-foreground">
                {errorMessage}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecting you back...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
