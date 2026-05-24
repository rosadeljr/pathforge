"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  ChevronRight,
  X,
  Sparkles,
  Crown,
  Zap,
  Trophy,
  Flame,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { CAREER_PATHS } from "@/lib/data/career-paths";

interface AdminUser {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  selected_career_path_id: string | null;
  subscription_tier: string | null;
  is_admin: boolean;
  career_path_changes_count: number;
  created_at: string;
  last_quest_completed_at: string | null;
}

type TierFilter = "all" | "free" | "pro" | "family";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data || []) as AdminUser[]);
    } catch (e: any) {
      console.error("Load users error:", e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    let result = users;
    if (tierFilter !== "all") {
      result = result.filter((u) => (u.subscription_tier || "free") === tierFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.full_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, search, tierFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-1">Users</h1>
        <p className="text-sm text-slate-400">
          {users.length} total · {filteredUsers.length} shown
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, username, or name..."
            className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "free", "pro", "family"] as TierFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                tierFilter === t
                  ? "bg-white text-slate-900"
                  : "bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <UserListSkeleton />
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
          <p className="text-sm text-slate-400">No users match those filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            <div>User</div>
            <div className="text-right hidden sm:block">Level</div>
            <div className="text-right hidden md:block">Streak</div>
            <div className="text-right hidden lg:block">Tier</div>
            <div />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {filteredUsers.map((u, i) => {
              const career = u.selected_career_path_id
                ? CAREER_PATHS.find((cp) => cp.id === u.selected_career_path_id)
                : null;
              const tier = u.subscription_tier || "free";
              return (
                <motion.button
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setSelected(u)}
                  className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 items-center hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(u.username || u.email || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        {u.full_name || u.username || "—"}
                        {u.is_admin && (
                          <span className="text-[9px] font-bold tracking-wider px-1 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                        {career && <span>{career.emoji}</span>}
                        <span className="truncate">{u.email || u.username}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block text-sm tabular-nums">
                    {u.current_level}
                  </div>
                  <div className="text-right hidden md:block text-sm tabular-nums text-amber-300">
                    {u.streak_count}d
                  </div>
                  <div className="text-right hidden lg:block">
                    <TierBadge tier={tier} />
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const meta: Record<string, { label: string; color: string; bg: string }> = {
    free: { label: "Free", color: "#94a3b8", bg: "bg-white/[0.04] border-white/[0.08]" },
    pro: { label: "Pro", color: "#a855f7", bg: "bg-violet-500/15 border-violet-500/30 text-violet-300" },
    family: { label: "Family", color: "#f59e0b", bg: "bg-amber-500/15 border-amber-500/30 text-amber-300" },
  };
  const m = meta[tier] || meta.free;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${m.bg}`}
    >
      {m.label}
    </span>
  );
}

function UserDetailModal({
  user,
  onClose,
  onUpdate,
}: {
  user: AdminUser;
  onClose: () => void;
  onUpdate: (u: AdminUser) => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const supabase = createClient();
  const career = user.selected_career_path_id
    ? CAREER_PATHS.find((cp) => cp.id === user.selected_career_path_id)
    : null;
  const currentTier = user.subscription_tier || "free";

  async function setTier(tier: "free" | "pro" | "family") {
    if (currentTier === tier) return;
    setSaving(tier);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ subscription_tier: tier })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      toast.success(`Set to ${tier.toUpperCase()}`);
      onUpdate(data as AdminUser);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(null);
    }
  }

  async function toggleAdmin() {
    setSaving("admin");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_admin: !user.is_admin })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      toast.success(user.is_admin ? "Admin removed" : "Admin granted");
      onUpdate(data as AdminUser);
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(null);
    }
  }

  async function resetChanges() {
    setSaving("changes");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ career_path_changes_count: 0 })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Career change counter reset");
      onUpdate(data as AdminUser);
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#0a0a0f] border border-white/[0.08] sm:rounded-2xl shadow-2xl my-auto overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold flex-shrink-0">
              {(user.username || user.email || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight truncate flex items-center gap-2">
                {user.full_name || user.username || "Unnamed"}
                {user.is_admin && (
                  <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    ADMIN
                  </span>
                )}
              </h2>
              <div className="text-xs text-slate-400 truncate">{user.email || user.username}</div>
              {user.username && (
                <Link
                  href={`/u/${user.username}`}
                  target="_blank"
                  className="text-[10px] text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 mt-1"
                >
                  /u/{user.username}
                  <ExternalLink size={9} />
                </Link>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-5 border-b border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Level" value={user.current_level.toString()} icon={Zap} accent="#6366f1" />
          <Stat label="Total XP" value={user.total_xp.toLocaleString()} icon={Trophy} accent="#a855f7" />
          <Stat label="Streak" value={`${user.streak_count}d`} icon={Flame} accent="#f59e0b" />
          <Stat label="Best streak" value={`${user.longest_streak}d`} icon={Sparkles} accent="#ec4899" />
        </div>

        {/* Career & dates */}
        <div className="px-6 py-5 border-b border-white/[0.06] space-y-3">
          <Row label="Career path">
            {career ? (
              <div className="inline-flex items-center gap-2 text-sm">
                <span>{career.emoji}</span>
                {career.title}
              </div>
            ) : (
              <span className="text-sm text-slate-500">Not selected</span>
            )}
          </Row>
          <Row label="Path changes used">
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.career_path_changes_count}/3</span>
              {user.career_path_changes_count > 0 && (
                <button
                  onClick={resetChanges}
                  disabled={saving === "changes"}
                  className="text-[10px] text-indigo-300 hover:text-indigo-200 underline disabled:opacity-50"
                >
                  reset
                </button>
              )}
            </div>
          </Row>
          <Row label="Created">
            <span className="text-sm">
              {new Date(user.created_at).toLocaleString()}
            </span>
          </Row>
          <Row label="Last active">
            <span className="text-sm">
              {user.last_quest_completed_at
                ? new Date(user.last_quest_completed_at).toLocaleString()
                : "Never"}
            </span>
          </Row>
        </div>

        {/* Subscription Control */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Subscription tier
          </div>
          <div className="grid grid-cols-3 gap-2">
            <TierButton
              tier="free"
              currentTier={currentTier}
              saving={saving}
              onClick={() => setTier("free")}
              icon={Zap}
              color="#94a3b8"
            />
            <TierButton
              tier="pro"
              currentTier={currentTier}
              saving={saving}
              onClick={() => setTier("pro")}
              icon={Sparkles}
              color="#a855f7"
            />
            <TierButton
              tier="family"
              currentTier={currentTier}
              saving={saving}
              onClick={() => setTier("family")}
              icon={Crown}
              color="#f59e0b"
            />
          </div>
        </div>

        {/* Admin Control */}
        <div className="px-6 py-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold mb-0.5">Admin privileges</div>
            <div className="text-xs text-slate-400">
              {user.is_admin ? "Has access to /admin" : "Standard user"}
            </div>
          </div>
          <button
            onClick={toggleAdmin}
            disabled={saving === "admin"}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              user.is_admin
                ? "border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                : "bg-white text-slate-900 hover:bg-slate-100"
            }`}
          >
            {saving === "admin" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : user.is_admin ? (
              "Revoke admin"
            ) : (
              "Make admin"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color: accent }} />
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </span>
      </div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function TierButton({
  tier,
  currentTier,
  saving,
  onClick,
  icon: Icon,
  color,
}: {
  tier: "free" | "pro" | "family";
  currentTier: string;
  saving: string | null;
  onClick: () => void;
  icon: any;
  color: string;
}) {
  const isActive = currentTier === tier;
  const isSaving = saving === tier;
  return (
    <button
      onClick={onClick}
      disabled={isSaving || isActive}
      className={`relative p-3 rounded-xl border transition-all text-center ${
        isActive
          ? "border-white/30 bg-white/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
      } disabled:cursor-not-allowed`}
    >
      {isSaving ? (
        <Loader2 size={14} className="animate-spin text-white mx-auto" />
      ) : (
        <Icon size={14} className="mx-auto mb-1" style={{ color }} />
      )}
      <div className="text-xs font-semibold capitalize">{tier}</div>
      {isActive && (
        <div className="text-[9px] text-emerald-300 mt-0.5">Current</div>
      )}
    </button>
  );
}

function UserListSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-white/[0.04] rounded animate-pulse" />
          </div>
          <div className="h-6 w-12 bg-white/[0.04] rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
