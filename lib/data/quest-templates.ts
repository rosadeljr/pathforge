/**
 * PathForge Quest Templates
 *
 * Each career path has 15-20 quests that progress from foundations to mastery.
 * Quests are written to be:
 * - SPECIFIC: a clear deliverable, not "learn React"
 * - ACTIONABLE: doable in 30min - 4hrs
 * - VALUABLE: produces portfolio-worthy proof
 * - PROGRESSIVE: easy → medium → hard → insane
 *
 * Designed for PH/Gen Z context — mention real tools and platforms.
 */

export interface QuestResource {
  label: string;
  url: string;
  type: "video" | "article" | "docs" | "tool" | "template";
}

export interface QuestTemplate {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "insane";
  xp_reward: number;
  time_estimate_minutes: number;
  skill_tag: string;
  career_impact: string;
  proof_type: "url" | "screenshot" | "text" | "github";
  proof_required: boolean;
  resources: QuestResource[];
  steps?: string[];
}

// ============================================================
// SOFTWARE ENGINEER
// ============================================================
const SOFTWARE_ENGINEER_QUESTS: QuestTemplate[] = [
  {
    title: "Set up your dev environment",
    description: "Install Node.js, Git, VS Code, and create your first GitHub account. This is your forge.",
    difficulty: "easy",
    xp_reward: 100,
    time_estimate_minutes: 45,
    skill_tag: "Setup",
    career_impact: "Every engineer needs a clean dev environment. This is non-negotiable.",
    proof_type: "screenshot",
    proof_required: true,
    steps: [
      "Install Node.js LTS from nodejs.org",
      "Install Git from git-scm.com",
      "Install VS Code from code.visualstudio.com",
      "Create a GitHub account at github.com",
      "Run `node --version` and `git --version` in your terminal",
    ],
    resources: [
      { label: "VS Code Setup Guide", url: "https://code.visualstudio.com/docs/setup/setup-overview", type: "docs" },
      { label: "Git Basics", url: "https://www.atlassian.com/git/tutorials/what-is-version-control", type: "article" },
    ],
  },
  {
    title: "Build your first HTML page",
    description: "Create a personal landing page with your name, photo, and a one-liner about you. Deploy it on GitHub Pages.",
    difficulty: "easy",
    xp_reward: 150,
    time_estimate_minutes: 90,
    skill_tag: "HTML/CSS",
    career_impact: "Your first online presence. Every engineer should have a personal site.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "HTML Crash Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", type: "video" },
      { label: "GitHub Pages Quickstart", url: "https://docs.github.com/en/pages/quickstart", type: "docs" },
    ],
  },
  {
    title: "Style with Tailwind CSS",
    description: "Take your personal page and rebuild it with Tailwind CSS. Add hover states, transitions, and make it responsive.",
    difficulty: "easy",
    xp_reward: 200,
    time_estimate_minutes: 120,
    skill_tag: "Tailwind CSS",
    career_impact: "Tailwind is the industry standard for modern web styling. You'll use this everywhere.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Tailwind Docs", url: "https://tailwindcss.com/docs/installation", type: "docs" },
      { label: "Tailwind Play (sandbox)", url: "https://play.tailwindcss.com", type: "tool" },
    ],
  },
  {
    title: "Master JavaScript fundamentals",
    description: "Complete the first 5 sections of JavaScript.info or freeCodeCamp's JS curriculum. Take notes.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 180,
    skill_tag: "JavaScript",
    career_impact: "JS is the language of the web. Strong fundamentals separate juniors from interns.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "JavaScript.info", url: "https://javascript.info", type: "article" },
      { label: "freeCodeCamp JS", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", type: "docs" },
    ],
  },
  {
    title: "Build a to-do app with vanilla JS",
    description: "No frameworks. Just HTML, CSS, JS. Add tasks, mark complete, delete, persist to localStorage.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 180,
    skill_tag: "JavaScript",
    career_impact: "The classic project. Every senior engineer respects someone who can do this from scratch.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "localStorage MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage", type: "docs" },
    ],
  },
  {
    title: "Learn React in 30 minutes",
    description: "Read the React docs 'Quick Start' guide. Set up a new Vite + React project. Render 'Hello, world'.",
    difficulty: "medium",
    xp_reward: 250,
    time_estimate_minutes: 60,
    skill_tag: "React",
    career_impact: "React is the most-hired-for frontend skill in the world.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "React Quick Start", url: "https://react.dev/learn", type: "docs" },
      { label: "Vite Docs", url: "https://vitejs.dev/guide/", type: "docs" },
    ],
  },
  {
    title: "Build a weather app with React + an API",
    description: "Use OpenWeather API. Show current weather for a city the user enters. Style with Tailwind.",
    difficulty: "hard",
    xp_reward: 600,
    time_estimate_minutes: 240,
    skill_tag: "React + APIs",
    career_impact: "Portfolio gold. Hitting external APIs is a foundational engineering skill.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "OpenWeather API (free)", url: "https://openweathermap.org/api", type: "tool" },
      { label: "Fetch API Guide", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", type: "docs" },
    ],
  },
  {
    title: "Deploy your first app to Vercel",
    description: "Push your weather app to GitHub. Connect to Vercel. Deploy to a custom subdomain. Share the link.",
    difficulty: "medium",
    xp_reward: 350,
    time_estimate_minutes: 60,
    skill_tag: "DevOps",
    career_impact: "Knowing how to deploy is what separates students from engineers.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Vercel Quick Start", url: "https://vercel.com/docs/getting-started-with-vercel", type: "docs" },
    ],
  },
  {
    title: "Learn TypeScript basics",
    description: "Take the official 5-minute tour. Convert your weather app to TypeScript. Fix all type errors.",
    difficulty: "hard",
    xp_reward: 500,
    time_estimate_minutes: 180,
    skill_tag: "TypeScript",
    career_impact: "TS is required by 80% of remote-friendly senior frontend jobs. Don't skip it.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "TS 5-min Tour", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", type: "docs" },
    ],
  },
  {
    title: "Build a SaaS landing page clone",
    description: "Pick any SaaS landing page (Linear, Vercel, Stripe). Rebuild it pixel-perfect in Next.js + Tailwind.",
    difficulty: "hard",
    xp_reward: 800,
    time_estimate_minutes: 360,
    skill_tag: "Next.js + Design",
    career_impact: "Recruiters look for taste. A pixel-perfect clone proves you have it.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Next.js Tutorial", url: "https://nextjs.org/learn", type: "docs" },
    ],
  },
  {
    title: "Set up a database (Supabase)",
    description: "Create a Supabase project. Build a simple 'guestbook' table. Read + insert from a Next.js app.",
    difficulty: "hard",
    xp_reward: 700,
    time_estimate_minutes: 180,
    skill_tag: "Backend",
    career_impact: "Full-stack work is the hot lane. Databases are how data persists.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "Supabase Quickstart", url: "https://supabase.com/docs/guides/getting-started/quickstarts/nextjs", type: "docs" },
    ],
  },
  {
    title: "Build your portfolio site",
    description: "Custom domain, Next.js + Tailwind, dark mode, 3 projects highlighted, contact form. Deploy.",
    difficulty: "hard",
    xp_reward: 1000,
    time_estimate_minutes: 480,
    skill_tag: "Full Stack",
    career_impact: "Your portfolio site IS your resume in 2026. Make it sing.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Buy domain (Namecheap)", url: "https://www.namecheap.com", type: "tool" },
    ],
  },
  {
    title: "Solve 5 algorithm problems on LeetCode",
    description: "Pick 5 Easy problems. Solve them. Push solutions to a GitHub repo with explanation comments.",
    difficulty: "hard",
    xp_reward: 500,
    time_estimate_minutes: 300,
    skill_tag: "DSA",
    career_impact: "FAANG-tier interviews need this. Even non-FAANG asks them. Start now.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "LeetCode", url: "https://leetcode.com", type: "tool" },
      { label: "NeetCode roadmap", url: "https://neetcode.io/roadmap", type: "article" },
    ],
  },
  {
    title: "Contribute to an open source project",
    description: "Find a 'good first issue' on GitHub. Fix it. Open a PR. Get it merged.",
    difficulty: "insane",
    xp_reward: 1500,
    time_estimate_minutes: 480,
    skill_tag: "Open Source",
    career_impact: "BOSS QUEST. Open source contributions are gold on a resume. Recruiters notice.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Good First Issues", url: "https://goodfirstissues.com", type: "tool" },
      { label: "First Contributions guide", url: "https://github.com/firstcontributions/first-contributions", type: "docs" },
    ],
  },
  {
    title: "Write a technical blog post",
    description: "Write about what you learned this month. Publish on Dev.to or Hashnode. Share on LinkedIn.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 180,
    skill_tag: "Communication",
    career_impact: "Writing about tech is how you build a public engineering brand. Recruiters Google you.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Dev.to", url: "https://dev.to", type: "tool" },
      { label: "Hashnode", url: "https://hashnode.com", type: "tool" },
    ],
  },
];

// ============================================================
// DATA ANALYST
// ============================================================
const DATA_ANALYST_QUESTS: QuestTemplate[] = [
  {
    title: "Master Excel basics",
    description: "Learn VLOOKUP, pivot tables, conditional formatting. Build a sample sales report.",
    difficulty: "easy",
    xp_reward: 150,
    time_estimate_minutes: 120,
    skill_tag: "Excel",
    career_impact: "Excel is the unsexy backbone of business analysis. You need it.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Excel Crash Course", url: "https://www.youtube.com/watch?v=Vl0H-qTclOg", type: "video" },
    ],
  },
  {
    title: "Learn SQL with SQLZoo",
    description: "Complete the first 5 tutorials on SQLZoo. Master SELECT, WHERE, JOIN, GROUP BY.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 240,
    skill_tag: "SQL",
    career_impact: "SQL is THE skill for data work. Every analyst job lists it as required.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "SQLZoo", url: "https://sqlzoo.net", type: "tool" },
      { label: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial", type: "docs" },
    ],
  },
  {
    title: "Analyze a Kaggle dataset",
    description: "Download a public dataset from Kaggle. Find 3 insights using pivot tables or SQL. Write a 1-page report.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "Analysis",
    career_impact: "Real-data work. This is what analyst portfolios look like.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Kaggle Datasets", url: "https://www.kaggle.com/datasets", type: "tool" },
    ],
  },
  {
    title: "Build a dashboard in Tableau Public",
    description: "Free Tableau Public account. Pick a dataset. Build a 3-chart interactive dashboard. Publish.",
    difficulty: "hard",
    xp_reward: 600,
    time_estimate_minutes: 240,
    skill_tag: "Tableau",
    career_impact: "Public dashboards are portfolio gold. Hiring managers click them.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Tableau Public", url: "https://public.tableau.com", type: "tool" },
    ],
  },
  {
    title: "Learn Python for data with pandas",
    description: "Complete Kaggle's free Python + Pandas intro courses. Load a CSV, compute summary stats.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "Python",
    career_impact: "Python opens the door from analyst to data scientist. The pay jump is significant.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "docs" },
    ],
  },
  {
    title: "A/B test analysis case study",
    description: "Find a public A/B test dataset. Calculate lift, p-value, confidence interval. Write recommendations.",
    difficulty: "hard",
    xp_reward: 700,
    time_estimate_minutes: 240,
    skill_tag: "Statistics",
    career_impact: "Product/growth teams hire for this. Strong stats = strong analyst.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "A/B Testing Guide", url: "https://www.evanmiller.org/ab-testing/sample-size.html", type: "article" },
    ],
  },
  {
    title: "Build your data analyst portfolio site",
    description: "Use Notion or a simple Next.js site. 3 case studies with charts, dataset, and your analysis. Deploy.",
    difficulty: "hard",
    xp_reward: 900,
    time_estimate_minutes: 360,
    skill_tag: "Portfolio",
    career_impact: "Top analyst hires have portfolios. This puts you ahead of 90% of applicants.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Notion (free)", url: "https://notion.so", type: "tool" },
    ],
  },
  {
    title: "Write a data story on LinkedIn",
    description: "Pick an interesting analysis you've done. Write a 300-word LinkedIn post with a chart. Post.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 90,
    skill_tag: "Storytelling",
    career_impact: "LinkedIn is where analyst recruiters live. Posts get you noticed.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// VIRTUAL ASSISTANT
// ============================================================
const VIRTUAL_ASSISTANT_QUESTS: QuestTemplate[] = [
  {
    title: "Polish your English writing",
    description: "Install Grammarly. Take a free writing assessment. Aim for 90+ score.",
    difficulty: "easy",
    xp_reward: 100,
    time_estimate_minutes: 60,
    skill_tag: "Communication",
    career_impact: "VA clients are mostly US-based. Native-level English writing = higher rates.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Grammarly (free)", url: "https://www.grammarly.com", type: "tool" },
    ],
  },
  {
    title: "Master Google Workspace",
    description: "Get fluent in Gmail labels/filters, Calendar scheduling, Drive organization, Docs/Sheets basics.",
    difficulty: "easy",
    xp_reward: 200,
    time_estimate_minutes: 180,
    skill_tag: "Tools",
    career_impact: "Every US client uses Google Workspace. This is your daily tool.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "Google Workspace Learning", url: "https://support.google.com/a/users/answer/9282664", type: "docs" },
    ],
  },
  {
    title: "Learn Notion or ClickUp deeply",
    description: "Pick one. Build a personal project management system. Document workflows in screenshots.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 240,
    skill_tag: "PM Tools",
    career_impact: "Notion/ClickUp skills are listed in 70% of VA jobs. Master one, charge $5+/hr more.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Notion Guides", url: "https://www.notion.so/help/guides", type: "docs" },
    ],
  },
  {
    title: "Create your VA portfolio Notion page",
    description: "List your services, tools, rates, testimonials (mock if needed), and contact. Make it public.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "Personal Brand",
    career_impact: "A portfolio page proves you're serious. Send the link in every job application.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Set up an OnlineJobs.ph profile",
    description: "Create a complete profile with photo, skills test scores, portfolio link, and ID verification.",
    difficulty: "easy",
    xp_reward: 250,
    time_estimate_minutes: 120,
    skill_tag: "Job Hunt",
    career_impact: "OLJ is the biggest PH-VA marketplace. Profile completeness = visibility = jobs.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "OnlineJobs.ph", url: "https://www.onlinejobs.ph", type: "tool" },
    ],
  },
  {
    title: "Apply to 10 VA jobs this week",
    description: "Use OLJ + Upwork. Send 10 personalized applications. Track responses in a spreadsheet.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 180,
    skill_tag: "Applications",
    career_impact: "Volume + personalization wins. 10 applications, 1-2 replies, 1 interview = math working.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Upwork", url: "https://www.upwork.com", type: "tool" },
    ],
  },
  {
    title: "Learn email management workflow",
    description: "Build an Inbox Zero system in Gmail. Document your process. Practice on personal inbox for a week.",
    difficulty: "medium",
    xp_reward: 350,
    time_estimate_minutes: 240,
    skill_tag: "Email",
    career_impact: "Top VA service: managing executive inboxes. Charge $15-25/hr for this skill alone.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Inbox Zero Method", url: "https://www.43folders.com/izero", type: "article" },
    ],
  },
  {
    title: "Master Loom for screen recordings",
    description: "Record a 2-minute Loom explaining a tool/process. Send it as an application sample.",
    difficulty: "easy",
    xp_reward: 200,
    time_estimate_minutes: 60,
    skill_tag: "Communication",
    career_impact: "Loom intros stand out in a sea of text cover letters. Massive edge.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Loom (free)", url: "https://www.loom.com", type: "tool" },
    ],
  },
  {
    title: "Take Specialized VA Course",
    description: "Pick a niche: Real Estate VA, Amazon VA, Bookkeeping VA. Complete a YouTube playlist on it.",
    difficulty: "hard",
    xp_reward: 600,
    time_estimate_minutes: 360,
    skill_tag: "Specialization",
    career_impact: "Niche VAs earn 2-3x more. 'Real Estate VA' is more profitable than 'General VA'.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Land your first client",
    description: "BOSS QUEST. Get one paying client, even at low rate. Document the win.",
    difficulty: "insane",
    xp_reward: 2000,
    time_estimate_minutes: 0,
    skill_tag: "Sales",
    career_impact: "First client = proof of concept. Now it's just repeating + raising rates.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// UI/UX DESIGNER
// ============================================================
const UI_UX_DESIGNER_QUESTS: QuestTemplate[] = [
  {
    title: "Set up Figma + browse design inspiration",
    description: "Create Figma account. Spend 1 hour browsing Mobbin, Dribbble, Awwwards. Save 20 designs you love.",
    difficulty: "easy",
    xp_reward: 100,
    time_estimate_minutes: 90,
    skill_tag: "Inspiration",
    career_impact: "Taste is built through exposure. This is rep #1.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Figma", url: "https://figma.com", type: "tool" },
      { label: "Mobbin", url: "https://mobbin.com", type: "tool" },
      { label: "Dribbble", url: "https://dribbble.com", type: "tool" },
    ],
  },
  {
    title: "Learn Figma fundamentals",
    description: "Complete Figma's official 'Figma 101' course. Build a simple business card design.",
    difficulty: "easy",
    xp_reward: 200,
    time_estimate_minutes: 120,
    skill_tag: "Figma",
    career_impact: "Figma is the global standard. You'll use it every day in your career.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Figma 101", url: "https://www.figma.com/resource-library/design-101", type: "docs" },
    ],
  },
  {
    title: "Redesign an existing app screen",
    description: "Pick any app you use (Spotify, Notion, Shopee). Redesign one screen in Figma. Justify changes.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "UI Design",
    career_impact: "Classic portfolio piece. Recruiters love seeing critical thinking + design skills together.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Build a design system",
    description: "Define colors, typography, spacing, buttons, inputs as Figma components. Document each.",
    difficulty: "hard",
    xp_reward: 700,
    time_estimate_minutes: 360,
    skill_tag: "Design Systems",
    career_impact: "Design system skills = senior salary. Every product team needs this.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Design a 5-screen mobile app concept",
    description: "Pick an idea (habit tracker, recipe app, etc). Design onboarding, home, detail, profile, settings.",
    difficulty: "hard",
    xp_reward: 800,
    time_estimate_minutes: 480,
    skill_tag: "Product Design",
    career_impact: "Show end-to-end thinking. This is what companies hire for.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Conduct 3 user interviews",
    description: "Interview 3 people about a problem in their life. Take notes. Find patterns. Write findings.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 180,
    skill_tag: "User Research",
    career_impact: "UX without research is just art. This skill makes you a designer, not a decorator.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Build your Dribbble + portfolio site",
    description: "Upload 4-5 best works to Dribbble. Build a simple personal site (Framer, Webflow, or Notion).",
    difficulty: "hard",
    xp_reward: 900,
    time_estimate_minutes: 360,
    skill_tag: "Portfolio",
    career_impact: "No portfolio = no job in design. Period.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Framer", url: "https://framer.com", type: "tool" },
    ],
  },
  {
    title: "Write a UX case study",
    description: "Take your best project. Write a 1000-word case study: problem, process, decisions, outcome.",
    difficulty: "hard",
    xp_reward: 800,
    time_estimate_minutes: 240,
    skill_tag: "Case Study",
    career_impact: "One great case study > ten okay screenshots. Recruiters read these.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// DIGITAL MARKETER
// ============================================================
const DIGITAL_MARKETER_QUESTS: QuestTemplate[] = [
  {
    title: "Set up Google Analytics for any site",
    description: "Create a GA4 property. Install on a sample site (yours or family business). Track 1 conversion.",
    difficulty: "easy",
    xp_reward: 200,
    time_estimate_minutes: 90,
    skill_tag: "Analytics",
    career_impact: "GA4 is required for every digital marketing job. Get fluent.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "GA4 Setup", url: "https://support.google.com/analytics/answer/9304153", type: "docs" },
    ],
  },
  {
    title: "Get Google Ads certified",
    description: "Take Google Skillshop's free 'Google Ads Search Certification' exam. Print certificate.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 180,
    skill_tag: "Paid Ads",
    career_impact: "Industry-recognized certification. Add to LinkedIn, resume, portfolio.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Google Skillshop", url: "https://skillshop.exceedlms.com", type: "tool" },
    ],
  },
  {
    title: "Get Meta Blueprint certified",
    description: "Take the free 'Meta Certified Digital Marketing Associate' exam.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "Paid Ads",
    career_impact: "Facebook/Instagram ads = biggest budget channel. Be certified.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Meta Blueprint", url: "https://www.facebook.com/business/learn", type: "tool" },
    ],
  },
  {
    title: "Run your first ₱1,000 test ad",
    description: "Promote anything (your portfolio, your blog post). Spend ₱1k on Meta or Google. Document CTR, CPM.",
    difficulty: "hard",
    xp_reward: 700,
    time_estimate_minutes: 240,
    skill_tag: "Paid Ads",
    career_impact: "Spending real money teaches what tutorials can't. ₱1k is cheap tuition.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [],
  },
  {
    title: "Master SEO basics",
    description: "Complete Ahrefs' or Moz's free SEO beginner course. Optimize a sample page for one keyword.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "SEO",
    career_impact: "Organic traffic is free customers. SEO skills compound forever.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "Ahrefs Academy", url: "https://ahrefs.com/academy", type: "docs" },
    ],
  },
  {
    title: "Build a 3-email welcome sequence",
    description: "Pick a brand. Write a 3-email welcome series for new subscribers. Use ConvertKit or Mailchimp.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 240,
    skill_tag: "Email Marketing",
    career_impact: "Email marketing is the highest-ROI channel. Skill is rare and well-paid.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "ConvertKit (free)", url: "https://convertkit.com", type: "tool" },
    ],
  },
  {
    title: "Write a content strategy doc",
    description: "For a brand of your choice, write a 1-page content strategy: audience, channels, content pillars, calendar.",
    difficulty: "hard",
    xp_reward: 600,
    time_estimate_minutes: 240,
    skill_tag: "Strategy",
    career_impact: "Strategy docs separate marketers from doers. This is what gets you promoted.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Build your marketing portfolio",
    description: "Notion or simple site. 3 case studies, certifications, services offered, results.",
    difficulty: "hard",
    xp_reward: 900,
    time_estimate_minutes: 360,
    skill_tag: "Portfolio",
    career_impact: "Marketing portfolios get clicked by every hiring manager. Make yours undeniable.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// CONTENT CREATOR
// ============================================================
const CONTENT_CREATOR_QUESTS: QuestTemplate[] = [
  {
    title: "Define your niche in one sentence",
    description: "Write: 'I create [content type] for [audience] about [topic].' Test it on 3 people for clarity.",
    difficulty: "easy",
    xp_reward: 150,
    time_estimate_minutes: 60,
    skill_tag: "Brand",
    career_impact: "Niching down is the fastest way to grow an audience. Generalists struggle.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Pick one platform and commit for 30 days",
    description: "TikTok, YouTube Shorts, or Instagram Reels. Pick ONE. Post 5x/week for 30 days. No exceptions.",
    difficulty: "insane",
    xp_reward: 2000,
    time_estimate_minutes: 0,
    skill_tag: "Consistency",
    career_impact: "Consistency > talent. 30 days of daily posting changes your life.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Learn CapCut deeply",
    description: "Watch 10 CapCut tutorials. Edit a 60-second short. Master cuts, text overlays, music timing.",
    difficulty: "medium",
    xp_reward: 350,
    time_estimate_minutes: 180,
    skill_tag: "Editing",
    career_impact: "CapCut is the creator standard. Free, powerful, mobile-friendly.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "CapCut", url: "https://www.capcut.com", type: "tool" },
    ],
  },
  {
    title: "Study 20 viral videos in your niche",
    description: "Watch them, take notes on: hook (first 3s), pacing, payoff, captions. Build a swipe file.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 120,
    skill_tag: "Research",
    career_impact: "Steal like an artist. Patterns hide in plain sight.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Write 50 hook ideas",
    description: "First 3 seconds of a video = 80% of success. Write 50 hooks for your niche.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 120,
    skill_tag: "Copywriting",
    career_impact: "Hook bank = endless content. Best investment of your time.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// AI / ML ENGINEER
// ============================================================
const AI_ML_ENGINEER_QUESTS: QuestTemplate[] = [
  {
    title: "Set up Python + Jupyter environment",
    description: "Install Python 3.11+, set up a virtual environment, install Jupyter. Run your first notebook with 'hello world'.",
    difficulty: "easy",
    xp_reward: 100,
    time_estimate_minutes: 60,
    skill_tag: "Setup",
    career_impact: "Python is the lingua franca of ML. Get fluent in the basics first.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Python.org installer", url: "https://www.python.org/downloads/", type: "tool" },
      { label: "Jupyter Notebook docs", url: "https://jupyter.org/install", type: "docs" },
    ],
  },
  {
    title: "Master NumPy + Pandas basics",
    description: "Complete Kaggle's free Python + Pandas micro-courses. Load a CSV, do 5 transformations, compute summary stats.",
    difficulty: "medium",
    xp_reward: 350,
    time_estimate_minutes: 240,
    skill_tag: "Python",
    career_impact: "These libraries are non-negotiable. Every ML job uses them daily.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "Kaggle Pandas", url: "https://www.kaggle.com/learn/pandas", type: "docs" },
    ],
  },
  {
    title: "Build a linear regression model from scratch",
    description: "Use a public dataset. Build, train, evaluate. Write up your findings as a notebook.",
    difficulty: "hard",
    xp_reward: 600,
    time_estimate_minutes: 240,
    skill_tag: "ML Foundations",
    career_impact: "Linear regression is the foundation. Master this before going to neural nets.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "scikit-learn", url: "https://scikit-learn.org/stable/getting_started.html", type: "docs" },
    ],
  },
  {
    title: "Train your first neural network with PyTorch",
    description: "Use the MNIST or Fashion-MNIST dataset. Build a 2-layer network. Achieve >90% accuracy.",
    difficulty: "hard",
    xp_reward: 800,
    time_estimate_minutes: 360,
    skill_tag: "PyTorch",
    career_impact: "PyTorch is the standard in industry research. Tensorflow is fading.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "PyTorch 60-min Blitz", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", type: "docs" },
    ],
  },
  {
    title: "Build a RAG chatbot with OpenAI API",
    description: "Take 5 documents (PDFs/text). Build a chatbot that answers questions using them via embeddings.",
    difficulty: "hard",
    xp_reward: 900,
    time_estimate_minutes: 480,
    skill_tag: "LLMs",
    career_impact: "RAG is the hottest skill in 2026. Every company wants this.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "OpenAI Cookbook", url: "https://cookbook.openai.com", type: "docs" },
      { label: "LangChain RAG tutorial", url: "https://python.langchain.com/docs/use_cases/question_answering/", type: "docs" },
    ],
  },
  {
    title: "Read 'Attention is All You Need' paper",
    description: "Read the transformer paper. Write a 500-word summary in plain English. Explain self-attention.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 180,
    skill_tag: "Theory",
    career_impact: "This is THE foundational paper of modern AI. Understanding it = level up.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "The paper", url: "https://arxiv.org/abs/1706.03762", type: "article" },
      { label: "Illustrated explanation", url: "http://jalammar.github.io/illustrated-transformer/", type: "article" },
    ],
  },
  {
    title: "Fine-tune an open-source LLM",
    description: "Use Hugging Face. Fine-tune a small model (Mistral 7B or Llama) on a custom dataset. Document results.",
    difficulty: "insane",
    xp_reward: 1800,
    time_estimate_minutes: 720,
    skill_tag: "Fine-tuning",
    career_impact: "BOSS QUEST. Fine-tuning is a niche but explosive-pay skill.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "HuggingFace Fine-tuning", url: "https://huggingface.co/docs/transformers/training", type: "docs" },
    ],
  },
  {
    title: "Build your AI portfolio site",
    description: "Showcase 3 ML projects with notebooks, demos, and writeups. Deploy on Vercel or Hugging Face Spaces.",
    difficulty: "hard",
    xp_reward: 1200,
    time_estimate_minutes: 360,
    skill_tag: "Portfolio",
    career_impact: "ML hiring is portfolio-heavy. Visible work beats certifications.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Hugging Face Spaces", url: "https://huggingface.co/spaces", type: "tool" },
    ],
  },
];

// ============================================================
// CYBERSECURITY SPECIALIST
// ============================================================
const CYBERSECURITY_QUESTS: QuestTemplate[] = [
  {
    title: "Set up a Kali Linux VM",
    description: "Install VirtualBox or VMware. Download Kali Linux. Boot in. Run your first command.",
    difficulty: "easy",
    xp_reward: 150,
    time_estimate_minutes: 90,
    skill_tag: "Setup",
    career_impact: "Kali is the cybersec swiss army knife. You'll live in it.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Kali Linux", url: "https://www.kali.org/get-kali/", type: "tool" },
      { label: "VirtualBox", url: "https://www.virtualbox.org", type: "tool" },
    ],
  },
  {
    title: "Master Linux command line basics",
    description: "Complete LinuxJourney's basic + sysadmin tracks. Be comfortable with grep, sed, awk, ps, netstat.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 360,
    skill_tag: "Linux",
    career_impact: "Without Linux fluency, cybersec careers stall. Most attacks/defenses happen here.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "LinuxJourney", url: "https://linuxjourney.com", type: "docs" },
    ],
  },
  {
    title: "Complete TryHackMe 'Pre-Security' path",
    description: "Free path covering networking, web, Linux, Windows fundamentals. Earn the badge.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 600,
    skill_tag: "Foundations",
    career_impact: "TryHackMe is the gold standard learning platform. Recruiters check profiles.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "TryHackMe", url: "https://tryhackme.com/path/outline/presecurity", type: "tool" },
    ],
  },
  {
    title: "Learn networking deeply (OSI + TCP/IP)",
    description: "Complete Professor Messer's free Network+ course on YouTube. Take notes. Understand subnetting.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 480,
    skill_tag: "Networking",
    career_impact: "Networking knowledge separates real cybersec pros from script kiddies.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "Professor Messer", url: "https://www.professormesser.com/network-plus/n10-008/n10-008-training-course/", type: "video" },
    ],
  },
  {
    title: "Complete OverTheWire 'Bandit'",
    description: "First 15 levels of OverTheWire's Bandit war-game. Learn Linux + basic security through play.",
    difficulty: "hard",
    xp_reward: 700,
    time_estimate_minutes: 480,
    skill_tag: "Practical",
    career_impact: "Hands-on hacking practice. Far more valuable than passive courses.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "OverTheWire Bandit", url: "https://overthewire.org/wargames/bandit/", type: "tool" },
    ],
  },
  {
    title: "Get CompTIA Security+ certified",
    description: "Study for and pass the Sec+ exam. Industry-recognized entry-level credential.",
    difficulty: "insane",
    xp_reward: 2000,
    time_estimate_minutes: 2400,
    skill_tag: "Certification",
    career_impact: "Sec+ is the most-requested cert in entry-level cybersec job postings. Worth ~₱60-100k pay bump.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "CompTIA Sec+", url: "https://www.comptia.org/certifications/security", type: "tool" },
    ],
  },
  {
    title: "Build a SOC analyst home lab",
    description: "Set up a SIEM (Splunk free or ELK). Ingest sample logs. Build 3 alert rules.",
    difficulty: "hard",
    xp_reward: 1000,
    time_estimate_minutes: 600,
    skill_tag: "Blue Team",
    career_impact: "SOC analyst is the most common entry point. Home lab proves you can do the job.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Splunk Free", url: "https://www.splunk.com/en_us/download/splunk-enterprise.html", type: "tool" },
    ],
  },
  {
    title: "Document a CTF writeup",
    description: "Complete any CTF challenge. Write a detailed writeup of how you solved it. Publish on Medium or GitHub.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 240,
    skill_tag: "Documentation",
    career_impact: "CTF writeups = public proof of skill. Recruiters Google your name and read these.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// MOBILE DEVELOPER
// ============================================================
const MOBILE_DEV_QUESTS: QuestTemplate[] = [
  {
    title: "Set up React Native + Expo",
    description: "Install Node + Expo CLI. Create a new app. Run it on your phone via Expo Go. See 'Hello' on your device.",
    difficulty: "easy",
    xp_reward: 200,
    time_estimate_minutes: 90,
    skill_tag: "Setup",
    career_impact: "Expo lets you ship to both iOS + Android without two codebases. Modern default.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Expo Docs", url: "https://docs.expo.dev/get-started/create-a-project/", type: "docs" },
    ],
  },
  {
    title: "Build a counter app",
    description: "Two buttons, one number. Add useState. Increment/decrement. Style it nicely.",
    difficulty: "easy",
    xp_reward: 250,
    time_estimate_minutes: 90,
    skill_tag: "React Native",
    career_impact: "The fundamental React pattern. Once this clicks, everything else does too.",
    proof_type: "github",
    proof_required: true,
    resources: [],
  },
  {
    title: "Build a todo app with AsyncStorage",
    description: "Add tasks, mark complete, delete. Persist between sessions. Use FlatList.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 240,
    skill_tag: "React Native",
    career_impact: "Lists + persistence = 80% of mobile app work. This proves you can build real apps.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "AsyncStorage docs", url: "https://react-native-async-storage.github.io/async-storage/", type: "docs" },
    ],
  },
  {
    title: "Add navigation with React Navigation",
    description: "Build a 3-screen app (Home, Detail, Settings). Stack navigation with smooth transitions.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 240,
    skill_tag: "Navigation",
    career_impact: "Every multi-screen mobile app needs this. Navigation is non-negotiable.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "React Navigation", url: "https://reactnavigation.org", type: "docs" },
    ],
  },
  {
    title: "Build a weather app with API + geolocation",
    description: "Request location. Fetch weather from OpenWeather. Show 5-day forecast with icons.",
    difficulty: "hard",
    xp_reward: 800,
    time_estimate_minutes: 360,
    skill_tag: "APIs + Sensors",
    career_impact: "Combines APIs, permissions, native modules. Portfolio gold.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "Expo Location", url: "https://docs.expo.dev/versions/latest/sdk/location/", type: "docs" },
      { label: "OpenWeather API", url: "https://openweathermap.org/api", type: "tool" },
    ],
  },
  {
    title: "Publish to Expo Application Services (EAS)",
    description: "Build and deploy your app to TestFlight (iOS) or Play Store internal testing. Share the link.",
    difficulty: "hard",
    xp_reward: 1000,
    time_estimate_minutes: 480,
    skill_tag: "Deployment",
    career_impact: "Shipping to real app stores is what separates engineers from hobbyists.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "EAS Build", url: "https://docs.expo.dev/build/introduction/", type: "docs" },
    ],
  },
  {
    title: "Learn iOS-native via Swift basics",
    description: "Complete Apple's free Swift Playgrounds intro. Build a basic SwiftUI 'Hello' app in Xcode.",
    difficulty: "hard",
    xp_reward: 700,
    time_estimate_minutes: 360,
    skill_tag: "Swift",
    career_impact: "Native iOS skills are 2x the rate of React Native. Worth the side investment.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [
      { label: "Swift Playgrounds", url: "https://www.apple.com/swift/playgrounds/", type: "tool" },
    ],
  },
  {
    title: "Build your mobile portfolio site",
    description: "Showcase 3 mobile apps with screenshots, descriptions, App Store/Play Store links if live.",
    difficulty: "hard",
    xp_reward: 900,
    time_estimate_minutes: 240,
    skill_tag: "Portfolio",
    career_impact: "Mobile recruiters want to see and try your apps. Make it easy.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// DATA SCIENTIST
// ============================================================
const DATA_SCIENTIST_QUESTS: QuestTemplate[] = [
  {
    title: "Refresh stats fundamentals",
    description: "Complete Khan Academy's Statistics and Probability course. Take handwritten notes.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 480,
    skill_tag: "Statistics",
    career_impact: "Data scientists who can't explain a p-value get filtered out. Don't be that.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "Khan Stats", url: "https://www.khanacademy.org/math/statistics-probability", type: "docs" },
    ],
  },
  {
    title: "Master pandas + numpy on Kaggle",
    description: "Complete the Pandas + Intermediate Python micro-courses. Apply on a public dataset.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 360,
    skill_tag: "Python",
    career_impact: "Data manipulation is 70% of DS work. Get fast at it.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "docs" },
    ],
  },
  {
    title: "Win (or place top 25%) in a Kaggle competition",
    description: "Pick a beginner-level competition. Submit at least 3 different model approaches. Document.",
    difficulty: "insane",
    xp_reward: 2000,
    time_estimate_minutes: 1200,
    skill_tag: "Kaggle",
    career_impact: "Kaggle medals are recognized credentials. Top 25% in any competition is impressive.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Kaggle Competitions", url: "https://www.kaggle.com/competitions", type: "tool" },
    ],
  },
  {
    title: "Build a deep learning image classifier",
    description: "Use PyTorch or TensorFlow. Train on a small dataset (e.g., flowers, cats vs dogs). Hit >85% accuracy.",
    difficulty: "hard",
    xp_reward: 900,
    time_estimate_minutes: 480,
    skill_tag: "Deep Learning",
    career_impact: "Computer vision basics. Demonstrates you can train and tune a real DL model.",
    proof_type: "github",
    proof_required: true,
    resources: [
      { label: "PyTorch tutorials", url: "https://pytorch.org/tutorials/", type: "docs" },
    ],
  },
  {
    title: "Create a Jupyter notebook portfolio",
    description: "Compile 5 best notebooks (EDA, modeling, writeups). Publish on Kaggle or GitHub.",
    difficulty: "hard",
    xp_reward: 1000,
    time_estimate_minutes: 360,
    skill_tag: "Portfolio",
    career_impact: "Recruiters click through notebooks. Show clean code + great storytelling.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Take the Andrew Ng ML course",
    description: "Complete Coursera's Machine Learning Specialization (audit for free). Even 4 weeks of it.",
    difficulty: "hard",
    xp_reward: 1500,
    time_estimate_minutes: 1800,
    skill_tag: "Theory",
    career_impact: "The most respected ML course on the planet. Foundational knowledge.",
    proof_type: "text",
    proof_required: true,
    resources: [
      { label: "Coursera ML", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "docs" },
    ],
  },
  {
    title: "Write a data science blog post",
    description: "Pick an analysis you've done. Write a 1500-word post on Medium or Towards Data Science.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 240,
    skill_tag: "Communication",
    career_impact: "Writing about your work multiplies its reach. One viral post = job offers.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Towards Data Science", url: "https://towardsdatascience.com", type: "tool" },
    ],
  },
];

// ============================================================
// SOCIAL MEDIA MANAGER
// ============================================================
const SOCIAL_MEDIA_QUESTS: QuestTemplate[] = [
  {
    title: "Audit your own social media",
    description: "Open your accounts. Look at bio, recent posts, engagement. Identify 5 things to fix. Write them down.",
    difficulty: "easy",
    xp_reward: 100,
    time_estimate_minutes: 60,
    skill_tag: "Strategy",
    career_impact: "Self-awareness is step zero. Your accounts are the proof you can do this for others.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Study 30 top creators in your niche",
    description: "Pick 30 creators with 10k-1M followers. Save 5 best posts from each. Notice patterns. Build swipe file.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 180,
    skill_tag: "Research",
    career_impact: "All great social media is borrowed structurally. Steal frameworks ethically.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Learn Canva deeply",
    description: "Complete Canva Design School free courses. Build 10 different post templates for your niche.",
    difficulty: "easy",
    xp_reward: 250,
    time_estimate_minutes: 180,
    skill_tag: "Design",
    career_impact: "Canva is the social media designer's daily tool. Master it = save 5hrs/week.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "Canva Design School", url: "https://www.canva.com/designschool/", type: "docs" },
    ],
  },
  {
    title: "Master CapCut for short-form video",
    description: "Edit 5 short videos (Reels/TikTok format). Master cuts, captions, transitions, music timing.",
    difficulty: "medium",
    xp_reward: 400,
    time_estimate_minutes: 240,
    skill_tag: "Video",
    career_impact: "Short-form video is dominant. SMMs who can edit > SMMs who only schedule.",
    proof_type: "url",
    proof_required: true,
    resources: [
      { label: "CapCut", url: "https://www.capcut.com", type: "tool" },
    ],
  },
  {
    title: "Build a content calendar for a brand",
    description: "Pick any local brand. Plan 30 days of content (mix of formats). Justify each post with strategy.",
    difficulty: "hard",
    xp_reward: 600,
    time_estimate_minutes: 240,
    skill_tag: "Strategy",
    career_impact: "Content calendars are deliverables you bring to interviews. Show, don't tell.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Grow an account to 1000 followers",
    description: "Use your own niche account. Post 5x/week for 30+ days. Engage with 30 people daily. Track growth.",
    difficulty: "insane",
    xp_reward: 1800,
    time_estimate_minutes: 1800,
    skill_tag: "Growth",
    career_impact: "BOSS QUEST. Real-world growth proof beats 100 certifications. Clients want this.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Set up analytics tracking",
    description: "Master Meta Business Suite, TikTok Analytics, Instagram Insights. Pull a sample report.",
    difficulty: "medium",
    xp_reward: 350,
    time_estimate_minutes: 180,
    skill_tag: "Analytics",
    career_impact: "Numbers > opinions. Brands hire SMMs who can prove ROI.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [],
  },
  {
    title: "Build your SMM portfolio",
    description: "Create a Notion page or simple site. Showcase content calendars, growth case studies, design samples.",
    difficulty: "hard",
    xp_reward: 800,
    time_estimate_minutes: 240,
    skill_tag: "Portfolio",
    career_impact: "Most SMMs apply with just a CV. A portfolio puts you in the top 10%.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// GENERIC / FALLBACK QUESTS (for paths without curated content yet)
// ============================================================
const GENERIC_QUESTS: QuestTemplate[] = [
  {
    title: "Set up your LinkedIn profile",
    description: "Professional photo, headline that says what you do, summary, skills, experience. Make it scannable.",
    difficulty: "easy",
    xp_reward: 150,
    time_estimate_minutes: 90,
    skill_tag: "Personal Brand",
    career_impact: "LinkedIn is where recruiters live. Profile = your storefront.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Define your 90-day goal",
    description: "Write one specific outcome you want in 90 days. e.g. 'Land first remote gig at $15/hr'. Pin it visibly.",
    difficulty: "easy",
    xp_reward: 100,
    time_estimate_minutes: 30,
    skill_tag: "Strategy",
    career_impact: "Vague goals get vague results. Specific = achievable.",
    proof_type: "text",
    proof_required: true,
    resources: [],
  },
  {
    title: "Block 5 daily 'forge' hours this week",
    description: "Open your calendar. Block 5 one-hour slots labeled 'PathForge'. Treat as inviolable.",
    difficulty: "easy",
    xp_reward: 150,
    time_estimate_minutes: 15,
    skill_tag: "Habit",
    career_impact: "What gets calendared gets done. Career-building is no different.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [],
  },
  {
    title: "Build your portfolio page",
    description: "Notion, Framer, or any simple builder. Bio + work samples + contact. Make it public.",
    difficulty: "medium",
    xp_reward: 500,
    time_estimate_minutes: 240,
    skill_tag: "Portfolio",
    career_impact: "Portfolio is your career receipt. Send the link in every application.",
    proof_type: "url",
    proof_required: true,
    resources: [],
  },
  {
    title: "Connect with 10 professionals in your field",
    description: "LinkedIn search your target role. Send 10 thoughtful connection requests with a one-line note.",
    difficulty: "medium",
    xp_reward: 300,
    time_estimate_minutes: 90,
    skill_tag: "Networking",
    career_impact: "Your network is your net worth. Start building before you need it.",
    proof_type: "screenshot",
    proof_required: true,
    resources: [],
  },
];

// ============================================================
// EXPORT MAP
// ============================================================
export const QUEST_LIBRARY: Record<string, QuestTemplate[]> = {
  // Engineering
  "00000000-0000-0000-0000-000000000001": SOFTWARE_ENGINEER_QUESTS, // Software Engineer
  "00000000-0000-0000-0000-000000000005": AI_ML_ENGINEER_QUESTS, // AI/ML Engineer
  "00000000-0000-0000-0000-000000000006": CYBERSECURITY_QUESTS, // Cybersecurity
  "00000000-0000-0000-0000-000000000007": MOBILE_DEV_QUESTS, // Mobile Developer

  // Data & AI
  "00000000-0000-0000-0000-000000000002": DATA_ANALYST_QUESTS, // Data Analyst
  "00000000-0000-0000-0000-000000000008": DATA_SCIENTIST_QUESTS, // Data Scientist

  // Design
  "00000000-0000-0000-0000-000000000004": UI_UX_DESIGNER_QUESTS, // UI/UX Designer

  // Marketing & Content
  "00000000-0000-0000-0000-000000000011": DIGITAL_MARKETER_QUESTS, // Digital Marketer
  "00000000-0000-0000-0000-000000000012": SOCIAL_MEDIA_QUESTS, // Social Media Manager
  "00000000-0000-0000-0000-000000000013": CONTENT_CREATOR_QUESTS, // Content Creator

  // Remote & Freelance
  "00000000-0000-0000-0000-000000000014": VIRTUAL_ASSISTANT_QUESTS, // VA
};

/**
 * Get starter quests for a career path.
 * Returns the first N quests (easiest difficulty first).
 */
export function getStarterQuests(careerPathId: string, count = 8): QuestTemplate[] {
  const quests = QUEST_LIBRARY[careerPathId] || GENERIC_QUESTS;
  // Sort by difficulty (easy first) and return first N
  const difficultyOrder = { easy: 0, medium: 1, hard: 2, insane: 3 };
  return [...quests]
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
    .slice(0, count);
}

/**
 * Get ALL quests for a career path (used for browsing).
 */
export function getAllQuests(careerPathId: string): QuestTemplate[] {
  return QUEST_LIBRARY[careerPathId] || GENERIC_QUESTS;
}
