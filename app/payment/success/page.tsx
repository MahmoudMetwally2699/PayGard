'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Separate component for the success content
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (paymentIntentId) {
        try {
          await fetch('/api/payments/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId }),
          });
        } catch (error) {
          console.error('Error updating payment status:', error);
        }
      }
    };

    updatePaymentStatus();
  }, [paymentIntentId]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="mb-6">Your payment has been processed successfully.</p>
      <Link
        href="/dashboard"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

// Main success page component with Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
