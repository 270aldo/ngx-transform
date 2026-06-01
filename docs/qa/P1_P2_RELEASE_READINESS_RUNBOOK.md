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
