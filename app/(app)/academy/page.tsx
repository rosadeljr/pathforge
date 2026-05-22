"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  GraduationCap,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Trophy,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  issueCertificateIfEligible,
  linkedInAddUrl,
  type Certificate,
  type CertificateProgress,
} from "@/lib/certificates";
import { getEntitlements } from "@/lib/entitlements";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { PageShimmer } from "@/components/ui/Shimmer";

export default function AcademyPage() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [progress, setProgress] = useState<CertificateProgress | null>(null);
  const [tier, setTier] = useState<string>("free");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", userId)
          .single();
        if (profile?.subscription_tier) setTier(profile.subscription_tier);

        // Issue the certificate if the user just became eligible.
        const result = await issueCertificateIfEligible(supabase, userId);
        setProgress(result.progress);
        if (result.justIssued) {
          toast.success("Certificate earned! 🎓", { duration: 6000 });
        }

        const { data: certs } = await supabase
          .from("certificates")
          .select("*")
          .eq("user_id", userId)
          .order("issued_at", { ascending: false });
        setCertificates((certs as Certificate[]) || []);
      } catch (e) {
        console.error("Academy load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <PageShimmer />;

  const canDownload = getEntitlements(tier).canDownloadCertificate;
  const earnedPathIds = new Set(certificates.map((c) => c.career_path_id));
  const showProgress =
    progress &&
    progress.pathTitle &&
    progress.completed < progress.threshold &&
    // Don't show in-progress for a path already certified.
    !certificates.some((c) => c.career_path_title === progress.pathTitle);

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
            <GraduationCap size={11} className="text-indigo-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              PathForge AI Academy
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Your certifications
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Complete a career program and earn a verifiable certificate — a real,
            shareable credential recruiters can confirm.
          </p>
        </motion.div>

        {/* Earned certificates */}
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 + i * 0.05 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
          >
            {/* Certificate preview image */}
            <Link href={`/verify/${cert.credential_id}`} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/verify/${cert.credential_id}/opengraph-image`}
                alt={`${cert.career_path_title} certificate`}
                className="w-full border-b border-white/[0.06]"
                width={1200}
                height={630}
              />
            </Link>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold mb-1">
                    <ShieldCheck size={13} />
                    Verified credential
                  </div>
                  <h3 className="text-base font-semibold">
                    {cert.career_path_title} Program
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Credential ID{" "}
                    <span className="font-mono text-slate-400">{cert.credential_id}</span>{" "}
                    · Issued {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/verify/${cert.credential_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  <ExternalLink size={12} />
                  Verification page
                </Link>
              </div>

              {canDownload ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`/verify/${cert.credential_id}/opengraph-image`}
                    download={`PathForge-Certificate-${cert.credential_id}.png`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <a
                    href={linkedInAddUrl(
                      cert,
                      typeof window !== "undefined"
                        ? `${window.location.origin}/verify/${cert.credential_id}`
                        : `/verify/${cert.credential_id}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] text-sm font-medium text-slate-200 hover:bg-white/[0.04] transition-colors"
                  >
                    <Share2 size={14} />
                    Add to LinkedIn
                  </a>
                </div>
              ) : (
                <UpgradePrompt
                  title="Download & share your certificate"
                  description="You've earned this credential — it's yours. Upgrade to Pro to download the high-resolution certificate and add it to your LinkedIn profile in one click."
                  compact
                />
              )}
            </div>
          </motion.div>
        ))}

        {/* In-progress toward next certificate */}
        {showProgress && progress && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-indigo-300" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  In progress
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {progress.pathTitle} Certificate
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Complete{" "}
                <strong className="text-slate-200">
                  {progress.threshold - progress.completed} more quest
                  {progress.threshold - progress.completed === 1 ? "" : "s"}
                </strong>{" "}
                to earn your verifiable PathForge AI Academy certificate.
              </p>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Quests completed</span>
                <span className="text-slate-300 tabular-nums">
                  {progress.completed}/{progress.threshold}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (progress.completed / progress.threshold) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
              <Link
                href="/quests"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Continue questing
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Empty state — no path / no progress yet */}
        {certificates.length === 0 && !showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 mb-4">
              <GraduationCap size={22} className="text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No certificates yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-5">
              Pick a career path and complete quests. Finish a program and your
              PathForge AI Academy certificate is generated automatically.
            </p>
            <Link
              href="/quests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Start questing
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Resume nudge — turn the journey into a resume */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.1] via-indigo-500/[0.04] to-transparent p-6"
        >
          <div
            className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-25 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)" }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold mb-1">
                Turn your progress into a resume
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your skills, projects, and certificate — built into a recruiter-ready
                resume in minutes, polished by ForgeBot.
              </p>
            </div>
            <Link
              href="/resume"
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
            >
              Build my resume
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Trophy size={14} className="text-amber-300" />
            How PathForge certification works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Complete your program",
                body: "Finish 12 quests in your career path — real work, with proof reviewed by ForgeBot.",
              },
              {
                step: "2",
                title: "Earn the credential",
                body: "Your certificate is issued automatically with a unique, verifiable credential ID.",
              },
              {
                step: "3",
                title: "Share it everywhere",
                body: "Recruiters verify it on a public page. Add it to LinkedIn in one click.",
              },
            ].map((s) => (
              <div key={s.step}>
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-indigo-300 mb-2">
                  {s.step}
                </div>
                <div className="text-sm font-medium mb-1">{s.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
