'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
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
