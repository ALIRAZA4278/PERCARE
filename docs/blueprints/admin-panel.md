# Blueprint: Admin Panel

> Based on: Direct spec document (FluffyNest / PetCare Ecosystem Admin Panel)
> Status: Draft
> Date: 2026-05-21
> Depth: Deep

---

## Purpose

Platform admins can approve vets/stores/shelters, manage users, moderate reviews and reports, track orders, handle support tickets, and view a full audit log — all from a single secure dashboard at `/admin-dashboard`.

## Scope

### In Scope
- Admin sidebar + layout + route guard (`role === 'admin'`)
- Overview page with real KPI counts
- Approvals (Vets, Stores, Shelters, Products)
- User management (list, search, ban/unban, view profile)
- Orders view (all marketplace orders with status)
- Reports moderation (resolve/dismiss user reports)
- Review moderation (remove inappropriate reviews)
- Support tickets (create, assign, resolve)
- Audit logs (read-only log of all admin actions)

### Out of Scope
- Multi-role admin (Super Admin vs Moderator) — single `admin` role only (Phase 1)
- Email notifications to users on approval — notify via `notifications` table only
- Analytics charts — just counts and tables for Phase 1
- Admin creation UI — set `role = 'admin'` directly in Supabase for now

---

## Context & Research

### Existing Patterns to Follow
- `src/app/vet-dashboard/layout.jsx` — role guard pattern (`profile.role !== 'veterinarian'`)
- `src/components/VetSidebar.jsx` — sidebar structure, mobile hamburger, active state
- `src/app/seller-dashboard/products/page.jsx` — table list + modal pattern
- `src/app/vet-dashboard/page.jsx` — KPI cards + stat fetching with `Promise.all`
- `supabase.from('notifications').insert(...)` — in-app notification on approval/rejection

### Existing Tables (ready to use)
| Table | Used For |
|-------|----------|
| `profiles` | User list, ban/unban (`is_banned`), role filter |
| `vet_profiles` | Vet approvals |
| `stores` | Seller/store approvals (`is_approved`) |
| `shelters` | Shelter verifications (`is_verified`) |
| `products` | Product approvals (`is_approved`) |
| `orders` + `order_items` | Orders management |
| `reviews` | Review moderation |
| `reports` | User reports moderation |
| `admin_audit_log` | Audit trail |
| `user_bans` | Ban records |
| `notifications` | Notify users on approval/reject |

### Tables Needing Schema Changes
- `vet_profiles` — missing `is_approved`, `certificate_url`, `rejection_reason`
- New table: `support_tickets`

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route | `/admin-dashboard` | Consistent with existing `/vet-dashboard`, `/seller-dashboard` |
| Sidebar accent | Red/dark (`red-600`) | Visually distinct from blue (vet) and green (seller) |
| Auth guard | `profile.role === 'admin'` | Already in profiles CHECK constraint |
| Audit logging | Insert to `admin_audit_log` on every approve/reject/ban action | Already in schema |
| Notifications | Insert to `notifications` on approval/rejection | Reuse existing pattern |
| Support tickets | New `support_tickets` table | Not in existing schema |
| Admin creation | Manual (Supabase dashboard) | No self-serve admin registration |

---

## Schema Changes

### Modified Tables

#### `vet_profiles` — Add missing approval columns
```sql
ALTER TABLE vet_profiles
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
```

### New Tables

#### `support_tickets`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| created_by | UUID → profiles | Ticket submitter |
| assigned_to | UUID → profiles nullable | Admin assigned |
| subject | TEXT | |
| description | TEXT | |
| status | TEXT | `open`, `in_progress`, `resolved`, `closed` |
| priority | TEXT | `low`, `medium`, `high`, `urgent` |
| category | TEXT | `account`, `payment`, `technical`, `abuse`, `other` |
| admin_notes | TEXT nullable | Internal notes |
| resolved_at | TIMESTAMPTZ nullable | |
| created_at | TIMESTAMPTZ | |

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'other' CHECK (category IN ('account', 'payment', 'technical', 'abuse', 'other')),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );
```

---

## Component Tree

```
src/app/admin-dashboard/
  layout.jsx                    — Role guard + AdminSidebar wrapper
  page.jsx                      — Overview (KPIs)
  approvals/page.jsx            — Tabbed: Vets / Stores / Shelters / Products
  users/page.jsx                — User list + ban/unban
  orders/page.jsx               — All orders table
  reports/page.jsx              — Reports moderation
  reviews/page.jsx              — Review moderation
  tickets/page.jsx              — Support tickets
  audit/page.jsx                — Audit log

src/components/
  AdminSidebar.jsx              — Sidebar (mirrors VetSidebar, red accent)
```

---

## File-by-File Plan

---

### Phase 1: Schema + Foundation — [DB] [CONFIG]

**Goal:** SQL migrations done, layout guard working, sidebar renders.

#### Task 1.1: Run schema migrations in Supabase
- **Size:** XS
- **Acceptance criteria:**
  - [ ] `vet_profiles` has `is_approved`, `certificate_url`, `rejection_reason` columns
  - [ ] `support_tickets` table exists with RLS enabled
- **Files:** SQL to run in Supabase SQL Editor (provided below in SQL section)
- **Verification:** Supabase Table Editor shows new columns/table
- **Dependencies:** None

#### Task 1.2: Build AdminSidebar component
- **Size:** S
- **Acceptance criteria:**
  - [ ] Desktop sidebar fixed left, `w-64`, red-600 accent
  - [ ] Mobile hamburger opens overlay sidebar
  - [ ] Active nav item highlighted with `bg-red-50 text-red-600`
  - [ ] Nav items: Overview, Approvals, Users, Orders, Reports, Reviews, Tickets, Audit Log, Sign Out
  - [ ] Shows admin name + email from `useAuth().profile`
- **Files:** `src/components/AdminSidebar.jsx`
- **Pattern to follow:** `src/components/VetSidebar.jsx` exactly
- **Verification:** Component renders without errors
- **Dependencies:** None

#### Task 1.3: Build admin-dashboard layout + route guard
- **Size:** XS
- **Acceptance criteria:**
  - [ ] Redirects to `/login` if not logged in
  - [ ] Redirects to `/` if `profile.role !== 'admin'`
  - [ ] Renders `<AdminSidebar />` + `<main className="lg:ml-64 ...">` when authorized
- **Files:** `src/app/admin-dashboard/layout.jsx`
- **Pattern to follow:** `src/app/vet-dashboard/layout.jsx`
- **Verification:** Visiting `/admin-dashboard` with non-admin account redirects to `/`
- **Dependencies:** Task 1.2

**Checkpoint after Phase 1:** Layout renders for admin role, redirects correctly for others.

---

### Phase 2: Overview Dashboard — [UI]

**Goal:** Admin sees platform health at a glance with real counts.

#### Task 2.1: Build overview page with KPI cards
- **Size:** M
- **Acceptance criteria:**
  - [ ] Cards show: Total Users, Pending Vet Approvals, Pending Store Approvals, Active Orders, Open Reports, Open Tickets
  - [ ] All counts fetched from Supabase with `{ count: 'exact', head: true }`
  - [ ] Pending counts use orange/red color to signal urgency
  - [ ] Recent signups list (last 5 users, name + role + date)
  - [ ] Recent reports list (last 5, reason + status)
- **Files:** `src/app/admin-dashboard/page.jsx`
- **Pattern to follow:** `src/app/vet-dashboard/page.jsx` — `Promise.all` for parallel fetches
- **Verification:** Page loads with real numbers, no hardcoded data
- **Dependencies:** Phase 1

**Checkpoint after Phase 2:** Overview page shows live counts.

---

### Phase 3: Approvals — [UI]

**Goal:** Admin can approve or reject vets, stores, shelters, and products.

#### Task 3.1: Build approvals page with 4 tabs
- **Size:** L
- **Acceptance criteria:**
  - [ ] 4 tabs: Vets, Stores, Shelters, Products — tab shows pending count badge
  - [ ] **Vets tab**: shows name, license number, specialization, certificate image (if uploaded), Approve/Reject buttons
  - [ ] Approve vet → `vet_profiles.is_approved = true` + insert notification to user + insert audit log
  - [ ] Reject vet → modal asks for reason → saves `rejection_reason` + notification + audit log
  - [ ] **Stores tab**: shows store name, owner name, category, Approve/Reject
  - [ ] Approve store → `stores.is_approved = true` + notification + audit log
  - [ ] **Shelters tab**: shows shelter name, city, Verify/Reject
  - [ ] Verify shelter → `shelters.is_verified = true` + notification + audit log
  - [ ] **Products tab**: shows product name, store, price, image, Approve/Reject
  - [ ] Approve product → `products.is_approved = true` + audit log
  - [ ] All pending items shown by default; toggle to show approved
- **Files:** `src/app/admin-dashboard/approvals/page.jsx`
- **Pattern to follow:** Tab pattern from `src/app/lost-found/page.jsx`, card list from seller products page
- **Verification:** Approve a vet → their `is_approved` becomes true in Supabase, notification appears in their dashboard
- **Dependencies:** Task 1.1 (vet_profiles schema), Phase 1

**Checkpoint after Phase 3:** Full approval workflow functional.

---

### Phase 4: User Management — [UI]

**Goal:** Admin can find, view, and ban/unban any user.

#### Task 4.1: Build users list page
- **Size:** M
- **Acceptance criteria:**
  - [ ] Table shows: avatar initial, full name, email, role (colored badge), city, joined date, status (active/banned)
  - [ ] Search by name or email (client-side filter)
  - [ ] Filter by role dropdown (All, pet_owner, veterinarian, seller, shelter, admin)
  - [ ] Ban button → modal asks for reason + ban type (temporary/permanent) → inserts to `user_bans` + sets `profiles.is_banned = true` + audit log
  - [ ] Unban button (for banned users) → sets `user_bans.is_active = false` + `profiles.is_banned = false` + audit log
  - [ ] Pagination: 20 users per page
- **Files:** `src/app/admin-dashboard/users/page.jsx`
- **Pattern to follow:** Table layout from `src/app/admin-dashboard/approvals/page.jsx`
- **Verification:** Ban a user → their `is_banned` = true in Supabase
- **Dependencies:** Phase 1

---

### Phase 5: Orders Management — [UI]

**Goal:** Admin can view and track all marketplace orders.

#### Task 5.1: Build orders list page
- **Size:** S
- **Acceptance criteria:**
  - [ ] Table: order ID (short), buyer name, total amount, payment method, status badge, date
  - [ ] Status badges: pending (orange), confirmed (blue), shipped (purple), delivered (green), cancelled (red)
  - [ ] Click row → expand to show order items (product name, qty, price)
  - [ ] Filter by status tabs at top
  - [ ] Total revenue shown as a summary card at top
- **Files:** `src/app/admin-dashboard/orders/page.jsx`
- **Verification:** Orders match what's in Supabase `orders` table
- **Dependencies:** Phase 1

---

### Phase 6: Reports & Review Moderation — [UI]

**Goal:** Admin can investigate and resolve user reports and remove bad reviews.

#### Task 6.1: Build reports moderation page
- **Size:** S
- **Acceptance criteria:**
  - [ ] List of reports: reporter, target type, reason, description, status badge, date
  - [ ] Filter by status: pending, investigating, resolved, dismissed
  - [ ] Resolve button → set `status = 'resolved'`, add `admin_notes`, set `resolved_by` + `resolved_at` + audit log
  - [ ] Dismiss button → set `status = 'dismissed'` + audit log
- **Files:** `src/app/admin-dashboard/reports/page.jsx`
- **Verification:** Resolving a report updates its status in Supabase
- **Dependencies:** Phase 1

#### Task 6.2: Build review moderation page
- **Size:** S
- **Acceptance criteria:**
  - [ ] List of all reviews: reviewer name, target (vet/store/shelter), rating, comment, date
  - [ ] Filter: show flagged reviews first (those with associated reports)
  - [ ] Delete review → `supabase.from('reviews').delete()` + audit log
  - [ ] Confirm modal before delete
- **Files:** `src/app/admin-dashboard/reviews/page.jsx`
- **Verification:** Deleted review disappears from public vet/store profile
- **Dependencies:** Phase 1

**Checkpoint after Phase 6:** Full moderation workflow works.

---

### Phase 7: Support Tickets — [UI]

**Goal:** Users can raise tickets; admins can manage and resolve them.

#### Task 7.1: Build support tickets page
- **Size:** M
- **Acceptance criteria:**
  - [ ] List: ticket subject, submitter, category, priority badge, status, created date
  - [ ] Filter by status + priority
  - [ ] Click ticket → side panel/modal shows full description + admin notes field
  - [ ] Admin can update status and add internal notes → saves to `support_tickets`
  - [ ] Priority badges: urgent=red, high=orange, medium=blue, low=gray
- **Files:** `src/app/admin-dashboard/tickets/page.jsx`
- **Verification:** Updating ticket status reflects in DB
- **Dependencies:** Task 1.1 (support_tickets table)

---

### Phase 8: Audit Log — [UI]

**Goal:** All admin actions are visible and searchable.

#### Task 8.1: Build audit log page
- **Size:** S
- **Acceptance criteria:**
  - [ ] Table: admin name, action, target type, target ID (short), details, timestamp
  - [ ] Read-only — no actions available
  - [ ] 50 rows per page, newest first
  - [ ] Search by action or target type
- **Files:** `src/app/admin-dashboard/audit/page.jsx`
- **Verification:** After approving a vet, a new audit entry appears in this page
- **Dependencies:** Phase 1

---

## SQL to Run Before Building

Run this in Supabase SQL Editor before starting:

```sql
-- 1. Add missing columns to vet_profiles
ALTER TABLE vet_profiles
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'other' CHECK (category IN ('account', 'payment', 'technical', 'abuse', 'other')),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- 3. Add admin SELECT policy on vet_profiles (for approvals page)
CREATE POLICY "Admins can view all vet profiles" ON vet_profiles
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can update vet profiles" ON vet_profiles
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- 4. Add admin policies on stores, shelters, products
CREATE POLICY "Admins can update stores" ON stores
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update shelters" ON shelters
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can delete reviews" ON reviews
  FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
```

---

## Verification Criteria

- [ ] Non-admin user visiting `/admin-dashboard` is redirected to `/`
- [ ] Approving a vet sets `vet_profiles.is_approved = true` + creates a notification + creates audit log entry
- [ ] Banning a user sets `profiles.is_banned = true` + creates a `user_bans` record
- [ ] Resolving a report sets `reports.status = 'resolved'` with admin notes
- [ ] Deleting a review removes it from vet/store public page
- [ ] Every admin action (approve/reject/ban/unban/resolve/delete) creates a row in `admin_audit_log`

---

## Estimate

| Phase | Tasks | Size | Range |
|-------|-------|------|-------|
| Phase 1: Foundation | 1.1, 1.2, 1.3 | XS, S, XS | 1-2 hrs |
| Phase 2: Overview | 2.1 | M | 1-2 hrs |
| Phase 3: Approvals | 3.1 | L | 2-3 hrs |
| Phase 4: Users | 4.1 | M | 1-2 hrs |
| Phase 5: Orders | 5.1 | S | 1 hr |
| Phase 6: Reports + Reviews | 6.1, 6.2 | S, S | 1-2 hrs |
| Phase 7: Tickets | 7.1 | M | 1-2 hrs |
| Phase 8: Audit Log | 8.1 | S | 30 min-1 hr |
| **Total** | | | **9-15 hrs** |

**Assumptions:**
- Existing Supabase + Next.js App Router patterns followed exactly
- No new npm packages needed (lucide-react already installed)
- SQL migrations run cleanly (no conflicting policies)
- Admin user account created manually in Supabase

---

## Three-Tier Boundaries

### Always (proceed without asking)
- Follow VetSidebar/SellerSidebar pattern exactly
- Red-600 as admin accent color
- Insert audit log on every approve/reject/ban action

### Ask First
- Any change to existing RLS policies on shared tables
- Adding admin access to tables not listed above

### Never
- Expose `SUPABASE_SERVICE_ROLE_KEY` in client code — use RLS policies
- Allow admin to set another user's role to `admin` via UI
