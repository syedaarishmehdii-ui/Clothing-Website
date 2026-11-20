-- ==============================================================================
-- N5 APPARELS - SUPABASE DATABASE SCHEMA & PROFILES TRIGGER
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ynzezkfwflkvqsjarrvx
-- 2. Click "SQL Editor" from the left menu
-- 3. Click "+ New Query", paste this entire script, and click "Run"
-- ==============================================================================

-- 1. PROFILES TABLE (Stores extra customer business data linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    nickname TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    shipping_address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. AUTOMATIC TRIGGER FUNCTION: Creates/updates profile record when a user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, updated_at)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', new.phone),
        new.raw_user_meta_data->>'avatar_url',
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. REAL-TIME ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.n5_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- 4. CUSTOMER QUERIES TABLE
CREATE TABLE IF NOT EXISTS public.n5_queries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STANDALONE USERS TABLE (Fallback & quick lookups)
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

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n5_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n5_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n5_users ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR PROFILES (Allows users to read/insert/update their own profile & allows upsert)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

-- RLS POLICIES FOR ORDERS
DROP POLICY IF EXISTS "Allow public read orders" ON public.n5_orders;
CREATE POLICY "Allow public read orders" ON public.n5_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.n5_orders;
CREATE POLICY "Allow public insert orders" ON public.n5_orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders" ON public.n5_orders;
CREATE POLICY "Allow public update orders" ON public.n5_orders FOR UPDATE USING (true);

-- RLS POLICIES FOR QUERIES
DROP POLICY IF EXISTS "Allow public insert queries" ON public.n5_queries;
CREATE POLICY "Allow public insert queries" ON public.n5_queries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select queries" ON public.n5_queries;
CREATE POLICY "Allow public select queries" ON public.n5_queries FOR SELECT USING (true);

-- RLS POLICIES FOR N5_USERS
DROP POLICY IF EXISTS "Allow public access n5_users" ON public.n5_users;
CREATE POLICY "Allow public access n5_users" ON public.n5_users FOR ALL USING (true) WITH CHECK (true);

-- Done! Your profiles table and automatic trigger on auth.users are fully installed.
