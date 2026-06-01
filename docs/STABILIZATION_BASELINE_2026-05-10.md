# NGX Vision Stabilization Baseline

Date: 2026-05-10

## Purpose

This baseline freezes the current product before the Season Vision Report rebuild.
The next product branch should start from this stabilized state and keep Firebase as
the persistence layer.

## Verified Commands

Run from the repository root:

```bash
pnpm lint
pnpm test
pnpm build
```

Expected stabilization target:

- `pnpm lint`: 0 errors, 0 warnings.
- `pnpm test`: full Vitest suite passes.
- `pnpm build`: production build passes.

## Product Scope Freeze

- `/demo/[shareId]`, `/s/[shareId]/demo`, `/plan/[shareId]`, and `/s/[shareId]/plan`
  remain legacy redirect surfaces to `/s/[shareId]#hybrid-offer`.
- Share-to-unlock is disabled by default. It can only be re-enabled explicitly with
  `FF_SHARE_UNLOCK=true` or `FF_SHARE_TO_UNLOCK=true`.
- The 7-day plan feature flag is disabled in `.env.example` so the public funnel does
  not present the plan as the primary lead magnet output.
- The commercial exit remains the unified results page with HYBRID offer, booking,
  WhatsApp, checkout, and brief/email paths according to runtime configuration.

## Firebase Decision

The Season Vision Report rebuild should not migrate to Supabase. Keep:

- Firestore for sessions, report metadata, transform events, checkout state, and
  optional voice outcomes.
- Firebase Storage for originals, generated images, and rendered PDFs.
- Signed URLs for private asset access.
- Existing cleanup, rate limiting, spend limiting, and share scope patterns unless the
  rebuild introduces a concrete reason to replace them.

## Compatibility Rule

The rebuild may keep internal `m4`, `m8`, and `m12` asset keys temporarily and map
them to user-facing `Season 1`, `Season 2`, and `Season 3`. User-facing copy should
move to Season language, but existing sessions and generated assets should remain
readable during the transition.
