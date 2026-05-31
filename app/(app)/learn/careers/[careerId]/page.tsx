"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Lock,
  Check,
  Sparkles,
  GraduationCap,
  MapPin,
  Lightbulb,
  Loader2,
  PlayCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  getCareer,
  rarityMeta,
  isCareerUnlocked,
  getStages,
  currentStageIndex,
} from "@/lib/data/careers";
import {
  guildForCareer,
  currentRank,
  unlockedRewards,
} from "@/lib/data/guilds";
import { SUBJECTS, ageTierForGrade } from "@/lib/data/learner";
import { getLessonsBySubject } from "@/lib/data/learner-lessons";
import { PageShimmer } from "@/components/ui/Shimmer";

export default function CareerDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const careerId = (params?.careerId as string) || "";
  const career = getCareer(careerId);

  const [loading, setLoading] = useState(true);
  const [totalXp, setTotalXp] = useState(0);
  const [grade, setGrade] = useState<number | null>(null);
  const [dreamCareerId, setDreamCareerId] = useState<string | null>(null);
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
        console.error("Career detail load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <PageShimmer />;

  if (!career) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Career not found</h1>
        <Link
          href="/learn/careers"
          className="text-sm text-indigo-300 hover:text-indigo-200"
        >
          ← All careers
        </Link>
      </div>
    );
  }

  const unlocked = isCareerUnlocked(career, totalXp);
  const isDream = dreamCareerId === career.id;
  const tier = ageTierForGrade(grade);
  const rarity = rarityMeta(career.rarity);
  const subjects = career.helpfulSubjects
    .map((id) => SUBJECTS.find((s) => s.id === id))
    .filter(Boolean) as typeof SUBJECTS;

  // Pick a first lesson in a helpful subject to suggest
  const suggestedLesson = (() => {
    for (const subj of career.helpfulSubjects) {
      const lessons = getLessonsBySubject(subj, grade ?? undefined);
      if (lessons[0]) return lessons[0];
    }
    return null;
  })();

  async function pickDream() {
    if (!unlocked || !career) return;
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

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        {/* Back */}
        <Link
          href="/learn/careers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          All careers
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8"
        >
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${career.accentColor}, transparent 70%)`,
            }}
          />
          <div className="relative">
            {/* Rarity + lock badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                style={{
                  color: rarity.color,
                  backgroundColor: `${rarity.color}15`,
                  borderColor: `${rarity.color}50`,
                }}
              >
                {rarity.label}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {career.category}
              </span>
              {!unlocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-md px-1.5 py-0.5">
                  <Lock size={9} />
                  Locked
                </span>
              )}
              {isDream && (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/40"
                >
                  <Heart size={9} fill="white" />
                  Your Dream
                </motion.span>
              )}
            </div>

            <div className="flex items-start gap-4 flex-wrap mb-5">
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${career.gradient} flex items-center justify-center text-5xl shadow-2xl flex-shrink-0 ${
                  !unlocked ? "grayscale opacity-50" : ""
                }`}
                style={
                  unlocked
                    ? { boxShadow: `0 14px 40px ${career.accentColor}40` }
                    : undefined
                }
              >
                {career.emoji}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
                  {career.title}
                </h1>
                {career.filipinoTitle && career.filipinoTitle !== career.title && (
                  <div className="text-sm text-slate-400 mb-2">
                    {career.filipinoTitle}
                  </div>
                )}
                <p className="text-base text-slate-300 leading-relaxed">
                  {career.oneLiner}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            {unlocked && !isDream && (
              <button
                onClick={pickDream}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold hover:shadow-xl hover:shadow-rose-500/40 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Heart size={14} fill="white" />
                )}
                Set as my dream
              </button>
            )}
            {!unlocked && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                    <Lock size={11} />
                    Unlock by earning more XP
                  </span>
                  <span className="text-slate-300 tabular-nums font-semibold">
                    {totalXp.toLocaleString()} / {career.xpToUnlock.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (totalXp / career.xpToUnlock) * 100)}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${career.gradient}`}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── GUILD HALL ─── only when this career has a guild ladder ─── */}
        {unlocked && (() => {
          const guild = guildForCareer(career.id);
          if (!guild) return null;
          const { idx: rankIdx, rank } = currentRank(guild, totalXp);
          const unlocked_rewards = unlockedRewards(guild, totalXp);
          const unlockedSet = new Set(unlocked_rewards.map((r) => r.id));
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.03 }}
              className="relative overflow-hidden rounded-3xl border p-5 sm:p-6"
              style={{
                borderColor: `${career.accentColor}50`,
                background: `linear-gradient(135deg, ${career.accentColor}1F, transparent 70%)`,
              }}
            >
              <div
                className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full opacity-25 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${career.accentColor}, transparent 70%)`,
                }}
              />
              <div className="relative">
                {/* Guild header */}
                <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: career.accentColor }}
                    >
                      🏛️ Guild Hall
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    Rank {rankIdx + 1} of {guild.ranks.length}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1">
                  {guild.name}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {guild.description}
                </p>

                {/* Master quote */}
                <div
                  className="text-xs italic text-slate-200 leading-relaxed mb-4 pl-3 border-l-2"
                  style={{ borderColor: career.accentColor }}
                >
                  "{guild.masterQuote}"
                  <div className="not-italic text-[10px] text-slate-400 mt-0.5">
                    — {guild.masterTitle}
                  </div>
                </div>

                {/* Current rank pill */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: `${career.accentColor}25`,
                      color: career.accentColor,
                      border: `1px solid ${career.accentColor}55`,
                    }}
                  >
                    <span className="text-base">{rank.emoji}</span>
                    Your rank: {rank.title}
                  </motion.div>
                </div>

                {/* Rank ladder — horizontal pills */}
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Rank ladder
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-5">
                  {guild.ranks.map((r, i) => {
                    const reached = i <= rankIdx;
                    const isCurrent = i === rankIdx;
                    return (
                      <div
                        key={i}
                        className={`relative p-2 rounded-lg text-center transition-all ${
                          reached
                            ? "bg-white/[0.04] border border-white/[0.10]"
                            : "bg-white/[0.02] border border-white/[0.04]"
                        }`}
                        title={`${r.title} · ${r.xpThreshold.toLocaleString()} XP`}
                      >
                        <div
                          className={`text-lg leading-none ${
                            reached ? "" : "opacity-30 grayscale"
                          }`}
                        >
                          {r.emoji}
                        </div>
                        <div
                          className={`text-[8px] font-semibold leading-tight mt-1 ${
                            reached ? "text-white" : "text-slate-600"
                          }`}
                        >
                          {r.title}
                        </div>
                        {isCurrent && (
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            style={{
                              boxShadow: `inset 0 0 0 1px ${career.accentColor}`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress to next rank */}
                {rankIdx < guild.ranks.length - 1 && (
                  <>
                    <div className="flex items-baseline justify-between text-[10px] mb-1">
                      <span className="text-slate-400">
                        Next: {guild.ranks[rankIdx + 1].emoji}{" "}
                        {guild.ranks[rankIdx + 1].title}
                      </span>
                      <span className="text-slate-300 tabular-nums font-semibold">
                        {totalXp.toLocaleString()} /{" "}
                        {guild.ranks[rankIdx + 1].xpThreshold.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            ((totalXp - rank.xpThreshold) /
                              Math.max(
                                1,
                                guild.ranks[rankIdx + 1].xpThreshold -
                                  rank.xpThreshold
                              )) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${career.accentColor}, ${career.accentColor}dd)`,
                          boxShadow: `0 0 8px ${career.accentColor}80`,
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Cosmetic rewards */}
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 inline-flex items-center gap-1.5">
                  <span>🎖️</span>
                  Cosmetic rewards
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {guild.rewards.map((r) => {
                    const isUnlocked = unlockedSet.has(r.id);
                    return (
                      <div
                        key={r.id}
                        className={`relative p-2.5 rounded-xl border text-center transition-all ${
                          isUnlocked
                            ? "border-white/[0.16] bg-white/[0.04]"
                            : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                        title={r.earnedBy}
                      >
                        <div
                          className={`text-xl leading-none ${
                            isUnlocked ? "" : "opacity-30 grayscale"
                          }`}
                        >
                          {r.emoji}
                        </div>
                        <div
                          className={`text-[10px] font-semibold leading-tight mt-1 ${
                            isUnlocked ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {r.name}
                        </div>
                        <div
                          className={`text-[8px] mt-0.5 ${
                            isUnlocked ? "text-emerald-300" : "text-slate-600"
                          }`}
                        >
                          {isUnlocked ? "✓ Earned" : r.earnedBy}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 italic">
                  Cosmetic only · earned through learning · no shortcut purchase
                </p>
              </div>
            </motion.div>
          );
        })()}

        {/* ─── ADVENTURE JOURNEY ─── always shown so kids see the path */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:p-6"
        >
          <div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${career.accentColor}, transparent 70%)`,
            }}
          />
          <div className="relative">
            <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1.5">
                <Sparkles size={11} style={{ color: career.accentColor }} />
                Your adventure
              </h2>
              <span className="text-[10px] text-slate-500 tabular-nums">
                {totalXp.toLocaleString()} / {Math.max(career.xpToUnlock, 1500).toLocaleString()} XP
              </span>
            </div>

            {(() => {
              const stages = getStages(career);
              const currentIdx = currentStageIndex(career, totalXp);
              return (
                <div className="relative">
                  {/* Vertical connecting line */}
                  <div
                    className="absolute left-[18px] top-2 bottom-2 w-[2px] bg-white/[0.06]"
                    aria-hidden
                  />
                  {/* Progress fill on the line */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(currentIdx / Math.max(1, stages.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="absolute left-[18px] top-2 w-[2px] rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${career.accentColor}, ${career.accentColor}80)`,
                      boxShadow: `0 0 8px ${career.accentColor}`,
                    }}
                  />

                  <div className="space-y-3 relative">
                    {stages.map((stage, i) => {
                      const reached = totalXp >= stage.xpRequired;
                      const isCurrent = i === currentIdx;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                          className="flex items-start gap-3"
                        >
                          {/* Stage node */}
                          <motion.div
                            animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`relative flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-lg z-10 ${
                              reached
                                ? `bg-gradient-to-br ${career.gradient}`
                                : "bg-white/[0.04] border border-white/[0.08]"
                            }`}
                            style={
                              reached
                                ? { boxShadow: `0 6px 18px ${career.accentColor}50` }
                                : undefined
                            }
                          >
                            <span className={reached ? "" : "opacity-40"}>{stage.emoji}</span>
                            {isCurrent && (
                              <motion.span
                                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity }}
                                className="absolute inset-0 rounded-2xl"
                                style={{
                                  border: `2px solid ${career.accentColor}`,
                                }}
                              />
                            )}
                          </motion.div>
                          {/* Stage details */}
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <div
                                className={`text-sm font-semibold ${
                                  reached ? "text-white" : "text-slate-500"
                                }`}
                              >
                                {stage.title}
                              </div>
                              {isCurrent && (
                                <span
                                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                                  style={{
                                    color: career.accentColor,
                                    backgroundColor: `${career.accentColor}15`,
                                    border: `1px solid ${career.accentColor}50`,
                                  }}
                                >
                                  You're here
                                </span>
                              )}
                              {reached && !isCurrent && (
                                <Check
                                  size={11}
                                  strokeWidth={3}
                                  style={{ color: career.accentColor }}
                                />
                              )}
                            </div>
                            <div
                              className={`text-xs leading-relaxed mt-0.5 ${
                                reached ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {stage.whatYouLearn}
                            </div>
                            {!reached && (
                              <div className="text-[10px] text-slate-500 mt-1 inline-flex items-center gap-1">
                                <Lock size={9} />
                                Needs {stage.xpRequired.toLocaleString()} XP
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>

        {/* What they do */}
        {unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              What they do
            </h2>
            <div className="space-y-2.5">
              {career.whatTheyDo.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${career.accentColor}20`,
                      border: `1px solid ${career.accentColor}40`,
                    }}
                  >
                    <Check
                      size={11}
                      strokeWidth={3}
                      style={{ color: career.accentColor }}
                    />
                  </div>
                  <span className="text-sm text-slate-200 leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fun fact */}
        {unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5"
          >
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)",
              }}
            />
            <div className="relative flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Lightbulb size={18} className="text-white" />
              </motion.div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-1">
                  Fun fact
                </div>
                <p className="text-sm text-amber-50 leading-relaxed">{career.funFact}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Helpful subjects */}
        {unlocked && subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Subjects that help you become this
            </h2>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {subjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/learn/${s.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.16] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl shadow-lg`}
                      style={{ boxShadow: `0 6px 18px ${s.accentColor}30` }}
                    >
                      {s.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{s.title}</div>
                      <div className="text-[10px] text-slate-500">
                        Go to lessons
                      </div>
                    </div>
                    <ArrowRight
                      size={12}
                      className="text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition-all"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* How to become — only for Junior+ tier */}
        {unlocked && tier !== "little" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.06] to-transparent p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-indigo-300" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                How to become one
              </h2>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{career.pathToBecome}</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Senior High strand (after Grade 10)
                </div>
                <div className="text-sm font-semibold">{career.collegeTrack}</div>
              </div>
              {career.phContext && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 inline-flex items-center gap-1">
                    <MapPin size={9} />
                    PH context
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {career.phContext}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Suggested starter lesson */}
        {unlocked && suggestedLesson && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Start working toward it
            </h2>
            <Link
              href={`/learn/${suggestedLesson.subject}/${suggestedLesson.id}`}
              className="group relative overflow-hidden block rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-5 hover:border-emerald-400/40 transition-all"
            >
              <div
                className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-25 pointer-events-none group-hover:opacity-50 transition-opacity"
                style={{
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.5), transparent 70%)",
                }}
              />
              <div className="relative flex items-center gap-3">
                <div className="text-3xl">{suggestedLesson.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold mb-0.5">
                    Suggested first lesson
                  </div>
                  <div className="text-base font-semibold">{suggestedLesson.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    +{suggestedLesson.xpReward} XP toward your goal
                  </div>
                </div>
                <PlayCircle
                  size={20}
                  className="text-emerald-300 group-hover:scale-110 transition-transform"
                />
              </div>
            </Link>
          </motion.div>
        )}

        {/* Locked state — encourage learning */}
        {!unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center"
          >
            <div className="text-5xl mb-3 opacity-50">{career.emoji}</div>
            <h3 className="text-base font-semibold mb-1">Keep learning to unlock</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
              Every lesson you finish earns XP. Reach{" "}
              <span className="text-white font-semibold">
                {career.xpToUnlock.toLocaleString()} XP
              </span>{" "}
              to discover what {career.title}s actually do day-to-day.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              <Sparkles size={14} />
              Go to lessons
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
