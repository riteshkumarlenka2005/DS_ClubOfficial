-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('leadership', 'technical', 'management', 'creative')),
    tier TEXT NOT NULL CHECK (tier IN ('lead', 'head', 'core', 'co-member')),
    sub_category TEXT CHECK (sub_category IN ('social', 'design', 'video') OR sub_category IS NULL),
    bio TEXT,
    avatar_url TEXT,
    img_seed TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    instagram_url TEXT,
    email TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_members_department ON public.team_members(department);
CREATE INDEX idx_team_members_visible ON public.team_members(is_visible);
CREATE INDEX idx_team_members_order ON public.team_members(display_order);

-- Updated_at trigger
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access team_members" ON public.team_members
    FOR ALL USING (true) WITH CHECK (true);

    