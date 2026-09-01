'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Users, Stethoscope, Store, Package, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAlerts } from '@/lib/useAdminAlerts';

const typeIcon = { user: Users, vet: Stethoscope, store: Store, product: Package };
const severityColor = { danger: 'bg-red-50 border-red-200 text-red-700', warning: 'bg-orange-50 border-orange-200 text-orange-700', info: 'bg-blue-50 border-blue-200 text-blue-700' };

export default function AdminHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const searchRef = useRef(null);
  const alertsRef = useRef(null);
  const { alerts } = useAdminAlerts();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (alertsRef.current && !alertsRef.current.contains(e.target)) setShowAlerts(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const timer = setTimeout(async () => {
      const [usersRes, vetsRes, storesRes, productsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').ilike('full_name', `%${q}%`).limit(3),
        supabase.from('vet_profiles').select('id, user:profiles(full_name, email)').limit(20),
        supabase.from('stores').select('id, name, city').ilike('name', `%${q}%`).limit(3),
        supabase.from('products').select('id, name').ilike('name', `%${q}%`).limit(3),
      ]);
      const matchedVets = (vetsRes.data || []).filter(v => v.user?.full_name?.toLowerCase().includes(q.toLowerCase())).slice(0, 3);
      setResults([
        ...(usersRes.data || []).map(u => ({ type: 'user', id: u.id, label: u.full_name, sub: u.email, href: '/admin/users' })),
        ...matchedVets.map(v => ({ type: 'vet', id: v.id, label: v.user?.full_name, sub: v.user?.email, href: '/admin/vets' })),
        ...(storesRes.data || []).map(s => ({ type: 'store', id: s.id, label: s.name, sub: s.city, href: '/admin/stores' })),
        ...(productsRes.data || []).map(p => ({ type: 'product', id: p.id, label: p.name, sub: 'Product', href: '/admin/products' })),
      ]);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goTo = (href) => {
    router.push(`${href}?q=${encodeURIComponent(query)}`);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
      <div ref={searchRef} className="relative flex-1 max-w-xl">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder="Search users, vets, stores, products..."
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-300 focus:bg-white transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No matches</p>
            ) : results.map(r => {
              const Icon = typeIcon[r.type];
              return (
                <button key={`${r.type}-${r.id}`} onClick={() => goTo(r.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{r.label || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{r.sub}</p>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase shrink-0">{r.type}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div ref={alertsRef} className="relative shrink-0">
        <button onClick={() => setShowAlerts(v => !v)} className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <Bell size={18} />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
          )}
        </button>
        {showAlerts && (
          <div className="absolute top-full right-0 mt-1.5 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Alerts</h3>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">All clear — no active alerts</p>
            ) : alerts.map(a => (
              <button key={a.id} onClick={() => { router.push(a.href); setShowAlerts(false); }}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors`}>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mb-1 uppercase ${severityColor[a.severity]}`}>{a.severity}</span>
                <p className="text-xs text-gray-700 leading-relaxed">{a.message}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
