"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  UserPlus,
  Check,
  X,
  Users,
  Loader2,
  Trash2,
  Sparkles,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageShimmer } from "@/components/ui/Shimmer";

interface ProfileLite {
  id: string;
  username: string | null;
  full_name: string | null;
  current_level: number | null;
  total_xp: number | null;
  streak_count: number | null;
  user_mode: "career" | "learner" | null;
}

interface Friendship {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  requester: ProfileLite | null;
  recipient: ProfileLite | null;
}

export default function FriendsPage() {
  const supabase = createClient();
  const [me, setMe] = useState<{ id: string; mode: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProfileLite[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  // ============ Initial load ============
  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        const [{ data: prof }, { data: rows }] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_mode")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("friendships")
            .select(
              `id, requester_id, recipient_id, status, created_at,
               requester:profiles!friendships_requester_id_fkey(id, username, full_name, current_level, total_xp, streak_count, user_mode),
               recipient:profiles!friendships_recipient_id_fkey(id, username, full_name, current_level, total_xp, streak_count, user_mode)`
            )
            .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
            .order("created_at", { ascending: false }),
        ]);

        setMe({ id: userId, mode: prof?.user_mode ?? null });
        setFriendships((rows as unknown as Friendship[]) || []);
      } catch (e) {
        console.error("Friends load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  // ============ Search ============
  useEffect(() => {
    if (!me || !query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, username, full_name, current_level, total_xp, streak_count, user_mode")
          .ilike("username", `%${query.trim()}%`)
          .neq("id", me.id)
          // Only show same-mode users (kids can only friend kids etc.)
          .eq("user_mode", me.mode || "career")
          .limit(10);
        setResults((data as ProfileLite[]) || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, me, supabase]);

  // ============ Buckets ============
  const friends = useMemo(
    () => friendships.filter((f) => f.status === "accepted"),
    [friendships]
  );
  const pendingReceived = useMemo(
    () =>
      friendships.filter(
        (f) => f.status === "pending" && f.recipient_id === me?.id
      ),
    [friendships, me]
  );
  const pendingSent = useMemo(
    () =>
      friendships.filter(
        (f) => f.status === "pending" && f.requester_id === me?.id
      ),
    [friendships, me]
  );

  // Map ids the user already has *any* friendship with (any status) — for search UI.
  const existingIds = useMemo(() => {
    const s = new Set<string>();
    for (const f of friendships) {
      if (f.requester_id !== me?.id) s.add(f.requester_id);
      if (f.recipient_id !== me?.id) s.add(f.recipient_id);
    }
    return s;
  }, [friendships, me]);

  // ============ Actions ============
  async function sendRequest(targetId: string) {
    if (!me) return;
    setActionId(targetId);
    try {
      const { error } = await supabase.from("friendships").insert({
        requester_id: me.id,
        recipient_id: targetId,
      });
      if (error) throw error;
      toast.success("Friend request sent");
      // Refresh
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Couldn't send the request");
    } finally {
      setActionId(null);
    }
  }

  async function setStatus(friendshipId: string, status: "accepted" | "declined") {
    setActionId(friendshipId);
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", friendshipId);
      if (error) throw error;
      toast.success(status === "accepted" ? "Friend added" : "Request declined");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    } finally {
      setActionId(null);
    }
  }

  async function removeFriendship(friendshipId: string) {
    if (!window.confirm("Remove this friendship?")) return;
    setActionId(friendshipId);
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
      toast.success("Removed");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Couldn't remove");
    } finally {
      setActionId(null);
    }
  }

  async function refresh() {
    if (!me) return;
    const { data: rows } = await supabase
      .from("friendships")
      .select(
        `id, requester_id, recipient_id, status, created_at,
         requester:profiles!friendships_requester_id_fkey(id, username, full_name, current_level, total_xp, streak_count, user_mode),
         recipient:profiles!friendships_recipient_id_fkey(id, username, full_name, current_level, total_xp, streak_count, user_mode)`
      )
      .or(`requester_id.eq.${me.id},recipient_id.eq.${me.id}`)
      .order("created_at", { ascending: false });
    setFriendships((rows as unknown as Friendship[]) || []);
  }

  if (loading) return <PageShimmer />;

  const isLearner = me?.mode === "learner";

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
            <Users size={11} className="text-indigo-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Friends
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
            Find your study buddies
          </h1>
          <p className="text-sm text-slate-400">
            Add friends to compare progress and climb leaderboards together.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Search by username
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a friend's username…"
              className="w-full pl-10 pr-10 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50"
            />
            {searching && (
              <Loader2
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-500"
              />
            )}
          </div>

          {/* Search results */}
          <AnimatePresence>
            {query.trim().length >= 2 && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]"
              >
                {results.map((r) => {
                  const already = existingIds.has(r.id);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3"
                    >
                      <Avatar name={r.username || r.full_name || "?"} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {r.username || "user"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Level {r.current_level || 1} · {(r.total_xp || 0).toLocaleString()} XP
                        </div>
                      </div>
                      {already ? (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-400">
                          Connected
                        </span>
                      ) : (
                        <button
                          onClick={() => sendRequest(r.id)}
                          disabled={actionId === r.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        >
                          {actionId === r.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <UserPlus size={12} />
                          )}
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
            {query.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="text-xs text-slate-500 mt-3">
                No learners match "{query}".
              </p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pending received */}
        {pendingReceived.length > 0 && (
          <Section title={`Friend requests · ${pendingReceived.length}`}>
            {pendingReceived.map((f) => {
              const them = f.requester;
              if (!them) return null;
              return (
                <Row
                  key={f.id}
                  profile={them}
                  busy={actionId === f.id}
                  trailing={
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStatus(f.id, "accepted")}
                        disabled={actionId === f.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                      >
                        <Check size={11} strokeWidth={3} />
                        Accept
                      </button>
                      <button
                        onClick={() => setStatus(f.id, "declined")}
                        disabled={actionId === f.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-slate-300 text-xs font-medium hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
                      >
                        <X size={11} />
                        Decline
                      </button>
                    </div>
                  }
                />
              );
            })}
          </Section>
        )}

        {/* Pending sent */}
        {pendingSent.length > 0 && (
          <Section title={`Awaiting reply · ${pendingSent.length}`} subtle>
            {pendingSent.map((f) => {
              const them = f.recipient;
              if (!them) return null;
              return (
                <Row
                  key={f.id}
                  profile={them}
                  busy={actionId === f.id}
                  trailing={
                    <button
                      onClick={() => removeFriendship(f.id)}
                      disabled={actionId === f.id}
                      className="text-xs text-rose-300/80 hover:text-rose-300 inline-flex items-center gap-1"
                    >
                      <X size={11} />
                      Cancel
                    </button>
                  }
                />
              );
            })}
          </Section>
        )}

        {/* Friends */}
        <Section title={`Your friends · ${friends.length}`}>
          {friends.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-slate-400">
                No friends yet — find someone above and send a request.
              </p>
            </div>
          ) : (
            friends.map((f) => {
              const them = f.requester_id === me?.id ? f.recipient : f.requester;
              if (!them) return null;
              return (
                <Row
                  key={f.id}
                  profile={them}
                  busy={actionId === f.id}
                  showStats
                  trailing={
                    <button
                      onClick={() => removeFriendship(f.id)}
                      disabled={actionId === f.id}
                      aria-label="Remove friend"
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/[0.06] transition-colors"
                    >
                      {actionId === f.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  }
                />
              );
            })
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  subtle,
  children,
}: {
  title: string;
  subtle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          subtle ? "text-slate-500" : "text-slate-300"
        }`}
      >
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  profile,
  trailing,
  showStats,
  busy,
}: {
  profile: ProfileLite;
  trailing: React.ReactNode;
  showStats?: boolean;
  busy?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] ${busy ? "opacity-70" : ""}`}>
      <Avatar name={profile.username || profile.full_name || "?"} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">
          {profile.username || "user"}
        </div>
        <div className="text-[11px] text-slate-500 inline-flex items-center gap-2 flex-wrap">
          <span>Level {profile.current_level || 1}</span>
          {showStats && (
            <>
              <span className="inline-flex items-center gap-1">
                <Sparkles size={9} className="text-indigo-300" />
                {(profile.total_xp || 0).toLocaleString()} XP
              </span>
              {(profile.streak_count || 0) > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <Flame size={9} />
                  {profile.streak_count}d
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{trailing}</div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
      {initials}
    </div>
  );
}
