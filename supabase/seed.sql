-- Career Paths
INSERT INTO public.career_paths (id, title, category, description, demand_level, salary_min, salary_max, roadmap_json, skills_json) VALUES
('00000000-0000-0000-0000-000000000001', 'Software Engineer', 'Technology', 'Build scalable applications', 'high', 80000, 200000, '[]'::jsonb, '["JavaScript", "React", "APIs", "Databases"]'::jsonb),
('00000000-0000-0000-0000-000000000002', 'Data Analyst', 'Business & Growth', 'Turn data into insights', 'high', 70000, 150000, '[]'::jsonb, '["SQL", "Excel", "Statistics", "Dashboarding"]'::jsonb),
('00000000-0000-0000-0000-000000000003', 'Product Manager', 'Business & Growth', 'Lead product strategy', 'high', 100000, 250000, '[]'::jsonb, '["Strategy", "Analytics", "Communication"]'::jsonb),
('00000000-0000-0000-0000-000000000004', 'UI/UX Designer', 'Creative', 'Design user experiences', 'medium', 60000, 140000, '[]'::jsonb, '["Design", "Prototyping", "Research"]'::jsonb);

-- Achievements
INSERT INTO public.achievements (id, title, description, achievement_type, rarity, xp_bonus, icon_name) VALUES
('10000000-0000-0000-0000-000000000001', 'First Step', 'Complete your first quest', 'milestone', 'common', 10, 'rocket'),
('10000000-0000-0000-0000-000000000002', '7-Day Streak', 'Maintain a 7-day streak', 'streak', 'rare', 100, 'flame'),
('10000000-0000-0000-0000-000000000003', 'Portfolio Builder', 'Create your first project', 'portfolio', 'rare', 50, 'briefcase'),
('10000000-0000-0000-0000-000000000004', 'Level 10', 'Reach level 10', 'milestone', 'epic', 200, 'star'),
('10000000-0000-0000-0000-000000000005', 'Legendary Path', 'Reach level 100', 'milestone', 'legendary', 5000, 'crown');
