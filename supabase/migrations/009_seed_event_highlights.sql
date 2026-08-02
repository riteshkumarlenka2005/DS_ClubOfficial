-- ============================================
-- SEED: EVENT HIGHLIGHTS
-- Run AFTER you have events in the events table.
-- This creates two sample events + their highlights.
-- ============================================

DO $$
DECLARE
  admin_id UUID;
  event1_id UUID;
  event2_id UUID;
BEGIN
  -- Get first admin
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.users LIMIT 1;
  END IF;
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No users found. Run after first login.';
    RETURN;
  END IF;

  -- Create sample past events if they don't exist
  INSERT INTO public.events (
    title, slug, description, short_description,
    event_date, location, image_url,
    status, created_by, published_by, published_at
  ) VALUES (
    'Python for Data Science Workshop',
    'python-for-data-science-workshop',
    'An immersive foundation course that equipped 80+ students with essential Python skills for data science. Participants built end-to-end data pipelines using NumPy, Pandas, and Matplotlib.',
    'Master Python fundamentals for data science in this hands-on workshop.',
    NOW() - INTERVAL '30 days',
    'Seminar Hall 1, GIETU',
    'https://picsum.photos/seed/13/1200/500',
    'completed', admin_id, admin_id, NOW() - INTERVAL '35 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO event1_id;

  -- If event already existed, fetch its id
  IF event1_id IS NULL THEN
    SELECT id INTO event1_id FROM public.events WHERE slug = 'python-for-data-science-workshop' LIMIT 1;
  END IF;

  INSERT INTO public.events (
    title, slug, description, short_description,
    event_date, location, image_url,
    status, created_by, published_by, published_at
  ) VALUES (
    'SIH 2025 Team Selection Meet',
    'sih-2025-team-selection-meet',
    'A high-energy ideation and team formation event for the Smart India Hackathon 2025. Teams brainstormed solutions across 8 problem statements, with mentors providing real-time feedback.',
    'Form teams and brainstorm ideas for Smart India Hackathon 2025.',
    NOW() - INTERVAL '20 days',
    'Innovation Lab, GIETU',
    'https://picsum.photos/seed/14/1200/500',
    'completed', admin_id, admin_id, NOW() - INTERVAL '25 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO event2_id;

  IF event2_id IS NULL THEN
    SELECT id INTO event2_id FROM public.events WHERE slug = 'sih-2025-team-selection-meet' LIMIT 1;
  END IF;

  -- Insert highlights for event 1
  IF event1_id IS NOT NULL THEN
    INSERT INTO public.event_highlights (
      event_id, summary, stats, photos, key_takeaways,
      testimonial_text, testimonial_author
    ) VALUES (
      event1_id,
      'An immersive foundation course that equipped 80+ students with essential Python skills for data science. Participants built end-to-end data pipelines using NumPy, Pandas, and Matplotlib — going from raw CSV files to polished visualizations in a single session.',
      '[
        {"label": "Participants", "value": "80+"},
        {"label": "Hours", "value": "6"},
        {"label": "Projects Built", "value": "12"},
        {"label": "Satisfaction", "value": "96%"}
      ]'::jsonb,
      ARRAY[
        'https://picsum.photos/seed/pyds1/600/400',
        'https://picsum.photos/seed/pyds2/600/400',
        'https://picsum.photos/seed/pyds3/600/400',
        'https://picsum.photos/seed/pyds4/600/400',
        'https://picsum.photos/seed/pyds5/600/400',
        'https://picsum.photos/seed/pyds6/600/400'
      ],
      ARRAY[
        'Hands-on NumPy array operations and broadcasting',
        'Data wrangling with Pandas: merge, groupby, pivot tables',
        'Matplotlib & Seaborn for publication-quality visualizations',
        'End-to-end mini project: Analyzing real-world datasets'
      ],
      'This workshop transformed my understanding of Python for data science. The hands-on approach made complex concepts click instantly.',
      'Priya S., 2nd Year CSE'
    )
    ON CONFLICT (event_id) DO NOTHING;
  END IF;

  -- Insert highlights for event 2
  IF event2_id IS NOT NULL THEN
    INSERT INTO public.event_highlights (
      event_id, summary, stats, photos, key_takeaways,
      testimonial_text, testimonial_author
    ) VALUES (
      event2_id,
      'A high-energy ideation and team formation event for the Smart India Hackathon 2025. Teams brainstormed solutions across 8 problem statements, with mentors providing real-time feedback on feasibility and innovation.',
      '[
        {"label": "Teams Formed", "value": "15"},
        {"label": "Problem Statements", "value": "8"},
        {"label": "Mentors", "value": "6"},
        {"label": "Selected for SIH", "value": "5"}
      ]'::jsonb,
      ARRAY[
        'https://picsum.photos/seed/sih1/600/400',
        'https://picsum.photos/seed/sih2/600/400',
        'https://picsum.photos/seed/sih3/600/400',
        'https://picsum.photos/seed/sih4/600/400',
        'https://picsum.photos/seed/sih5/600/400',
        'https://picsum.photos/seed/sih6/600/400'
      ],
      ARRAY[
        'Problem statement analysis and scoping techniques',
        'Rapid prototyping and MVP planning strategies',
        'Pitch deck creation for hackathon presentations',
        '5 teams selected to represent GIETU at SIH nationals'
      ],
      'The mentorship during the selection meet was invaluable. Our team refined our idea three times before landing on something truly impactful.',
      'Rahul M., 3rd Year IT'
    )
    ON CONFLICT (event_id) DO NOTHING;
  END IF;

END $$;