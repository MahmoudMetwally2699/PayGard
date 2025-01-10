'use client'; // Mark this as a Client Component
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
          console.error('No user ID found. User might not be logged in.');
          return;
        }

        const response = await fetch(`/api/payments?userId=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setPayments(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    fetchPayments();
  }, []);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <ul>
        {payments.map((payment) => (
          <li key={payment._id} className="mb-4 p-4 border rounded">
            <p>Title: {payment.title}</p>
            <p>Amount: {payment.amount}</p>
            <p>Status: {payment.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
