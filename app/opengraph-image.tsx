import { ImageResponse } from "next/og";

// Social share card — shown when a PathForge link is posted to X, Facebook,
// LinkedIn, WhatsApp, Slack, etc.
export const alt = "PathForge — Where kids forge their future";
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

export default function Image() {
  const logo = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "76px 80px",
          justifyContent: "space-between",
          background:
            "linear-gradient(140deg, #15122e 0%, #0a0a0f 55%, #1c1033 100%)",
          overflow: "hidden",
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -210,
            right: -130,
            width: 660,
            height: 660,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.42) 0%, rgba(168,85,247,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            bottom: -280,
            left: -150,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.34) 0%, rgba(99,102,241,0) 70%)",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={62} height={62} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 38,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            PathForge
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Where kids
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              color: "#fbbf24",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            forge their future.
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 29,
            color: "#94a3b8",
            letterSpacing: "-0.01em",
          }}
        >
          K-12 learning, gamified · Ages 6–18 · 🇵🇭 Filipino-built
        </div>
      </div>
    ),
    { ...size }
  );
}
