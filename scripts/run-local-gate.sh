#!/usr/bin/env bash
# Local P1/P2 validation gate against the Firebase Emulator Suite.
#
# Starts the Auth + Firestore emulators, the Next dev server, seeds fixtures,
# mints owner (A) and other-user (B) tokens, then runs test:auth + test:smoke.
# Zero paid APIs, zero production data — the emulator hosts force firebase-admin
# to localhost regardless of any real .env.local present.
#
# Usage: pnpm test:gate:local   (or: bash scripts/run-local-gate.sh)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE=".env.emulator.local"

# Ensure a JRE is on PATH for the Firestore emulator (Homebrew openjdk).
export PATH="/opt/homebrew/opt/openjdk/bin:/usr/local/opt/openjdk/bin:$PATH"

if [ "${1:-}" != "--inner" ]; then
  [ -f "$ENV_FILE" ] || { echo "✗ Missing $ENV_FILE (copy from .env.emulator.example)"; exit 1; }
  command -v java >/dev/null 2>&1 || { echo "✗ java not found — run: brew install openjdk"; exit 1; }
  command -v firebase >/dev/null 2>&1 || { echo "✗ firebase CLI not found — run: npm i -g firebase-tools"; exit 1; }
  # Re-exec the inner body inside the emulator lifecycle.
  exec firebase emulators:exec --only auth,firestore,storage --project demo-ngx "bash '$0' --inner"
fi

# ---------------------------------------------------------------------------
# Inner: emulators are up. firebase emulators:exec has exported
# FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST for child processes.
# ---------------------------------------------------------------------------
set -a; . "$ENV_FILE"; set +a

# Pick a dedicated free port so we never collide with (or hit) another running
# dev server — e.g. a real one on :3000 wired to production .env.local.
GATE_PORT="${GATE_PORT:-3123}"
while lsof -iTCP:"$GATE_PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; do
  GATE_PORT=$((GATE_PORT + 1))
done
BASE_URL="http://localhost:${GATE_PORT}"

echo "▶ starting Next dev server on ${BASE_URL} …"
PORT="$GATE_PORT" pnpm exec next dev -p "$GATE_PORT" >/tmp/ngx-gate-dev.log 2>&1 &
DEV_PID=$!
trap 'kill "$DEV_PID" 2>/dev/null || true' EXIT

echo "▶ waiting for ${BASE_URL}/api/health …"
for _ in $(seq 1 90); do
  if curl -sf -o /dev/null "${BASE_URL}/api/health"; then break; fi
  sleep 1
done
curl -sf -o /dev/null "${BASE_URL}/api/health" || {
  echo "✗ dev server did not come up. Last log lines:"; tail -30 /tmp/ngx-gate-dev.log; exit 1;
}

echo "▶ seeding fixtures…"
node scripts/seed-emulator.mjs >/dev/null

echo "▶ minting tokens…"
TOKEN_A="$(node scripts/mint-token.mjs A)"
TOKEN_B="$(node scripts/mint-token.mjs B)"

export TEST_BASE_URL="$BASE_URL"
export TEST_USER_A_TOKEN="$TOKEN_A"
export TEST_USER_B_TOKEN="$TOKEN_B"
export TEST_OWNER_ID_TOKEN="$TOKEN_A"
export TEST_USER_A_SESSION_ID="gate-session-a"
export TEST_SHARE_ID="gate-session-a"
export TEST_CRON_API_KEY="${CRON_API_KEY:-emulator-cron-key}"
# Disposable fixtures for the destructive delete gate.
export TEST_DELETE_SHARE_ID="gate-del-owner"
export TEST_DELETE_TOKEN_SHARE_ID="gate-del-token"
export TEST_DELETE_TOKEN="gate-delete-token-abc123"

echo "▶ pnpm test:auth"
pnpm test:auth
echo "▶ pnpm test:smoke"
pnpm test:smoke
echo "▶ pnpm test:delete"
pnpm test:delete

echo "✓ local P1/P2 gate complete"
