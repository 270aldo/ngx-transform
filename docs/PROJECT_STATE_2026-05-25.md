# Project State - 2026-05-25

## Current Read

NGX Vision is a launch-candidate web app, not a raw MVP. The committed codebase builds, lints, and tests successfully. The remaining work is mostly production configuration, real end-to-end AI QA, and legal/commercial data.

## Verified Locally

- `pnpm lint` passed.
- `pnpm test` passed: 25 test files, 98 tests.
- `pnpm build` passed: 39 App Router routes.
- `/api/health` returned healthy for Firebase, Redis, and Gemini in local env.
- Landing, wizard, and loading routes respond locally.
- Mobbin-inspired visual QA captured for landing, wizard, and results in desktop/mobile viewports.

## Organized Artifacts

- Root-level QA screenshots and snapshots moved to `docs/qa/snapshots/2026-05-10-season-vision/`.
- Mobbin visual refinement screenshots stored in `docs/qa/snapshots/2026-05-25-mobbin-refinement/`.
- Local tool caches are ignored in `.gitignore`: `.claude/`, `.playwright-*`, `output/`, `qa-v12/`.

## Code-Side Items Closed In This Pass

- Removed stale font-face declarations for font files that do not exist in `public/fonts`.
- Unified primary landing CTA copy to `Iniciar mi scan`.
- Removed stale ASCEND reference from the general landing FAQ.
- Added a stronger hero conviction line and reduced the visual weight of the hero assurance rail.
- Refined shared surfaces, cards, buttons, selectable controls, and result panels using Mobbin references: neutral charcoal panels, thinner borders, restrained purple usage, and consistent CTA styling.
- Updated README/AGENTS command paths from the old `app/` layout to the actual repository root.

## Remaining Blockers

- Real AI flow must be tested with a real session: upload → analysis → m4/m8/m12 generation → report → share settings.
- Identity Chain / Gemini image generation still needs a production-key validation pass.
- Production env still needs legal/commercial confirmation: support email, responsible legal name/address, email footer address, booking/payment URLs.
- External monitoring/alerts need production wiring.
- Smoke tests against deployed preview/staging still need a live URL.

## Next Best Work

1. Run a paid real-session QA pass and capture exact failures, if any.
2. Replace demo/placeholder visual assets with final brand-approved transformation media.
3. Configure production env and run `pnpm test:smoke` against staging.
