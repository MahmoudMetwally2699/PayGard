'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [downloading, setDownloading] = useState({});
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate payment summaries
  const calculateSummary = (paymentsData) => {
    return {
      total: paymentsData.length,
      totalAmount: paymentsData.reduce((sum, p) => sum + p.amount, 0),
      pending: paymentsData.filter(p => p.status === 'pending').length,
      approved: paymentsData.filter(p => p.status === 'approved').length,
      rejected: paymentsData.filter(p => p.status === 'rejected').length
    };
  };

  // Apply filters to payments
  const applyFilters = useCallback(() => {
    let filtered = [...payments];

    if (filters.startDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(filters.endDate));
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    setFilteredPayments(filtered);
  }, [filters, payments]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch all documents (for admin)
  const fetchAllDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      if (response.ok) {
        setDocuments(data);
      } else {
        console.error('Failed to fetch documents:', data.message);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Handle updating document status
  const handleUpdateDocumentStatus = async (documentId, status) => {
    console.log('Document ID:', documentId); // Log the document ID

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Document status updated successfully!');
        fetchAllDocuments(); // Refresh the documents list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('Failed to update document status. Please try again.');
    }
  };

  // Handle downloading a document
  const handleDownloadDocument = async (fileUrl, documentId) => {
    setDownloading((prev) => ({ ...prev, [documentId]: true }));
    try {
      // Remove any leading slashes and get the clean path
      const cleanPath = fileUrl.replace(/^\/+/, '');
      console.log('Attempting to download file:', cleanPath);

      const { data, error } = await supabase.storage
        .from('documents')
        .download(cleanPath);

      console.log('Supabase Download Response:', { data, error }); // Log the response

      if (error) {
        console.error('Supabase Storage Error Details:', {
          message: error.message,
          name: error.name,
          status: error.status,
          statusCode: error.statusCode
        });
        alert('Failed to download document. Please try again.');
        return;
      }

      if (!data) {
        console.error('No data received from Supabase');
        alert('Failed to download document. No data received.');
        return;
      }

      // Create a temporary link to download the file
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanPath.split('/').pop(); // Use the file name as the download name
      document.body.appendChild(link); // Append to body
      link.click();
      document.body.removeChild(link); // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      // Step 1: Check if the user is authenticated with Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      if (error || !supabaseUser) {
        console.error('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      // Step 2: Fetch the user's role from MongoDB
      try {
        const response = await fetch(`/api/users?supabaseUserId=${supabaseUser.id}`);
        const data = await response.json();
        if (response.ok) {
          if (data.role !== 'admin') {
            console.error('User is not an admin, redirecting to dashboard');
            router.push('/dashboard'); // Redirect non-admin users
            return;
          }
          setUser({ ...supabaseUser, role: data.role }); // Combine Supabase and MongoDB data
          fetchAllPayments(); // Fetch all payments for admin
        } else {
          console.error('Failed to fetch user role:', data.message);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  // Fetch all payments (for admin)
  const fetchAllPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      if (response.ok) {
        setPayments(data);
      } else {
        console.error('Failed to fetch payments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Handle updating payment status
  const handleUpdateStatus = async (paymentId, status) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Payment status updated successfully!');
        fetchAllPayments(); // Refresh the payments list
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const summary = calculateSummary(filteredPayments);

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-50 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
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
              <p className="text-blue-100">Admin Dashboard</p>
            </div>

            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm text-blue-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-800">${summary.totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{summary.pending}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-800">{summary.approved}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm text-red-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-800">{summary.rejected}</p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Payments Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">All Payments</h2>
              {filteredPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payments found.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment._id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{payment.title}</p>
                          <p className="text-sm text-gray-600">ID: {payment._id}</p>
                          <p className="text-lg font-bold text-blue-600">${payment.amount}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(payment._id, 'approved')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(payment._id, 'rejected')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">All Documents</h2>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No documents found.</p>
              ) : (
                <div className="grid gap-4">
                  {documents.map((document) => (
                    <div key={document._id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600">User ID: {document.userId}</p>
                          <p className="text-sm text-gray-600">Status: <span className={`font-semibold ${
                            document.status === 'approved' ? 'text-green-600' :
                            document.status === 'rejected' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>{document.status}</span></p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadDocument(document.fileUrl, document._id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                            disabled={downloading[document._id]}
                          >
                            {downloading[document._id] ? 'Downloading...' : 'Download'}
                          </button>
                          <button
                            onClick={() => handleUpdateDocumentStatus(document._id, 'approved')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateDocumentStatus(document._id, 'rejected')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
