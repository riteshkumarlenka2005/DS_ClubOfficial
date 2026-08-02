-- 015_event_highlights_media.sql
-- Add event_id to blogs table so videos can be linked to events for highlights

ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
