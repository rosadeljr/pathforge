"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import {
  Users,
  TrendingUp,
  Activity,
  Trophy,
  Zap,
  DollarSign,
  Target,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface Overview {
  total_users: number;
  signups_today: number;
  signups_week: number;
  signups_month: number;
  users_onboarded: number;
  users_completed_quest: number;
  total_quests_completed: number;
  total_projects: number;
  dau: number;
  wau: number;
  mau: number;
  pro_users: number;
  elite_users: number;
  free_users: number;
}

interface PathPopularity {
  career_path_id: string;
  count: number;
}

interface EventCount {
  event_type: string;
  count: number;
}

export default function AdminOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pathPopularity, setPathPopularity] = useState<PathPopularity[]>([]);
  const [recentEvents, setRecentEvents] = useState<EventCount[]>([]);
  const [signupTrend, setSignupTrend] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, profilesRes, eventsRes, recentSignupsRes] = await Promise.all([
          supabase.from("admin_overview").select("*").maybeSingle(),
          supabase.from("profiles").select("selected_career_path_id"),
          supabase
            .from("analytics_events")
            .select("event_type")
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from("profiles")
            .select("created_at")
            .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
            .order("created_at", { ascending: true }),
        ]);

        if (overviewRes.data) setOverview(overviewRes.data as Overview);

        // Aggregate career path popularity client-side
        if (profilesRes.data) {
          const counts = new Map<string, number>();
          for (const p of profilesRes.data as any[]) {
            if (p.selected_career_path_id) {
              counts.set(p.selected_career_path_id, (counts.get(p.selected_career_path_id) || 0) + 1);
            }
          }
          const sorted = Array.from(counts.entries())
            .map(([career_path_id, count]) => ({ career_path_id, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
          setPathPopularity(sorted);
        }

        // Aggregate event counts
        if (eventsRes.data) {
          const counts = new Map<string, number>();
          for (const e of eventsRes.data as any[]) {
            counts.set(e.event_type, (counts.get(e.event_type) || 0) + 1);
          }
          const sorted = Array.from(counts.entries())
            .map(([event_type, count]) => ({ event_type, count }))
            .sort((a, b) => b.count - a.count);
          setRecentEvents(sorted);
        }

        // Build 14-day signup trend
        if (recentSignupsRes.data) {
          const days = new Map<string, number>();
          for (let i = 13; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            days.set(key, 0);
          }
          for (const p of recentSignupsRes.data as any[]) {
            const key = p.created_at.slice(0, 10);
            if (days.has(key)) days.set(key, (days.get(key) || 0) + 1);
          }
          setSignupTrend(Array.from(days.entries()).map(([date, count]) => ({ date, count })));
        }
      } catch (e) {
        console.error("Admin load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading || !overview) {
    return <OverviewSkeleton />;
  }

  // Funnel %
  const pctOnboarded =
    overview.total_users > 0 ? Math.round((overview.users_onboarded / overview.total_users) * 100) : 0;
  const pctActivated =
    overview.total_users > 0
      ? Math.round((overview.users_completed_quest / overview.total_users) * 100)
      : 0;
  const paidUsers = overview.pro_users + overview.elite_users;
  const pctPaid =
    overview.total_users > 0 ? Math.round((paidUsers / overview.total_users) * 100) : 0;

  const maxSignup = Math.max(...signupTrend.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight mb-1">Overview</h1>
        <p className="text-sm text-slate-400">Real-time metrics across PathForge.</p>
      </motion.div>

      {/* Top stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total users" value={overview.total_users.toLocaleString()} icon={Users} accent="#6366f1" sub={`+${overview.signups_today} today`} />
        <StatCard label="DAU" value={overview.dau.toLocaleString()} icon={Activity} accent="#10b981" sub={`MAU ${overview.mau}`} />
        <StatCard label="Quests done" value={overview.total_quests_completed.toLocaleString()} icon={Trophy} accent="#f59e0b" />
        <StatCard
          label="Paid users"
          value={paidUsers.toLocaleString()}
          icon={DollarSign}
          accent="#ec4899"
          sub={`${pctPaid}% conversion`}
        />
      </div>

      {/* Funnel */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Target size={14} className="text-slate-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Activation funnel
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <FunnelStep
            label="Signed up"
            value={overview.total_users}
            pct={100}
            color="#6366f1"
            isFirst
          />
          <FunnelStep
            label="Completed onboarding"
            value={overview.users_onboarded}
            pct={pctOnboarded}
            color="#a855f7"
          />
          <FunnelStep
            label="Completed first quest"
            value={overview.users_completed_quest}
            pct={pctActivated}
            color="#ec4899"
          />
          <FunnelStep
            label="Active in last 7 days"
            value={overview.wau}
            pct={overview.total_users > 0 ? Math.round((overview.wau / overview.total_users) * 100) : 0}
            color="#f59e0b"
          />
          <FunnelStep
            label="Paid"
            value={paidUsers}
            pct={pctPaid}
            color="#10b981"
            isLast
          />
        </div>
      </motion.section>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Signup trend (14d) */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <TrendingUp size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Signups · last 14 days
            </h2>
            <span className="ml-auto text-xs text-slate-400 tabular-nums">
              {overview.signups_week} this week
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-1 h-32">
              {signupTrend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-purple-500 transition-all group-hover:from-indigo-400 group-hover:to-purple-400"
                    style={{
                      height: `${(d.count / maxSignup) * 100}%`,
                      minHeight: d.count > 0 ? "4px" : "0",
                    }}
                    title={`${d.date}: ${d.count}`}
                  />
                  <span className="text-[8px] text-slate-500 mt-1 tabular-nums">
                    {new Date(d.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Subscription distribution */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Sparkles size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Subscription distribution
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <SubBar label="Free" count={overview.free_users} total={overview.total_users} color="#94a3b8" />
            <SubBar label="Pro" count={overview.pro_users} total={overview.total_users} color="#a855f7" />
            <SubBar label="Elite" count={overview.elite_users} total={overview.total_users} color="#f59e0b" />
          </div>
        </motion.section>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Career path popularity */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Trophy size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Top career paths
            </h2>
          </div>
          <div className="p-5 space-y-2">
            {pathPopularity.length === 0 ? (
              <p className="text-xs text-slate-500">No data yet.</p>
            ) : (
              pathPopularity.map((p) => {
                const path = CAREER_PATHS.find((cp) => cp.id === p.career_path_id);
                if (!path) return null;
                const pct =
                  overview.users_onboarded > 0 ? (p.count / overview.users_onboarded) * 100 : 0;
                return (
                  <div key={p.career_path_id} className="flex items-center gap-3">
                    <span className="text-xl">{path.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{path.title}</span>
                        <span className="text-xs text-slate-400 tabular-nums">{p.count}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${path.gradient}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.section>

        {/* Recent events */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.17 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Zap size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Events · last 7 days
            </h2>
          </div>
          <div className="p-5 space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-xs text-slate-500">No events recorded yet.</p>
            ) : (
              recentEvents.map((e) => (
                <div key={e.event_type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 capitalize">
                    {e.event_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-slate-400 font-medium tabular-nums">{e.count}</span>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>

      {/* CTA */}
      <Link
        href="/admin/users"
        className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
      >
        <div>
          <h3 className="text-base font-semibold mb-0.5">Manage users</h3>
          <p className="text-xs text-slate-400">Grant Pro/Elite, view individual stats, ban accounts</p>
        </div>
        <ArrowUpRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  icon: any;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            {label}
          </span>
          <Icon size={12} style={{ color: accent }} />
        </div>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  pct,
  color,
  isFirst,
  isLast,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-xs text-slate-400 tabular-nums">
          <span className="text-slate-200 font-semibold">{value.toLocaleString()}</span>
          <span className="ml-2">{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function SubBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="text-slate-400 tabular-nums">
          {count.toLocaleString()} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div className="h-full" style={{ background: color, width: `${pct}%` }} />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-32 bg-white/[0.04] rounded" />
        <div className="h-4 w-64 bg-white/[0.04] rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.06] rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-white/[0.02] border border-white/[0.06] rounded-2xl" />
    </div>
  );
}
