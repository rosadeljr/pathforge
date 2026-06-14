"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Trophy, Award, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCareer } from "@/lib/data/careers";
import type { CareerCertificate } from "@/lib/certificates";
import { PageShimmer } from "@/components/ui/Shimmer";
import { BackToTop } from "@/components/ui/BackToTop";

export default function CertificatesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<CareerCertificate[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from("career_certificates")
          .select("*")
          .eq("user_id", session.user.id)
          .order("awarded_at", { ascending: false });
        setCertificates((data || []) as CareerCertificate[]);
      } catch (e) {
        console.error("Certificates load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <PageShimmer />;

  return (
    <div className="min-h-screen pb-12">
      <BackToTop />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        <Link
          href="/learn/careers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          Back to careers
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/[0.08] border border-amber-500/30 mb-3">
            <Trophy size={11} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-200 tracking-wide">
              Career Mastery
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
            Your certificates
          </h1>
          <p className="text-sm text-slate-400">
            Earn one for every career you fully master on PathForge.
          </p>
        </motion.div>

        {/* Empty state OR list */}
        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-12 text-center"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold mb-2">No certificates yet</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
              Pick a dream career and finish lessons to climb the 5-stage
              adventure. Reach the final stage and a certificate is yours.
            </p>
            <Link
              href="/learn/careers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              <Sparkles size={14} />
              Explore careers
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {certificates.map((cert, i) => {
              const career = getCareer(cert.career_id);
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/learn/certificates/${cert.credential_code}`}
                    className="group relative overflow-hidden block rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-500/[0.10] via-orange-500/[0.04] to-transparent p-5 hover:border-amber-400/60 transition-all"
                  >
                    <div
                      className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
                      style={{
                        background: career
                          ? `radial-gradient(circle, ${career.accentColor}80, transparent 70%)`
                          : "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)",
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <motion.div
                          animate={{ rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className={`w-14 h-14 rounded-2xl ${
                            career
                              ? `bg-gradient-to-br ${career.gradient}`
                              : "bg-gradient-to-br from-amber-400 to-orange-500"
                          } flex items-center justify-center text-2xl shadow-lg`}
                          style={{
                            boxShadow: career
                              ? `0 8px 24px ${career.accentColor}40`
                              : "0 8px 24px rgba(245,158,11,0.4)",
                          }}
                        >
                          {career?.emoji || "🏆"}
                        </motion.div>
                        <Award size={20} className="text-amber-300" />
                      </div>

                      <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">
                        Career Mastery
                      </div>
                      <h3 className="text-base font-semibold tracking-tight mb-2">
                        {cert.career_title}
                      </h3>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div>
                          Awarded to{" "}
                          <span className="text-white font-medium">
                            {cert.recipient_name}
                          </span>
                        </div>
                        <div>
                          on{" "}
                          {new Date(cert.awarded_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="font-mono text-amber-200/70 pt-1">
                          {cert.credential_code}
                        </div>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-300 group-hover:translate-x-0.5 transition-transform">
                        View certificate
                        <ArrowRight size={11} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
