import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Schema health check — surfaces database drift (migrations not yet applied)
 * as a loud, actionable signal instead of letting features fail silently.
 *
 * Admin-only. Probes the columns/functions the app writes but that live in
 * separate migration files; reports which are missing and which SQL to run.
 *
 * Probes are read-only or side-effect-free:
 *   - columns: `select <col> limit 1` (missing column → parse error we detect)
 *   - functions: `learner_link_parent('')` returns false BEFORE any write, so
 *     calling it is a safe existence probe; a missing function returns PGRST202.
 */

export const dynamic = "force-dynamic";

const COLUMN_CHECKS: { table: string; column: string; migration: string }[] = [
  { table: "profiles", column: "learner_grade", migration: "LEARNER_MODE_MIGRATION.sql" },
  { table: "profiles", column: "parent_email", migration: "LEARNER_MODE_MIGRATION.sql" },
  { table: "profiles", column: "is_parent_account", migration: "PARENT_FAMILY_MIGRATION.sql" },
  { table: "profiles", column: "parent_profile_id", migration: "PARENT_FAMILY_MIGRATION.sql" },
  { table: "profiles", column: "learner_avatar_class", migration: "AVATAR_CLASS_MIGRATION.sql" },
];

const FUNCTION_CHECKS: { fn: string; args: Record<string, unknown>; migration: string }[] = [
  { fn: "learner_link_parent", args: { p_email: "" }, migration: "PARENT_LINK_RPC_MIGRATION.sql" },
];

type PgError = { code?: string; message?: string } | null;

function isMissingColumn(error: PgError, col: string): boolean {
  if (!error) return false;
  const m = (error.message || "").toLowerCase();
  const looksMissing =
    error.code === "42703" ||
    error.code === "PGRST204" ||
    m.includes("schema cache") ||
    m.includes("does not exist");
  return looksMissing && m.includes(col.toLowerCase());
}

function isMissingFunction(error: PgError): boolean {
  if (!error) return false;
  const m = (error.message || "").toLowerCase();
  // PGRST202 = "Could not find the function ... in the schema cache".
  // Any OTHER error (e.g. the function's own "Not authenticated" raise) proves
  // the function EXISTS, so it is not treated as missing.
  return error.code === "PGRST202" || m.includes("could not find the function");
}

export async function GET() {
  // Admin-only: schema shape isn't secret, but keep it out of public reach.
  const authed = await createServerClient();
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: prof } = await authed
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!(prof as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Prefer the service role for probes (bypasses RLS); fall back to the admin's
  // own authed client if the service key isn't configured.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const probe =
    url && serviceKey
      ? createAdminClient(url, serviceKey, { auth: { persistSession: false } })
      : authed;

  const missing: { kind: "column" | "function"; name: string; migration: string }[] = [];

  for (const c of COLUMN_CHECKS) {
    const { error } = await probe.from(c.table).select(c.column).limit(1);
    if (isMissingColumn(error, c.column)) {
      missing.push({ kind: "column", name: `${c.table}.${c.column}`, migration: c.migration });
    }
  }
  for (const f of FUNCTION_CHECKS) {
    const { error } = await probe.rpc(f.fn, f.args);
    if (isMissingFunction(error)) {
      missing.push({ kind: "function", name: `${f.fn}()`, migration: f.migration });
    }
  }

  const migrations = [...new Set(missing.map((m) => m.migration))];
  return NextResponse.json({
    ok: missing.length === 0,
    missing,
    migrations,
    checkedAt: new Date().toISOString(),
  });
}
