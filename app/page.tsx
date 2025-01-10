'use client'; // Mark this as a Client Component
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Redirect to dashboard if logged in
        router.push('/dashboard');
      } else {
        // Redirect to login if not logged in
        router.push('/login');
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p>Loading...</p>
    </div>
  );
}
