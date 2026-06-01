# Release Checklist — NGX Vision (v3.2 HYBRID)

> Auditoria de produccion/legal/comercial vigente: `docs/PRODUCTION_LAUNCH_AUDIT_2026-05-25.md`.

## Estado local verificado (Fase 5 — 2026-05-31)
- [x] `pnpm lint` (0 errores; 4 warnings de unused-vars, no bloquean)
- [x] `pnpm exec tsc --noEmit` (0 errores, repo completo incl. tests)
- [x] `pnpm test` (116/116 passing)
- [x] `pnpm build` (39 rutas) + CI verde en `main` (lint+tsc+build+test)
- [x] Smoke dev: `/`, `/wizard`, `/privacy`, `/s/demo?demo=1` → 200, voice agent + reveal renderizan

## BLOQUEADORES go-live (acciones en Vercel — el build de prod FALLA sin estos)
- [ ] `NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME` — guard `assertLegalConfigForProductionDeploy` bloquea deploy si falta
- [ ] `NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS`
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL`
- [ ] **Rotar `OPENAI_API_KEY`** (se compartió en chat durante el setup) + `NEXT_PUBLIC_FF_HYBRID_VOICE_AGENT=true`

## Mobile UX (Fase 2) — verificado
- [x] Dramatic reveal corre en superficie lead-magnet (gated en cadena m4/m8/m12 + ready)
- [x] Swipe entre hitos (clamp, ignora scroll vertical)
- [x] Ritmo de secciones uniforme (py-14 md:py-20); teaser de voz como acción hero
- [x] `prefers-reduced-motion` global vía `<MotionConfig reducedMotion="user">`
- [ ] Pase manual en dispositivo (iPhone + Android chico) antes de go-live

## Funnel intelligence (Fase 3) — verificado
- [x] `POST /api/sessions/[shareId]/classify` persiste `funnel.fitClassification` + track
- [x] Webhook `lead_classified` (n8n) + CTA segmentado (HYBRID / ASCEND / nurture)
- [ ] Confirmar que n8n recibe las 3 clasificaciones en staging

## Accesibilidad (Fase 5) — auditoría estática
- [x] Todos los `<img>` tienen `alt` (0 sin alt)
- [x] 38+ atributos aria/role en componentes; reduce-motion respetado globalmente
- [ ] Lighthouse mobile a11y ≥ 90 (correr con chrome-devtools cuando esté disponible)

## Video (Fase 4) — generar en Flow/Veo, ver `docs/VIDEO_PROMPTS_FLOW.md`
- [ ] `NEXT_PUBLIC_HYBRID_VIDEO_URL` + `NEXT_PUBLIC_HYBRID_VIDEO_POSTER`

> Los checks marcados abajo siguen pendientes de confirmación en producción/Vercel o requieren datos legales/comerciales externos.

## Seguridad y privacidad
- [ ] Revisar matriz final de produccion/legal/comercial
- [ ] `FF_DELETE_TOKEN_REQUIRED=true` en prod
- [ ] Clientes usan `X-Delete-Token` (no query params) para borrado
- [ ] `MAX_UPLOAD_BYTES` definido (tamaño máx de foto)
- [ ] `ALLOW_RATE_LIMIT_FALLBACK` solo si es estrictamente necesario
- [ ] `shareScope` respetado en endpoints públicos
- [ ] Reglas de Storage desplegadas (solo owner en `uploads/{uid}`, bloquear `sessions/**`)
- [ ] Consentimiento requerido en leads/remarketing (UI + API)
- [ ] Consentimiento requerido y persistido en la sesión principal (`terms` + `aiProcessing`)
- [ ] `marketingEmailOptIn` separado de consentimientos necesarios
- [ ] Política de Privacidad y Términos publicados
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` configurado para contacto legal
- [ ] `NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME` y `NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS` configurados

## Costos y límites
- [ ] `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- [ ] `GEMINI_DAILY_LIMIT_USD` / `GEMINI_HOURLY_LIMIT_USD`
- [ ] `AI_FLAG_CACHE_TTL_MS` razonable

## Infra / Health
- [ ] `/api/health` responde 200/207/503
- [ ] `/api/health` protegido con `X-Api-Key` (`CRON_API_KEY`) en prod
- [ ] Cron cleanup activo con `CRON_API_KEY`
- [ ] Índices Firestore creados (ver `docs/FIRESTORE_INDEXES.md`)

## Emails
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM` configurado
- [ ] `CRON_API_KEY` configurado para secuencias
- [ ] Links de baja (`/unsubscribe`) funcionan y se respetan en envíos

## Observabilidad
- [ ] Telemetría habilitada (`FF_TELEMETRY_ENABLED=true`)
- [ ] Alertas externas (Sentry/Logtail/Datadog) conectadas

## QA
- [ ] `pnpm test:auth` (si hay tokens)
- [ ] `pnpm test:smoke`
- [ ] Smoke manual de wizard y share
- [ ] Smoke manual de checkout/booking/WhatsApp segun canales activos
- [ ] Landing y CTAs alineados con auth-before-wizard (`/auth?next=/wizard`)
