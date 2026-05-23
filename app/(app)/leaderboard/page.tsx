"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { PageShimmer } from "@/components/ui/Shimmer";
import {
  Trophy,
  Crown,
  Medal,
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
  selected_career_path_id: string | null;
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

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("xp");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myPathId, setMyPathId] = useState<string | null>(null);
  const [viewPathId, setViewPathId] = useState<string | null>(null);

  const supabase = createClient();

  // Load the viewer's identity + their own career path.
  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("selected_career_path_id")
            .eq("id", session.user.id)
            .maybeSingle();
          const path = profile?.selected_career_path_id || null;
          setMyPathId(path);
          setViewPathId(path || CAREER_PATHS[0]?.id || null);
        } else {
          setViewPathId(CAREER_PATHS[0]?.id || null);
        }
      } catch (e) {
        console.error("Leaderboard init error:", e);
        setLoading(false);
      }
    }
    init();
  }, [supabase]);

  // Load the ranking for the path being viewed.
  useEffect(() => {
    if (!viewPathId) return;
    let cancelled = false;
    async function loadBoard() {
      setLoading(true);
      try {
        const orderColumn =
          sortMode === "xp" ? "total_xp" :
          sortMode === "level" ? "current_level" :
          "longest_streak";

        const { data } = await supabase
          .from("profiles")
          .select("id, username, full_name, current_level, total_xp, streak_count, longest_streak, selected_career_path_id")
          .eq("selected_career_path_id", viewPathId)
          .not("username", "is", null)
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
  }, [supabase, sortMode, viewPathId]);

  const viewPath = CAREER_PATHS.find((p) => p.id === viewPathId);
  const isOwnPath = viewPathId === myPathId && !!myPathId;
  const myRank = currentUserId
    ? entries.findIndex((e) => e.id === currentUserId) + 1
    : 0;

  const getStat = (e: LeaderboardEntry) => {
    if (sortMode === "xp") return { value: e.total_xp.toLocaleString(), label: "XP" };
    if (sortMode === "level") return { value: e.current_level.toString(), label: "Level" };
    return { value: `${e.longest_streak}d`, label: "Streak" };
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
            <Crown size={11} className="text-amber-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Leaderboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 flex items-center gap-2 flex-wrap">
            {viewPath && <span>{viewPath.emoji}</span>}
            <span>{viewPath ? `Top ${viewPath.title}s` : "Leaderboard"}</span>
          </h1>
          <p className="text-sm text-slate-400">
            You&apos;re ranked only against others on the same path — a fair fight.
          </p>
        </motion.div>

        {/* No-path nudge */}
        {!myPathId && (
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

        {/* Path selector + your standing */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={viewPathId || ""}
            onChange={(e) => setViewPathId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            {CAREER_PATHS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.title}
                {p.id === myPathId ? " — your path" : ""}
              </option>
            ))}
          </select>
          {isOwnPath && myRank > 0 && (
            <span className="text-xs text-slate-400">
              You&apos;re{" "}
              <strong className="text-indigo-300">#{myRank}</strong> on this board
            </span>
          )}
        </div>

        {/* Sort filter */}
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortMode(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sortMode === opt.value
                  ? "bg-white text-slate-900"
                  : "bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              <opt.icon size={12} />
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageShimmer />
        ) : (
          <>
            {/* Podium (top 3) */}
            {entries.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-3 gap-3 items-end"
              >
                <PodiumCard entry={entries[1]} rank={2} stat={getStat(entries[1])} />
                <PodiumCard entry={entries[0]} rank={1} stat={getStat(entries[0])} />
                <PodiumCard entry={entries[2]} rank={3} stat={getStat(entries[2])} />
              </motion.div>
            )}

            {/* Full list */}
            {entries.length === 0 ? (
              <div className="p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
                <p className="text-sm text-slate-400">
                  No forgers on this path yet.{" "}
                  {isOwnPath ? "Be the first to claim #1." : ""}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500 font-semibold grid grid-cols-[2rem_1fr_auto] gap-4 items-center">
                  <div>Rank</div>
                  <div>Hunter</div>
                  <div className="text-right">
                    {SORT_OPTIONS.find((o) => o.value === sortMode)?.label}
                  </div>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {entries.map((entry, i) => {
                    const rank = i + 1;
                    const userRank = getRank(entry.current_level);
                    const rankStyle = RANK_COLORS[userRank];
                    const stat = getStat(entry);
                    const isYou = entry.id === currentUserId;

                    return (
                      <Link
                        key={entry.id}
                        href={entry.username ? `/u/${entry.username}` : "#"}
                        className={`grid grid-cols-[2rem_1fr_auto] gap-4 items-center px-5 py-3 transition-colors ${
                          isYou
                            ? "bg-indigo-500/[0.06] hover:bg-indigo-500/[0.1]"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="text-sm font-bold tabular-nums text-slate-400">
                          {rank <= 3 ? (
                            <Medal
                              size={16}
                              className={
                                rank === 1
                                  ? "text-amber-400"
                                  : rank === 2
                                  ? "text-slate-300"
                                  : "text-orange-400"
                              }
                              fill="currentColor"
                            />
                          ) : (
                            `#${rank}`
                          )}
                        </div>

                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${rankStyle.gradient} flex items-center justify-center text-xs font-bold flex-shrink-0`}
                          >
                            {(entry.username || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate flex items-center gap-2">
                              {entry.full_name || entry.username}
                              {isYou && (
                                <span className="text-[9px] font-bold tracking-wider px-1 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="font-bold" style={{ color: rankStyle.color }}>
                                {userRank}-Rank
                              </span>
                              <span>· Lv {entry.current_level}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold tabular-nums">
                            {stat.value}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 text-center"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at center, rgba(245,158,11,0.3), transparent 70%)" }}
          />
          <div className="relative">
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  stat,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  stat: { value: string; label: string };
}) {
  const userRank = getRank(entry.current_level);
  const rankStyle = RANK_COLORS[userRank];
  const podiumColors = {
    1: "from-amber-400 to-amber-600",
    2: "from-slate-300 to-slate-500",
    3: "from-orange-400 to-orange-600",
  };
  const height = rank === 1 ? "h-32" : rank === 2 ? "h-24" : "h-20";

  return (
    <Link
      href={entry.username ? `/u/${entry.username}` : "#"}
      className="group flex flex-col items-center"
    >
      <div className="relative mb-2">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rankStyle.gradient} flex items-center justify-center text-base font-bold shadow-xl`}
          style={{ boxShadow: `0 12px 32px ${rankStyle.color}40` }}
        >
          {(entry.username || "?").slice(0, 2).toUpperCase()}
        </div>
        <div
          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${podiumColors[rank]} flex items-center justify-center text-xs font-black text-white shadow-lg`}
        >
          {rank}
        </div>
      </div>
      <div className="text-xs font-semibold truncate max-w-full text-center mb-0.5">
        {entry.full_name || entry.username}
      </div>
      <div className="text-[10px] text-slate-500 mb-2">
        <span style={{ color: rankStyle.color }} className="font-bold">
          {userRank}-Rank
        </span>
        {" · Lv "}
        {entry.current_level}
      </div>
      <div
        className={`w-full ${height} rounded-t-xl flex flex-col items-center justify-center px-2 transition-transform group-hover:scale-[1.02] relative overflow-hidden border border-white/[0.08]`}
        style={{
          background: `linear-gradient(180deg, ${rankStyle.color}30, ${rankStyle.color}10)`,
        }}
      >
        <div className="text-base font-bold tabular-nums">{stat.value}</div>
        <div className="text-[9px] text-slate-400 uppercase tracking-wider">{stat.label}</div>
      </div>
    </Link>
  );
}
