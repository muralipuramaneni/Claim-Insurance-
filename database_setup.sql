-- Insurance Claim System - Database Schema
-- Run this script in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('customer', 'agent', 'admin')) DEFAULT 'customer',
    phone TEXT,
    address JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims table
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

-- Claim documents table
CREATE TABLE IF NOT EXISTS public.claim_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim history/audit trail table
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

-- AI processing logs table
CREATE TABLE IF NOT EXISTS public.ai_processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    node_name TEXT NOT NULL,
    input_data JSONB,
    output_data JSONB,
    execution_time INTEGER, -- milliseconds
    status TEXT CHECK (status IN ('success', 'error', 'pending')) NOT NULL,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table (for application configuration)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_type ON public.claims(type);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON public.claims(created_at);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON public.claims(claim_number);

CREATE INDEX IF NOT EXISTS idx_claim_history_claim_id ON public.claim_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_history_performed_at ON public.claim_history(performed_at);

CREATE INDEX IF NOT EXISTS idx_claim_documents_claim_id ON public.claim_documents(claim_id);

CREATE INDEX IF NOT EXISTS idx_ai_logs_claim_id ON public.ai_processing_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status ON public.ai_processing_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_logs_processed_at ON public.ai_processing_logs(processed_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Claims policies
CREATE POLICY "Users can view own claims" ON public.claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own claims" ON public.claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own claims" ON public.claims
    FOR UPDATE USING (auth.uid() = user_id);

-- Agents can view all claims
CREATE POLICY "Agents can view all claims" ON public.claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('agent', 'admin')
        )
    );

-- Agents can update any claim
CREATE POLICY "Agents can update any claim" ON public.claims
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('agent', 'admin')
        )
    );

-- Claim documents policies
CREATE POLICY "Users can view own claim documents" ON public.claim_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.claims 
            WHERE claims.id = claim_documents.claim_id 
            AND claims.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own claim documents" ON public.claim_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.claims 
            WHERE claims.id = claim_documents.claim_id 
            AND claims.user_id = auth.uid()
        )
    );

-- Agents can view all claim documents
CREATE POLICY "Agents can view all claim documents" ON public.claim_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('agent', 'admin')
        )
    );

-- Claim history policies
CREATE POLICY "Users can view own claim history" ON public.claim_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.claims 
            WHERE claims.id = claim_history.claim_id 
            AND claims.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert claim history" ON public.claim_history
    FOR INSERT WITH CHECK (true);

-- Agents can view all claim history
CREATE POLICY "Agents can view all claim history" ON public.claim_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('agent', 'admin')
        )
    );

-- AI processing logs policies
CREATE POLICY "Users can view own AI logs" ON public.ai_processing_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.claims 
            WHERE claims.id = ai_processing_logs.claim_id 
            AND claims.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert AI logs" ON public.ai_processing_logs
    FOR INSERT WITH CHECK (true);

-- Agents can view all AI logs
CREATE POLICY "Agents can view all AI logs" ON public.ai_processing_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('agent', 'admin')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
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

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.claim_number = 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate claim number
CREATE TRIGGER set_claim_number BEFORE INSERT ON public.claims
    FOR EACH ROW EXECUTE FUNCTION generate_claim_number();

-- Function to log claim status changes
CREATE OR REPLACE FUNCTION log_claim_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.claim_history (
            claim_id,
            action,
            previous_status,
            new_status,
            notes,
            performed_by
        ) VALUES (
            NEW.id,
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            OLD.status,
            NEW.status,
            'Automatic status change log',
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log status changes
CREATE TRIGGER log_claim_status_changes AFTER UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION log_claim_status_change();

-- =====================================================
-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
    ('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
    ('allowed_file_types', '["jpg", "jpeg", "png", "pdf", "doc", "docx"]', 'Allowed file types for document upload'),
    ('auto_approve_threshold', '1000', 'Claims under this amount may be auto-approved'),
    ('fraud_threshold', '0.7', 'Fraud probability threshold for investigation'),
    ('claim_expiry_days', '30', 'Days after which incomplete claims expire')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 7. CREATE STORAGE BUCKETS (for file uploads)
-- =====================================================

-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for claim documents
CREATE POLICY "Users can upload own claim documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'claim-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own claim documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'claim-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Agents can view all documents
CREATE POLICY "Agents can view all claim documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'claim-documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('agent', 'admin')
        )
    );

-- =====================================================
-- 8. CREATE VIEWS FOR REPORTING
-- =====================================================

-- Claims summary view
CREATE OR REPLACE VIEW public.claims_summary AS
SELECT 
    c.id,
    c.claim_number,
    c.type,
    c.status,
    c.priority,
    c.amount,
    c.incident_date,
    c.submitted_date,
    p.full_name as customer_name,
    p.role as customer_role,
    EXTRACT(DAY FROM (NOW() - c.submitted_date)) as days_pending
FROM public.claims c
JOIN public.profiles p ON c.user_id = p.id;

-- Claims statistics view
CREATE OR REPLACE VIEW public.claims_statistics AS
SELECT 
    status,
    type,
    COUNT(*) as count,
    AVG(amount) as avg_amount,
    SUM(amount) as total_amount,
    MIN(submitted_date) as oldest_claim,
    MAX(submitted_date) as newest_claim
FROM public.claims
GROUP BY status, type;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment these to verify the setup:

-- SELECT 'Tables created successfully' as status;

-- SELECT table_name, table_type 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'claims', 'claim_documents', 'claim_history', 'ai_processing_logs', 'notifications', 'system_settings');

-- SELECT schemaname, tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- SELECT 'Database setup completed successfully!' as message;