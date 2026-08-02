-- ============================================
-- CATCH-UP MIGRATION: Add columns that may be
-- missing from production Supabase instance
-- (safe to re-run — uses IF NOT EXISTS)
-- ============================================

-- ── USERS TABLE ─────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- ── EVENTS TABLE ────────────────────────────
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- ── BLOGS TABLE ─────────────────────────────
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Community';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS is_user_upload BOOLEAN NOT NULL DEFAULT false;

-- ── PROJECTS TABLE ──────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS short_description TEXT;

-- ── EVENT REGISTRATIONS TABLE ───────────────
-- Ensure the table exists (needed for My Registrations)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ── EVENT HIGHLIGHTS TABLE ──────────────────
-- Ensure the table exists
CREATE TABLE IF NOT EXISTS public.event_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    event_date TIMESTAMPTZ,
    category TEXT DEFAULT 'General',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TEAM MEMBERS TABLE ──────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'Member',
    position TEXT,
    department TEXT,
    batch_year INTEGER,
    bio TEXT,
    avatar_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MEMBERSHIP APPLICATIONS TABLE ───────────
CREATE TABLE IF NOT EXISTS public.membership_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    motivation TEXT,
    skills TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ACTIVITY LOG TABLE ──────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES (IF NOT EXISTS) ─────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);

-- ── RLS POLICIES (safe to re-create) ────────
-- These are permissive "allow everything" policies for service_role
-- If they already exist, the DO block skips them.

DO $$
BEGIN
    -- event_highlights
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_highlights' AND policyname = 'Service role full access event_highlights') THEN
        EXECUTE 'CREATE POLICY "Service role full access event_highlights" ON public.event_highlights FOR ALL USING (true) WITH CHECK (true)';
    END IF;

    -- team_members
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Service role full access team_members') THEN
        EXECUTE 'CREATE POLICY "Service role full access team_members" ON public.team_members FOR ALL USING (true) WITH CHECK (true)';
    END IF;

    -- membership_applications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'membership_applications' AND policyname = 'Service role full access membership_applications') THEN
        EXECUTE 'CREATE POLICY "Service role full access membership_applications" ON public.membership_applications FOR ALL USING (true) WITH CHECK (true)';
    END IF;
END $$;

-- Enable RLS on new tables (safe to re-run)
ALTER TABLE public.event_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

-- ── UPDATED_AT TRIGGERS ─────────────────────
-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop-and-recreate triggers (safe approach)
DROP TRIGGER IF EXISTS update_event_highlights_updated_at ON public.event_highlights;
CREATE TRIGGER update_event_highlights_updated_at
    BEFORE UPDATE ON public.event_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_membership_applications_updated_at ON public.membership_applications;
CREATE TRIGGER update_membership_applications_updated_at
    BEFORE UPDATE ON public.membership_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
