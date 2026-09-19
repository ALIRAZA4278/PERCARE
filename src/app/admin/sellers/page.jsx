'use client';

import { CheckCircle, ChevronLeft, ChevronRight, Search, Store, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const SELLER_ROLES = ['seller', 'company'];

function SellersTable() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [sellers, setSellers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchSellers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, stores:stores(id, name, is_approved)')
      .in('role', SELLER_ROLES)
      .order('created_at', { ascending: false });
    setSellers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    let rows = sellers;
    if (filter === 'approved') rows = rows.filter((s) => s.is_approved);
    if (filter === 'pending') rows = rows.filter((s) => !s.is_approved);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(rows);
    setPage(0);
  }, [sellers, search, filter]);

  const setApproval = async (seller, approved) => {
    setProcessing(seller.id);
    await supabase.from('profiles').update({ is_approved: approved }).eq('id', seller.id);
    await supabase.from('admin_audit_log').insert({
      admin_id: user?.id,
      action: approved ? 'seller_approved' : 'seller_revoked',
      target_type: 'profile',
      target_id: seller.id,
      details: { email: seller.email },
    });
    setSellers((rows) =>
      rows.map((r) => (r.id === seller.id ? { ...r, is_approved: approved } : r))
    );
    setProcessing(null);
  };

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sellers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} seller{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or city..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'approved', 'pending'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize btn-press transition-expo ${
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
        ) : pageRows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No sellers found.</p>
        ) : (
          <div className="divide-y divide-border">
            {pageRows.map((seller) => (
              <div key={seller.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Store className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {seller.full_name || 'Unnamed seller'}
                    </p>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {seller.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{seller.email}</p>
                  {seller.stores?.length > 0 && (
                    <Link
                      href={`/admin/stores?q=${encodeURIComponent(seller.stores[0].name)}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {seller.stores[0].name}
                    </Link>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    seller.is_approved
                      ? 'bg-vitality/10 text-vitality'
                      : 'bg-amber/10 text-amber'
                  }`}
                >
                  {seller.is_approved ? 'Approved' : 'Pending'}
                </span>

                <button
                  onClick={() => setApproval(seller, !seller.is_approved)}
                  disabled={processing === seller.id}
                  className={`h-9 px-3 rounded-lg text-xs font-semibold btn-press transition-expo shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50 ${
                    seller.is_approved
                      ? 'bg-emergency/10 text-emergency hover:bg-emergency/20'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {seller.is_approved ? (
                    <>
                      <XCircle className="h-3.5 w-3.5" /> Revoke
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted btn-press disabled:opacity-40 inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted btn-press disabled:opacity-40 inline-flex items-center gap-1"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminSellersPage() {
  return (
    <Suspense fallback={null}>
      <SellersTable />
    </Suspense>
  );
}
