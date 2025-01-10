'use client'; // Mark this as a Client Component
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null); // State to store the authenticated user
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [payments, setPayments] = useState([]); // State to store payment requests
  const [title, setTitle] = useState(''); // State for payment title
  const [amount, setAmount] = useState(''); // State for payment amount

  // Fetch the authenticated user on component mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('User:', user); // Log the user object for debugging

      if (error || !user) {
        console.error('No user found, redirecting to login');
        router.push('/login'); // Redirect to login if no user is found
      } else {
        console.log('User is authenticated:', user);
        setUser(user); // Set the authenticated user
        fetchPayments(user.id); // Fetch payments for the logged-in user
      }
      setLoading(false); // Set loading to false after checking
    };

    checkUser();
  }, [router]);

  // Fetch payments for the logged-in user
  const fetchPayments = async (userId) => {
    try {
      const response = await fetch(`/api/payments?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setPayments(data); // Set the payments in state
      } else {
        console.error('Failed to fetch payments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Handle creating a new payment request
  const handleCreatePayment = async (e) => {
    e.preventDefault();

    if (!title || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount, userId: user.id }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Payment created successfully!');
        setTitle(''); // Clear the title field
        setAmount(''); // Clear the amount field
        fetchPayments(user.id); // Refresh the payments list
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Sign out the user
    if (error) {
      console.error('Logout Error:', error);
    } else {
      router.push('/login'); // Redirect to login after logout
    }
  };

  // Show a loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navigation Bar */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">PayGuard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h1 className="text-3xl font-bold">Welcome, {user.email}!</h1>
              <p className="text-blue-100">User Dashboard</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Upload Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Document Upload</h2>
                <p className="text-gray-600 mb-4">Upload your documents securely for verification</p>
                <button
                  onClick={() => router.push('/documents/upload')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Upload Document
                </button>
              </div>

              {/* Create Payment Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Payment Request</h2>
                <form onSubmit={handleCreatePayment} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount ($)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Create Payment
                  </button>
                </form>
              </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Payments</h2>
              {payments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payments found.</p>
              ) : (
                <div className="grid gap-4">
                  {payments.map((payment) => (
                    <div key={payment._id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800">{payment.title}</h3>
                          <p className="text-lg font-bold text-blue-600">${payment.amount}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
