'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [statusText, setStatusText] = useState('Connecting to payment service...');

  useEffect(() => {
    if (!token) {
      setError('Invalid payment token');
      setIsProcessing(false);
      return;
    }

    const type = searchParams.get('type') || undefined;

    const processPayment = async () => {
      try {
        setStatusText('Preparing your payment...');

        const response = await fetch('/api/payment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, type }),
        });

        const data = await response.json();

        if (!response.ok || data.code !== 0) {
          setError(data.message || 'Payment processing failed');
          setIsProcessing(false);
          return;
        }

        if (data.data?.checkoutUrl) {
          setStatusText('Redirecting to secure checkout...');
          // Small delay so user sees the status update
          await new Promise((r) => setTimeout(r, 300));
          window.location.href = data.data.checkoutUrl;
        } else {
          setError('No checkout URL received');
          setIsProcessing(false);
        }
      } catch (err) {
        setError('Payment processing failed. Please try again.');
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md px-6">
        {isProcessing ? (
          <>
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-zinc-900 animate-spin"></div>
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">
              {statusText}
            </h1>
            <p className="text-sm text-zinc-500">
              Please do not close this page.
            </p>
          </>
        ) : error ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">
              Payment Error
            </h1>
            <p className="text-sm text-red-500 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Go Back
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
