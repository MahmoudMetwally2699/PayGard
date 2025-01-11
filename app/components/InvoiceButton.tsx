'use client';

import { useState } from 'react';

export default function InvoiceButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      console.log('Downloading invoice for payment:', paymentId);
      const response = await fetch(`/api/payments/${paymentId}/invoice`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : 'Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`text-sm px-3 py-1 ${
        loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
      } text-white rounded transition-colors`}
    >
      {loading ? 'Downloading...' : 'Download Invoice'}
    </button>
  );
}
