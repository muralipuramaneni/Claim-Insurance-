-- Quick Setup Script for Insurance Claim System
-- Run this in your Supabase SQL Editor for minimal setup

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('customer', 'agent', 'admin')) DEFAULT 'customer',
    phone TEXT,
    address JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create claims table
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    claim_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('auto', 'health', 'property', 'life')),
    status TEXT NOT NULL CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'settled')) DEFAULT 'submitted',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    amount DECIMAL(12,2),
    description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create claim history table
CREATE TABLE IF NOT EXISTS public.claim_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    notes TEXT,
    performed_by UUID REFERENCES public.profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_history ENABLE ROW LEVEL SECURITY;

-- 5. Basic RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own claims" ON public.claims
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own claim history" ON public.claim_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.claims 
            WHERE claims.id = claim_history.claim_id 
            AND claims.user_id = auth.uid()
        )
    );

-- 6. Auto-create profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger for auto profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Auto-generate claim number function
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.claim_number = 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger for claim number generation
CREATE TRIGGER set_claim_number BEFORE INSERT ON public.claims
    FOR EACH ROW EXECUTE FUNCTION generate_claim_number();

-- Done! Your basic tables are ready.