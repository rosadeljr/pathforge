/**
 * PathForge Career Paths
 * Curated for Gen Z and PH market — blend of high-growth tech,
 * creator economy, and remote-friendly careers.
 *
 * Each path has a Solo Leveling-inspired rank reflecting market demand:
 *   S = Legendary demand (FAANG-tier, AI boom)
 *   A = Hot market (high pay, lots of openings)
 *   B = Solid demand (stable career)
 *   C = Niche but valuable
 */

export type CareerRank = "S" | "A" | "B" | "C";
export type CareerCategory =
  | "Engineering"
  | "Data & AI"
  | "Design & Creative"
  | "Product & Strategy"
  | "Marketing & Growth"
  | "Remote & Freelance";

export interface CareerPath {
  id: string;
  title: string;
  tagline: string;
  category: CareerCategory;
  rank: CareerRank;
  trending?: boolean;
  remote?: boolean;
  // Visual identity
  emoji: string;
  gradient: string; // tailwind gradient classes
  accentColor: string; // hex for glow effects
  // Career details
  salaryMinPhp: number;
  salaryMaxPhp: number;
  salaryMinUsd: number;
  salaryMaxUsd: number;
  timelineMonths: number;
  skills: string[];
  // Marketing
  vibe: string; // short Gen Z descriptor
  whyItMatters: string;
  realRoles: string[]; // example job titles
}

export const CAREER_PATHS: CareerPath[] = [
  // ============ ENGINEERING ============
  // PH salary ranges sourced from Jobstreet PH, Glassdoor PH, Reddit r/phjobs, 2025 averages.
  // Numbers represent realistic ranges from junior → mid-senior for PH-based roles.
  // (Top-end implies senior/lead at outsourced-to-US salaries — possible but rare for entry path.)
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Software Engineer",
    tagline: "Build the apps people can't live without",
    category: "Engineering",
    rank: "A",
    trending: true,
    remote: true,
    emoji: "⚡",
    gradient: "from-cyan-500 to-blue-600",
    accentColor: "#06b6d4",
    salaryMinPhp: 300000,
    salaryMaxPhp: 840000,
    salaryMinUsd: 22000,
    salaryMaxUsd: 62000,
    timelineMonths: 9,
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "Git", "APIs"],
    vibe: "The blueprint career. Stack-agnostic problem solver.",
    whyItMatters: "Software runs the world. Every company needs builders.",
    realRoles: ["Full-stack Developer", "Frontend Engineer", "Backend Engineer"],
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    title: "AI / ML Engineer",
    tagline: "Train the models that train everyone else",
    category: "Engineering",
    rank: "S",
    trending: true,
    remote: true,
    emoji: "🧠",
    gradient: "from-violet-500 to-fuchsia-600",
    accentColor: "#a855f7",
    salaryMinPhp: 360000,
    salaryMaxPhp: 1080000,
    salaryMinUsd: 27000,
    salaryMaxUsd: 80000,
    timelineMonths: 12,
    skills: ["Python", "PyTorch", "LLMs", "Statistics", "MLOps", "Math"],
    vibe: "Top of the food chain. AI gold rush is happening now.",
    whyItMatters: "Every product is becoming an AI product. Be at the frontier.",
    realRoles: ["ML Engineer", "AI Researcher", "Prompt Engineer", "MLOps Engineer"],
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    title: "Cybersecurity Specialist",
    tagline: "Hack the planet — ethically",
    category: "Engineering",
    rank: "A",
    trending: true,
    remote: true,
    emoji: "🛡️",
    gradient: "from-emerald-500 to-green-700",
    accentColor: "#10b981",
    salaryMinPhp: 330000,
    salaryMaxPhp: 960000,
    salaryMinUsd: 24000,
    salaryMaxUsd: 71000,
    timelineMonths: 12,
    skills: ["Networking", "Linux", "Pen Testing", "Cloud Security", "Python"],
    vibe: "Digital sheriff. Pays well, never gets boring.",
    whyItMatters: "Cyberattacks cost trillions. Defenders are in massive demand.",
    realRoles: ["Security Analyst", "Penetration Tester", "Cloud Security Engineer"],
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    title: "Mobile Developer",
    tagline: "Ship apps to a billion phones",
    category: "Engineering",
    rank: "B",
    remote: true,
    emoji: "📱",
    gradient: "from-sky-500 to-indigo-600",
    accentColor: "#0ea5e9",
    salaryMinPhp: 300000,
    salaryMaxPhp: 780000,
    salaryMinUsd: 22000,
    salaryMaxUsd: 58000,
    timelineMonths: 8,
    skills: ["React Native", "Swift", "Kotlin", "Flutter", "Mobile UX"],
    vibe: "Your app on every screen. Tangible, visual impact.",
    whyItMatters: "Mobile-first is the new default. PH is one of the most mobile markets.",
    realRoles: ["iOS Developer", "Android Developer", "React Native Engineer"],
  },

  // ============ DATA & AI ============
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "Data Analyst",
    tagline: "Turn raw numbers into business wins",
    category: "Data & AI",
    rank: "A",
    trending: true,
    remote: true,
    emoji: "📊",
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "#3b82f6",
    salaryMinPhp: 240000,
    salaryMaxPhp: 660000,
    salaryMinUsd: 18000,
    salaryMaxUsd: 49000,
    timelineMonths: 6,
    skills: ["SQL", "Excel", "Python", "Tableau", "Statistics", "Storytelling"],
    vibe: "The detective of the business world.",
    whyItMatters: "Data-driven decisions print money. Companies need translators.",
    realRoles: ["Business Analyst", "BI Analyst", "Data Analyst", "Marketing Analyst"],
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    title: "Data Scientist",
    tagline: "Predict the future with math + code",
    category: "Data & AI",
    rank: "S",
    trending: true,
    remote: true,
    emoji: "🔬",
    gradient: "from-purple-500 to-pink-600",
    accentColor: "#a855f7",
    salaryMinPhp: 360000,
    salaryMaxPhp: 960000,
    salaryMinUsd: 27000,
    salaryMaxUsd: 71000,
    timelineMonths: 14,
    skills: ["Python", "ML", "Statistics", "SQL", "Deep Learning", "Research"],
    vibe: "Half scientist, half wizard. Salary that makes parents nod.",
    whyItMatters: "ML drives every modern product, from TikTok feeds to credit scores.",
    realRoles: ["Data Scientist", "Research Scientist", "Quant Analyst"],
  },

  // ============ DESIGN & CREATIVE ============
  {
    id: "00000000-0000-0000-0000-000000000004",
    title: "UI/UX Designer",
    tagline: "Make pixels people fall in love with",
    category: "Design & Creative",
    rank: "B",
    remote: true,
    emoji: "🎨",
    gradient: "from-pink-500 to-rose-600",
    accentColor: "#ec4899",
    salaryMinPhp: 240000,
    salaryMaxPhp: 660000,
    salaryMinUsd: 18000,
    salaryMaxUsd: 49000,
    timelineMonths: 7,
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "UX Writing"],
    vibe: "Bridge between art and engineering. Aesthetic, refined, in-demand.",
    whyItMatters: "Good design is a competitive moat. Companies pay for taste.",
    realRoles: ["Product Designer", "UX Designer", "Design Lead", "UX Researcher"],
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    title: "Video Editor / Motion",
    tagline: "Cut, color, ship — content that hits",
    category: "Design & Creative",
    rank: "B",
    trending: true,
    remote: true,
    emoji: "🎬",
    gradient: "from-orange-500 to-red-600",
    accentColor: "#f97316",
    salaryMinPhp: 180000,
    salaryMaxPhp: 540000,
    salaryMinUsd: 13000,
    salaryMaxUsd: 40000,
    timelineMonths: 5,
    skills: ["Premiere Pro", "After Effects", "DaVinci", "Color Grading", "Storytelling"],
    vibe: "Behind every viral video is an editor who made it click.",
    whyItMatters: "Short-form video is the new TV. Editors get paid like the new directors.",
    realRoles: ["Video Editor", "Motion Designer", "Content Creator's Right Hand"],
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    title: "Graphic Designer",
    tagline: "Brand, identity, vibes — make it stunning",
    category: "Design & Creative",
    rank: "C",
    remote: true,
    emoji: "🖌️",
    gradient: "from-fuchsia-500 to-purple-600",
    accentColor: "#d946ef",
    salaryMinPhp: 180000,
    salaryMaxPhp: 480000,
    salaryMinUsd: 13000,
    salaryMaxUsd: 35000,
    timelineMonths: 6,
    skills: ["Illustrator", "Photoshop", "Typography", "Branding", "Layout"],
    vibe: "Build brands from scratch. Side hustles fuel main bag.",
    whyItMatters: "Every business needs visual identity. Freelance ceiling is sky-high.",
    realRoles: ["Brand Designer", "Visual Designer", "Freelance Designer"],
  },

  // ============ PRODUCT & STRATEGY ============
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "Product Manager",
    tagline: "Decide what gets built — and why",
    category: "Product & Strategy",
    rank: "A",
    remote: true,
    emoji: "🎯",
    gradient: "from-amber-500 to-orange-600",
    accentColor: "#f59e0b",
    salaryMinPhp: 420000,
    salaryMaxPhp: 1080000,
    salaryMinUsd: 31000,
    salaryMaxUsd: 80000,
    timelineMonths: 10,
    skills: ["Strategy", "Analytics", "Roadmapping", "User Research", "Communication"],
    vibe: "CEO of the product. High leverage, high salary, hard role.",
    whyItMatters: "PMs decide where billion-dollar bets land. Influence at the top.",
    realRoles: ["Product Manager", "Product Owner", "Growth PM", "Technical PM"],
  },

  // ============ MARKETING & GROWTH ============
  {
    id: "00000000-0000-0000-0000-000000000011",
    title: "Digital Marketer",
    tagline: "Run paid ads that print revenue",
    category: "Marketing & Growth",
    rank: "B",
    trending: true,
    remote: true,
    emoji: "📈",
    gradient: "from-rose-500 to-pink-600",
    accentColor: "#f43f5e",
    salaryMinPhp: 240000,
    salaryMaxPhp: 600000,
    salaryMinUsd: 18000,
    salaryMaxUsd: 44000,
    timelineMonths: 6,
    skills: ["Meta Ads", "Google Ads", "SEO", "Analytics", "Copywriting", "Funnels"],
    vibe: "Math meets psychology. Performance > opinions.",
    whyItMatters: "Every business needs customers. Paid acquisition skill is forever.",
    realRoles: ["Performance Marketer", "Paid Media Manager", "Growth Marketer"],
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    title: "Social Media Manager",
    tagline: "Run the page that runs the brand",
    category: "Marketing & Growth",
    rank: "B",
    trending: true,
    remote: true,
    emoji: "💬",
    gradient: "from-violet-500 to-purple-600",
    accentColor: "#8b5cf6",
    salaryMinPhp: 180000,
    salaryMaxPhp: 480000,
    salaryMinUsd: 13000,
    salaryMaxUsd: 35000,
    timelineMonths: 5,
    skills: ["Content Strategy", "TikTok/Reels", "Community", "Copywriting", "Analytics"],
    vibe: "Make the algorithm love you. Native to platforms, fluent in trends.",
    whyItMatters: "Attention is the new oil. PH brands are scaling fast on socials.",
    realRoles: ["Social Media Manager", "Community Manager", "Content Strategist"],
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    title: "Content Creator",
    tagline: "Build an audience, build a business",
    category: "Marketing & Growth",
    rank: "C",
    trending: true,
    remote: true,
    emoji: "🎤",
    gradient: "from-red-500 to-rose-600",
    accentColor: "#ef4444",
    salaryMinPhp: 120000,
    salaryMaxPhp: 600000,
    salaryMinUsd: 9000,
    salaryMaxUsd: 44000,
    timelineMonths: 12,
    skills: ["Personal Brand", "Video", "Writing", "Editing", "Community", "Monetization"],
    vibe: "Be the brand. Own your audience. Skip the corporate ladder.",
    whyItMatters: "Creator economy is $250B+. PH creators are going global on TikTok.",
    realRoles: ["YouTuber", "TikToker", "Newsletter Writer", "Podcaster", "Streamer"],
  },

  // ============ REMOTE & FREELANCE ============
  {
    id: "00000000-0000-0000-0000-000000000014",
    title: "Virtual Assistant",
    tagline: "Run someone's life, get paid in dollars",
    category: "Remote & Freelance",
    rank: "C",
    trending: true,
    remote: true,
    emoji: "💼",
    gradient: "from-teal-500 to-cyan-600",
    accentColor: "#14b8a6",
    salaryMinPhp: 180000,
    salaryMaxPhp: 420000,
    salaryMinUsd: 13000,
    salaryMaxUsd: 31000,
    timelineMonths: 3,
    skills: ["Organization", "Email/Calendar", "Tools (Notion, Slack)", "Communication", "English"],
    vibe: "Lowest barrier to entry. Highest ROI on time invested.",
    whyItMatters: "USD income from PH. The VA boom is real — and growing.",
    realRoles: ["Executive Assistant", "Operations VA", "Marketing VA", "Real Estate VA"],
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    title: "Copywriter",
    tagline: "Words that sell, on demand",
    category: "Remote & Freelance",
    rank: "B",
    remote: true,
    emoji: "✍️",
    gradient: "from-yellow-500 to-amber-600",
    accentColor: "#eab308",
    salaryMinPhp: 180000,
    salaryMaxPhp: 540000,
    salaryMinUsd: 13000,
    salaryMaxUsd: 40000,
    timelineMonths: 6,
    skills: ["Copywriting", "Persuasion", "Email", "Landing Pages", "Research", "Voice"],
    vibe: "Write a sentence. Get paid $500. Repeat.",
    whyItMatters: "Every marketing dollar runs through copy. Top copywriters are kings.",
    realRoles: ["Direct Response Copywriter", "Brand Copywriter", "UX Writer"],
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    title: "Customer Success",
    tagline: "Keep customers happy, keep revenue growing",
    category: "Remote & Freelance",
    rank: "B",
    remote: true,
    emoji: "🤝",
    gradient: "from-green-500 to-emerald-600",
    accentColor: "#22c55e",
    salaryMinPhp: 240000,
    salaryMaxPhp: 600000,
    salaryMinUsd: 18000,
    salaryMaxUsd: 44000,
    timelineMonths: 4,
    skills: ["Communication", "Empathy", "SaaS Tools", "Onboarding", "Account Management"],
    vibe: "The relationship-builder role. SaaS companies fight for good ones.",
    whyItMatters: "Retention > acquisition. CS roles are remote-friendly and growing fast.",
    realRoles: ["Customer Success Manager", "Onboarding Specialist", "Account Manager"],
  },
];

export const CATEGORIES: { name: CareerCategory; emoji: string; description: string }[] = [
  { name: "Engineering", emoji: "⚡", description: "Build the future, one commit at a time" },
  { name: "Data & AI", emoji: "🧠", description: "Numbers, models, and the future of intelligence" },
  { name: "Design & Creative", emoji: "🎨", description: "Aesthetic-first careers that ship" },
  { name: "Product & Strategy", emoji: "🎯", description: "Decide what gets built and why" },
  { name: "Marketing & Growth", emoji: "📈", description: "Move metrics, build brands" },
  { name: "Remote & Freelance", emoji: "🌍", description: "Work from anywhere, earn in USD" },
];

export const RANK_META: Record<CareerRank, { label: string; color: string; bgColor: string }> = {
  S: { label: "Legendary", color: "#fbbf24", bgColor: "bg-amber-500/15 border-amber-400/30 text-amber-300" },
  A: { label: "Hot", color: "#f43f5e", bgColor: "bg-rose-500/15 border-rose-400/30 text-rose-300" },
  B: { label: "Strong", color: "#8b5cf6", bgColor: "bg-violet-500/15 border-violet-400/30 text-violet-300" },
  C: { label: "Niche", color: "#06b6d4", bgColor: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300" },
};

export function formatPhp(amount: number): string {
  if (amount >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₱${Math.round(amount / 1000)}k`;
  return `₱${amount}`;
}
