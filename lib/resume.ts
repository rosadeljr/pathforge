/** Shared types + helpers for the PathForge Resume Builder. */

export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  period: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export type ResumeAccent = "indigo" | "slate" | "emerald" | "rose" | "amber";

export interface ResumeData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  skills: string;
  languages: string;
  accent: ResumeAccent;
}

/** Accent hex per option — used only for headings/rules, body stays ATS-plain. */
export const RESUME_ACCENTS: Record<ResumeAccent, string> = {
  indigo: "#4338ca",
  slate: "#1e293b",
  emerald: "#047857",
  rose: "#be123c",
  amber: "#b45309",
};

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyResume(): ResumeData {
  return {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    links: "",
    summary: "",
    experience: [],
    education: [],
    certifications: [],
    skills: "",
    languages: "",
    accent: "indigo",
  };
}

/** Merge persisted data over an empty resume so missing keys never crash the UI. */
export function normalizeResume(data: Partial<ResumeData> | null | undefined): ResumeData {
  const base = emptyResume();
  if (!data || typeof data !== "object") return base;
  return {
    ...base,
    ...data,
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    accent: data.accent && RESUME_ACCENTS[data.accent] ? data.accent : "indigo",
  };
}

/** First-run resume seeded from the user's PathForge profile. */
export function buildInitialResume(opts: {
  fullName?: string | null;
  email?: string | null;
  careerTitle?: string | null;
  skills?: string[] | null;
}): ResumeData {
  return {
    ...emptyResume(),
    fullName: opts.fullName || "",
    email: opts.email || "",
    headline: opts.careerTitle ? `Aspiring ${opts.careerTitle}` : "",
    skills: (opts.skills || []).join(", "),
  };
}

export interface ResumeCheck {
  label: string;
  hint: string;
  done: boolean;
  points: number;
}

export interface ResumeScore {
  score: number;
  checks: ResumeCheck[];
}

/**
 * Scores resume completeness 0-100 against recruiter best practices.
 * `hasProjects` / `hasCertificate` come from the user's live PathForge data.
 */
export function scoreResume(
  r: ResumeData,
  opts: { hasProjects: boolean; hasCertificate: boolean }
): ResumeScore {
  const skillCount = r.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;
  const strongExp = r.experience.some(
    (e) => (e.title || e.company) && e.description.trim().length > 30
  );

  const checks: ResumeCheck[] = [
    {
      label: "Contact details complete",
      hint: "Add your name, email and phone number.",
      done: !!(r.fullName.trim() && r.email.trim() && r.phone.trim()),
      points: 15,
    },
    {
      label: "Professional headline",
      hint: "A one-line title, e.g. “Front-End Developer”.",
      done: r.headline.trim().length > 3,
      points: 10,
    },
    {
      label: "Compelling summary",
      hint: "Write 2-3 sentences — ForgeBot can do it for you.",
      done: r.summary.trim().length >= 100,
      points: 15,
    },
    {
      label: "Detailed work experience",
      hint: "Add at least one role with real bullet points.",
      done: strongExp,
      points: 20,
    },
    {
      label: "5+ skills listed",
      hint: "Recruiters and ATS scan for relevant skills.",
      done: skillCount >= 5,
      points: 15,
    },
    {
      label: "Education added",
      hint: "Add your school or program.",
      done: r.education.some((e) => e.school || e.degree),
      points: 10,
    },
    {
      label: "A portfolio project",
      hint: "Ship a project on PathForge — it auto-fills here.",
      done: opts.hasProjects,
      points: 10,
    },
    {
      label: "A certification",
      hint: "Earn your PathForge certificate or add an existing one.",
      done: opts.hasCertificate || r.certifications.some((c) => c.name.trim()),
      points: 5,
    },
  ];

  const score = checks.reduce((s, c) => s + (c.done ? c.points : 0), 0);
  return { score, checks };
}
