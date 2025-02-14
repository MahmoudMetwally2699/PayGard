'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PaymentForm from '../components/PaymentForm';

// Separate component for payment content
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const amount = searchParams.get('amount');
    const paymentId = searchParams.get('paymentId');
    const title = searchParams.get('title');

    if (!amount || !paymentId) {
      router.push('/dashboard');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount),
            paymentId,
            title
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Payment initialization failed');
        }
      } catch {
        setError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
      <div className="mb-4">
        <p className="text-gray-600">Payment for: {searchParams.get('title')}</p>
        <p className="text-gray-600">Amount: ${searchParams.get('amount')}</p>
      </div>
      {clientSecret && <PaymentForm clientSecret={clientSecret} />}
    </div>
  );
}

// Main payment page component with Suspense
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
