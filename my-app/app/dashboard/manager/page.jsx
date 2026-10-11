// src/app/dashboard/manager/page.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { getManagerReport } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManagerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'manager') {
        router.push('/login');
      } else {
        fetchReport();
      }
    }
  }, [user, loading, router]);

  const fetchReport = async () => {
    try {
      const data = await getManagerReport();
      setReport(data);
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch manager report');
    }
  };

  if (loading || !user) return <div className="text-center mt-20">Verifying Manager credentials...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Manager Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user.username} (Role: {user.role})</p>
        </div>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {report && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-indigo-900 mb-2">{report.message}</h2>
          <p className="text-3xl font-extrabold text-indigo-600">
            Total Company Salary Expense: ${report.total_salary_expense}
          </p>
        </div>
      )}
    </div>
  );
}