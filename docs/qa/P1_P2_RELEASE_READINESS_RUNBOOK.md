# P1/P2 Release Readiness Runbook

Purpose: validate the P1/P2 hardening gate without production mutations or paid API calls. Use a staging Firebase project and disposable sessions only.

## Fixture Lock

Required staging fixtures:

- `TEST_BASE_URL`: local or staging URL under test.
- `TEST_SHARE_ID`: representative ready session owned by user A.
- `TEST_OWNER_ID_TOKEN`: Firebase ID token for the owner of `TEST_SHARE_ID`.
- `TEST_USER_A_TOKEN`: same owner token used by `test:auth`.
- `TEST_USER_B_TOKEN`: Firebase ID token for a different user.
- `TEST_USER_A_SESSION_ID`: same value as `TEST_SHARE_ID`, unless testing a second fixture.
- `TEST_CRON_API_KEY`: staging cron key.

The fixture session must include `ownerUid`, `email`, `consents`, private `shareScope`, `deleteToken`, realistic `input`, and mocked or staging-safe image paths. Never use production Firebase data for destructive delete checks.

Optional destructive fixture:

- `TEST_DELETE_SHARE_ID`: disposable session that may be deleted.
- `TEST_DELETE_TOKEN`: legacy delete token for that disposable session.

## Local Gates

Run from `/Users/aldoolivas/genesis-scann`:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test
TEST_BASE_URL=http://localhost:3000 TEST_SHARE_ID="$TEST_SHARE_ID" TEST_OWNER_ID_TOKEN="$TEST_OWNER_ID_TOKEN" pnpm test:smoke
TEST_BASE_URL=http://localhost:3000 TEST_USER_A_TOKEN="$TEST_USER_A_TOKEN" TEST_USER_B_TOKEN="$TEST_USER_B_TOKEN" TEST_USER_A_SESSION_ID="$TEST_USER_A_SESSION_ID" pnpm test:auth
```

Expected: all configured tests pass. Skips are acceptable only when the fixture env var named in the skip message is intentionally absent.

## Local Emulator Gate (no staging required)

Runs the full owner/non-owner/anonymous + delete matrix against the Firebase Emulator Suite — zero paid APIs, zero production data. The emulator host env vars force `firebase-admin` to localhost, so it can never reach a real project even if a real `.env.local` is present.

Prerequisites (one-time):

- `brew install openjdk` (the Firestore/Storage emulators need a JRE).
- `firebase-tools` available as the global `firebase` CLI.
- `cp .env.emulator.example .env.emulator.local`, then generate a throwaway key (see the header of `.env.emulator.example`). `.env.emulator.local` is gitignored.

Run:

```bash
pnpm test:gate:local
```

This starts the auth/firestore/storage emulators, boots a Next dev server on a dedicated free port, seeds two users + an owned `ready` session + two disposable sessions, mints owner (A) and other-user (B) ID tokens, and runs `test:auth`, `test:smoke`, and `test:delete`.

Acceptance (all green):

- `test:auth` — 13 tests, 0 skipped: owner `200`, non-owner `403`, anonymous `401` across `/private`, classify, hybrid-offer, feedback, brief, checkout.
- `test:smoke` — 5 pass, 1 skip: the skip is the `REQUIRE_SMOKE_ENV` prod-env assertion, which belongs to the staging gate below.
- `test:delete` — 4 tests: anonymous/non-owner rejected, owner delete `200` (session then `404`), legacy delete-token wrong-token rejected / correct token `200`.

Telemetry isolation (`trusted:false` → no `session_metrics` mutation) and the MercadoPago mock gate (signature/amount/currency/idempotency) are covered by the vitest suites in `pnpm test` (136/136) and do not require the emulator.

Building blocks (to run pieces manually):

- `pnpm emulators` — start the emulator suite (auth, firestore, storage).
- `pnpm seed:emulator` — seed users + fixtures (emulator must be running).
- `pnpm mint:token A` / `pnpm mint:token B` — print an owner / other-user ID token.

## Staging Gates

```bash
TEST_BASE_URL="$STAGING_URL" \
TEST_USER_A_TOKEN="$TEST_USER_A_TOKEN" \
TEST_USER_B_TOKEN="$TEST_USER_B_TOKEN" \
TEST_USER_A_SESSION_ID="$TEST_USER_A_SESSION_ID" \
pnpm test:auth
```

```bash
TEST_BASE_URL="$STAGING_URL" \
TEST_SHARE_ID="$TEST_SHARE_ID" \
TEST_OWNER_ID_TOKEN="$TEST_OWNER_ID_TOKEN" \
TEST_CRON_API_KEY="$TEST_CRON_API_KEY" \
REQUIRE_SMOKE_ENV=true \
pnpm test:smoke
```

Acceptance:

- Owner can read `/api/sessions/[shareId]/private`.
- Anonymous receives `401`.
- Non-owner receives `403`.
- Public `/api/sessions/[shareId]` omits private fields.
- Launch-critical mutation routes reject anonymous and non-owner requests.

## MercadoPago Mock Gate

Keep direct checkout disabled in staging unless sandbox credentials are explicitly approved. Local `pnpm test` covers:

- Owner-only preference creation with mocked `createMpPreference`.
- Anonymous/non-owner preference rejection before any MP call.
- Valid signed webhook converts the session with mocked payment data.
- Invalid signature, SKU mismatch, amount mismatch, and currency mismatch do not mutate state.
- Duplicate approved webhook is idempotent.

## Public Telemetry Gate

Local `pnpm test` covers:

- `/api/telemetry` calls `trackEvent` with `trusted:false`.
- Email-keyed public metadata is stripped before tracking.
- `trackEvent({ trusted:false })` writes `telemetry_events` only and does not update `session_metrics`.
- Trusted server-side telemetry still updates canonical metrics.

Manual staging spot-check:

1. POST a public `voice_agent_classified` telemetry event with email-like metadata.
2. Confirm `telemetry_events` has `trusted:false` and `metadata.publicApi:true`.
3. Confirm `session_metrics`, `sessions/{shareId}.funnel`, checkout fields, CRM, N8N, and lead scoring are unchanged.

## Visual QA

Use these viewports:

- `390x844`
- `768x1024`
- `1440x900`

Pages:

- `/loading/$TEST_SHARE_ID`
- `/s/$TEST_SHARE_ID`
- `/s/$TEST_SHARE_ID#hybrid-offer`
- `/s/$TEST_SHARE_ID/demo` and `/s/$TEST_SHARE_ID/plan` as redirects to `/s/$TEST_SHARE_ID#hybrid-offer`
- `/dashboard`
- `/dashboard/$TEST_SHARE_ID`

Acceptance: countdown/results render, no overlapping text, no blocked CTAs, dashboard owner state loads, and delete controls are reachable. Use a disposable fixture for actual delete confirmation.

## Warning Triage

Hydration mismatch:

- Reproduce in clean Chromium.
- If the mismatch is from app markup, it is launch-blocking.
- If it is injected by automation or a browser extension, document as non-blocking.

Telemetry timeout:

- Confirm user-facing requests still finish.
- Confirm only telemetry writes are dropped.
- Check staging logs for frequency. High frequency is a launch risk even if the request path is non-blocking.

## Go/No-Go

GO requires passing local gates, staging auth/smoke with real owner fixtures, mocked MP tests, telemetry trust tests, visual QA, and documented fixtures.

NO-GO if any non-owner mutation succeeds, invalid MP webhook mutates state, public telemetry changes canonical funnel/commercial state, dashboard delete can remove another user's data, mobile QA blocks conversion/privacy/delete, or fixture secrets are undocumented.
