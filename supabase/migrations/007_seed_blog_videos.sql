-- ============================================
-- SEED: BLOG VIDEO DATA
-- ============================================

-- We need a system user for club-official content.
-- First, get any admin user ID, or create one.
-- For seeding, we'll use a subquery to find the first admin.
-- If no admin exists yet, run this AFTER your first admin login.

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get first admin user
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;

  -- If no admin, get any user
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.users LIMIT 1;
  END IF;

  -- If still no user, skip seeding (run after first login)
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No users found. Seed blog videos after first user login.';
    RETURN;
  END IF;

  -- Insert blog videos
  INSERT INTO public.blogs (
    title, slug, content, excerpt, cover_image, author_id,
    status, published_at, published_by, tags,
    video_url, category, duration, views_count, is_user_upload
  ) VALUES

  (
    'DataFest 2025 — Full Recap & Highlights',
    'datafest-2025-full-recap-highlights',
    'Relive the best moments from GIETU''s flagship data science summit. Talks, hackathons, and community energy.',
    'Relive the best moments from GIETU''s flagship data science summit.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    admin_id,
    'published', NOW(), admin_id,
    ARRAY['events', 'datafest', 'summit'],
    '', 'Events', '12:34', 1200, false
  ),

  (
    'Building a RAG Pipeline from Scratch',
    'building-rag-pipeline-from-scratch',
    'Step-by-step tutorial on Retrieval-Augmented Generation using LangChain, FAISS, and OpenAI embeddings.',
    'Step-by-step tutorial on Retrieval-Augmented Generation.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    admin_id,
    'published', NOW() - INTERVAL '5 days', admin_id,
    ARRAY['tutorial', 'rag', 'langchain', 'ai'],
    '', 'Tutorials', '28:45', 890, false
  ),

  (
    'Python for Data Science — Workshop Recording',
    'python-data-science-workshop-recording',
    'Complete workshop covering NumPy, Pandas, and Matplotlib fundamentals for beginners.',
    'Complete workshop covering NumPy, Pandas, and Matplotlib fundamentals.',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
    admin_id,
    'published', NOW() - INTERVAL '10 days', admin_id,
    ARRAY['workshop', 'python', 'numpy', 'pandas'],
    '', 'Workshops', '1:05:20', 2300, false
  ),

  (
    'Research Spotlight: Attention Mechanisms Explained',
    'research-spotlight-attention-mechanisms-explained',
    'A deep dive into self-attention, multi-head attention, and why transformers dominate modern AI.',
    'A deep dive into self-attention and transformers.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    admin_id,
    'published', NOW() - INTERVAL '20 days', admin_id,
    ARRAY['research', 'attention', 'transformers', 'nlp'],
    '', 'Research', '18:12', 650, false
  ),

  (
    'Club Story: From 10 Members to 200+',
    'club-story-from-10-members-to-200',
    'Founding members share the journey of building DSC GIETU into one of the most active technical clubs on campus.',
    'Founding members share the journey of building DSC GIETU.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    admin_id,
    'published', NOW() - INTERVAL '30 days', admin_id,
    ARRAY['community', 'growth', 'story'],
    '', 'Community', '22:50', 1500, false
  ),

  (
    'SIH 2025 Preparation — Strategy & Tips',
    'sih-2025-preparation-strategy-tips',
    'Preparation strategy, problem statement analysis, and team coordination tips for Smart India Hackathon.',
    'Strategy and tips for Smart India Hackathon.',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800',
    admin_id,
    'published', NOW() - INTERVAL '40 days', admin_id,
    ARRAY['events', 'sih', 'hackathon'],
    '', 'Events', '15:30', 780, false
  );

END $$;