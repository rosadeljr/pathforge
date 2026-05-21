import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const alt = "PathForge AI Academy Certificate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="g" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#a5b4fc"/>
      <stop offset="50%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
  </defs>
  <path d="M20 2.5 L34.5 11 L34.5 29 L20 37.5 L5.5 29 L5.5 11 Z" fill="url(#g)"/>
  <g fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 23 L20 14 L28 23"/>
    <path d="M14.5 28.5 L20 23 L25.5 28.5" stroke-opacity="0.55"/>
  </g>
</svg>`;

interface CertRow {
  recipient_name: string;
  career_path_title: string;
  credential_id: string;
  issued_at: string;
  quests_completed: number;
}

async function getCert(code: string): Promise<CertRow | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("certificates")
      .select("recipient_name, career_path_title, credential_id, issued_at, quests_completed")
      .eq("credential_id", code)
      .maybeSingle();
    return (data as CertRow) ?? null;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cert = await getCert(code);
  const logo = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

  const bg = "linear-gradient(140deg, #15122e 0%, #0a0a0f 55%, #1c1033 100%)";

  if (!cert) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: bg,
            color: "#94a3b8",
            fontSize: 40,
          }}
        >
          Certificate not found
        </div>
      ),
      { ...size }
    );
  }

  const issued = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 44,
          background: bg,
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -220,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0) 70%)",
          }}
        />

        {/* Framed certificate */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 22,
            padding: "48px 64px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={46} height={46} alt="" />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}
            >
              PathForge AI Academy
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: "0.28em",
                color: "#a78bfa",
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              CERTIFICATE OF COMPLETION
            </div>
            <div style={{ display: "flex", fontSize: 20, color: "#94a3b8", marginBottom: 10 }}>
              This certifies that
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 68,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              {cert.recipient_name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: "#cbd5e1",
                textAlign: "center",
              }}
            >
              completed the {cert.career_path_title} career program
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 14, color: "#64748b" }}>
                CREDENTIAL ID
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#e2e8f0", fontWeight: 600 }}>
                {cert.credential_id}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 14, color: "#64748b" }}>ISSUED</div>
              <div style={{ display: "flex", fontSize: 20, color: "#e2e8f0", fontWeight: 600 }}>
                {issued}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
