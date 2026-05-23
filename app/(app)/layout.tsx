"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/Logo";
import {
  Bot,
  Crown,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Home,
  Users,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ageTierForGrade } from "@/lib/data/learner";

interface Profile {
  username: string | null;
  current_level: number;
  current_xp: number;
  total_xp: number;
  streak_count: number;
  is_admin?: boolean;
  learner_grade?: number | null;
}

// One nav for everyone — this is a kids' learning app.
const navLinks = [
  { icon: Home, label: "Home", href: "/learn", description: "Today's learning" },
  { icon: Bot, label: "Tutor", href: "/mentor", description: "Ask the tutor anything" },
  { icon: Users, label: "Friends", href: "/friends", description: "Your study crew" },
  { icon: Sparkles, label: "Achievements", href: "/achievements", description: "Badges you've earned" },
  { icon: Crown, label: "Leaderboard", href: "/leaderboard", description: "Top learners" },
  { icon: SettingsIcon, label: "Settings", href: "/settings", description: "Preferences" },
];

const mobileNavLinks = [
  { icon: Home, label: "Home", href: "/learn" },
  { icon: Bot, label: "Tutor", href: "/mentor" },
  { icon: Users, label: "Friends", href: "/friends" },
  { icon: Sparkles, label: "Badges", href: "/achievements" },
  { icon: Crown, label: "Ranks", href: "/leaderboard" },
];

// Setup flow is the only fullscreen route now (no sidebar).
const FULLSCREEN_ROUTES = ["/learn/setup"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<Profile | null>(null);

  const supabase = createClient();
  const { theme, toggle: toggleTheme } = useTheme();

  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session?.user) {
        setAuthState("unauthenticated");
        return;
      }

      setAuthState("authenticated");
      const userId = session.user.id;

      // Try to load profile (use maybeSingle so 0 rows doesn't throw)
      const { data: existing } = await supabase
        .from("profiles")
        .select(
          "username, current_level, current_xp, total_xp, streak_count, is_admin, learner_grade, user_mode"
        )
        .eq("id", userId)
        .maybeSingle();

      if (existing) {
        // Migrate any leftover non-learner accounts on the fly — single-track app now.
        if ((existing as any).user_mode !== "learner") {
          await supabase
            .from("profiles")
            .update({ user_mode: "learner" })
            .eq("id", userId);
        }
        if (mounted) setProfile(existing as Profile);
        return;
      }

      // Self-heal: create profile if missing — defaults to learner mode.
      const meta = session.user.user_metadata as any;
      const fallbackUsername =
        meta?.username ||
        session.user.email?.split("@")[0] ||
        `user_${userId.slice(0, 8)}`;
      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: session.user.email,
          username: fallbackUsername,
          full_name: meta?.full_name || null,
          user_mode: "learner",
        })
        .select(
          "username, current_level, current_xp, total_xp, streak_count, is_admin, learner_grade"
        )
        .single();
      if (mounted && created) setProfile(created as Profile);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setAuthState("authenticated");
      } else if (event === "SIGNED_OUT") {
        setAuthState("unauthenticated");
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (authState === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState, router]);

  // Apply kid-friendly visual theme via [data-mode="learner"] + [data-age-tier].
  useEffect(() => {
    if (typeof document === "undefined") return;
    const tier = ageTierForGrade(profile?.learner_grade);
    document.documentElement.setAttribute("data-mode", "learner");
    document.documentElement.setAttribute("data-age-tier", tier);
    // Little/Junior get forced light theme; teens can keep their pick.
    if (tier !== "teen") {
      document.documentElement.setAttribute("data-theme", "light");
    }
    return () => {
      document.documentElement.removeAttribute("data-mode");
      document.documentElement.removeAttribute("data-age-tier");
    };
  }, [profile?.learner_grade]);

  // Route new learners (or any leftover users without a grade) to setup.
  useEffect(() => {
    if (authState !== "authenticated" || !profile || !pathname) return;
    const onFullscreen = FULLSCREEN_ROUTES.some((r) => pathname.startsWith(r));
    if (profile.learner_grade == null && !onFullscreen) {
      router.replace("/learn/setup");
    }
  }, [authState, profile, pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const authenticated = authState === "authenticated";

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    return <>{children}</>;
  }

  const level = profile?.current_level ?? 1;
  const xp = profile?.current_xp ?? 0;
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100);
  const username = profile?.username ?? "Friend";
  const initials = username.slice(0, 2).toUpperCase();
  const tier = ageTierForGrade(profile?.learner_grade);
  const isLittle = tier === "little";
  const isTeen = tier === "teen";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)" }}
        />
      </div>

      {/* Mobile top bar */}
      {authenticated && (
        <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="px-4 h-14 flex items-center justify-between">
            <Link href="/learn" className="flex items-center gap-2">
              <Logo size={28} />
              <span className="font-semibold tracking-tight">PathForge</span>
            </Link>
            <Link
              href="/learn"
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]"
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                {level}
              </div>
              <span className="text-[10px] text-slate-300 tabular-nums">
                {xp.toLocaleString()} XP
              </span>
            </Link>
          </div>
          <div className="h-0.5 bg-white/[0.04]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 flex">
        {/* Desktop Sidebar */}
        {authenticated && (
          <aside className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-30 border-r border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="px-6 py-6 border-b border-white/[0.06]">
              <Link href="/learn" className="flex items-center gap-2.5 group">
                <Logo size={32} />
                <span className="text-base font-semibold tracking-tight">PathForge</span>
              </Link>
            </div>

            <div className="px-4 pt-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-amber-500 border-2 border-[#0a0a0f] flex items-center justify-center text-[9px] font-bold text-slate-900">
                      {level}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{username}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {isLittle ? "Little Forger" : isTeen ? "Teen Forger" : "Junior Forger"} · Lv {level}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">XP</span>
                    <span className="text-slate-300 font-medium tabular-nums">
                      {xp.toLocaleString()} / {xpForNextLevel.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    />
                  </div>
                  {profile?.streak_count ? (
                    <div className="flex items-center gap-1 text-[10px] text-amber-300 pt-1">
                      <Sparkles size={10} />
                      <span>{profile.streak_count}-day streak</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Menu
              </div>
              {navLinks.map(({ icon: Icon, label, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"
                      />
                    )}
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/[0.06] space-y-0.5">
              {profile?.is_admin && (
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-300 hover:bg-rose-500/[0.06] hover:text-rose-200 transition-all"
                >
                  <Sparkles size={17} strokeWidth={2} />
                  <span className="font-medium">Admin</span>
                  <span className="ml-auto text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    STAFF
                  </span>
                </Link>
              )}
              {/* Theme toggle — only for teens; little/junior tiers stay light. */}
              {isTeen && (
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white transition-all"
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? (
                    <Sun size={17} strokeWidth={2} />
                  ) : (
                    <Moon size={17} strokeWidth={2} />
                  )}
                  <span className="font-medium">
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white transition-all"
              >
                <LogOut size={17} strokeWidth={2} />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </aside>
        )}

        <main className={`flex-1 ${authenticated ? "md:ml-64 lg:ml-72" : ""} min-w-0 pb-20 md:pb-0`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {authenticated && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-stretch justify-around h-16 px-1">
            {mobileNavLinks.map(({ icon: Icon, label, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] group active:bg-white/[0.04] transition-colors rounded-lg"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300 transition-colors"}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300 transition-colors"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
