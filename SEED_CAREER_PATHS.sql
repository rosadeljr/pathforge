-- ============================================================
-- PathForge Career Paths Seed Data (16 paths)
-- Run this in Supabase SQL Editor to populate career_paths table
-- Safe to run multiple times (uses ON CONFLICT)
-- ============================================================

INSERT INTO public.career_paths (id, title, category, description, demand_level, salary_min, salary_max, skills_json, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Software Engineer', 'Engineering', 'Build the apps people cant live without', 'high', 480000, 1800000, '["JavaScript","React","TypeScript","Node.js","Git","APIs"]'::jsonb, true),
('00000000-0000-0000-0000-000000000005', 'AI / ML Engineer', 'Engineering', 'Train the models that train everyone else', 'high', 900000, 3500000, '["Python","PyTorch","LLMs","Statistics","MLOps","Math"]'::jsonb, true),
('00000000-0000-0000-0000-000000000006', 'Cybersecurity Specialist', 'Engineering', 'Hack the planet ethically', 'high', 720000, 2400000, '["Networking","Linux","Pen Testing","Cloud Security","Python"]'::jsonb, true),
('00000000-0000-0000-0000-000000000007', 'Mobile Developer', 'Engineering', 'Ship apps to a billion phones', 'high', 540000, 1800000, '["React Native","Swift","Kotlin","Flutter","Mobile UX"]'::jsonb, true),
('00000000-0000-0000-0000-000000000002', 'Data Analyst', 'Data & AI', 'Turn raw numbers into business wins', 'high', 420000, 1200000, '["SQL","Excel","Python","Tableau","Statistics","Storytelling"]'::jsonb, true),
('00000000-0000-0000-0000-000000000008', 'Data Scientist', 'Data & AI', 'Predict the future with math and code', 'high', 780000, 2700000, '["Python","ML","Statistics","SQL","Deep Learning","Research"]'::jsonb, true),
('00000000-0000-0000-0000-000000000004', 'UI/UX Designer', 'Design & Creative', 'Make pixels people fall in love with', 'medium', 420000, 1500000, '["Figma","Design Systems","User Research","Prototyping","UX Writing"]'::jsonb, true),
('00000000-0000-0000-0000-000000000009', 'Video Editor / Motion', 'Design & Creative', 'Cut color ship content that hits', 'medium', 300000, 1200000, '["Premiere Pro","After Effects","DaVinci","Color Grading","Storytelling"]'::jsonb, true),
('00000000-0000-0000-0000-000000000010', 'Graphic Designer', 'Design & Creative', 'Brand identity vibes make it stunning', 'medium', 240000, 900000, '["Illustrator","Photoshop","Typography","Branding","Layout"]'::jsonb, true),
('00000000-0000-0000-0000-000000000003', 'Product Manager', 'Product & Strategy', 'Decide what gets built and why', 'high', 720000, 2700000, '["Strategy","Analytics","Roadmapping","User Research","Communication"]'::jsonb, true),
('00000000-0000-0000-0000-000000000011', 'Digital Marketer', 'Marketing & Growth', 'Run paid ads that print revenue', 'high', 360000, 1500000, '["Meta Ads","Google Ads","SEO","Analytics","Copywriting","Funnels"]'::jsonb, true),
('00000000-0000-0000-0000-000000000012', 'Social Media Manager', 'Marketing & Growth', 'Run the page that runs the brand', 'high', 300000, 1080000, '["Content Strategy","TikTok/Reels","Community","Copywriting","Analytics"]'::jsonb, true),
('00000000-0000-0000-0000-000000000013', 'Content Creator', 'Marketing & Growth', 'Build an audience build a business', 'medium', 180000, 3000000, '["Personal Brand","Video","Writing","Editing","Community","Monetization"]'::jsonb, true),
('00000000-0000-0000-0000-000000000014', 'Virtual Assistant', 'Remote & Freelance', 'Run someones life get paid in dollars', 'high', 240000, 720000, '["Organization","Email/Calendar","Tools","Communication","English"]'::jsonb, true),
('00000000-0000-0000-0000-000000000015', 'Copywriter', 'Remote & Freelance', 'Words that sell on demand', 'medium', 300000, 1500000, '["Copywriting","Persuasion","Email","Landing Pages","Research","Voice"]'::jsonb, true),
('00000000-0000-0000-0000-000000000016', 'Customer Success', 'Remote & Freelance', 'Keep customers happy keep revenue growing', 'high', 360000, 1320000, '["Communication","Empathy","SaaS Tools","Onboarding","Account Management"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  demand_level = EXCLUDED.demand_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  skills_json = EXCLUDED.skills_json,
  is_active = EXCLUDED.is_active;

-- Done. You should now see 16 career paths in your career_paths table.
