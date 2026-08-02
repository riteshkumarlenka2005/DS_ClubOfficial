-- ============================================
-- 011: Add missing indexes + updated_at columns
-- ============================================

-- ── Gallery indexes ──
CREATE INDEX IF NOT EXISTS idx_gallery_event_id ON public.gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_status ON public.gallery(status);
CREATE INDEX IF NOT EXISTS idx_gallery_uploaded_by ON public.gallery(uploaded_by);

-- ── Projects index ──
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- ── Events index (commonly filtered) ──
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- ── Blogs indexes ──
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);

-- ── Add updated_at to gallery ──
ALTER TABLE public.gallery
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Add updated_at to event_registrations ──
ALTER TABLE public.event_registrations
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Auto-update triggers ──
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_gallery_updated_at
    BEFORE UPDATE ON public.gallery
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
