-- ============================================
-- EXTEND ALUMNI TABLE — New columns for UI
-- ============================================

-- Skills array (for tag badges)
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- GitHub URL
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Background color for alumni section
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#F9F7FF';

-- Image seed for picsum fallback
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS img_seed TEXT;

-- Display order for consistent ordering
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_alumni_display_order ON public.alumni(display_order);