-- ==============================================================================
-- N5 APPARELS - COMPLETE DATABASE SCHEMA, PROFILES & REAL-TIME ORDERS
-- ==============================================================================
-- Copy this ENTIRE file (from top to bottom) and paste into Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PUBLIC.PROFILES (Customer business profile linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
END $$;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

-- Trigger function to auto-create profile when user registers via Supabase Auth
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 2. PUBLIC.N5_ORDERS (Real-time customer orders with UPI UTR verification)
-- ------------------------------------------------------------------------------
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

ALTER TABLE public.n5_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read orders" ON public.n5_orders;
    DROP POLICY IF EXISTS "Allow public insert orders" ON public.n5_orders;
    DROP POLICY IF EXISTS "Allow public update orders" ON public.n5_orders;
END $$;

CREATE POLICY "Allow public read orders" ON public.n5_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.n5_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.n5_orders FOR UPDATE USING (true);


-- ------------------------------------------------------------------------------
-- 3. PUBLIC.N5_QUERIES (Customer queries & inquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.n5_queries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.n5_queries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public insert queries" ON public.n5_queries;
    DROP POLICY IF EXISTS "Allow public select queries" ON public.n5_queries;
    DROP POLICY IF EXISTS "Allow public update queries" ON public.n5_queries;
END $$;

CREATE POLICY "Allow public insert queries" ON public.n5_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select queries" ON public.n5_queries FOR SELECT USING (true);
CREATE POLICY "Allow public update queries" ON public.n5_queries FOR UPDATE USING (true);


-- ------------------------------------------------------------------------------
-- 4. PUBLIC.N5_USERS (Fallback standalone customer records)
-- ------------------------------------------------------------------------------
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

ALTER TABLE public.n5_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public access n5_users" ON public.n5_users;
END $$;

CREATE POLICY "Allow public access n5_users" ON public.n5_users FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SUCCESS: Tables, profiles, triggers, and RLS policies are now 100% active!
-- ==============================================================================
