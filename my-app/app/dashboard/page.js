
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StandardDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Standard User Portal</h1>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1.5 rounded text-sm">Logout</button>
      </div>
      <p>Hello <strong>{user.username}</strong>! Your account has role: <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{user.role}</span></p>
    </div>
  );
}