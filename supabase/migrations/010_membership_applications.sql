-- ============================================
-- MEMBERSHIP APPLICATIONS TABLE
-- ============================================

CREATE TABLE public.membership_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    academic_year INTEGER NOT NULL CHECK (academic_year BETWEEN 1 AND 4),
    interests TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_membership_applications_email ON public.membership_applications(email);
CREATE INDEX idx_membership_applications_status ON public.membership_applications(status);
CREATE INDEX idx_membership_applications_user ON public.membership_applications(user_id);

-- Updated_at trigger
CREATE TRIGGER update_membership_applications_updated_at
    BEFORE UPDATE ON public.membership_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access membership_applications" ON public.membership_applications
    FOR ALL USING (true) WITH CHECK (true);
