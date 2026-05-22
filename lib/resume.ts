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
  skills: string;
}

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
    skills: "",
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
