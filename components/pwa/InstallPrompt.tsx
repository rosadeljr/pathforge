"use client";

/**
 * PWA Install Prompt — surfaces a friendly "Install the app" toast
 * after the user has signed in and engaged with at least one lesson.
 *
 * - Listens for the `beforeinstallprompt` event (Android Chrome, Edge, etc.)
 * - Suppressed for users who already installed (display-mode: standalone)
 * - Dismissals remembered in localStorage for 14 days
 * - iOS Safari shows a manual instruction (no programmatic prompt available)
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

const DISMISS_KEY = "pathforge-install-dismissed-at";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed → never prompt
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari only
      window.navigator?.standalone === true;
    if (standalone) return;

    // Recently dismissed → respect cooldown
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt) < DISMISS_TTL_MS) {
        return;
      }
    } catch {
      /* localStorage may be blocked — proceed anyway */
    }

    // Detect iOS — needs manual install instructions
    const ua = navigator.userAgent || "";
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for Android/Chrome/Edge install prompt event
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Delay slightly so it doesn't pop immediately on first paint
      setTimeout(() => setShow(true), 2500);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // On iOS, show after a small delay (no event)
    if (iOS) {
      const t = setTimeout(() => setShow(true), 4000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setShow(false);
      }
    } catch {
      /* user closed the prompt */
    } finally {
      setInstallEvent(null);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:max-w-sm z-[60]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/[0.16] via-purple-500/[0.08] to-[#0a0a0f]/95 backdrop-blur-xl p-4 shadow-2xl shadow-indigo-500/20">
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
              }}
            />
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
            <div className="relative pr-7">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Download size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-0.5">
                    Install PathForge
                  </div>
                  <div className="text-sm font-semibold mb-1.5">
                    {isIOS
                      ? "Add to your home screen"
                      : "Get the full app experience"}
                  </div>
                  {isIOS ? (
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      Tap{" "}
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] mx-0.5">
                        <Share size={9} />
                      </span>{" "}
                      then{" "}
                      <span className="font-semibold text-white">
                        Add to Home Screen
                      </span>{" "}
                      for fullscreen mode + offline lessons.
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      Install to skip the browser bar, get faster loads, and quick
                      shortcuts to lessons + tutor + careers.
                    </div>
                  )}
                  {!isIOS && installEvent && (
                    <button
                      onClick={install}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Download size={11} />
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
