import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, ShieldX, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/server";
import type { Certificate } from "@/lib/certificates";

async function getCertificate(code: string): Promise<Certificate | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("credential_id", code)
      .maybeSingle();
    return (data as Certificate) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const cert = await getCertificate(code);
  if (!cert) {
    return { title: "Certificate not found — PathForge AI Academy" };
  }
  return {
    title: `${cert.recipient_name} — ${cert.career_path_title} Certificate`,
    description: `${cert.recipient_name} completed the ${cert.career_path_title} program at PathForge AI Academy. Credential ${cert.credential_id} — verified.`,
  };
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cert = await getCertificate(code);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.3), transparent 70%)" }}
        />
      </div>

      <nav className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-tight">PathForge</span>
          </Link>
          <span className="text-xs text-slate-500">AI Academy</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {cert ? (
          <>
            {/* Verified badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/[0.1] border border-emerald-500/30">
                <ShieldCheck size={14} className="text-emerald-300" />
                <span className="text-xs font-semibold text-emerald-200 tracking-wide">
                  Verified credential
                </span>
              </div>
            </div>

            {/* Certificate */}
            <div className="relative rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.05] to-transparent overflow-hidden">
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at top, rgba(168,85,247,0.25), transparent 65%)",
                }}
              />
              <div className="relative p-8 sm:p-12 text-center">
                <div className="inline-flex items-center gap-2 mb-6">
                  <Logo size={26} />
                  <span className="text-sm font-semibold tracking-tight">
                    PathForge AI Academy
                  </span>
                </div>

                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-3">
                  Certificate of Completion
                </div>
                <div className="text-xs text-slate-500 mb-1">This certifies that</div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                  {cert.recipient_name}
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  has successfully completed the{" "}
                  <span className="text-white font-medium">
                    {cert.career_path_title}
                  </span>{" "}
                  career program — demonstrating real, project-backed skills.
                </p>

                {/* Skills */}
                {cert.skills?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-7 max-w-lg mx-auto">
                    {cert.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-6 border-t border-white/[0.06]">
                  <Meta label="Issued" value={new Date(cert.issued_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} />
                  <Meta label="Quests cleared" value={String(cert.quests_completed)} />
                  <Meta label="Final level" value={String(cert.final_level)} />
                </div>

                <div className="mt-6 text-[11px] text-slate-500">
                  Credential ID{" "}
                  <span className="font-mono text-slate-400">{cert.credential_id}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              This credential was issued by PathForge AI Academy and is genuine.
            </p>

            {/* Growth CTA */}
            <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
              <Sparkles size={18} className="text-indigo-300 mx-auto mb-2" />
              <h2 className="text-lg font-semibold mb-1">Forge your own credential</h2>
              <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
                PathForge turns career growth into a game — roadmaps, quests, and an AI
                coach. Earn a certificate like this one.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Start free
                <ArrowRight size={14} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/[0.08] border border-rose-500/30 mb-5">
              <ShieldX size={22} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Certificate not found
            </h1>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              We couldn&apos;t verify a certificate with the ID{" "}
              <span className="font-mono text-slate-300">{code}</span>. Double-check the
              link or credential ID.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Go to PathForge
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
