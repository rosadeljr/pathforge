"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard,
  Swords,
  Compass,
  Trophy,
  Bot,
  Crown,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface Profile {
  username: string | null;
  current_level: number;
  current_xp: number;
  total_xp: number;
  streak_count: number;
  is_admin?: boolean;
}

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", description: "Your command center" },
  { icon: Swords, label: "Quests", href: "/quests", description: "Daily missions" },
  { icon: Compass, label: "Roadmap", href: "/roadmap", description: "Your career path" },
  { icon: Bot, label: "AI Mentor", href: "/mentor", description: "Talk to your mentor" },
  { icon: Trophy, label: "Portfolio", href: "/portfolio", description: "Show your work" },
  { icon: Sparkles, label: "Achievements", href: "/achievements", description: "Your trophies" },
  { icon: Crown, label: "Leaderboard", href: "/leaderboard", description: "Top forgers" },
  { icon: SettingsIcon, label: "Settings", href: "/settings", description: "Preferences" },
];

// Mobile bottom nav shows the 5 most-used routes
const mobileNavLinks = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: Swords, label: "Quests", href: "/quests" },
  { icon: Bot, label: "Mentor", href: "/mentor" },
  { icon: Trophy, label: "Portfolio", href: "/portfolio" },
  { icon: SettingsIcon, label: "Settings", href: "/settings" },
];

// Onboarding doesn't show the sidebar
const FULLSCREEN_ROUTES = ["/onboarding"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<Profile | null>(null);

  // createClient() is now a singleton — same instance across renders
  const supabase = createClient();
  const { theme, toggle: toggleTheme } = useTheme();

  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    let mounted = true;

    // Initial session check
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
        .select("username, current_level, current_xp, total_xp, streak_count, is_admin")
        .eq("id", userId)
        .maybeSingle();

      if (existing) {
        if (mounted) setProfile(existing as Profile);
        return;
      }

      // Self-heal: create profile if missing
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
        })
        .select("username, current_level, current_xp, total_xp, streak_count, is_admin")
        .single();
      if (mounted && created) setProfile(created as Profile);
    });

    // Subscribe to auth changes (handles login/logout/token refresh reliably)
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

  // Redirect to login only AFTER we know the user is unauthenticated
  // (not during the initial loading state)
  useEffect(() => {
    if (authState === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const authenticated = authState === "authenticated";

  // Show shimmer during initial auth check
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    );
  }

  // Show redirect-in-progress state instead of flashing unauthenticated content
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

  // Fullscreen routes (like onboarding) skip the sidebar
  if (isFullscreen) {
    return <>{children}</>;
  }

  const level = profile?.current_level ?? 1;
  const xp = profile?.current_xp ?? 0;
  const xpForNextLevel = level * 1000; // simple formula
  const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100);
  const username = profile?.username ?? "Hunter";
  const initials = username.slice(0, 2).toUpperCase();

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
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size={28} />
              <span className="font-semibold tracking-tight">PathForge</span>
            </Link>
            {/* Compact level pill */}
            <Link
              href="/dashboard"
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
          {/* Mobile XP progress bar */}
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
            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/[0.06]">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <Logo size={32} />
                <span className="text-base font-semibold tracking-tight">PathForge</span>
              </Link>
            </div>

            {/* User Level Card */}
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
                      Level {level}
                    </div>
                  </div>
                </div>

                {/* XP bar */}
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

            {/* Navigation */}
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

            {/* Footer */}
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
              {/* Theme toggle */}
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

        {/* Main content */}
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
                  // 44px minimum touch target via py-2.5 + flex content height
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
