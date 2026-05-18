// Auth & User
export type User = {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  selected_career_path_id?: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  readiness_score: number;
  target_salary_min?: number;
  target_salary_max?: number;
  target_timeline_months?: number;
  weekly_availability_hours?: number;
  primary_goal?: string;
  subscription_tier: 'free' | 'pro' | 'elite';
  created_at: string;
  updated_at: string;
};

// Career Paths
export type CareerPath = {
  id: string;
  title: string;
  category: string;
  description: string;
  demand_level: 'high' | 'medium' | 'low';
  salary_min: number;
  salary_max: number;
  roadmap_json: RoadmapPhase[];
  skills_json: string[];
  portfolio_examples_json: string[];
  is_active: boolean;
  created_at: string;
};

export type RoadmapPhase = {
  id: string;
  phase_number: number;
  title: string;
  description: string;
  skills: string[];
  estimated_weeks: number;
  key_projects: string[];
  milestones: string[];
};

export type UserCareerPath = {
  id: string;
  user_id: string;
  career_path_id: string;
  status: 'active' | 'paused' | 'completed';
  progress_percentage: number;
  started_at: string;
  completed_at?: string;
};

// Quests
export type Quest = {
  id: string;
  user_id: string;
  career_path_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  quest_type: 'learning' | 'building' | 'portfolio' | 'interview';
  xp_reward: number;
  time_estimate_minutes: number;
  proof_required: boolean;
  proof_type?: 'github' | 'live_demo' | 'figma' | 'text' | 'screenshot';
  proof_url?: string;
  proof_notes?: string;
  skill_tag: string;
  career_impact: string;
  status: 'active' | 'completed' | 'locked';
  generated_by: 'system' | 'ai';
  due_date?: string;
  completed_at?: string;
  created_at: string;
};

// Skills
export type Skill = {
  id: string;
  career_path_id: string;
  title: string;
  description: string;
  category: string;
  unlock_level: number;
  sort_order: number;
  created_at: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  mastery_percentage: number;
  unlocked: boolean;
  unlocked_at?: string;
  updated_at: string;
};

// Projects (Portfolio)
export type Project = {
  id: string;
  user_id: string;
  career_path_id: string;
  title: string;
  description: string;
  project_url?: string;
  github_url?: string;
  proof_url?: string;
  status: 'idea' | 'in_progress' | 'submitted' | 'verified' | 'needs_improvement';
  ai_review_score?: number;
  readiness_impact: number;
  skills_used: string[];
  lessons_learned?: string;
  created_at: string;
  updated_at: string;
};

// Achievements
export type Achievement = {
  id: string;
  title: string;
  description: string;
  achievement_type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_bonus: number;
  icon_name: string;
  created_at: string;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
};

// Analytics
export type AnalyticsEvent = {
  id: string;
  user_id: string;
  event_type: string;
  event_payload: Record<string, any>;
  xp_delta: number;
  readiness_delta: number;
  created_at: string;
};

export type DailyAnalytics = {
  id: string;
  user_id: string;
  date: string;
  daily_xp: number;
  quests_completed: number;
  streak_count: number;
  readiness_score: number;
  completion_rate: number;
  created_at: string;
};

// Subscriptions
export type Subscription = {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'elite';
  status: 'active' | 'cancelled' | 'expired';
  provider?: string;
  provider_customer_id?: string;
  provider_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
};

// AI Messages
export type AIMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
};

// API Responses
export type ReadinessScore = {
  totalScore: number;
  breakdown: {
    questCompletion: number;
    skillMastery: number;
    portfolioProof: number;
    consistency: number;
    interviewPrep: number;
  };
  recommendation: string;
};

export type AIResponse = {
  reply: string;
  suggestedActions: string[];
};

export type LevelInfo = {
  currentLevel: number;
  currentXP: number;
  requiredXP: number;
  progressPercentage: number;
  levelTitle: string;
};
