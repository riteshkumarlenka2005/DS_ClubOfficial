-- ============================================
-- SEED: ALUMNI DATA
-- ============================================

INSERT INTO public.alumni (
  full_name, batch_year, designation, company, testimonial,
  skills, avatar_url, img_seed, bg_color,
  linkedin_url, github_url, department,
  is_visible, display_order
) VALUES

(
  'Arjun Sharma', 2022,
  'AI Research Engineer', 'Google',
  'The Data Science Club gave me the foundation to think analytically and the confidence to tackle real-world AI challenges. Every project, every late-night hackathon — it all counts.',
  ARRAY['PyTorch', 'TensorFlow', 'Computer Vision'],
  NULL, 'arjun', '#E8F5E9',
  NULL, NULL, NULL,
  true, 1
),

(
  'Priya Das', 2021,
  'Senior Data Scientist', 'Microsoft',
  'From cleaning messy datasets in the club to building ML pipelines at scale — the journey started right here at GIETU. The mentorship culture is unmatched.',
  ARRAY['Pandas', 'Sklearn', 'Azure ML'],
  NULL, 'priya', '#FFF3E0',
  NULL, NULL, NULL,
  true, 2
),

(
  'Rohan Varma', 2023,
  'Founder & CEO', 'DataLabs',
  'The entrepreneurial spirit I developed at DSC GIETU helped me launch my own data analytics startup. The club teaches you to build, not just learn.',
  ARRAY['AWS', 'Spark', 'Leadership'],
  NULL, 'rohan', '#E3F2FD',
  NULL, NULL, NULL,
  true, 3
),

(
  'Sneha Reddy', 2022,
  'ML Engineer', 'Zomato',
  'NLP fascinated me during a club workshop, and now I build recommendation engines serving millions. The club''s hands-on approach made all the difference.',
  ARRAY['NLP', 'FastAPI', 'Transformers'],
  NULL, 'sneha', '#FCE4EC',
  NULL, NULL, NULL,
  true, 4
),

(
  'Vikram Sen', 2020,
  'Quantitative Analyst', 'Citadel',
  'Statistics was just theory until the club showed me how to apply it. Now I model financial markets using concepts I first explored in DSC workshops.',
  ARRAY['Statistics', 'R', 'Python'],
  NULL, 'vikram', '#FFFDE7',
  NULL, NULL, NULL,
  true, 5
),

(
  'Ananya Mahto', 2024,
  'GPU Computing Engineer', 'NVIDIA',
  'Parallel computing, CUDA optimization — the club exposed me to cutting-edge tech early. I''m grateful for every challenge that pushed me forward.',
  ARRAY['C++', 'CUDA', 'Deep Learning'],
  NULL, 'ananya', '#F3E5F5',
  NULL, NULL, NULL,
  true, 6
);
