-- ============================================
-- EVENT HIGHLIGHTS TABLE
-- ============================================
CREATE TABLE public.event_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    stats JSONB NOT NULL DEFAULT '[]',
    photos TEXT[] DEFAULT '{}',
    key_takeaways TEXT[] DEFAULT '{}',
    testimonial_text TEXT,
    testimonial_author TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id)
);

-- Indexes
CREATE INDEX idx_event_highlights_event ON public.event_highlights(event_id);

-- Updated_at trigger
CREATE TRIGGER update_event_highlights_updated_at
    BEFORE UPDATE ON public.event_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.event_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access event_highlights" ON public.event_highlights
    FOR ALL USING (true) WITH CHECK (true);
    