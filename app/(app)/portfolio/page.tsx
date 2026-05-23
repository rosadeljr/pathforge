"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Trophy,
  Plus,
  ExternalLink,
  Code2,
  Sparkles,
  ArrowRight,
  Star,
  Calendar,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { ACHIEVEMENT_IDS, awardAchievements } from "@/lib/gamification/progression";
import { PageShimmer } from "@/components/ui/Shimmer";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  skills_used: string[] | null;
  project_url: string | null;
  github_url: string | null;
  proof_url: string | null;
  ai_review_score: number | null;
  readiness_impact: number | null;
  lessons_learned: string | null;
  created_at: string;
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        setProjects(data || []);
      } catch (e) {
        console.error("Portfolio load error:", e);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [supabase]);

  if (loading) {
    return <PageShimmer />;
  }

  const totalImpact = projects.reduce((sum, p) => sum + (p.readiness_impact || 0), 0);
  const avgScore = projects.filter((p) => p.ai_review_score).reduce((sum, p, _, arr) => sum + (p.ai_review_score || 0) / arr.length, 0);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
              <Trophy size={11} className="text-amber-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">Your portfolio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Proof of work
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Every project here is verified, ranked, and ready to share with recruiters.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
          >
            <Plus size={14} />
            Add project
          </button>
        </motion.div>

        {/* Stats */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Projects</div>
              <div className="text-2xl font-semibold tabular-nums">{projects.length}</div>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Readiness boost</div>
              <div className="text-2xl font-semibold tabular-nums text-emerald-300">+{totalImpact}%</div>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Avg AI score</div>
              <div className="text-2xl font-semibold tabular-nums">
                {avgScore > 0 ? avgScore.toFixed(1) : "—"}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resume cross-promo — your projects feed straight into your resume */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] to-transparent p-4 flex items-center gap-3 flex-wrap"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <FileText size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-sm">
              <div className="font-semibold text-white">
                Your projects auto-fill your resume
              </div>
              <div className="text-xs text-slate-400">
                Open the Resume Builder and let ForgeBot polish them into recruiter-ready bullets.
              </div>
            </div>
            <Link
              href="/resume"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-white hover:bg-white/[0.1] transition-colors flex-shrink-0"
            >
              Open Resume
              <ArrowRight size={11} />
            </Link>
          </motion.div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.4), transparent 70%)" }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 mb-4">
                <Trophy size={20} className="text-amber-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-5">
                Build real-world projects to prove your skills. Every completed quest
                can become a portfolio piece.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/quests"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Find quests
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.03] transition-colors"
                >
                  <Plus size={14} />
                  Add manually
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold mb-1 truncate">{project.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Calendar size={10} />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        <span className="capitalize px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                          {project.status}
                        </span>
                      </div>
                    </div>
                    {project.ai_review_score && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30">
                        <Star size={10} className="text-amber-300" fill="currentColor" />
                        <span className="text-xs font-semibold text-amber-300 tabular-nums">
                          {project.ai_review_score.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  {/* Skills */}
                  {project.skills_used && project.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.skills_used.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {project.skills_used.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                          +{project.skills_used.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action links */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <ExternalLink size={11} />
                        Live
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <Code2 size={11} />
                        Code
                      </a>
                    )}
                    {project.readiness_impact && project.readiness_impact > 0 && (
                      <span className="ml-auto text-[10px] text-emerald-300 font-semibold">
                        +{project.readiness_impact}% readiness
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Project Modal */}
        {showAddModal && (
          <AddProjectModal
            onClose={() => setShowAddModal(false)}
            onAdd={(project) => {
              setProjects([project, ...projects]);
              setShowAddModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function AddProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (project: Project) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Not signed in");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("selected_career_path_id")
        .eq("id", session.user.id)
        .single();

      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: session.user.id,
          career_path_id: profile?.selected_career_path_id,
          title: title.trim(),
          description: description.trim() || null,
          project_url: projectUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          skills_used: skillsArray.length > 0 ? skillsArray : null,
          status: "completed",
          readiness_impact: 2,
        })
        .select()
        .single();

      if (error) throw error;

      // Check + award "Portfolio Builder" achievement (first project)
      try {
        const { count: projectCount } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id);

        if (projectCount === 1) {
          const { data: existing } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("user_id", session.user.id)
            .eq("achievement_id", ACHIEVEMENT_IDS.PORTFOLIO_BUILDER);

          if (!existing || existing.length === 0) {
            await awardAchievements(supabase, session.user.id, [
              {
                id: ACHIEVEMENT_IDS.PORTFOLIO_BUILDER,
                title: "Portfolio Builder",
                description: "Added your first project",
                xpBonus: 100,
                rarity: "rare",
              },
            ]);
            // Update total XP
            const { data: profile } = await supabase
              .from("profiles")
              .select("total_xp")
              .eq("id", session.user.id)
              .single();
            if (profile) {
              await supabase
                .from("profiles")
                .update({ total_xp: (profile.total_xp || 0) + 100 })
                .eq("id", session.user.id);
            }
            setTimeout(() => {
              toast.success("Achievement: Portfolio Builder (+100 XP)", {
                duration: 5000,
                icon: "🏆",
              });
            }, 500);
          }
        }
      } catch (achErr) {
        console.warn("Achievement check (non-fatal):", achErr);
      }

      toast.success("Project added");
      onAdd(data as Project);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-6"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight mb-1">Add a project</h2>
          <p className="text-xs text-slate-400">Show off something you've built.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Personal Finance App"
              className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What it does and why it matters..."
              rows={3}
              className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 resize-none"
              disabled={saving}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Live URL</label>
              <input
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">GitHub</label>
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Skills used</label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, PostgreSQL"
              className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
              disabled={saving}
            />
            <p className="text-[10px] text-slate-500 mt-1">Comma-separated</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.03] transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
