import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

/**
 * Offline fallback — served by the service worker when a navigation fails.
 * Deliberately a server component with INLINE styles only: when offline, the
 * hashed JS/CSS chunks may not be cached yet, so this page must look right
 * with nothing but its own HTML.
 */
export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "radial-gradient(80% 60% at 50% 0%, #16122b 0%, #070a11 60%)",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* inline brand mark — no external asset needed */}
      <svg width="56" height="56" viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="og" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <path d="M20 2.5 L34.5 11 L34.5 29 L20 37.5 L5.5 29 L5.5 11 Z" fill="url(#og)" />
        <g fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 23 L20 14 L28 23" />
          <path d="M14.5 28.5 L20 23 L25.5 28.5" strokeOpacity="0.55" />
        </g>
      </svg>

      <div style={{ fontSize: 40, marginTop: 24 }}>📡</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 10, color: "#fff" }}>
        You&apos;re offline, adventurer
      </h1>
      <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 360, marginTop: 8, lineHeight: 1.6 }}>
        Forgeheart City needs a connection to load your quests and save your XP.
        Check your Wi&#8209;Fi or data, then jump back in.
      </p>
      <a
        href="/learn"
        style={{
          marginTop: 28,
          padding: "12px 26px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          color: "#1a1303",
          background: "linear-gradient(180deg,#fcd34d,#f59e0b)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        Try again
      </a>
      <p style={{ fontSize: 11, color: "#475569", marginTop: 18 }}>
        Your streak and progress are safe — they sync when you&apos;re back online.
      </p>
    </main>
  );
}
