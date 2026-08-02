-- ============================================
-- EXTEND BLOGS TABLE — Video blog fields
-- ============================================

-- Video URL (external link or storage URL)
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Single category (for filter tabs)
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Community';

-- Duration string (e.g. "12:34")
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS duration TEXT;

-- View count
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

-- Whether this is a user-contributed upload
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS is_user_upload BOOLEAN NOT NULL DEFAULT false;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);