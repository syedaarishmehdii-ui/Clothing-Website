-- ==============================================================================
-- N5 APPARELS - 100% FREE CLOUD DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Instructions:
-- 1. Create a FREE project at https://supabase.com (500MB free tier, thousands of users)
-- 2. Open "SQL Editor" from the left menu in your Supabase dashboard
-- 3. Paste this entire SQL script and click "Run"
-- 4. Copy your Project URL & Anon Public API Key from Project Settings > API
-- 5. Paste them into the N5 Apparels Admin Portal (Settings > Free Cloud Database)
-- ==============================================================================

-- 1. USERS TABLE (Stores all customers who login or create account for future marketing & loyalty)
CREATE TABLE IF NOT EXISTS public.n5_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL UNIQUE,
    password TEXT,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDERS TABLE (Stores all orders with UTR, cancellation reasons, and status)
CREATE TABLE IF NOT EXISTS public.n5_orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    shipping NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Placed',
    payment_method TEXT NOT NULL DEFAULT 'UPI QR (Verified)',
    utr TEXT,
    screenshot_url TEXT,
    cancel_reason TEXT,
    cancel_note TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMER QUERIES TABLE
CREATE TABLE IF NOT EXISTS public.n5_queries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC ACCESS FOR THE STOREFRONT
ALTER TABLE public.n5_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n5_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n5_queries ENABLE ROW LEVEL SECURITY;

-- Allow anon public read and write so the static website can query & save records securely
DROP POLICY IF EXISTS "Allow anon insert users" ON public.n5_users;
CREATE POLICY "Allow anon insert users" ON public.n5_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select users" ON public.n5_users;
CREATE POLICY "Allow anon select users" ON public.n5_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon update users" ON public.n5_users;
CREATE POLICY "Allow anon update users" ON public.n5_users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon insert orders" ON public.n5_orders;
CREATE POLICY "Allow anon insert orders" ON public.n5_orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select orders" ON public.n5_orders;
CREATE POLICY "Allow anon select orders" ON public.n5_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon update orders" ON public.n5_orders;
CREATE POLICY "Allow anon update orders" ON public.n5_orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon insert queries" ON public.n5_queries;
CREATE POLICY "Allow anon insert queries" ON public.n5_queries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select queries" ON public.n5_queries;
CREATE POLICY "Allow anon select queries" ON public.n5_queries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon update queries" ON public.n5_queries;
CREATE POLICY "Allow anon update queries" ON public.n5_queries FOR UPDATE USING (true);

-- Done! Your free PostgreSQL cloud database is ready for N5 Apparels!
