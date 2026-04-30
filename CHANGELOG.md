# Changelog

## v3.1 — Security Hardening & Infrastructure

### Rate Limiting & Security
- Distributed rate limiting via Upstash Redis (`rateLimit.ts`) — sliding window per IP/email.
- Content Security Policy (CSP) with nonce-based `script-src` and `strict-dynamic` in `middleware.ts`.
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- `requireAuth()` mandatory on `/api/analyze` and `/api/generate-images`.
- PII stripping on public `GET /api/sessions/[shareId]` (allowlisted fields only).
- Share scope system: `shareOriginal`, `shareInsights`, `shareProfile` per session.
- `acquireJobLock()` for atomic job concurrency in image generation.
- Delete token validation (`X-Delete-Token` header) for session deletion.

### Telemetry & Observability
- Funnel telemetry (`telemetry.ts`) tracking `wizard_start` through `cta_completed`.
- Events: `rateLimitBlocked`, `authFailed`, `spendLimitBlocked`, `jobLockDenied`.
- `/api/health` endpoint for uptime monitoring.

### Plan Generation
- 7-day personalized plan via `/api/generate-plan` with Gemini 2.5 Flash.
- Plan viewer (`/s/[shareId]/plan`) — Day 1 full, Days 2-7 blurred/locked.
- `ComparisonCTA` component: "Sin Agentes vs GENESIS" conversion table.

### Infrastructure
- Cleanup cron (`/api/cron/cleanup`) for expired sessions/orphaned assets.
- `/api/csp-report` endpoint for CSP violation reporting.
- `/api/sessions/[shareId]/private` for authenticated full-PII session data.
- `/api/sessions/[shareId]/share-settings` for share scope management.

---

## v3.0 — Genesis Experience

### 13 GENESIS Agents
- Agent orchestration grid with SSE-driven 3-phase animation (`AgentOrchestration`).
- Phase 1 (Analyzing): GENESIS, STELLA, LOGOS.
- Phase 2 (Designing): BLAZE, TEMPO, ATLAS, SAGE, MACRO, METABOL.
- Phase 3 (Personalizing): WAVE, SPARK, NOVA, LUNA.
- Agent config with names, colors, domains in `genesis-demo/agents.ts`.

### DemoChat
- Limited chat (5 interactions) with quick-action buttons (`DemoChat`).
- A2UI widget system: GlassCard, AgentBadge, ActionButton, ProgressBar, WorkoutCard, MealPlan, InsightCard, ChecklistWidget.
- `A2UIMediator` widget orchestrator for chat responses.

### API Endpoints
- `GET /api/genesis-demo` — SSE streaming for agent orchestration animation.
- `POST /api/genesis-chat` — DemoChat responses with A2UI widgets.
- `POST /api/genesis-voice` — Voice agent responses via ElevenLabs.

### Pages
- `/s/[shareId]/demo` — Genesis Experience demo page.
- `/s/[shareId]/plan` — Plan preview page.
- `/auth` — Firebase auth callback.
- `/dashboard` and `/dashboard/[shareId]` — User dashboard with session history.
- `/account` — Account settings.
- `/loading/[shareId]` — Loading experience with progress animation.

---

## v2.1 — Viral Optimization & Email Nurture

### Email Nurture Sequence
- D0-D7 automated email sequence (`emailScheduler.ts`).
- Templates: D0Results, D1Reminder, D3Plan, D7Conversion.
- `/api/email/sequence` and `/api/email/send` endpoints.

### Viral Components
- `DramaticReveal` — countdown + slow morph reveal (m0 through m12).
- `ShareToUnlockModal` — modal for share-to-unlock premium content.
- `SocialCounter` — weekly transformation counter with social proof.
- `AgentBridgeCTA` — contextual CTA with NGX agent selection.
- `ReferralCard` — referral code UI with copy functionality.

---

## v2.0 — Results 2.0 & Identity Chain

### Results 2.0
- `CinematicViewer` — fullscreen immersive results with Nike-style aesthetic.
- `CinematicAutoplay` — animated reveal sequence m0 through m12.
- `CompareSlider` — touch-friendly before/after comparison slider.
- `LetterFromFuture` — modal with typewriter animation for m12 motivational letter.
- `StatsDelta` — animated stats progression with delta indicators.
- `ChapterView` — detailed milestone view with hero, narrative, stats.
- `TransformationViewer2` — orchestrator for the full Results 2.0 experience.

### Identity Chain
- `user_visual_anchor` — immutable facial/physical trait description for identity preservation.
- `style_profile` — visual style parameters (lighting, wardrobe, background, color_grade).
- `promptBuilder.ts` — robust prompt constructor with Identity Lock.
- Reference chaining: m4 refs [original, styleRef], m8 refs [original, styleRef, m4], m12 refs [original, styleRef, m8].

### Quality Gates
- `qualityGates.ts` — output validation (face visible, single subject, no artifacts).
- Feature flags: `FF_IDENTITY_CHAIN`, `FF_QUALITY_GATES`, `FF_NB_PRO`.

### Viral Features
- Share-to-unlock flow (`/api/unlock`) with share_intent and request_unlock actions.
- Referral tracking (`/api/referral`) with visit, complete, claim, stats.
- Social pack generator (`/api/social-pack/[shareId]`) — story, post, square formats.
- OG split-screen image (`/api/og/[shareId]`) — HOY vs 12 MESES.

---

## 2025-09-22

### UI/Theme
- Integrado shadcn/ui v4 (button, input, textarea, card, progress, separator, tabs, select, tooltip, dialog).
- Tokens Tailwind v4 y mapa @theme inline (background/foreground/primary/secondary/accent/etc.).
- Tipografía Inter para títulos y texto (estilo minimal tech); pill buttons por defecto, Cards rounded-2xl.

### Resultados (rediseño Fase 1)
- Nuevo layout 3 columnas (sticky izquierda/derecha) y componentes modulares:
  - ImageViewer (tabs M0/M4/M8/M12, overlay on/off, guía on/off, minimap, miniaturas, descargar).
  - InsightsCard (insightsText en Card).
  - ActionsCard (email, copiar enlace, reservar, borrar con Dialog shadcn).
  - ProfileSummaryCard (perfil compacto).
- TimelineViewer migrado a Tabs shadcn y secciones en Cards.
- Demo Result usa el mismo layout para visualización inmediata.

### Wizard (polish)
- Dropzone rounded-2xl con glow y tokens; Inputs/Select/Progress con shadcn.
- Select migrado a Radix shadcn; botones estandarizados (pills, ring).

### Accesibilidad y UX
- Focus ring consistente (violeta), estados hover/active sutiles.
- Preparado para sincronización de tabs y deep-link en Fase 2.

---

## 2025-09-21
- Setup inicial (Next.js 15, Tailwind v4, Firebase, Gemini, estructura base, endpoints, validaciones).
