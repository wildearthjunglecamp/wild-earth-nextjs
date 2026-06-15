-- ============================================================================
-- Migration 008: Row Level Security (RLS) policies
-- ============================================================================
-- Security model:
--   * Catalog tables (tent_types, tents, addons, date_specific_pricing):
--       public read, admin-only writes.
--   * Sensitive tables (bookings, booking_tents, payments, booking_addons,
--       customers): admin-only via RLS. Public booking writes happen ONLY
--       through create_booking_with_payment(), which is SECURITY DEFINER and
--       therefore bypasses RLS — guests never touch these tables directly.
--   * Internal tables (inventory_items, expenses, users): admin-only.
--
-- Admin identity comes from the JWT: app_metadata.role = 'admin'
-- (matches middleware.ts and lib/auth/adminAuth.ts).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: is_admin() — reads the role claim from the current JWT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata'  ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ----------------------------------------------------------------------------
-- Make the trusted write/read functions run as their owner so they can
-- operate on RLS-protected tables on behalf of anonymous guests.
-- SET search_path is a SECURITY DEFINER best practice.
-- ----------------------------------------------------------------------------
ALTER FUNCTION public.create_booking_with_payment(
  TEXT, TEXT, TEXT, TEXT, DATE, DATE, JSONB, INTEGER, INTEGER,
  DECIMAL, TEXT, TEXT, TEXT, TEXT
) SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.get_available_tents_by_type(DATE, DATE, INTEGER)
  SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.get_available_tents(DATE, DATE, INTEGER)
  SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.check_tent_availability(UUID, DATE, DATE)
  SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================================
-- CATALOG TABLES — public read, admin write
-- ============================================================================

-- tent_types ----------------------------------------------------------------
ALTER TABLE public.tent_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tent_types public read"  ON public.tent_types;
DROP POLICY IF EXISTS "tent_types admin manage" ON public.tent_types;

CREATE POLICY "tent_types public read"
  ON public.tent_types FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "tent_types admin manage"
  ON public.tent_types FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- tents ---------------------------------------------------------------------
ALTER TABLE public.tents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tents public read"  ON public.tents;
DROP POLICY IF EXISTS "tents admin manage" ON public.tents;

CREATE POLICY "tents public read"
  ON public.tents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "tents admin manage"
  ON public.tents FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- addons --------------------------------------------------------------------
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addons public read"  ON public.addons;
DROP POLICY IF EXISTS "addons admin manage" ON public.addons;

CREATE POLICY "addons public read"
  ON public.addons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "addons admin manage"
  ON public.addons FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- date_specific_pricing -----------------------------------------------------
ALTER TABLE public.date_specific_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing public read"  ON public.date_specific_pricing;
DROP POLICY IF EXISTS "pricing admin manage" ON public.date_specific_pricing;

CREATE POLICY "pricing public read"
  ON public.date_specific_pricing FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "pricing admin manage"
  ON public.date_specific_pricing FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- SENSITIVE TABLES — admin-only via RLS.
-- Public writes flow through create_booking_with_payment() (SECURITY DEFINER),
-- so no anon policies are needed here.
-- ============================================================================

-- bookings ------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings admin manage" ON public.bookings;

CREATE POLICY "bookings admin manage"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- booking_tents -------------------------------------------------------------
ALTER TABLE public.booking_tents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_tents admin manage" ON public.booking_tents;

CREATE POLICY "booking_tents admin manage"
  ON public.booking_tents FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- payments ------------------------------------------------------------------
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments admin manage" ON public.payments;

CREATE POLICY "payments admin manage"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- booking_addons ------------------------------------------------------------
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_addons admin manage" ON public.booking_addons;

CREATE POLICY "booking_addons admin manage"
  ON public.booking_addons FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- customers -----------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers admin manage" ON public.customers;

CREATE POLICY "customers admin manage"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- INTERNAL TABLES — admin-only
-- ============================================================================

-- inventory_items -----------------------------------------------------------
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory admin manage" ON public.inventory_items;

CREATE POLICY "inventory admin manage"
  ON public.inventory_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- expenses ------------------------------------------------------------------
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses admin manage" ON public.expenses;

CREATE POLICY "expenses admin manage"
  ON public.expenses FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- users ---------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users admin manage" ON public.users;

CREATE POLICY "users admin manage"
  ON public.users FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Made with Bob
