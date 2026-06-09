"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary for failures in the root layout itself. Must
 * render its own <html>/<body>. Kept dependency-free and inline-styled so it
 * works even if app CSS/providers failed to load.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#070a11", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
          <div style={{ fontSize: 44 }}>🛠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>PathForge hit a snag</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 360, marginTop: 8 }}>
            Please reload the page. If it keeps happening, email support@pathforger.app.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: 24, padding: "10px 20px", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer", background: "linear-gradient(180deg,#fcd34d,#f59e0b)", color: "#0f172a" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
