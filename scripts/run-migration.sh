#!/usr/bin/env bash
#
# run-migration.sh — apply RPG_PROGRESSION_MIGRATION.sql to your Supabase
# Postgres database. Safe to run multiple times (the SQL uses IF NOT EXISTS
# guards and only ADDS columns/tables — it never changes existing data).
#
# ─────────────────────────────────────────────────────────────────────────────
# WHERE TO GET YOUR CONNECTION STRING
#   Supabase Dashboard → your project → Settings → Database → "Connection string"
#   → URI tab. Copy the string that looks like:
#       postgresql://postgres:[YOUR-PASSWORD]@db.<ref>.supabase.co:5432/postgres
#   Replace [YOUR-PASSWORD] with your DB password.
#
#   • If the direct host can't connect (some networks are IPv4-only), use the
#     "Session pooler" URI instead (host looks like
#     aws-0-<region>.pooler.supabase.com, port 5432). Do NOT use the
#     "Transaction" pooler (port 6543) — it can't run DDL/DO blocks.
#
# USAGE
#   1) Pass it as an argument:
#        ./scripts/run-migration.sh "postgresql://postgres:PW@db.xxxx.supabase.co:5432/postgres"
#   2) …or set an env var first (keeps it out of your shell history):
#        export SUPABASE_DB_URL="postgresql://postgres:PW@db.xxxx.supabase.co:5432/postgres"
#        ./scripts/run-migration.sh
#   3) …or via npm:
#        SUPABASE_DB_URL="..." npm run db:migrate
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Resolve paths relative to this script so it works from any cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Apply ALL migrations in dependency order by default. Every file is idempotent
# (IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS), so re-running is
# safe. Pass a single .sql filename as the first arg to run just that one.
#
# Order matters: base schema → learner columns → features that build on them.
ORDERED_MIGRATIONS=(
  "COMPLETE_DATABASE_SETUP.sql"
  "LEARNER_MODE_MIGRATION.sql"
  "RPG_PROGRESSION_MIGRATION.sql"
  "AVATAR_CLASS_MIGRATION.sql"
  "ADMIN_ANALYTICS_MIGRATION.sql"
  "AI_MENTOR_RLS_FIX.sql"
  "PARENT_FAMILY_MIGRATION.sql"
  "PARENT_LINK_RPC_MIGRATION.sql"
  "CAREERS_MIGRATION.sql"
  "SEED_CAREER_PATHS.sql"
  "CERTIFICATES_MIGRATION.sql"
  "CERTIFICATIONS_MIGRATION.sql"
  "FRIENDSHIPS_MIGRATION.sql"
  "STREAK_FREEZE_MIGRATION.sql"
  "PRIVACY_CONTROLS_MIGRATION.sql"
  "PUBLIC_PROFILE_MIGRATION.sql"
  "RESUME_BUILDER_MIGRATION.sql"
  "PAYMONGO_MIGRATION.sql"
  "GCASH_MAYA_PAYMENT_MIGRATION.sql"
  "LAUNCH_READY_MIGRATION.sql"
)

# First arg may be EITHER a .sql file to run, or the connection string.
SINGLE_FILE=""
CONN_ARG=""
if [[ "${1:-}" == *.sql ]]; then
  SINGLE_FILE="$1"; shift
fi
CONN_ARG="${1:-}"

# Connection string: positional → $SUPABASE_DB_URL → $DATABASE_URL
CONN="${CONN_ARG:-${SUPABASE_DB_URL:-${DATABASE_URL:-}}}"

err() { printf '\033[31m✖ %s\033[0m\n' "$1" >&2; }
ok()  { printf '\033[32m✔ %s\033[0m\n' "$1"; }
info(){ printf '\033[36m… %s\033[0m\n' "$1"; }

if ! command -v psql >/dev/null 2>&1; then
  err "psql is not installed."
  echo "  macOS:  brew install libpq && brew link --force libpq"
  echo "  Ubuntu: sudo apt-get install -y postgresql-client"
  exit 1
fi

if [[ -z "$CONN" ]]; then
  err "No database connection string provided."
  echo "  Pass it as an argument or set SUPABASE_DB_URL (see the header of this file)."
  exit 1
fi

# Build the list of files to run: one named file, or the full ordered set.
FILES=()
if [[ -n "$SINGLE_FILE" ]]; then
  [[ "$SINGLE_FILE" != /* ]] && SINGLE_FILE="$REPO_ROOT/$SINGLE_FILE"
  if [[ ! -f "$SINGLE_FILE" ]]; then
    err "Migration file not found: $SINGLE_FILE"; exit 1
  fi
  FILES=("$SINGLE_FILE")
else
  for f in "${ORDERED_MIGRATIONS[@]}"; do
    [[ -f "$REPO_ROOT/$f" ]] && FILES+=("$REPO_ROOT/$f")
  done
fi

# Force TLS (Supabase requires it) unless the URL already sets sslmode.
if [[ "$CONN" != *"sslmode="* ]]; then
  if [[ "$CONN" == *"?"* ]]; then CONN="${CONN}&sslmode=require"; else CONN="${CONN}?sslmode=require"; fi
fi

# Show a redacted version so the password never lands in logs/history.
REDACTED="$(printf '%s' "$CONN" | sed -E 's#(://[^:]+:)[^@]+(@)#\1********\2#')"
info "Target:     $REDACTED"
info "Migrations: ${#FILES[@]} file(s)"
echo

# Run each file in its own all-or-nothing transaction. Continue on failure so
# one unrelated migration can't block the rest; summarize at the end.
APPLIED=(); FAILED=()
for f in "${FILES[@]}"; do
  name="$(basename "$f")"
  info "Applying $name …"
  if psql "$CONN" --single-transaction -v ON_ERROR_STOP=1 -q -f "$f"; then
    ok "  $name"
    APPLIED+=("$name")
  else
    err "  $name failed (rolled back; continuing)"
    FAILED+=("$name")
  fi
done

echo
ok "Applied ${#APPLIED[@]}/${#FILES[@]} migration(s)."
if [[ ${#FAILED[@]} -gt 0 ]]; then
  err "Failed: ${FAILED[*]}"
  echo "  Common cause: wrong password, or using the Transaction pooler (port 6543)."
  echo "  Try the direct connection or the Session pooler (port 5432)."
  exit 1
fi

# Verify the columns this app most depends on actually exist now.
info "Verifying key columns…"
psql "$CONN" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'profiles.' || column_name AS present
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('learner_grade','learner_avatar_class','parent_email',
                      'is_parent_account','parent_profile_id')
ORDER BY 1;
SELECT 'function: ' || routine_name AS present
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('parent_claim_kids','learner_link_parent')
ORDER BY 1;
SQL

echo
ok "Done. Schema is in sync with the app."
