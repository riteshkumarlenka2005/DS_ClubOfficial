-- ============================================
-- GALLERY SUB-PHOTOS: Cover + Sub-photo support
-- ============================================

-- parent_id links sub-photos to their cover photo
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.gallery(id) ON DELETE CASCADE;

-- is_cover marks whether this row is the cover photo of a collection
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_cover BOOLEAN NOT NULL DEFAULT false;

-- description column (may already exist as caption — add if missing)
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS description TEXT;

-- Index for fast sub-photo lookups
CREATE INDEX IF NOT EXISTS idx_gallery_parent_id ON public.gallery(parent_id);
CREATE INDEX IF NOT EXISTS idx_gallery_is_cover ON public.gallery(is_cover);
