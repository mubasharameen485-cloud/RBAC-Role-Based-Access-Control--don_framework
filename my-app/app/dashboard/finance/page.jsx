// src/app/dashboard/finance/page.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { updateSalaryApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FinanceDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [salary, setSalary] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'finance') {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await updateSalaryApi(userId, salary);
      setStatusMsg(res.message);
      setUserId('');
      setSalary('');
    } catch (err) {
      setErrorMsg(err.response?.data || 'Failed to update salary');
    }
  };

  if (loading || !user) return <div className="text-center mt-20">Verifying Finance credentials...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💰 Finance Payroll Desk</h1>
          <p className="text-sm text-gray-500">Welcome, {user.username} (Role: {user.role})</p>
        </div>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>

      {statusMsg && <div className="bg-green-100 text-green-800 p-4 rounded mb-4 font-semibold">{statusMsg}</div>}
      {errorMsg && <div className="bg-red-100 text-red-800 p-4 rounded mb-4 font-semibold">{errorMsg}</div>}

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl shadow space-y-4 max-w-lg">
        <h2 className="text-lg font-bold text-gray-700">Update Employee Salary</h2>
        <div>
          <label className="block text-sm font-medium text-gray-600">Employee ID</label>
          <input type="number" placeholder="e.g. 1" value={userId} onChange={(e) => setUserId(e.target.value)} required className="w-full p-2 border rounded mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">New Monthly Salary ($)</label>
          <input type="number" placeholder="e.g. 12000" value={salary} onChange={(e) => setSalary(e.target.value)} required className="w-full p-2 border rounded mt-1" />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700">
          Commit Salary Update
        </button>
      </form>
    </div>
  );
}