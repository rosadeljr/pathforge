"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { getEntitlements } from "@/lib/entitlements";
import {
  type ResumeData,
  type ResumeExperience,
  type ResumeEducation,
  newId,
  normalizeResume,
  buildInitialResume,
} from "@/lib/resume";
import { PageShimmer } from "@/components/ui/Shimmer";

interface ResumeProject {
  title: string;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
  skills_used: string[] | null;
}

interface ResumeCertificate {
  credential_id: string;
  career_path_title: string;
  issued_at: string;
}

export default function ResumePage() {
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<ResumeData>(buildInitialResume({}));
  const [projects, setProjects] = useState<ResumeProject[]>([]);
  const [certificate, setCertificate] = useState<ResumeCertificate | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        const [profileRes, resumeRes, projectsRes, certRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, username, email, selected_career_path_id, subscription_tier")
            .eq("id", userId)
            .maybeSingle(),
          supabase.from("resumes").select("data").eq("user_id", userId).maybeSingle(),
          supabase
            .from("projects")
            .select("title, description, project_url, github_url, skills_used")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("certificates")
            .select("credential_id, career_path_title, issued_at")
            .eq("user_id", userId)
            .order("issued_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const profile = profileRes.data;
        if (profile?.subscription_tier) setTier(profile.subscription_tier);

        if (resumeRes.data?.data && Object.keys(resumeRes.data.data).length > 0) {
          setResume(normalizeResume(resumeRes.data.data));
        } else if (profile) {
          const path = CAREER_PATHS.find((p) => p.id === profile.selected_career_path_id);
          setResume(
            buildInitialResume({
              fullName: profile.full_name || profile.username,
              email: profile.email,
              careerTitle: path?.title,
              skills: path?.skills,
            })
          );
        }

        setProjects((projectsRes.data as ResumeProject[]) || []);
        if (certRes.data) setCertificate(certRes.data as ResumeCertificate);
      } catch (e) {
        console.error("Resume load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  const update = (patch: Partial<ResumeData>) => setResume((r) => ({ ...r, ...patch }));

  const addExperience = () =>
    setResume((r) => ({
      ...r,
      experience: [
        ...r.experience,
        { id: newId(), title: "", company: "", period: "", description: "" },
      ],
    }));
  const updateExperience = (id: string, patch: Partial<ResumeExperience>) =>
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  const removeExperience = (id: string) =>
    setResume((r) => ({ ...r, experience: r.experience.filter((e) => e.id !== id) }));

  const addEducation = () =>
    setResume((r) => ({
      ...r,
      education: [...r.education, { id: newId(), school: "", degree: "", period: "" }],
    }));
  const updateEducation = (id: string, patch: Partial<ResumeEducation>) =>
    setResume((r) => ({
      ...r,
      education: r.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  const removeEducation = (id: string) =>
    setResume((r) => ({ ...r, education: r.education.filter((e) => e.id !== id) }));

  async function save(silent = false): Promise<boolean> {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("resumes")
        .upsert(
          { user_id: session.user.id, data: resume, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      if (!silent) toast.success("Resume saved");
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save your resume");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function polish(type: "summary" | "bullets", expId?: string) {
    setAiBusy(expId || "summary");
    try {
      const exp = expId ? resume.experience.find((e) => e.id === expId) : null;
      const res = await fetch("/api/resume-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          headline: resume.headline,
          skills: resume.skills,
          draft: type === "summary" ? resume.summary : exp?.description || "",
          role: exp ? `${exp.title} at ${exp.company}` : "",
        }),
      });
      if (!res.ok) throw new Error("AI assist failed");
      const data = await res.json();
      if (!data.result) throw new Error("No result");
      if (type === "summary") {
        update({ summary: data.result });
      } else if (expId) {
        updateExperience(expId, { description: data.result });
      }
      toast.success("Polished by ForgeBot");
    } catch {
      toast.error("ForgeBot couldn't polish that. Try again.");
    } finally {
      setAiBusy(null);
    }
  }

  const canExport = getEntitlements(tier).canExportResume;

  async function handleDownload() {
    if (!canExport) {
      toast("Exporting your resume to PDF is a Pro feature.", { icon: "🔒" });
      router.push("/pricing");
      return;
    }
    const ok = await save(true);
    if (ok) setTimeout(() => window.print(), 150);
  }

  if (loading) return <PageShimmer />;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header — hidden when printing */}
        <div className="no-print flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
              <FileText size={11} className="text-indigo-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                Resume Builder
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
              Build your resume
            </h1>
            <p className="text-sm text-slate-400">
              Pre-filled from your PathForge journey. Polish it and export.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => save()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] text-sm font-medium text-slate-200 hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              {canExport ? <Download size={14} /> : <Lock size={14} />}
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="no-print space-y-5">
            {/* Basics */}
            <Section title="Basics">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Full name" value={resume.fullName} onChange={(v) => update({ fullName: v })} />
                <Field label="Headline" value={resume.headline} onChange={(v) => update({ headline: v })} placeholder="Aspiring Software Engineer" />
                <Field label="Email" value={resume.email} onChange={(v) => update({ email: v })} />
                <Field label="Phone" value={resume.phone} onChange={(v) => update({ phone: v })} />
                <Field label="Location" value={resume.location} onChange={(v) => update({ location: v })} placeholder="Manila, Philippines" />
                <Field label="Links" value={resume.links} onChange={(v) => update({ links: v })} placeholder="portfolio.com · linkedin.com/in/you" />
              </div>
            </Section>

            {/* Summary */}
            <Section
              title="Professional summary"
              action={
                <AiButton
                  busy={aiBusy === "summary"}
                  onClick={() => polish("summary")}
                />
              }
            >
              <textarea
                value={resume.summary}
                onChange={(e) => update({ summary: e.target.value })}
                rows={4}
                placeholder="A few words about who you are and what you bring — or let ForgeBot write it."
                className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500/50"
              />
            </Section>

            {/* Experience */}
            <Section
              title="Experience"
              action={
                <button onClick={addExperience} className="text-xs font-medium text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              }
            >
              {resume.experience.length === 0 && (
                <p className="text-xs text-slate-500">No experience added yet — internships and freelance count.</p>
              )}
              <div className="space-y-3">
                {resume.experience.map((exp) => (
                  <div key={exp.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Field label="Title" value={exp.title} onChange={(v) => updateExperience(exp.id, { title: v })} />
                      <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} />
                    </div>
                    <Field label="Period" value={exp.period} onChange={(v) => updateExperience(exp.id, { period: v })} placeholder="2024 – Present" />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-300">What you did</label>
                        <AiButton
                          label="Polish bullets"
                          busy={aiBusy === exp.id}
                          onClick={() => polish("bullets", exp.id)}
                        />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                        rows={3}
                        placeholder="Jot down what you did — ForgeBot turns it into strong bullet points."
                        className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-xs text-rose-300/80 hover:text-rose-300 inline-flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Education */}
            <Section
              title="Education"
              action={
                <button onClick={addEducation} className="text-xs font-medium text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              }
            >
              <div className="space-y-3">
                {resume.education.map((ed) => (
                  <div key={ed.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <Field label="School" value={ed.school} onChange={(v) => updateEducation(ed.id, { school: v })} />
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Field label="Degree / program" value={ed.degree} onChange={(v) => updateEducation(ed.id, { degree: v })} />
                      <Field label="Period" value={ed.period} onChange={(v) => updateEducation(ed.id, { period: v })} placeholder="2020 – 2024" />
                    </div>
                    <button
                      onClick={() => removeEducation(ed.id)}
                      className="text-xs text-rose-300/80 hover:text-rose-300 inline-flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section title="Skills">
              <textarea
                value={resume.skills}
                onChange={(e) => update({ skills: e.target.value })}
                rows={2}
                placeholder="React, TypeScript, Node.js, Communication"
                className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">Comma-separated.</p>
            </Section>

            {!canExport && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3.5 text-xs text-slate-300 flex items-center gap-2">
                <Lock size={13} className="text-violet-300 flex-shrink-0" />
                <span>
                  Building &amp; previewing is free. Downloading the PDF is a{" "}
                  <button onClick={() => router.push("/pricing")} className="text-violet-300 font-semibold underline">
                    Pro feature
                  </button>
                  .
                </span>
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="no-print text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Live preview
            </div>
            <div
              id="resume-print-area"
              className="bg-white text-slate-800 rounded-xl p-7 sm:p-9 shadow-2xl"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-3 mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {resume.fullName || "Your Name"}
                </h2>
                {resume.headline && (
                  <div className="text-sm font-medium text-indigo-700 mt-0.5">
                    {resume.headline}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {[resume.email, resume.phone, resume.location, resume.links]
                    .filter(Boolean)
                    .map((item, i) => (
                      <span key={i}>{i > 0 && <span className="mr-2">·</span>}{item}</span>
                    ))}
                </div>
              </div>

              {resume.summary && (
                <ResumeSection title="Summary">
                  <p className="text-[12.5px] leading-relaxed text-slate-700">{resume.summary}</p>
                </ResumeSection>
              )}

              {resume.experience.some((e) => e.title || e.company) && (
                <ResumeSection title="Experience">
                  {resume.experience
                    .filter((e) => e.title || e.company)
                    .map((e) => (
                      <div key={e.id} className="mb-3 last:mb-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="text-[13px] font-bold text-slate-900">
                            {e.title || "Role"}
                            {e.company && <span className="font-medium text-slate-600"> · {e.company}</span>}
                          </div>
                          {e.period && <div className="text-[11px] text-slate-500 flex-shrink-0">{e.period}</div>}
                        </div>
                        {e.description && (
                          <p className="text-[12px] leading-relaxed text-slate-700 mt-0.5 whitespace-pre-line">
                            {e.description}
                          </p>
                        )}
                      </div>
                    ))}
                </ResumeSection>
              )}

              {projects.length > 0 && (
                <ResumeSection title="Projects">
                  {projects.map((p, i) => (
                    <div key={i} className="mb-2.5 last:mb-0">
                      <div className="text-[13px] font-bold text-slate-900">{p.title}</div>
                      {p.description && (
                        <p className="text-[12px] leading-relaxed text-slate-700">{p.description}</p>
                      )}
                      {(p.project_url || p.github_url) && (
                        <div className="text-[11px] text-indigo-700">
                          {p.project_url || p.github_url}
                        </div>
                      )}
                    </div>
                  ))}
                </ResumeSection>
              )}

              {resume.skills.trim() && (
                <ResumeSection title="Skills">
                  <p className="text-[12px] leading-relaxed text-slate-700">{resume.skills}</p>
                </ResumeSection>
              )}

              {resume.education.some((e) => e.school || e.degree) && (
                <ResumeSection title="Education">
                  {resume.education
                    .filter((e) => e.school || e.degree)
                    .map((e) => (
                      <div key={e.id} className="mb-2 last:mb-0 flex items-baseline justify-between gap-3">
                        <div className="text-[12.5px]">
                          <span className="font-bold text-slate-900">{e.school || "School"}</span>
                          {e.degree && <span className="text-slate-600"> — {e.degree}</span>}
                        </div>
                        {e.period && <div className="text-[11px] text-slate-500 flex-shrink-0">{e.period}</div>}
                      </div>
                    ))}
                </ResumeSection>
              )}

              {certificate && (
                <ResumeSection title="Certifications">
                  <div className="text-[12px] text-slate-700">
                    <span className="font-bold text-slate-900">
                      {certificate.career_path_title} Program
                    </span>{" "}
                    — PathForge AI Academy
                    <span className="text-slate-500">
                      {" "}· Credential {certificate.credential_id} ·{" "}
                      {new Date(certificate.issued_at).getFullYear()}
                    </span>
                  </div>
                </ResumeSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50"
      />
    </div>
  );
}

function AiButton({
  label = "Polish with ForgeBot",
  busy,
  onClick,
}: {
  label?: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/25 disabled:opacity-50 transition-colors"
    >
      {busy ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
      {label}
    </button>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
