# NGX Vision Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the GPT 5.5 PRO audit plus local repo evidence into an executable release-readiness backlog for NGX Vision.

**Architecture:** Split work into two execution tracks: a production-stabilization track that fixes the core photo-to-analysis-to-image promise, and a visual-polish track that can proceed without touching protected backend/result modules. Do not mix those tracks in the same PR because the blast radius and QA requirements are different.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Firebase Admin/Client, Gemini, Tailwind CSS v4, Vitest, node:test smoke tests, Vercel.

---

## Current Scope Guardrails

The current visual-polish branch rules prohibit edits to:

- `src/lib/**`
- `src/types/**`
- `src/app/api/**`
- `src/components/results/**`
- schemas and schema-bearing files

That means several P0 audit items are valid release blockers but are not safe to implement under the current "landing polish only" rule. Treat them as a separate stabilization branch.

Recommended branches:

- `codex/release-readiness-p0`: backend/lib/API/schema fixes.
- `codex/landing-polish-v12`: visual-only landing and wizard copy/layout fixes that respect current guardrails.
- `codex/commercial-prod-hardening`: Mercado Pago, email, CSP, provider configuration, and smoke endpoints.

## Evidence From Local Repo

- The repo root is the app root. Commands should run from `/Users/aldoolivas/genesis-scann`, not `/Users/aldoolivas/genesis-scann/app`.
- `package.json` uses Next `16.2.4`; the AGENTS.md overview says `16.0.7`, so docs are stale.
- Both `package-lock.json` and `pnpm-lock.yaml` exist while `vercel.json` installs/builds with pnpm.
- `src/lib/gemini.ts` still converts V2 analysis back to a V1-shaped object inside `generateInsightsFromImage`, dropping `user_visual_anchor`, `style_profile`, and `letter_from_future`.
- `src/app/loading/[shareId]/LoadingExperience.tsx` still triggers `/api/generate-images` when status is `"processing"` or `"analyzed"` and image count is `0`; it does not require `aiPresent`.
- `.env.example` sets `FF_NB_PRO=true` and `GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview`; `src/lib/imageConfig.ts` and `src/lib/imageConfig.test.ts` make explicit `GEMINI_IMAGE_MODEL` win over `FF_NB_PRO`.
- `src/components/wizard/WizardObjectiveStep.tsx` labels a control "Días disponibles por semana" but writes to `weeklyTime`.
- `src/components/wizard/wizardSchema.ts` still uses `bodyType: ectomorph | mesomorph | endomorph`.
- Public copy still mixes 12 weeks and 12 months in multiple routes/components. Some result components are in the protected "do not touch" list, so full migration needs its own branch.
- Legacy module names are visible in component source and may be surfaced depending on rendering paths. User-facing UI must remain "GENESIS" plus capability labels.
- Local docs contain a prior smoke report saying a recent session completed with NB Pro. Treat that as useful evidence, not launch certification; rerun smoke after P0 changes.

## Release Decision

Public production remains **NO-GO** until P0 is done and 20-50 internal sessions are audited.

Controlled beta is acceptable after:

- P0 identity payload is preserved.
- Image generation waits for persisted AI.
- Image model config is unambiguous.
- Wizard inputs stop corrupting availability data.
- Visual promise is consistently "12 weeks" or explicitly reconciled.
- Commercial providers are configured with real secrets/domains.
- Build, lint, unit tests, smoke tests, and manual golden path pass.

---

### Task 1: Freeze Baseline And Branch Boundaries

**Files:**
- Read: `docs/audit-uiux-2026-05/FIXES_APPLIED.md`
- Read: `docs/AUDIT_UIUX_2026_05.md`
- Read: `.env.example`
- Read: `package.json`
- Read: `vercel.json`
- Modify: `docs/RELEASE_CHECKLIST.md`

- [ ] **Step 1: Record baseline facts in release checklist**

Add a "Release Readiness Baseline" section to `docs/RELEASE_CHECKLIST.md` with these exact facts:

```md
## Release Readiness Baseline

- App root: repository root (`/Users/aldoolivas/genesis-scann`).
- Package manager for deploy: pnpm (`vercel.json` uses `pnpm install` and `pnpm build`).
- Current package manager drift: both `package-lock.json` and `pnpm-lock.yaml` exist.
- Current Next version in `package.json`: `16.2.4`.
- Public production status: NO-GO until P0 release-readiness tasks pass.
- Controlled beta status: allowed only after P0 smoke test and internal image QA.
```

- [ ] **Step 2: Commit docs-only baseline**

Run:

```bash
git add docs/RELEASE_CHECKLIST.md
git commit -m "docs: record release readiness baseline"
```

Expected: one docs-only commit.

---

### Task 2: Preserve V2 Identity Payload Through Analysis

**Files:**
- Modify: `src/lib/gemini.ts`
- Modify: `src/app/api/analyze/route.ts`
- Test: `src/lib/gemini.test.ts`
- Optional Test: `tests/smoke.api.test.mjs`

- [ ] **Step 1: Write a failing unit test for V2 payload preservation**

Add a pure test that locks the desired contract: when V2 analysis is used, persisted `ai` must include `user_visual_anchor`, `style_profile`, and `letter_from_future`. The minimum assertion should be:

```ts
expect(ai).toHaveProperty("user_visual_anchor");
expect(ai).toHaveProperty("style_profile");
expect(ai).toHaveProperty("letter_from_future");
expect(ai.user_visual_anchor.length).toBeGreaterThan(50);
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
pnpm test src/lib/gemini.test.ts
```

Expected: FAIL because the legacy conversion path drops V2-only fields.

- [ ] **Step 3: Change analysis route to persist full V2 output**

Update the analysis flow so the stored `ai` object is the full V2 `AnalysisOutput` whenever `FF_NB_PRO` or `FF_IDENTITY_CHAIN` is enabled. Keep legacy fallback only for sessions explicitly running without identity chain.

Required persisted shape:

```ts
{
  ...analysis,
  schemaVersion: "v2",
  user_visual_anchor: analysis.user_visual_anchor,
  style_profile: analysis.style_profile,
  letter_from_future: analysis.letter_from_future
}
```

- [ ] **Step 4: Remove generic fallback from the premium path**

In the image-generation path, if identity chain is enabled and `user_visual_anchor` is missing, return a controlled failure instead of generating generic transformations.

Required status marker:

```ts
status: "failed",
lastError: "analysis_failed_identity_anchor"
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
pnpm test src/lib/gemini.test.ts src/app/api/generate-images/workerToken.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/gemini.ts src/app/api/analyze/route.ts src/app/api/generate-images/route.ts src/lib/gemini.test.ts
git commit -m "fix: preserve identity payload for image generation"
```

---

### Task 3: Make Image Model Selection Unambiguous

**Files:**
- Modify: `src/lib/imageConfig.ts`
- Modify: `src/lib/imageConfig.test.ts`
- Modify: `.env.example`
- Modify: `docs/GEMINI.md`

- [ ] **Step 1: Decide product policy**

Use this policy for premium launch:

```txt
If FF_NB_PRO=true, use gemini-3-pro-image-preview unless GEMINI_IMAGE_MODEL is explicitly set to another Pro-compatible model and documented as an override.
```

- [ ] **Step 2: Write failing tests**

Change `src/lib/imageConfig.test.ts` so this case expects Pro:

```ts
setEnv({ GEMINI_IMAGE_MODEL: "gemini-3.1-flash-image-preview", FF_NB_PRO: "true" });
expect(config.default.model).toBe(MODELS.GEMINI_3_PRO_IMAGE);
```

Keep a separate test for explicit override only if an env such as `GEMINI_IMAGE_MODEL_OVERRIDE=true` is introduced.

- [ ] **Step 3: Update resolver**

Change `resolveImageModel()` so `FF_NB_PRO=true` has priority over the default `.env.example` value.

- [ ] **Step 4: Fix `.env.example`**

For premium production, set:

```env
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
FF_NB_PRO=true
FF_IDENTITY_CHAIN=true
```

- [ ] **Step 5: Run tests**

```bash
pnpm test src/lib/imageConfig.test.ts src/lib/validators.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/imageConfig.ts src/lib/imageConfig.test.ts .env.example docs/GEMINI.md
git commit -m "fix: make pro image model selection explicit"
```

---

### Task 4: Remove Client-Side Race Between Analysis And Image Generation

**Files:**
- Modify: `src/app/loading/[shareId]/LoadingExperience.tsx`
- Modify: `src/app/api/sessions/[shareId]/route.ts`
- Test: add or update a loading behavior test if test harness exists

- [ ] **Step 1: Require persisted AI before triggering images**

In `LoadingExperience.tsx`, generation should start only when:

```ts
nextStatus === "analyzed" && aiPresent === true && count === 0
```

Remove `"processing"` from the trigger condition.

- [ ] **Step 2: Ensure public session response exposes `hasAi`**

In `GET /api/sessions/[shareId]`, return:

```ts
hasAi: Boolean(data.ai)
```

Use `hasAi` in the loading component instead of inspecting a potentially stripped public `ai` payload.

- [ ] **Step 3: Keep retry sequencing strict**

When retrying, call `/api/analyze`, wait for success or poll until `hasAi === true`, and then call `/api/generate-images`.

- [ ] **Step 4: Run focused checks**

```bash
pnpm test
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/loading/[shareId]/LoadingExperience.tsx src/app/api/sessions/[shareId]/route.ts
git commit -m "fix: gate image generation on completed analysis"
```

---

### Task 5: Fix Wizard Availability And Remove Somatotype Framing

**Files:**
- Modify: `src/components/wizard/WizardObjectiveStep.tsx`
- Modify: `src/components/wizard/WizardProfileStep.tsx`
- Modify: `src/components/wizard/wizardSchema.ts`
- Modify: `src/app/wizard/page.tsx`
- Modify: schemas/API only in the stabilization branch, not visual-polish branch
- Test: `src/app/wizard/wizardLayout.test.ts`

- [ ] **Step 1: Separate days from duration**

Target fields:

```ts
trainingDaysPerWeek: 2 | 3 | 4 | 5 | 6
sessionDurationMinutes: 30 | 45 | 60 | 75
weeklyTimeMinutes: number
```

Compute:

```ts
weeklyTimeMinutes = trainingDaysPerWeek * sessionDurationMinutes
```

- [ ] **Step 2: Stop writing days into `weeklyTime`**

In `WizardObjectiveStep.tsx`, the "Días disponibles por semana" control must call:

```ts
setValue("trainingDaysPerWeek", d)
```

not:

```ts
setValue("weeklyTime", d)
```

- [ ] **Step 3: Replace extreme goal copy**

Use these labels:

```txt
Recomposición atlética
Construir músculo funcional
Híbrido de rendimiento
```

Use these descriptions:

```txt
Reducir grasa sin perder rendimiento, priorizando tono muscular y postura.
Ganar fuerza y músculo útil con proporciones naturales.
Equilibrar rendimiento, estética, recuperación y consistencia.
```

- [ ] **Step 4: Replace somatotype with actionable signal**

Remove user-facing `ectomorph`, `mesomorph`, and `endomorph`. Replace with a field such as:

```ts
bodyFatLevel: "bajo" | "medio" | "alto"
```

or a more actionable "punto de partida" field if the schema branch allows it.

- [ ] **Step 5: Add a micro-output after objective selection**

After the user selects a goal, show one short GENESIS message:

```txt
Entendido. Voy a priorizar músculo, postura y proporciones; no una transformación exagerada.
```

- [ ] **Step 6: Run checks**

```bash
pnpm test src/app/wizard/wizardLayout.test.ts
pnpm lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/wizard src/app/wizard/page.tsx
git commit -m "fix: align wizard inputs with plan personalization"
```

---

### Task 6: Reconcile 12 Weeks Versus 12 Months

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/config/landing/**`
- Modify: `src/components/TimelineNav.tsx`
- Modify: `src/components/CinematicViewer.tsx`
- Modify: `src/components/TransformationViewer.tsx`
- Modify only in a dedicated branch: `src/components/results/**`
- Modify only in a dedicated branch: `src/app/api/og/[shareId]/route.tsx`
- Modify docs: `docs/GEMINI.md`, `docs/RELEASE_CHECKLIST.md`

- [ ] **Step 1: Choose the product language**

Use:

```txt
12 semanas
Semana 4
Semana 8
Semana 12
```

Keep internal image keys as `m4`, `m8`, and `m12` for backward compatibility unless a separate data migration is approved.

- [ ] **Step 2: Replace public labels**

Replace public-facing:

```txt
MES 4
MES 8
MES 12
12 meses
```

with:

```txt
SEMANA 4
SEMANA 8
SEMANA 12
12 semanas
```

- [ ] **Step 3: Preserve old keys in data**

Do not rename Firestore asset keys in this task. Add a comment where necessary:

```ts
// Historical storage keys remain m4/m8/m12; UI presents them as weeks.
```

- [ ] **Step 4: Run copy scan**

```bash
rg -n "12 meses|12 MESES|MES 4|MES 8|MES 12|mes 4|mes 8|mes 12" src docs
```

Expected: only intentional migration notes or internal compatibility docs remain.

- [ ] **Step 5: Commit**

```bash
git add src docs
git commit -m "fix: align transformation promise to twelve weeks"
```

---

### Task 7: Keep GENESIS As The Only User-Facing AI Entity

**Files:**
- Modify: `src/components/genesis/AgentOrchestration.tsx`
- Modify: `src/components/genesis/DemoChat.tsx`
- Modify: `src/components/widgets/AgentBadge.tsx`
- Modify in stabilization branch only: `src/lib/genesis-demo/agents.ts`
- Test: `src/components/genesis/DemoChat.test.tsx`

- [ ] **Step 1: Define public labels**

Allowed public labels:

```txt
GENESIS
GENESIS · Entrenamiento
GENESIS · Nutrición
GENESIS · Recuperación
GENESIS · Hábitos
```

Forbidden public labels:

```txt
BLAZE
ATLAS
TEMPO
SAGE
MACRO
METABOL
WAVE
NOVA
LUNA
SPARK
STELLA
LOGOS
```

- [ ] **Step 2: Add a regression test**

In `DemoChat.test.tsx`, assert rendered text does not contain forbidden labels.

- [ ] **Step 3: Keep internal compatibility isolated**

If SSE still emits legacy module IDs, map them immediately to capability IDs at the boundary and never pass raw module names to rendered UI.

- [ ] **Step 4: Run grep check**

```bash
rg -n "BLAZE|ATLAS|TEMPO|SAGE|MACRO|METABOL|WAVE|NOVA|LUNA|SPARK|STELLA|LOGOS" src/components
```

Expected: either no matches or matches only in internal mapping constants with comments saying they are not rendered.

- [ ] **Step 5: Commit**

```bash
git add src/components/genesis src/components/widgets src/lib/genesis-demo/agents.ts
git commit -m "fix: hide legacy module names behind GENESIS capabilities"
```

---

### Task 8: Add Generated Image Share Scope

**Files:**
- Modify: `src/types/ai.ts`
- Modify: `src/lib/validators.ts`
- Modify: `src/app/api/sessions/[shareId]/route.ts`
- Modify: `src/app/api/sessions/[shareId]/urls/route.ts`
- Modify: `src/app/api/sessions/[shareId]/share-settings/route.ts`
- Modify: `src/app/s/[shareId]/page.tsx`
- Test: add route tests if existing harness supports it

- [ ] **Step 1: Extend share scope**

Add:

```ts
shareImages: boolean
```

Default:

```ts
false
```

- [ ] **Step 2: Enforce image visibility**

Public signed URLs for generated images should be omitted unless:

```ts
shareScope.shareImages === true
```

or the authenticated requester owns the session.

- [ ] **Step 3: Update user-facing copy**

Use:

```txt
Tus imágenes no son públicas. Puedes compartirlas cuando tú decidas.
```

- [ ] **Step 4: Run privacy tests**

Add assertions:

```ts
expect(publicSession.assets?.images).toEqual({});
expect(ownerSession.assets?.images?.m12).toBeTruthy();
```

- [ ] **Step 5: Commit**

```bash
git add src/types/ai.ts src/lib/validators.ts src/app/api/sessions src/app/s/[shareId]/page.tsx
git commit -m "fix: protect generated images behind share scope"
```

---

### Task 9: Harden Commercial Providers For Production

**Files:**
- Modify: `src/app/api/checkout/webhook/route.ts`
- Modify: `src/lib/mercadoPago.ts`
- Modify: `src/app/api/email/send/route.ts`
- Modify: `src/app/api/brief/send/route.ts`
- Modify: `src/proxy.ts`
- Modify: `.env.example`
- Test: `src/proxy.security.test.ts`

- [ ] **Step 1: Make Mercado Pago webhook secret mandatory in production**

If `NODE_ENV === "production"` and `MP_WEBHOOK_SECRET` is missing, return:

```ts
NextResponse.json({ error: "Webhook not configured" }, { status: 503 })
```

- [ ] **Step 2: Make checkout idempotency deterministic**

Use a stable key:

```ts
`${shareId}-${sku}`
```

or a persisted `checkoutIntentId`.

- [ ] **Step 3: Require real email sender**

Production email sender must come from:

```env
RESEND_FROM_EMAIL=GENESIS <genesis@ngxvision.app>
```

Do not fall back to `resend.dev` in production.

- [ ] **Step 4: Update CSP for actual providers**

Add only providers actually used:

```txt
https://calendly.com
https://www.youtube.com
https://player.vimeo.com
https://*.mercadopago.com
```

- [ ] **Step 5: Add CSP regression assertions**

In `src/proxy.security.test.ts`, assert `src/proxy.ts` includes the required provider domains when the corresponding feature is enabled.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/checkout src/lib/mercadoPago.ts src/app/api/email src/app/api/brief src/proxy.ts .env.example src/proxy.security.test.ts
git commit -m "fix: harden commercial provider configuration"
```

---

### Task 10: Clean Package Manager Drift And Build Gate

**Files:**
- Modify: `package.json`
- Delete: `package-lock.json`
- Keep: `pnpm-lock.yaml`
- Modify: `docs/RELEASE_CHECKLIST.md`

- [ ] **Step 1: Add package manager field**

Add to `package.json`:

```json
"packageManager": "pnpm@10.0.0"
```

Use the installed pnpm major version if local tooling reports a newer stable version.

- [ ] **Step 2: Remove npm lockfile**

Delete:

```txt
package-lock.json
```

- [ ] **Step 3: Run install/build/test gate**

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm test:smoke
```

Expected: all commands pass before beta.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml docs/RELEASE_CHECKLIST.md
git rm package-lock.json
git commit -m "chore: standardize package manager on pnpm"
```

---

### Task 11: Polish LandingStats Without Touching Protected Areas

**Files:**
- Modify: `src/components/landing/LandingStats.tsx`
- Optional Modify: `src/config/landing/copy/general.ts`
- Optional Modify: `src/config/landing/copy/jovenes.ts`
- Optional Modify: `src/config/landing/copy/mayores.ts`
- Test: visual QA screenshots

- [ ] **Step 1: Remove four identical card rhythm**

Replace the equal card grid with an editorial stats band:

```txt
One dominant stat on the left
Three compact proof points on the right
No nested cards
No ngx-metal-card
Use section-level banding and DS typography
```

- [ ] **Step 2: Preserve DS typography**

Use:

```txt
ngx-h2 for the section headline if needed
ngx-eyebrow-pill for context
United Sans condensed uppercase behavior via existing classes
```

- [ ] **Step 3: Give the section its own mood**

Use a restrained numeric/proof mood that does not duplicate the previous section:

```txt
dark base + violet rule + emerald/amber numeric accents
```

- [ ] **Step 4: Verify mobile**

Capture:

```txt
390x844 landing stats viewport
1440x900 landing stats viewport
```

Expected: no clipped numbers, no text overflow, no nested card look.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/LandingStats.tsx src/config/landing
git commit -m "style: refine landing stats section"
```

---

### Task 12: Mobile QA For Six New Landing Sections

**Files:**
- Modify only as needed: `src/components/landing/LandingProblem.tsx`
- Modify only as needed: `src/components/landing/LandingValueStack.tsx`
- Modify only as needed: `src/components/landing/LandingBridge.tsx`
- Modify only as needed: `src/components/landing/LandingCTA.tsx`
- Modify only as needed: `src/components/landing/LandingTrustStrip.tsx`
- Do not modify: `src/components/landing/LandingHero.tsx`
- Do not modify: `src/components/landing/LandingHowItWorks.tsx`
- Do not modify: `src/components/landing/LandingReportPreview.tsx`
- Do not modify: `src/components/landing/LandingFAQ.tsx`

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

Expected: local Next server starts.

- [ ] **Step 2: Capture mobile and desktop screenshots**

Use browser QA at:

```txt
http://localhost:3000
390x844
1440x900
```

- [ ] **Step 3: Check layout rules**

Validate:

```txt
No text overlap
No card-inside-card
No ngx-metal-card in editorial content
No one-note purple theme across adjacent sections
CTA remains tappable above sticky CTA
```

- [ ] **Step 4: Patch only failing sections**

Keep changes scoped to spacing, wrapping, responsive grid, and color balancing.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing
git commit -m "style: tighten mobile landing sections"
```

---

### Task 13: Add Restraint-Based Microinteractions

**Files:**
- Modify: `src/components/landing/ScrollAnimator.tsx`
- Modify only if needed: individual landing section components

- [ ] **Step 1: Audit current scroll animation behavior**

Confirm `animate-on-scroll` and `delay-*` classes do not cause content to be invisible when JavaScript is slow.

- [ ] **Step 2: Add subtle reveal rules**

Use:

```txt
opacity + translateY only
duration under 500ms
respect prefers-reduced-motion
no decorative orb/blob animations
```

- [ ] **Step 3: Add hover states only to interactive elements**

Buttons and links may lift or brighten. Static editorial blocks should not wiggle or pulse.

- [ ] **Step 4: Verify reduced motion**

Run a browser check with reduced motion enabled.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ScrollAnimator.tsx src/components/landing
git commit -m "style: refine landing scroll interactions"
```

---

### Task 14: Beta Release Gate

**Files:**
- Modify: `docs/RELEASE_CHECKLIST.md`
- Create: `docs/BETA_QA_PROTOCOL.md`

- [ ] **Step 1: Create beta protocol**

Create `docs/BETA_QA_PROTOCOL.md` with:

```md
# Beta QA Protocol

## Audience
25-50 controlled users. No cold ads.

## Manual Review Per Session
- Does m4 resemble the original user?
- Does m8 resemble the original user and differ from m4?
- Does m12 resemble the original user and differ from m8?
- Does the transformation feel plausible for 12 weeks?
- Does the diagnostic identify one clear bottleneck and one first leverage?
- Does the CTA path match intent: agenda, WhatsApp, checkout, or email brief?

## User Survey
1. ¿La imagen se parece a ti?
2. ¿La transformación se siente creíble?
3. ¿El diagnóstico te dio claridad?
4. ¿Qué harías después: agenda, WhatsApp, comprar, nada?
```

- [ ] **Step 2: Add smoke checklist**

Add to `docs/RELEASE_CHECKLIST.md`:

```txt
Landing -> wizard -> upload -> analyze -> generate 3 images -> result -> video -> Calendly -> WhatsApp -> checkout -> webhook -> email brief -> unsubscribe
```

- [ ] **Step 3: Run full gate**

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm test:smoke
```

- [ ] **Step 4: Commit**

```bash
git add docs/RELEASE_CHECKLIST.md docs/BETA_QA_PROTOCOL.md
git commit -m "docs: add beta qa protocol"
```

---

## Recommended Execution Order

1. Task 2: Preserve V2 identity payload.
2. Task 4: Remove analysis/generation race.
3. Task 3: Make image model selection unambiguous.
4. Task 5: Fix wizard availability and somatotype framing.
5. Task 6: Reconcile 12 weeks versus 12 months.
6. Task 7: Keep GENESIS as the only user-facing AI.
7. Task 9: Harden commercial providers.
8. Task 8: Add generated image share scope.
9. Task 10: Clean package manager drift.
10. Task 14: Beta gate.

Visual-only work can run in parallel after the current protected-file rule is confirmed:

1. Task 11: LandingStats.
2. Task 12: Mobile QA for six new sections.
3. Task 13: Microinteractions.

## Acceptance Criteria For Controlled Beta

- `pnpm build`, `pnpm lint`, `pnpm test`, and `pnpm test:smoke` pass.
- 5 internal golden-path sessions complete from upload to ready result.
- At least 4 of 5 internal sessions preserve recognizable identity across all generated milestones.
- No generated result uses public "12 months" copy unless explicitly justified in product copy.
- No user-facing UI renders legacy module names.
- Mercado Pago webhook rejects unsigned production calls.
- Email uses verified NGX sender domain.
- CSP does not block the configured video, Calendly, or Mercado Pago flow.
- Public share links do not expose generated images unless the user opted in.

