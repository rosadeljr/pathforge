"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Swords,
  Compass,
  Trophy,
  Bot,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface Profile {
  username: string | null;
  current_level: number;
  current_xp: number;
  total_xp: number;
  streak_count: number;
}

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", description: "Your command center" },
  { icon: Swords, label: "Quests", href: "/quests", description: "Daily missions" },
  { icon: Compass, label: "Roadmap", href: "/roadmap", description: "Your career path" },
  { icon: Bot, label: "AI Mentor", href: "/mentor", description: "Talk to your mentor" },
  { icon: Trophy, label: "Portfolio", href: "/portfolio", description: "Show your work" },
  { icon: SettingsIcon, label: "Settings", href: "/settings", description: "Preferences" },
];

// Onboarding doesn't show the sidebar
const FULLSCREEN_ROUTES = ["/onboarding"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Auth check error:", error.message);
          if (!pathname.includes("(marketing)") && !pathname.includes("(auth)")) {
            router.push("/login?error=session_expired");
          }
          return;
        }

        if (!user && !pathname.includes("(marketing)") && !pathname.includes("(auth)")) {
          router.push("/login");
          return;
        }

        setAuthenticated(!!user);

        // Fetch profile data for sidebar display
        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, current_level, current_xp, total_xp, streak_count")
            .eq("id", user.id)
            .single();
          if (profileData) setProfile(profileData);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        if (!pathname.includes("(marketing)") && !pathname.includes("(auth)")) {
          router.push("/login?error=auth_error");
        }
      }
    }
    checkAuth();
  }, [router, supabase, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-semibold tracking-tight">PathForge</span>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -mr-2 text-slate-300 hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
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
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
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
            <div className="px-3 py-4 border-t border-white/[0.06]">
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

        {/* Mobile Sidebar Drawer */}
        {authenticated && mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="md:hidden fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col"
          >
            {/* User card */}
            <div className="px-4 pt-16 pb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
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
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
              {navLinks.map(({ icon: Icon, label, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/[0.06]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/[0.03] hover:text-white"
              >
                <LogOut size={17} />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </motion.aside>
        )}

        {/* Backdrop for mobile drawer */}
        {authenticated && mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          />
        )}

        {/* Main content */}
        <main className={`flex-1 ${authenticated ? "md:ml-64 lg:ml-72" : ""} min-w-0`}>
          {children}
        </main>
      </div>
    </div>
  );
}
