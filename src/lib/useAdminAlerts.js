'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DAY_MS = 24 * 60 * 60 * 1000;

export function useAdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * DAY_MS).toISOString();
      const twoDaysAgo = new Date(Date.now() - 2 * DAY_MS).toISOString();

      const [stalePendingVets, stalePendingStores, stuckOrders, openReports, bannedButActive] = await Promise.all([
        supabase.from('vet_profiles').select('id, user:profiles(full_name), created_at').eq('is_approved', false).lt('created_at', fiveDaysAgo).order('created_at', { ascending: true }).limit(3),
        supabase.from('stores').select('id, name, created_at').eq('is_approved', false).lt('created_at', fiveDaysAgo).order('created_at', { ascending: true }).limit(3),
        supabase.from('orders').select('id, status, updated_at').eq('status', 'shipped').lt('updated_at', twoDaysAgo).order('updated_at', { ascending: true }).limit(3),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_banned', true),
      ]);

      const items = [];

      (stalePendingVets.data || []).forEach(v => {
        const days = Math.floor((Date.now() - new Date(v.created_at).getTime()) / DAY_MS);
        items.push({ id: `vet-${v.id}`, severity: 'warning', message: `Vet approval for ${v.user?.full_name || 'a vet'} pending > ${days} days.`, href: '/admin/approvals' });
      });

      (stalePendingStores.data || []).forEach(s => {
        const days = Math.floor((Date.now() - new Date(s.created_at).getTime()) / DAY_MS);
        items.push({ id: `store-${s.id}`, severity: 'warning', message: `Store approval for ${s.name} pending > ${days} days.`, href: '/admin/approvals' });
      });

      (stuckOrders.data || []).forEach(o => {
        items.push({ id: `order-${o.id}`, severity: 'danger', message: `Order ${o.id.slice(0, 8)} marked Shipped > 48h with no update.`, href: '/admin/orders' });
      });

      if ((openReports.count || 0) > 0) {
        items.push({ id: 'reports', severity: 'warning', message: `${openReports.count} report${openReports.count > 1 ? 's' : ''} awaiting review.`, href: '/admin/reports' });
      }

      if ((bannedButActive.count || 0) > 0) {
        items.push({ id: 'banned', severity: 'info', message: `${bannedButActive.count} banned account${bannedButActive.count > 1 ? 's' : ''} on file.`, href: '/admin/users' });
      }

      setAlerts(items);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  return { alerts, loading };
}
