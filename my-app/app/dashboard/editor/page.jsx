// src/app/dashboard/editor/page.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { getArticles, createArticle, publishArticleApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditorDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'editor') {
        router.push('/login');
      } else {
        loadArticles();
      }
    }
  }, [user, loading, router]);

  const loadArticles = async () => {
    try {
      const data = await getArticles();
      setArticles(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createArticle({ title, content });
      setTitle('');
      setContent('');
      setStatusMsg('Article created as Draft!');
      loadArticles();
    } catch (err) {
      setStatusMsg('Failed to create article');
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await publishArticleApi(id);
      setStatusMsg(res.message);
      loadArticles();
    } catch (err) {
      setStatusMsg(err.response?.data || 'Failed to publish');
    }
  };

  if (loading || !user) return <div className="text-center mt-20">Verifying Editor credentials...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 Editor Studio</h1>
          <p className="text-sm text-gray-500">Welcome, {user.username} (Role: {user.role})</p>
        </div>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>

      {statusMsg && <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm">{statusMsg}</div>}

      {/* Create Article Form */}
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">
        <h2 className="text-lg font-bold">Write New Article</h2>
        <input type="text" placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border rounded" />
        <textarea placeholder="Article Content" value={content} onChange={(e) => setContent(e.target.value)} required className="w-full p-2 border rounded" rows={3}></textarea>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-medium">Save Draft</button>
      </form>

      {/* Articles List */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-bold">All Articles</h2>
        {articles.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.content}</p>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {item.is_published ? 'PUBLISHED' : 'DRAFT'}
              </span>
            </div>
            {!item.is_published && (
              <button onClick={() => handlePublish(item.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-green-700">
                Publish Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}