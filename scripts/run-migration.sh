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
SQL_FILE="$REPO_ROOT/RPG_PROGRESSION_MIGRATION.sql"

# Connection string: $1 → $SUPABASE_DB_URL → $DATABASE_URL
CONN="${1:-${SUPABASE_DB_URL:-${DATABASE_URL:-}}}"

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

if [[ ! -f "$SQL_FILE" ]]; then
  err "Migration file not found at: $SQL_FILE"
  exit 1
fi

# Force TLS (Supabase requires it) unless the URL already sets sslmode.
if [[ "$CONN" != *"sslmode="* ]]; then
  if [[ "$CONN" == *"?"* ]]; then CONN="${CONN}&sslmode=require"; else CONN="${CONN}?sslmode=require"; fi
fi

# Show a redacted version so the password never lands in logs/history.
REDACTED="$(printf '%s' "$CONN" | sed -E 's#(://[^:]+:)[^@]+(@)#\1********\2#')"
info "Target:    $REDACTED"
info "Migration: RPG_PROGRESSION_MIGRATION.sql"
echo

# --single-transaction = all-or-nothing; ON_ERROR_STOP = fail loudly on any error.
if psql "$CONN" --single-transaction -v ON_ERROR_STOP=1 -f "$SQL_FILE"; then
  echo
  ok "Migration applied successfully."
else
  echo
  err "Migration failed — no changes were committed (ran in a single transaction)."
  echo "  Common cause: wrong password, or using the Transaction pooler (port 6543)."
  echo "  Try the direct connection or the Session pooler (port 5432)."
  exit 1
fi

# Verify the new columns + table actually exist.
info "Verifying schema…"
psql "$CONN" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'profiles.' || column_name AS added
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('learner_selected_class','rpg_class_xp','rpg_unlocked_skills',
                      'rpg_completed_quests','rpg_earned_rewards','rpg_avatar')
ORDER BY 1;
SELECT 'table: ' || table_name AS created
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'arena_results';
SQL

echo
ok "Done. Avatars, class/skill/quest/reward progress, and arena history are now durable."
