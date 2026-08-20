'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Trash2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['all', 'active', 'reunited', 'closed'];
const statusBadge = {
  active: 'bg-orange-100 text-orange-700',
  reunited: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function LostFoundAdminPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    let r = tab === 'all' ? posts : posts.filter(p => p.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.pet_name?.toLowerCase().includes(q) ||
        p.species?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.reporter?.full_name?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [posts, search, tab]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lost_found_pets')
      .select('*, reporter:profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'lost_found_pet', target_id: targetId, details });

  const handleResolve = async (post) => {
    setProcessing(post.id);
    const nextStatus = post.status === 'active' ? 'reunited' : 'closed';
    await supabase.from('lost_found_pets').update({ status: nextStatus }).eq('id', post.id);
    await logAudit('resolve_lost_found', post.id, `Marked as ${nextStatus}: ${post.pet_name || post.species}`);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: nextStatus } : p));
    setProcessing(null);
  };

  const handleReopen = async (post) => {
    setProcessing(post.id);
    await supabase.from('lost_found_pets').update({ status: 'active' }).eq('id', post.id);
    await logAudit('reopen_lost_found', post.id, `Reopened: ${post.pet_name || post.species}`);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'active' } : p));
    setProcessing(null);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(deleteModal.id);
    await supabase.from('lost_found_pets').delete().eq('id', deleteModal.id);
    await logAudit('delete_lost_found', deleteModal.id, `Removed: ${deleteModal.pet_name || deleteModal.species}`);
    setPosts(prev => prev.filter(p => p.id !== deleteModal.id));
    setDeleteModal(null);
    setProcessing(null);
  };

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'all' ? posts.length : posts.filter(p => p.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lost & Found</h1>
        <p className="text-sm text-gray-500 mt-1">{posts.length} total posts · moderate spam, close resolved listings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by pet name, species, city, reporter..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setTab(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${tab === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
              {s} <span className="opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 text-sm">No posts in this category</p>
          </div>
        ) : filtered.map(post => (
          <div key={post.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${post.type === 'lost' ? 'bg-red-50' : 'bg-green-50'}`}>
                <AlertTriangle size={18} className={post.type === 'lost' ? 'text-red-600' : 'text-green-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">{post.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[post.status] || 'bg-gray-100 text-gray-600'}`}>{post.status}</span>
                  <span className="text-xs text-gray-500 capitalize">{post.species}{post.breed ? ` · ${post.breed}` : ''}</span>
                </div>
                <p className="text-gray-900 font-semibold">{post.pet_name || 'Unknown Pet'}</p>
                {post.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                  <span>By: {post.reporter?.full_name || 'Unknown'}</span>
                  <span>{post.city || post.last_seen_location || '—'}</span>
                  <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {post.status === 'active' ? (
                  <button onClick={() => handleResolve(post)} disabled={processing === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border border-green-200 disabled:opacity-50">
                    <CheckCircle2 size={13} /> Resolve
                  </button>
                ) : (
                  <button onClick={() => handleReopen(post)} disabled={processing === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200 disabled:opacity-50">
                    Reopen
                  </button>
                )}
                <button onClick={() => setDeleteModal(post)} disabled={processing === post.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200 disabled:opacity-50">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Remove Post</h3>
                <button onClick={() => setDeleteModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                This permanently removes &ldquo;{deleteModal.pet_name || deleteModal.species}&rdquo;. Use this for spam or duplicate posts.
              </p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing === deleteModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing === deleteModal.id ? 'Removing...' : 'Remove'}
                </button>
                <button onClick={() => setDeleteModal(null)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
