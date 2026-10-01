-- ============================================================
-- Fix: the admin panel cannot see most of the platform's data
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================
--
-- Found by logging into the admin panel: it reported "Total Orders 0"
-- and "Total Revenue Rs. 0" straight after an order was placed, and
-- Support Tickets showed "0 total tickets".
--
-- The queries are correct. Row Level Security is filtering them:
--
--   orders / order_items   only "Buyers can view own orders" exists, so an
--                          admin sees nothing but its own purchases
--   appointments           only the involved parties can read theirs
--   adoption_requests      only requester and shelter owner
--   notifications          users can read their own, and nothing can INSERT
--                          at all — so every "approved!" notification the
--                          admin sends is silently dropped
--   support_tickets        the table is not in any migration; RLS is on with
--                          no policy, so it is unreadable by everyone
--
-- Everything below is additive: existing user-facing policies are left
-- alone, these only widen access for role = 'admin'.
-- ============================================================

-- Helper so each policy stays readable.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ---------- orders ----------
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (public.is_admin());

-- ---------- order_items ----------
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (public.is_admin());

-- ---------- appointments ----------
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (public.is_admin());

-- ---------- adoption_requests ----------
DROP POLICY IF EXISTS "Admins can view all adoption requests" ON adoption_requests;
CREATE POLICY "Admins can view all adoption requests" ON adoption_requests
  FOR SELECT USING (public.is_admin());

-- ---------- notifications ----------
-- Without an INSERT policy, nothing could ever create a notification, so the
-- "your store was approved" messages were never delivered.
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can send notifications" ON notifications;
CREATE POLICY "Admins can send notifications" ON notifications
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------- support_tickets ----------
-- The admin panel reads this table but no migration ever created it.
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets;
CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING (public.is_admin());

-- ---------- confirm ----------
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('orders','order_items','appointments','adoption_requests',
                    'notifications','support_tickets')
ORDER BY tablename, cmd, policyname;
