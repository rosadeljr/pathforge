"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Sparkles,
  ArrowRight,
  Filter,
  Star,
  Heart,
  Loader2,
  Check,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  CAREERS,
  ALL_CATEGORIES,
  rarityMeta,
  isCareerUnlocked,
  getStages,
  currentStageIndex,
  type Career,
  type CareerCategory,
} from "@/lib/data/careers";
import { SUBJECTS, ageTierForGrade } from "@/lib/data/learner";
import { PageShimmer } from "@/components/ui/Shimmer";
import { ScreenIntro } from "@/components/learn/rpg/primitives";

/**
 * Career exploration — kids browse careers, see what each does,
 * unlock them by earning XP. Picking a "dream career" saves to their
 * profile so the lessons and tutor can connect learning to it.
 */
export default function CareersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [totalXp, setTotalXp] = useState(0);
  const [grade, setGrade] = useState<number | null>(null);
  const [dreamCareerId, setDreamCareerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | CareerCategory>("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from("profiles")
          .select("total_xp, learner_grade, dream_career_id")
          .eq("id", session.user.id)
          .maybeSingle();
        if (data) {
          setTotalXp(data.total_xp || 0);
          setGrade(data.learner_grade ?? null);
          setDreamCareerId((data as any).dream_career_id ?? null);
        }
      } catch (e) {
        console.error("Careers load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  const tier = ageTierForGrade(grade);

  // Apply category filter
  const filtered = useMemo(() => {
    if (filter === "all") return CAREERS;
    return CAREERS.filter((c) => c.category === filter);
  }, [filter]);

  // Sort: unlocked first, then by xpToUnlock ascending, then by rarity
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aUnlocked = isCareerUnlocked(a, totalXp);
      const bUnlocked = isCareerUnlocked(b, totalXp);
      if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
      return a.xpToUnlock - b.xpToUnlock;
    });
  }, [filtered, totalXp]);

  const unlockedCount = CAREERS.filter((c) => isCareerUnlocked(c, totalXp)).length;
  const dreamCareer = CAREERS.find((c) => c.id === dreamCareerId);

  async function pickDream(career: Career) {
    if (!isCareerUnlocked(career, totalXp)) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ dream_career_id: career.id })
        .eq("id", session.user.id);
      if (error) throw error;
      setDreamCareerId(career.id);
      toast.success(`Dream career set: ${career.title}! 🌟`);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageShimmer />;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ScreenIntro
            emoji="🧭"
            accent="#fb7185"
            title={
              tier === "little"
                ? "What do you want to be? 🌟"
                : tier === "junior"
                ? "Pick your future career"
                : "Explore careers · find your path"
            }
            blurb="Every lesson you finish unlocks new careers to discover. Pick a dream career, then master its full 5-stage adventure to earn a Career Mastery Certificate! 🏆"
            right={
              <Link
                href="/learn/certificates"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200"
                style={{ border: "1px solid rgba(251,191,36,0.4)" }}
              >
                <Trophy size={12} />
                My certificates
                <ArrowRight size={10} />
              </Link>
            }
          />
        </motion.div>

        {/* Progress + dream career */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid sm:grid-cols-2 gap-3"
        >
          {/* Unlocked progress */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5">
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)" }}
            />
            <div className="relative flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-0.5">
                  Discovered
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {unlockedCount} <span className="text-base text-slate-400 font-medium">/ {CAREERS.length}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Earn more XP to unlock the rest
                </div>
              </div>
            </div>
          </div>

          {/* Dream career with current adventure stage */}
          <Link
            href={dreamCareer ? `/learn/careers/${dreamCareer.id}` : "#"}
            onClick={(e) => {
              if (!dreamCareer) e.preventDefault();
            }}
            className={`block relative overflow-hidden rounded-2xl border p-5 transition-all ${
              dreamCareer
                ? "border-rose-400/30 bg-gradient-to-br from-rose-500/[0.08] to-transparent hover:border-rose-400/50"
                : "border-white/[0.06] bg-white/[0.02] cursor-default"
            }`}
          >
            {dreamCareer && (
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${dreamCareer.accentColor}, transparent 70%)`,
                }}
              />
            )}
            <div className="relative flex items-center gap-3">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  dreamCareer
                    ? "bg-gradient-to-br " + dreamCareer.gradient
                    : "bg-white/[0.04] border border-white/[0.08]"
                }`}
                style={
                  dreamCareer
                    ? { boxShadow: `0 8px 24px ${dreamCareer.accentColor}40` }
                    : undefined
                }
              >
                {dreamCareer ? (
                  <span className="text-2xl">{dreamCareer.emoji}</span>
                ) : (
                  <Heart size={18} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 text-rose-300 inline-flex items-center gap-1">
                  <Heart size={9} fill="currentColor" />
                  Dream career
                </div>
                {dreamCareer ? (
                  (() => {
                    const stages = getStages(dreamCareer);
                    const idx = currentStageIndex(dreamCareer, totalXp);
                    const stage = stages[idx];
                    return (
                      <>
                        <div className="text-base font-semibold truncate">
                          {stage.emoji} {stage.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          Stage {idx + 1} of {stages.length} · {dreamCareer.title}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <div className="text-base font-semibold truncate">Pick one below</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      Tap the heart on any career to set it as your dream
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter size={12} className="text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Filter
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryPill label="All" active={filter === "all"} onClick={() => setFilter("all")} />
            {ALL_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={filter === cat}
                onClick={() => setFilter(cat)}
              />
            ))}
          </div>
        </motion.div>

        {/* Career grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {sorted.map((career, i) => (
              <CareerCard
                key={career.id}
                career={career}
                unlocked={isCareerUnlocked(career, totalXp)}
                isDream={dreamCareerId === career.id}
                xpProgress={totalXp}
                tier={tier}
                onPick={() => pickDream(career)}
                index={i}
                saving={saving}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        active
          ? "bg-white text-slate-900"
          : "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function CareerCard({
  career,
  unlocked,
  isDream,
  xpProgress,
  tier,
  onPick,
  index,
  saving,
}: {
  career: Career;
  unlocked: boolean;
  isDream: boolean;
  xpProgress: number;
  tier: "little" | "junior" | "teen";
  onPick: () => void;
  index: number;
  saving: boolean;
}) {
  const rarity = rarityMeta(career.rarity);
  const subjects = career.helpfulSubjects
    .map((id) => SUBJECTS.find((s) => s.id === id))
    .filter(Boolean) as typeof SUBJECTS;

  // XP progress toward unlock (for locked cards)
  const progressPct = Math.min(100, (xpProgress / Math.max(1, career.xpToUnlock)) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, delay: 0.04 + index * 0.025 }}
      whileHover={unlocked ? { y: -4 } : {}}
    >
      <Link
        href={unlocked ? `/learn/careers/${career.id}` : "#"}
        onClick={(e) => {
          if (!unlocked) e.preventDefault();
        }}
        className={`group relative overflow-hidden block rounded-2xl border p-5 transition-all ${
          !unlocked
            ? "border-white/[0.04] bg-white/[0.01] cursor-not-allowed"
            : isDream
            ? "border-rose-400/40 bg-gradient-to-br from-rose-500/[0.08] to-transparent hover:border-rose-400/60"
            : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.18]"
        }`}
        style={
          unlocked
            ? { boxShadow: `0 8px 28px ${rarity.glow}10` }
            : undefined
        }
      >
        {/* Background glow */}
        {unlocked && (
          <div
            className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-25 pointer-events-none group-hover:opacity-50 transition-opacity"
            style={{
              background: `radial-gradient(circle, ${career.accentColor}, transparent 70%)`,
            }}
          />
        )}

        {/* Dream badge */}
        {isDream && (
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-rose-500/40"
            >
              <Heart size={9} fill="white" />
              Dream
            </motion.div>
          </div>
        )}

        <div className="relative">
          {/* Emoji + rarity badge */}
          <div className="flex items-start justify-between mb-3">
            <motion.div
              whileHover={unlocked ? { rotate: [0, -8, 8, 0] } : {}}
              transition={{ duration: 0.5 }}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${career.gradient} flex items-center justify-center text-3xl shadow-lg ${
                !unlocked ? "grayscale opacity-50" : ""
              }`}
              style={
                unlocked
                  ? { boxShadow: `0 8px 24px ${career.accentColor}40` }
                  : undefined
              }
            >
              {career.emoji}
            </motion.div>
            {unlocked && !isDream && (
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border"
                style={{
                  color: rarity.color,
                  backgroundColor: `${rarity.color}15`,
                  borderColor: `${rarity.color}50`,
                }}
              >
                {rarity.label}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className={`text-base font-semibold tracking-tight ${
                !unlocked ? "text-slate-500" : ""
              }`}
            >
              {career.title}
            </h3>
            {career.filipinoTitle && career.filipinoTitle !== career.title && (
              <span className="text-[11px] text-slate-500">· {career.filipinoTitle}</span>
            )}
          </div>

          {/* One-liner */}
          <p
            className={`text-xs leading-relaxed mb-3 ${
              !unlocked ? "text-slate-600" : "text-slate-400"
            }`}
          >
            {career.oneLiner}
          </p>

          {/* Helpful subjects pills */}
          {unlocked && subjects.length > 0 && (
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              <span className="text-[10px] text-slate-500 mr-0.5">Helped by:</span>
              {subjects.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-white/[0.04] border border-white/[0.06] rounded-md px-1.5 py-0.5"
                >
                  <span>{s.emoji}</span>
                  {s.title}
                </span>
              ))}
            </div>
          )}

          {/* Lock state with XP progress */}
          {!unlocked ? (
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Lock size={10} />
                  {career.xpToUnlock.toLocaleString()} XP to unlock
                </span>
                <span className="tabular-nums">
                  {xpProgress.toLocaleString()} / {career.xpToUnlock.toLocaleString()}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className={`h-full bg-gradient-to-r ${career.gradient}`}
                />
              </div>
            </div>
          ) : isDream ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <Check size={12} strokeWidth={3} />
              Your dream career
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!saving) onPick();
                }}
                disabled={saving}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Heart size={11} />
                )}
                Set as dream
              </button>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                {tier === "little" ? "See more" : "Explore"}
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
