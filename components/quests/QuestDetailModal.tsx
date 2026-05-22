"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  Clock,
  Zap,
  Sparkles,
  CheckCircle2,
  Link2,
  FileText,
  Camera,
  Code2,
  Video,
  BookOpen,
  Wrench,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { QUEST_LIBRARY, type QuestResource } from "@/lib/data/quest-templates";
import { assessQuestSubmission, type QuestAssessment } from "@/lib/ai/quest-assessment";

interface Quest {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  xp_reward: number;
  time_estimate_minutes: number | null;
  skill_tag: string | null;
  career_impact: string | null;
  proof_required: boolean;
  proof_type: string | null;
  status: string;
  career_path_id?: string;
}

interface Props {
  quest: Quest;
  onClose: () => void;
  onComplete: (questId: string, proofUrl?: string, proofNotes?: string) => Promise<void>;
}

const DIFFICULTY_META: Record<string, { rank: string; label: string; color: string; gradient: string }> = {
  easy: { rank: "E", label: "Easy", color: "#10b981", gradient: "from-emerald-500 to-green-600" },
  medium: { rank: "C", label: "Medium", color: "#06b6d4", gradient: "from-cyan-500 to-blue-600" },
  hard: { rank: "B", label: "Hard", color: "#a855f7", gradient: "from-violet-500 to-purple-600" },
  insane: { rank: "S", label: "Boss", color: "#f43f5e", gradient: "from-rose-500 to-pink-600" },
};

const RESOURCE_ICONS: Record<string, any> = {
  video: Video,
  article: BookOpen,
  docs: FileText,
  tool: Wrench,
  template: FileText,
};

const PROOF_ICONS: Record<string, any> = {
  url: Link2,
  github: Code2,
  screenshot: Camera,
  text: FileText,
};

export function QuestDetailModal({ quest, onClose, onComplete }: Props) {
  const [proofUrl, setProofUrl] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [completing, setCompleting] = useState(false);
  // After completion, ForgeBot reviews the submission and shows feedback
  const [view, setView] = useState<"detail" | "assessed">("detail");
  const [assessment, setAssessment] = useState<QuestAssessment | null>(null);
  // Portal the modal to <body> so a transformed ancestor can't trap its
  // position:fixed and crop the sticky footer off-screen.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Look up matching template for steps/resources
  const template = useMemo(() => {
    if (!quest.career_path_id) return null;
    const templates = QUEST_LIBRARY[quest.career_path_id] || [];
    return templates.find((t) => t.title === quest.title) || null;
  }, [quest]);

  const diff = DIFFICULTY_META[quest.difficulty] || DIFFICULTY_META.medium;
  const ProofIcon = PROOF_ICONS[quest.proof_type || "text"] || FileText;

  const handleComplete = async () => {
    if (quest.proof_required) {
      if (quest.proof_type === "url" || quest.proof_type === "github") {
        if (!proofUrl.trim() || !/^https?:\/\//i.test(proofUrl)) {
          toast.error("Please paste a valid URL starting with http:// or https://");
          return;
        }
      } else if (!proofUrl.trim() && !proofNotes.trim()) {
        toast.error("Please add some proof or notes about what you did");
        return;
      }
    }

    setCompleting(true);
    const cleanUrl = proofUrl.trim() || undefined;
    const cleanNotes = proofNotes.trim() || undefined;
    try {
      // 1. Complete the quest (parent handles XP/streak/achievements)
      await onComplete(quest.id, cleanUrl, cleanNotes);

      // 2. Get ForgeBot's assessment of the submission — instant local fallback,
      //    then upgrade with the API response if it's better.
      const localAssessment = assessQuestSubmission({
        title: quest.title,
        difficulty: quest.difficulty,
        skillTag: quest.skill_tag,
        careerImpact: quest.career_impact,
        proofType: quest.proof_type,
        proofUrl: cleanUrl,
        proofNotes: cleanNotes,
      });
      setAssessment(localAssessment);
      setView("assessed");

      // Async upgrade — don't block the UI
      fetch("/api/assess-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quest.title,
          difficulty: quest.difficulty,
          skillTag: quest.skill_tag,
          careerImpact: quest.career_impact,
          proofType: quest.proof_type,
          proofUrl: cleanUrl,
          proofNotes: cleanNotes,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.verdict && data?.feedback) setAssessment(data);
        })
        .catch(() => {
          /* keep local assessment */
        });
    } catch (e) {
      // Error handling done in parent — stay on detail view so user can retry
    } finally {
      setCompleting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl bg-[#0a0a0f] border-t border-x sm:border border-white/[0.08] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          // Use small viewport-height units (svh) so mobile chrome doesn't crop
          maxHeight: "min(92svh, 92vh)",
        }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* Header */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(ellipse at top, ${diff.color}40, transparent 70%)` }}
          />
          <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${diff.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  style={{ boxShadow: `0 8px 24px ${diff.color}40` }}
                >
                  {diff.rank}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
                    {diff.label} Quest
                  </div>
                  {quest.skill_tag && (
                    <div className="text-xs text-slate-400">{quest.skill_tag}</div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">{quest.title}</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold">
                <Zap size={12} />+{quest.xp_reward} XP
              </span>
              {quest.time_estimate_minutes && (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock size={12} />
                  {quest.time_estimate_minutes < 60
                    ? `${quest.time_estimate_minutes} min`
                    : `${Math.round(quest.time_estimate_minutes / 60)}h`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ASSESSED VIEW — ForgeBot's review of the submission */}
        {view === "assessed" && assessment && (
          <div className="px-6 py-6 overflow-y-auto flex-1">
            {/* ForgeBot header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">ForgeBot reviewed your work</div>
                <div className="text-xs text-slate-400">Quest complete · +{quest.xp_reward} XP banked</div>
              </div>
            </div>

            {/* Verdict */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border mb-4 ${
                assessment.strength === "excellent"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : assessment.strength === "good"
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}
            >
              <CheckCircle2 size={12} />
              <span className="text-xs font-bold tracking-wide">{assessment.verdict}</span>
            </div>

            {/* Feedback */}
            <p className="text-sm text-slate-200 leading-relaxed mb-5">{assessment.feedback}</p>

            {/* Next step */}
            <div className="p-3.5 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20">
              <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
                <ChevronRight size={11} />
                ForgeBot suggests
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{assessment.nextStep}</p>
            </div>
          </div>
        )}

        {/* DETAIL VIEW — the quest details + proof form */}
        {view === "detail" && (
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Description */}
          {quest.description && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                The mission
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">{quest.description}</p>
            </div>
          )}

          {/* Career impact */}
          {quest.career_impact && (
            <div className="p-3.5 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-indigo-300 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold mb-1">
                    Why this matters
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {quest.career_impact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Steps */}
          {template?.steps && template.steps.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                How to complete it
              </h3>
              <ol className="space-y-2">
                {template.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-slate-300">
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Resources */}
          {template?.resources && template.resources.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                Resources
              </h3>
              <div className="space-y-2">
                {template.resources.map((r: QuestResource, i) => {
                  const Icon = RESOURCE_ICONS[r.type] || BookOpen;
                  return (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300">
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{r.label}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{r.type}</div>
                      </div>
                      <ExternalLink size={12} className="text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Proof submission */}
          {quest.proof_required && quest.status === "active" && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-1.5">
                <ProofIcon size={11} />
                Submit your proof
              </h3>
              <div className="space-y-3">
                {(quest.proof_type === "url" || quest.proof_type === "github" || quest.proof_type === "screenshot") && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {quest.proof_type === "github"
                        ? "GitHub URL"
                        : quest.proof_type === "screenshot"
                        ? "Screenshot URL (Imgur, Drive link, etc.)"
                        : "Deployed URL"}
                    </label>
                    <input
                      type="url"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Notes (what you learned, key wins){quest.proof_type === "text" ? "" : " · optional"}
                  </label>
                  <textarea
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Share what you learned, problems you solved, or any reflections..."
                    rows={3}
                    className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Footer — sticky on mobile so submit button is ALWAYS visible */}
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
        >
          {view === "assessed" ? (
            <button
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
            >
              <CheckCircle2 size={14} />
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-2 rounded-lg border border-white/[0.08] text-xs sm:text-sm font-medium text-slate-300 hover:bg-white/[0.04] transition-colors flex-shrink-0"
                disabled={completing}
              >
                Close
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-white/5 whitespace-nowrap"
              >
                {completing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Completing…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span className="hidden sm:inline">Complete · </span>
                    <span>+{quest.xp_reward} XP</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
