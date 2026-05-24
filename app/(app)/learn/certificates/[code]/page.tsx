"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Sparkles, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { getCareer } from "@/lib/data/careers";
import type { CareerCertificate } from "@/lib/certificates";
import { Logo } from "@/components/brand/Logo";
import { PageShimmer } from "@/components/ui/Shimmer";

export default function CertificateDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const code = (params?.code as string) || "";
  const [cert, setCert] = useState<CareerCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("career_certificates")
          .select("*")
          .eq("credential_code", code)
          .maybeSingle();
        setCert((data as CareerCertificate) || null);
      } catch (e) {
        console.error("Cert load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code, supabase]);

  if (loading) return <PageShimmer />;
  if (!cert) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Certificate not found</h1>
        <p className="text-sm text-slate-400 mb-5">
          The code{" "}
          <span className="font-mono text-slate-300">{code}</span> didn't match
          any certificate.
        </p>
        <Link
          href="/learn/certificates"
          className="text-sm text-indigo-300 hover:text-indigo-200"
        >
          ← All certificates
        </Link>
      </div>
    );
  }

  const career = getCareer(cert.career_id);

  async function shareCert() {
    const url = `${window.location.origin}/learn/certificates/${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cert!.recipient_name} mastered ${cert!.career_title} on PathForge`,
          url,
        });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        <Link
          href="/learn/certificates"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          All certificates
        </Link>

        {/* THE CERTIFICATE — design is the focus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="relative overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-500/[0.12] via-orange-500/[0.06] to-transparent p-8 sm:p-12"
          style={{
            boxShadow: "0 24px 60px rgba(245,158,11,0.18)",
          }}
        >
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-2xl pointer-events-none" />

          {/* Glow background */}
          <motion.div
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(245,158,11,0.4), transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative text-center">
            {/* Brand header */}
            <div className="inline-flex items-center gap-2 mb-6">
              <Logo size={24} />
              <span className="text-sm font-semibold tracking-tight">
                PathForge
              </span>
            </div>

            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold mb-4">
              ✦ Certificate of Career Mastery ✦
            </div>

            <p className="text-xs text-slate-400 mb-2">
              This certifies that
            </p>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300 bg-clip-text text-transparent">
              {cert.recipient_name}
            </h1>

            <p className="text-sm text-slate-300 mb-5 max-w-md mx-auto leading-relaxed">
              has reached the highest stage of the
            </p>

            {/* Career badge */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex flex-col items-center gap-3 mb-6"
            >
              <div
                className={`w-20 h-20 rounded-3xl ${
                  career
                    ? `bg-gradient-to-br ${career.gradient}`
                    : "bg-gradient-to-br from-amber-400 to-orange-500"
                } flex items-center justify-center text-4xl shadow-2xl`}
                style={{
                  boxShadow: career
                    ? `0 12px 40px ${career.accentColor}50`
                    : "0 12px 40px rgba(245,158,11,0.5)",
                }}
              >
                {career?.emoji || "🏆"}
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {cert.career_title}
              </div>
            </motion.div>

            <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
              adventure on PathForge — fully mastering its 5-stage learning
              journey with{" "}
              <span className="text-amber-200 font-semibold">
                {cert.total_xp_at_award.toLocaleString()} XP
              </span>{" "}
              earned.
            </p>

            {/* Date + credential */}
            <div className="inline-flex items-center justify-center gap-6 text-[11px] text-slate-400 mb-6 flex-wrap">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">
                  Awarded
                </div>
                <div className="text-slate-200 font-medium">
                  {new Date(cert.awarded_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">
                  Credential ID
                </div>
                <div className="font-mono text-amber-200 text-xs">
                  {cert.credential_code}
                </div>
              </div>
            </div>

            {/* Footer signature */}
            <div className="pt-5 border-t border-white/[0.06] text-[10px] text-slate-500">
              Issued by{" "}
              <span className="text-slate-300">PathForge</span> ·{" "}
              <span className="text-slate-400">ZenForge Technologies 🇵🇭</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <button
            onClick={shareCert}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Share2 size={14} />
            Share certificate
          </button>
          {career && (
            <Link
              href={`/learn/careers/${career.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm font-medium text-slate-200 hover:bg-white/[0.04] transition-colors"
            >
              <Sparkles size={14} />
              See career
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
