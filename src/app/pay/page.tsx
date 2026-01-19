'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid payment token');
      setIsProcessing(false);
      return;
    }

    // 获取订单类型参数 (shop 或 默认)
    const type = searchParams.get('type') || undefined;

    // 调用 B站支付处理 API
    const processPayment = async () => {
      try {
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

        // 跳转到 Stripe Checkout
        if (data.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else {
          setError('No checkout URL received');
          setIsProcessing(false);
        }
      } catch (err) {
        setError('Payment processing failed');
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-800">
              Redirecting to payment...
            </h1>
            <p className="text-gray-500 mt-2">Please wait</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">!</div>
            <h1 className="text-xl font-semibold text-gray-800">
              Payment Error
            </h1>
            <p className="text-red-500 mt-2">{error}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
