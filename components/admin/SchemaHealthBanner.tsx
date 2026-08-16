"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface HealthReport {
  ok: boolean;
  missing: { kind: string; name: string; migration: string }[];
  migrations: string[];
  checkedAt: string;
}

/**
 * Admin-only banner that makes database drift LOUD. If the deployed app expects
 * columns/functions the database doesn't have yet, this tells the admin exactly
 * which SQL to run — instead of users hitting silent failures (empty parent
 * dashboards, "column not found" onboarding errors, etc.).
 *
 * Renders nothing when the schema is in sync. Mount only for admins.
 */
export function SchemaHealthBanner() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health/schema")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (mounted && d) setReport(d as HealthReport);
      })
      .catch(() => {
        /* health check is best-effort; never break the app over it */
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (dismissed || !report || report.ok || !report.migrations?.length) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500/[0.12] border-b border-amber-500/30 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 text-xs sm:text-[13px] text-amber-100 leading-relaxed">
          <span className="font-semibold">Database is behind the app.</span>{" "}
          {report.missing.length} item{report.missing.length === 1 ? "" : "s"} missing —
          affected features will silently fail until you apply the SQL. Run{" "}
          <code className="px-1 py-0.5 rounded bg-black/30 text-amber-200 font-mono">
            RUN_THIS_IN_SUPABASE.sql
          </code>{" "}
          in the Supabase SQL editor.
          <details className="mt-1">
            <summary className="cursor-pointer text-amber-200/80 hover:text-amber-100">
              Show details
            </summary>
            <ul className="mt-1 space-y-0.5 text-amber-200/90">
              {report.missing.map((m) => (
                <li key={m.name} className="font-mono text-[11px]">
                  • {m.kind} <span className="font-semibold">{m.name}</span> → {m.migration}
                </li>
              ))}
            </ul>
          </details>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-amber-300/70 hover:text-amber-100 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
