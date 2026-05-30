"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ageTierForGrade, type AgeTier, TIER_COPY } from "@/lib/data/learner";
import { PageShimmer } from "@/components/ui/Shimmer";
import {
  Trophy,
  Crown,
  Zap,
  Flame,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string | null;
  full_name: string | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  learner_grade: number | null;
  show_on_leaderboard?: boolean;
  display_mode?: "username" | "pseudonymous";
}

/**
 * Resolve what name to show for a leaderboard entry. If a kid opted in
 * to pseudonymous display, we never expose their username to peers —
 * we render their tier label + level instead.
 */
function displayNameFor(e: LeaderboardEntry, tierLabel: string): string {
  if (e.display_mode === "pseudonymous") {
    return `${tierLabel} · Lv ${e.current_level}`;
  }
  return e.username || "anonymous";
}

type SortMode = "xp" | "level" | "streak";

const SORT_OPTIONS: { value: SortMode; label: string; icon: any }[] = [
  { value: "xp", label: "Top XP", icon: Zap },
  { value: "level", label: "Highest level", icon: Trophy },
  { value: "streak", label: "Longest streak", icon: Flame },
];

function getRank(level: number): string {
  if (level < 5) return "E";
  if (level < 10) return "D";
  if (level < 20) return "C";
  if (level < 35) return "B";
  if (level < 55) return "A";
  if (level < 75) return "S";
  if (level < 95) return "SS";
  return "SSS";
}

const RANK_COLORS: Record<string, { gradient: string; color: string }> = {
  E: { gradient: "from-slate-500 to-slate-700", color: "#94a3b8" },
  D: { gradient: "from-emerald-500 to-green-600", color: "#10b981" },
  C: { gradient: "from-cyan-500 to-blue-600", color: "#06b6d4" },
  B: { gradient: "from-violet-500 to-purple-600", color: "#a855f7" },
  A: { gradient: "from-orange-500 to-red-600", color: "#f97316" },
  S: { gradient: "from-rose-500 to-pink-600", color: "#f43f5e" },
  SS: { gradient: "from-amber-400 to-orange-500", color: "#f59e0b" },
  SSS: { gradient: "from-cyan-400 to-violet-500", color: "#06b6d4" },
};

const TIER_GRADES: Record<AgeTier, number[]> = {
  little: [1, 2, 3],
  junior: [4, 5, 6, 7],
  teen: [8, 9, 10, 11, 12],
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("xp");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myGrade, setMyGrade] = useState<number | null>(null);
  const [viewTier, setViewTier] = useState<AgeTier>("junior");

  const supabase = createClient();

  // Init: viewer + their tier.
  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("learner_grade")
            .eq("id", session.user.id)
            .maybeSingle();
          const grade = profile?.learner_grade ?? null;
          setMyGrade(grade);
          setViewTier(ageTierForGrade(grade));
        }
      } catch (e) {
        console.error("Leaderboard init error:", e);
        setLoading(false);
      }
    }
    init();
  }, [supabase]);

  // Load the ranking for the tier being viewed.
  useEffect(() => {
    let cancelled = false;
    async function loadBoard() {
      setLoading(true);
      try {
        const orderColumn =
          sortMode === "xp"
            ? "total_xp"
            : sortMode === "level"
            ? "current_level"
            : "longest_streak";

        const grades = TIER_GRADES[viewTier];
        const { data } = await supabase
          .from("profiles")
          .select(
            "id, username, full_name, current_level, total_xp, streak_count, longest_streak, learner_grade, show_on_leaderboard, display_mode"
          )
          .in("learner_grade", grades)
          .not("username", "is", null)
          // Honour the parent opt-out — if a kid's account is hidden,
          // they don't appear in anyone else's leaderboard view. They
          // still see themselves in their own page (handled client-side).
          .eq("show_on_leaderboard", true)
          .order(orderColumn, { ascending: false })
          .limit(50);

        if (!cancelled) setEntries((data as LeaderboardEntry[]) || []);
      } catch (e) {
        console.error("Leaderboard load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBoard();
    return () => {
      cancelled = true;
    };
  }, [supabase, sortMode, viewTier]);

  const myTier = useMemo(() => ageTierForGrade(myGrade), [myGrade]);
  const isOwnTier = myTier === viewTier && myGrade != null;
  const myRank = currentUserId
    ? entries.findIndex((e) => e.id === currentUserId) + 1
    : 0;
  const tierCopy = TIER_COPY[viewTier];

  const getStat = (e: LeaderboardEntry) => {
    if (sortMode === "xp") return { value: e.total_xp.toLocaleString(), label: "XP" };
    if (sortMode === "level") return { value: e.current_level.toString(), label: "Level" };
    return { value: `${e.longest_streak}d`, label: "Streak" };
  };

  if (loading && entries.length === 0) return <PageShimmer />;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
            <Crown size={11} className="text-amber-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Leaderboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1 inline-flex items-center gap-2 flex-wrap">
            <span>{tierCopy.emoji}</span>
            <span>Top {tierCopy.label}</span>
          </h1>
          <p className="text-sm text-slate-400">
            You're ranked against other learners in your age tier — a fair fight.
          </p>
        </motion.div>

        {/* No-grade nudge */}
        {!myGrade && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 flex items-start gap-3">
            <Sparkles size={15} className="text-amber-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="text-amber-100/90 mb-2">
                Set your grade to join the leaderboard and be ranked.
              </p>
              <Link
                href="/learn/setup"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 hover:text-white transition-colors"
              >
                Set up
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* Tier tabs + your standing */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(["little", "junior", "teen"] as AgeTier[]).map((t) => {
              const c = TIER_COPY[t];
              const active = viewTier === t;
              return (
                <button
                  key={t}
                  onClick={() => setViewTier(t)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-white text-slate-900"
                      : "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                  {t === myTier && myGrade != null && (
                    <span className={`text-[9px] ${active ? "text-slate-600" : "text-emerald-300"}`}>
                      · you
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {isOwnTier && myRank > 0 && (
            <span className="text-xs text-slate-400">
              You're <strong className="text-indigo-300">#{myRank}</strong> on this board
            </span>
          )}
        </div>

        {/* Sort tabs */}
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSortMode(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortMode === value
                  ? "bg-white/[0.08] text-white border border-white/[0.18]"
                  : "bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-sm text-slate-400">
              No {tierCopy.label.toLowerCase()} on the board yet — be the first!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-1.5"
          >
            {entries.map((e, i) => {
              const rank = getRank(e.current_level);
              const rankMeta = RANK_COLORS[rank];
              const stat = getStat(e);
              const isMe = e.id === currentUserId;
              const position = i + 1;
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isMe
                      ? "border-indigo-400/40 bg-indigo-500/[0.08]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  {/* Position */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      position === 1
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900"
                        : position === 2
                        ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900"
                        : position === 3
                        ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                        : "bg-white/[0.04] border border-white/[0.08] text-slate-400"
                    }`}
                  >
                    {position}
                  </div>
                  {/* Avatar — uses placeholder for pseudonymous learners */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {e.display_mode === "pseudonymous"
                      ? tierCopy.emoji
                      : (e.username || "?").slice(0, 2).toUpperCase()}
                  </div>
                  {/* Name + rank */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold truncate">
                        {displayNameFor(e, tierCopy.label)}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 inline-flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 font-medium`} style={{ color: rankMeta.color }}>
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold text-white bg-gradient-to-br ${rankMeta.gradient}`}
                        >
                          {rank}
                        </span>
                        Lv {e.current_level}
                      </span>
                      {e.streak_count > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-300">
                          <Flame size={9} />
                          {e.streak_count}d
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Stat */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold tabular-nums">{stat.value}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Motivation footer */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 text-center"
        >
          <Sparkles size={18} className="text-amber-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold mb-1">Want to climb?</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            Complete lessons, build streaks, unlock achievements. The leaderboard updates as you learn.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Open lessons
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
