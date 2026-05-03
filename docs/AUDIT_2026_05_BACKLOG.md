# Backlog accionable — Auditoría NGX Transform

**Fecha**: 2026-05-02
**Origen**: [AUDIT_2026_05.md](./AUDIT_2026_05.md)
**Total tickets**: 78 (16 P0, 36 P1, 26 P2)

---

## Cómo usar este backlog

- Cada ticket es **autocontenido**: contexto + archivos + criterio de aceptación + esfuerzo
- **Esfuerzo**: S (≤2h), M (2-8h), L (1-3 días), XL (>3 días)
- **ID**: `AUDIT-NNN` para referencia cruzada
- **Tier**: indica de qué auditoría viene (T0–T7), útil para volver al reporte
- Ordenado dentro de cada fase por (severidad, esfuerzo) — quick wins primero
- Branch sugerido por ticket: `fix/AUDIT-NNN-slug-corto`

---

## Roadmap propuesto

### Fase 1 — Pre-launch (bloqueantes, ~1-2 semanas)
**Cierre de los 15 P0** (incluyendo AUDIT-069 Identity Chain). No es razonable abrir tráfico real hasta resolver. Estimado: 50-70h ingeniero.

### Fase 2 — Mes 1 post-fix P0 (~3-4 semanas)
**Cierre de los 36 P1**. Profundiza seguridad, observabilidad, testing, refactors arquitectónicos críticos. Estimado: 100-140h ingeniero.

### Fase 3 — Trimestre 1 (~6-8 semanas)
**Cierre de los 27 P2**. Repository pattern, A/B real, CDN, structured logging, RSC migration. Estimado: 140-180h ingeniero.

**Total readiness pre-launch**: ~290-390h ingeniero (~7-10 semanas dedicadas a 1 dev).

---

## Vista rápida — Tabla maestra (top 40 por prioridad)

| ID | Sev | Tier | Título | Esfuerzo |
|---|---|---|---|---|
| AUDIT-001 | P0 | T0/T1 | Implementar middleware.ts con CSP/HSTS/headers | M |
| AUDIT-002 | P0 | T1 | Cerrar IDOR en `GET /api/sessions/[shareId]` | M |
| AUDIT-003 | P0 | T1 | Cerrar IDOR en `GET /api/sessions/[shareId]/private` | S |
| AUDIT-004 | P0 | T1 | Endurecer worker token en `/api/generate-images` | M |
| AUDIT-005 | P0 | T1 | Proteger `POST /api/email` (auth + rate limit + Zod) | S |
| AUDIT-006 | P0 | T1 | Firmar tokens en `/api/unsubscribe` + rate limit | M |
| AUDIT-007 | P0 | T3 | Integrar spendLimiter + aiKillSwitch en `genesis-voice` | S |
| AUDIT-008 | P0 | T1/T3 | Añadir 5 índices compuestos a `firestore.indexes.json` | S |
| AUDIT-009 | P0 | T0 | Resolver doble lockfile (declarar pnpm + borrar package-lock) | S |
| AUDIT-010 | P0 | T0 | Sincronizar `.env.local` desde `.env.example` (60 vars) | S |
| AUDIT-011 | P0 | T6 | Configurar cleanup cron en `vercel.json` | S |
| AUDIT-012 | P0 | T6 | Configurar 4 alertas mínimas (Sentry + Vercel) | M |
| AUDIT-013 | P0 | T6 | Crear `docs/RUNBOOK.md` con 5 escenarios | M |
| AUDIT-014 | P0 | T7 | Marcar/quitar sección "Security (v3.0)" falsa de CLAUDE.md | S |
| AUDIT-015 | P0 | T7 | Reescribir REPLICATION_GUIDE.md y STATUS_REPORT paths | S |
| AUDIT-016 | P1 | T1 | Proteger `POST /api/leads` (rate limit) | S |
| AUDIT-017 | P1 | T1 | Restringir CORS y rate-limit en `/api/csp-report` | S |
| AUDIT-018 | P1 | T1 | Auth + rate limit en `/api/unlock`, `/api/referral`, `/api/feedback` | M |
| AUDIT-019 | P1 | T1 | Paginar `/api/remarketing` (anti data dump) | S |
| AUDIT-020 | P1 | T1 | Endurecer `recordSpend(0.001)` en analyze | S |
| AUDIT-021 | P1 | T1 | Eliminar `src/proxy.ts` huérfano tras implementar middleware | S |
| AUDIT-022 | P1 | T1 | Validación MIME en `uploadBuffer()` (defensa en profundidad) | S |
| AUDIT-023 | P1 | T3 | Per-user spend caps en `spendLimiter.ts` | M |
| AUDIT-024 | P1 | T3 | Fix fail-mode asimétrico de `spendLimiter` | S |
| AUDIT-025 | P1 | T3 | Cap retry global en quality gates | S |
| AUDIT-026 | P1 | T3 | Añadir `runtime='nodejs'` a endpoints con firebase-admin | S |
| AUDIT-027 | P1 | T3 | Mitigar Upstash overflow (cachear sessions o upgrade) | M |
| AUDIT-028 | P1 | T3 | Validar tamaño de imagen antes de Sharp | S |
| AUDIT-029 | P1 | T0 | Bump `eslint-config-next` a v16 | S |
| AUDIT-030 | P1 | T4 | Hacer que CI corra `test:auth` (vía emulador Firebase) | M |
| AUDIT-031 | P1 | T4 | Crear workflow `smoke.yml` contra preview deployment | M |
| AUDIT-032 | P1 | T4 | Tests para spendLimiter + qualityGates | M |
| AUDIT-033 | P1 | T5 | Añadir tracking a `BookingCTA` | S |
| AUDIT-034 | P1 | T5 | Instrumentar telemetría en genesis-demo | S |
| AUDIT-035 | P1 | T5 | Resolver inconsistencia `FF_AGENT_BRIDGE_CTA` y `FF_NB_PRO` | S |
| AUDIT-036 | P1 | T5 | Implementar variant assignment estable (A/B base) | M |
| AUDIT-037 | P1 | T6 | Crear `sentry.edge.config.ts` | S |
| AUDIT-038 | P1 | T6 | Implementar `beforeSend` PII filter en Sentry | M |
| AUDIT-039 | P1 | T6 | Reemplazar `console.*` por logger estructurado (pino) | L |
| AUDIT-040 | P1 | T6 | Habilitar Firestore PITR | S |

_(continúa con AUDIT-041+ en sección "Tickets P1/P2 detallados")_

---

## Fase 1 — Pre-launch (P0 bloqueantes)

### AUDIT-001 [P0] Implementar middleware.ts con CSP/HSTS/headers
- **Origen**: T0.1 + T1.3 del reporte
- **Contexto**: el repo no tiene `middleware.ts`. CLAUDE.md afirma que sí lo tiene con CSP nonce-based, HSTS, X-Frame-Options, etc. — falso. La app responde sin ningún security header. Existe `src/proxy.ts` huérfano con CSP parcial nunca cargado.
- **Archivos afectados**:
  - Nuevo: `/middleware.ts` (root, NO `src/middleware.ts`)
  - Eventualmente: `src/proxy.ts` (eliminar, ver AUDIT-021)
  - `app/layout.tsx` (leer nonce desde headers)
- **Snippet de implementación**: ya diseñado en sección T1.3 del reporte (~150 líneas TypeScript con nonce 128-bit, CSP `'strict-dynamic'`, HSTS 2 años, Origin validation en `/api/*`)
- **Criterio de aceptación**:
  1. `curl -I https://app.url/` devuelve `Content-Security-Policy-Report-Only` (fase 1) o `Content-Security-Policy` (fase 2)
  2. Headers `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` presentes
  3. Cada request lleva un nonce único en `x-nonce` accesible vía `headers()` en RSC
  4. No regresiones en flow wizard → results → demo (test manual)
  5. Endpoint `/api/csp-report` recibe violaciones (validar 1-2 reportes en logs)
- **Rollout**:
  - Fase A (1 semana): `Content-Security-Policy-Report-Only` para detectar false positives
  - Fase B: cambiar a `Content-Security-Policy` enforce
- **Esfuerzo**: M (4-6h implementación + 1 semana monitoreo)

### AUDIT-002 [P0] Cerrar IDOR en `GET /api/sessions/[shareId]`
- **Origen**: T1.1-A
- **Contexto**: endpoint público que devuelve perfil + assets sin verificar ownership. Atacante itera shareIds y extrae datos de otros usuarios. El smoke test [tests/smoke.api.test.mjs:27-29](../tests/smoke.api.test.mjs) ya verifica que NO se exponga `photo`/`ai`/`input` — pero no corre en CI (ver AUDIT-031).
- **Archivos afectados**:
  - `src/app/api/sessions/[shareId]/route.ts` (handler GET)
  - `src/types/session.ts` (definir `PublicSessionView`)
- **Criterio de aceptación**:
  1. Respuesta solo incluye campos en allowlist explícita: `shareId`, `assets` (urls públicas), `createdAt`, `summary` curado, `shareScope`
  2. NUNCA incluye: `photo`, `ai.*`, `input.*`, `email`, `ownerUid`, `deleteToken`
  3. Test unitario que valida la allowlist (zod schema parse)
  4. `tests/smoke.api.test.mjs` actualizado y corriendo en CI (ver AUDIT-031)
  5. Considerar shareToken firmado (HMAC) para acceso, no solo shareId enumerable
- **Esfuerzo**: M (2-4h)

### AUDIT-003 [P0] Cerrar IDOR en `GET /api/sessions/[shareId]/private`
- **Origen**: T1.1-B
- **Contexto**: tiene `requireAuth()` pero el check de ownership (`session.ownerUid === auth.uid`) parece débil o ausente según el agente.
- **Archivos afectados**:
  - `src/app/api/sessions/[shareId]/private/route.ts` (línea ~42 — verificar exact)
- **Criterio de aceptación**:
  1. Si `session.ownerUid !== auth.uid` → `403 Forbidden`
  2. Si session no existe → `404 Not Found`
  3. Si no auth → `401 Unauthorized`
  4. `tests/auth.integration.test.mjs` (que ya prueba estos 3 casos) **corriendo en CI** (ver AUDIT-030)
- **Esfuerzo**: S (≤1h fix + integración CI separada)

### AUDIT-004 [P0] Endurecer worker token en `/api/generate-images`
- **Origen**: T1.1-C
- **Contexto**: `isWorkerRequest()` acepta token via `x-worker-token` header **o** `?workerToken=` query param. Sin expiry, sin scope a sessionId. Si se filtra (logs, screenshots), bypass total + AI spend ilimitado.
- **Archivos afectados**:
  - `src/app/api/generate-images/route.ts` (líneas ~65-72 y ~178)
  - `src/lib/workerAuth.ts` (nuevo, helper)
- **Criterio de aceptación**:
  1. **Rotar `AI_WORKER_TOKEN` actual** (P0 inmediato)
  2. Eliminar query param fallback — solo header `x-worker-token`
  3. Token incluye `iat` (issued at) + `sessionId` claim — verificar que coincida con request
  4. TTL corto (5 min) tras `iat`
  5. Logs server-side cuando worker request es rechazado (telemetry `auth_worker_rejected`)
- **Esfuerzo**: M (2-4h)

### AUDIT-005 [P0] Proteger `POST /api/email`
- **Origen**: T1.1-D
- **Contexto**: sin auth, sin Zod, sin rate limit. Atacante itera shareIds y dispara emails ilimitados (con costo Resend) a usuarios reales.
- **Archivos afectados**:
  - `src/app/api/email/route.ts`
  - `src/lib/validators.ts` (añadir `EmailRequestSchema`)
- **Criterio de aceptación**:
  1. `requireAuth()` aplicado
  2. Verificar `session.ownerUid === auth.uid` antes de enviar
  3. Zod schema valida `shareId`, `template` (enum), `customMessage?` (max 500 chars)
  4. Rate limit Upstash: 5 emails/hora por user
  5. Test integration: usuario A no puede enviar email a sesión de usuario B
- **Esfuerzo**: S (1-2h)

### AUDIT-006 [P0] Firmar tokens en `/api/unsubscribe` + rate limit
- **Origen**: T1.1-E
- **Contexto**: GET y POST aceptan `email` o `shareId` sin auth ni rate limit. Permite blind unsubscribe (atacante deshabilita marketing de cualquiera) y email enumeration via shareId.
- **Archivos afectados**:
  - `src/app/api/unsubscribe/route.ts`
  - `src/lib/unsubscribeToken.ts` (nuevo, HMAC sign/verify)
  - `src/emails/sequence/D*.tsx` (actualizar links de unsubscribe)
- **Criterio de aceptación**:
  1. Cada email enviado incluye link con `?token=<HMAC(email + emailId, SECRET)>`
  2. Endpoint valida HMAC antes de unsubscribe
  3. Rate limit: 10 requests/IP/hora
  4. Sin token válido → 401, no expone si el email existe o no
  5. POST y GET con misma protección
- **Esfuerzo**: M (3-4h, requiere migración de templates de email)

### AUDIT-007 [P0] Integrar spendLimiter + aiKillSwitch en `genesis-voice`
- **Origen**: T3.1-A
- **Contexto**: ElevenLabs TTS llama sin tracking. ~$0.04-0.05/usuario invisible al spendLimiter. A 1k users = $40-50/mes "fuera de los libros".
- **Archivos afectados**:
  - `src/app/api/genesis-voice/route.ts`
- **Criterio de aceptación**:
  1. `await checkSpendLimit(0.05, "elevenlabs")` antes de la llamada API
  2. `await recordSpend(0.05, "elevenlabs", { sessionId, voiceId })` después
  3. `await isAIKillSwitchEnabled()` retorna 503 si activo
  4. Health endpoint expone spend de ElevenLabs además de Gemini
- **Esfuerzo**: S (≤1h)

### AUDIT-008 [P0] Añadir 5 índices compuestos a Firestore
- **Origen**: T1.2-C + T3.2-A
- **Contexto**: queries compuestas sin índice declarado. Runtime "missing index" errors o fallback lento garantizado a escala.
- **Archivos afectados**:
  - `firestore.indexes.json`
- **Índices a añadir**:
  ```json
  {
    "indexes": [
      { "collectionGroup": "sessions", "queryScope": "COLLECTION",
        "fields": [
          {"fieldPath": "ownerUid", "order": "ASCENDING"},
          {"fieldPath": "createdAt", "order": "DESCENDING"}
        ]},
      { "collectionGroup": "sessions", "queryScope": "COLLECTION",
        "fields": [
          {"fieldPath": "status", "order": "ASCENDING"},
          {"fieldPath": "generatedAt", "order": "ASCENDING"}
        ]},
      { "collectionGroup": "sessions", "queryScope": "COLLECTION",
        "fields": [
          {"fieldPath": "createdAt", "order": "ASCENDING"},
          {"fieldPath": "status", "arrayConfig": "CONTAINS"}
        ]},
      { "collectionGroup": "email_sequences", "queryScope": "COLLECTION",
        "fields": [
          {"fieldPath": "status", "order": "ASCENDING"},
          {"fieldPath": "nextSend", "order": "ASCENDING"}
        ]},
      { "collectionGroup": "referrals", "queryScope": "COLLECTION",
        "fields": [
          {"fieldPath": "inviteeId", "order": "ASCENDING"},
          {"fieldPath": "completedAt", "order": "ASCENDING"}
        ]}
    ]
  }
  ```
- **Criterio de aceptación**:
  1. `firebase deploy --only firestore:indexes` exitoso
  2. Status "Building" → "Enabled" en Firebase Console
  3. Verificar que las 5 queries no logueen `FAILED_PRECONDITION` errors
- **Esfuerzo**: S (15 min código + 5-30 min build de índices en Firebase)

### AUDIT-009 [P0] Resolver doble lockfile
- **Origen**: T0.2
- **Contexto**: `pnpm-lock.yaml` (371KB) + `package-lock.json` (403KB) coexisten. Sin `packageManager` field. Cualquier `npm install` accidental rompe builds reproducibles.
- **Archivos afectados**:
  - `package.json` (añadir `packageManager` y `engines`)
  - Borrar `package-lock.json`
  - `.gitignore` (añadir `package-lock.json`)
- **Criterio de aceptación**:
  ```json
  // package.json
  "packageManager": "pnpm@10.x.y",
  "engines": { "node": "22.x", "pnpm": ">=10" }
  ```
  1. `package-lock.json` borrado y gitignored
  2. `pnpm install --frozen-lockfile` exitoso en local y CI
  3. README actualizado con `corepack enable` o instrucciones pnpm
- **Esfuerzo**: S (15 min)

### AUDIT-010 [P0] Sincronizar `.env.local` desde `.env.example`
- **Origen**: T0.3
- **Contexto**: 60 vars de las 77 documentadas faltan en `.env.local`. Dev local diverge de prod, bugs prod no se reproducen.
- **Archivos afectados**:
  - `/.env.local` (regenerar)
- **Criterio de aceptación**:
  1. `comm -23 <(env_example_keys) <(env_local_keys)` devuelve vacío
  2. Vars críticas con valores reales (no placeholders): `CRON_API_KEY`, `AI_WORKER_TOKEN`, `ELEVENLABS_API_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_*`, todos los `FF_*`
  3. `pnpm dev` arranca sin warnings de "missing env var"
- **Esfuerzo**: S (15-30 min)

### AUDIT-011 [P0] Configurar cleanup cron en vercel.json
- **Origen**: T6.6-B + T3.2-D
- **Contexto**: `src/app/api/cron/cleanup/route.ts` implementado correctamente pero **nunca se dispara**. Sessions crecen unbounded después de SESSION_TTL_DAYS (30).
- **Archivos afectados**:
  - `vercel.json`
- **Criterio de aceptación**:
  ```json
  {
    "crons": [
      { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }
    ]
  }
  ```
  1. Cron schedule visible en Vercel dashboard
  2. Primer run logueado en `/api/health` o telemetría
  3. Sessions con `createdAt < 30 days` y status terminal son borradas
  4. Endpoint requiere `Authorization: Bearer ${CRON_API_KEY}` (verificar no permitir invocación pública)
- **Esfuerzo**: S (15 min config + 1 día observación)

### AUDIT-012 [P0] Configurar 4 alertas mínimas
- **Origen**: T6.5-A
- **Contexto**: cero alertas. Si Gemini se cae a 2am, nadie se entera. Si spend llega a 80%, no notifica.
- **Setup**:
  - **Sentry alert 1**: error rate > 1% en 5 min → email + Slack
  - **Sentry alert 2**: nueva error de tipo `SpendLimitExceeded` → email
  - **Vercel alert**: deployment failure → email
  - **Custom webhook**: aiKillSwitch state change → POST a Slack/Discord
- **Archivos afectados**:
  - `src/lib/aiKillSwitch.ts` (notificación al cambiar)
  - `src/lib/spendLimiter.ts` (emit Sentry event al 80%)
  - Sentry/Vercel dashboard config (no es código, es ops)
- **Criterio de aceptación**: validar cada alerta disparando el escenario
- **Esfuerzo**: M (3-4h, mayoría config en dashboards)

### AUDIT-013 [P0] Crear docs/RUNBOOK.md
- **Origen**: T6.6-A
- **Contexto**: ningún operador sabe qué hacer cuando algo se rompe.
- **Archivos afectados**:
  - Nuevo: `docs/RUNBOOK.md`
- **Contenido mínimo (5 escenarios)**:
  1. **Gemini quota exhausted**: cómo detectar (health endpoint), mitigación (aiKillSwitch ON), comunicación a usuarios
  2. **Firebase rate limited**: cómo detectar, fallback a queue, recuperación
  3. **Cleanup cron failed**: cómo verificar (`/api/health`), reintento manual, escalación si Firestore lleno
  4. **Sentry quota exceeded**: backup observability (Vercel logs), procedimiento de upgrade
  5. **AI spend > daily limit**: aiKillSwitch automático, bypass manual con justificación, postmortem
- **Criterio de aceptación**:
  1. Cada escenario tiene: detección, mitigación, recovery, comunicación
  2. Linkado desde RELEASE_CHECKLIST.md y CLAUDE.md
  3. Validado con dry-run de 1-2 escenarios
- **Esfuerzo**: M (3-4h escritura)

### AUDIT-014 [P0] Sincronizar CLAUDE.md con realidad de seguridad
- **Origen**: T7.3 (cross-ref T0.1)
- **Contexto**: sección "Security (v3.0)" describe middleware/CSP/HSTS que no existen. Engaña a devs y agentes IA que la leen como SSOT.
- **Archivos afectados**:
  - `CLAUDE.md`
- **Criterio de aceptación**:
  1. Hasta que AUDIT-001 se merge: marcar la sección con header `> ⚠️ DISEÑO OBJETIVO — no implementado a 2026-05-02. Ver AUDIT-001.`
  2. Una vez AUDIT-001 mergeado: verificar que cada afirmación coincide con el middleware real (check items uno por uno)
  3. Eliminar `src/middleware.ts` references (era falso) y reemplazar con `/middleware.ts` (root)
- **Esfuerzo**: S (30 min ahora + 30 min después del merge de middleware)

### AUDIT-015 [P0] Reescribir REPLICATION_GUIDE + STATUS_REPORT paths
- **Origen**: T7.1 + T7.2
- **Contexto**: ambos hacen referencia a `/Users/aldoolivas/APP_NANO_NGX/app` que no existe en este repo. Cualquier dev nuevo siguiendo la guía falla en el primer comando.
- **Archivos afectados**:
  - `REPLICATION_GUIDE.md`
  - `STATUS_REPORT.md`
- **Criterio de aceptación**:
  1. Reemplazar todos los `/Users/aldoolivas/APP_NANO_NGX/app` por `<your-repo-root>` (path agnóstico)
  2. Eliminar referencias a subcarpeta `app/` (no existe)
  3. Validar que `git clone` + seguir la guía produce un dev environment funcional
- **Esfuerzo**: S (30-45 min)

---

## Fase 2 — Mes 1 (P1)

### AUDIT-016 [P1] Rate limit `POST /api/leads`
- **Origen**: T1.1-F
- **Archivos**: `src/app/api/leads/route.ts`
- **Aceptación**: rate limit Upstash 10/hora/IP y 3/día/email; Zod schema con consent obligatorio (ya existe LeadSchema en validators); telemetry event `lead_blocked_ratelimit`
- **Esfuerzo**: S

### AUDIT-017 [P1] CSP report endpoint hardening
- **Origen**: T1.1-F
- **Archivos**: `src/app/api/csp-report/route.ts`
- **Aceptación**:
  1. Eliminar `Access-Control-Allow-Origin: *` — restringir a own origin (`https://transform.ngxgenesis.com`)
  2. Rate limit 100/hora/IP
  3. Reportes inválidos (no son JSON CSP) → 400, no 500
  4. Limit body size 10KB
- **Esfuerzo**: S

### AUDIT-018 [P1] Auth + rate limit en `/api/unlock`, `/api/referral`, `/api/feedback`
- **Origen**: T1.1-F
- **Archivos**:
  - `src/app/api/unlock/route.ts`
  - `src/app/api/referral/route.ts`
  - `src/app/api/feedback/route.ts`
- **Aceptación**: cada endpoint requiere ownership de shareId (auth o token firmado); rate limit por IP+shareId; tests para abuso
- **Esfuerzo**: M (2-4h)

### AUDIT-019 [P1] Paginar `/api/remarketing` GET
- **Origen**: T1.1-G
- **Archivos**: `src/app/api/remarketing/route.ts`
- **Aceptación**: query params `limit` (default 100, max 500) y `cursor`; respuesta incluye `nextCursor`; CRON_API_KEY required (ya está)
- **Esfuerzo**: S

### AUDIT-020 [P1] Cost estimate más realista en analyze
- **Origen**: T1.1-G + T3
- **Contexto**: `recordSpend(0.001)` permite ~1M análisis "gratis" antes de bloqueo
- **Archivos**: `src/app/api/analyze/route.ts`
- **Aceptación**: estimar tokens reales (input + output) y multiplicar por rate Gemini Flash; min $0.0005 si no se puede calcular
- **Esfuerzo**: S

### AUDIT-021 [P1] Eliminar `src/proxy.ts` huérfano
- **Origen**: T1.3-B
- **Aceptación**: tras merge de AUDIT-001, borrar archivo; verificar no se importa de ningún lado con `grep -r "from.*proxy"`
- **Esfuerzo**: S

### AUDIT-022 [P1] Validación MIME server-side en `uploadBuffer()`
- **Origen**: T1.2-D
- **Archivos**: `src/lib/storage.ts`
- **Aceptación**: usar `file-type` lib (o magic-bytes manual) sobre el buffer antes de subir; rechazar si no es image/png|jpeg|webp; defensa en profundidad sobre storage.rules
- **Esfuerzo**: S

### AUDIT-023 [P1] Per-user spend caps
- **Origen**: T3.1-B
- **Archivos**: `src/lib/spendLimiter.ts`
- **Aceptación**: nuevos buckets `userId+date` ($0.50/día) y `userId+hour` ($0.10/hora) además de los globales; tests de race conditions
- **Esfuerzo**: M (4-6h)

### AUDIT-024 [P1] Fix fail-mode asimétrico spendLimiter
- **Origen**: T3.1-C
- **Archivos**: `src/lib/spendLimiter.ts`
- **Aceptación**: en prod fail-closed con cache Redis (TTL 5 min) como fallback antes de fail; nunca fail-open en prod (error claro al usuario "service degraded, retry in X")
- **Esfuerzo**: S

### AUDIT-025 [P1] Cap retry global en quality gates
- **Origen**: T3.1-D
- **Archivos**: `src/lib/qualityGates.ts`, `src/app/api/generate-images/route.ts`
- **Aceptación**: budget total 3 retries/sesión (en lugar de 2/step); si se agota, devolver imagen "best-effort" o placeholder y notificar telemetry `qa_budget_exhausted`
- **Esfuerzo**: S

### AUDIT-026 [P1] Añadir runtime='nodejs' explícito
- **Origen**: T3.2-A
- **Archivos**: todos los endpoints en `src/app/api/` que importen `firebase-admin`
- **Aceptación**: `export const runtime = 'nodejs'` en cada uno; verificar con `grep "runtime" src/app/api/**/route.ts`
- **Esfuerzo**: S

### AUDIT-027 [P1] Mitigar Upstash overflow proyectado
- **Origen**: T3.2-B
- **Decisión necesaria**: (a) upgrade Pro tier ($10/mes) o (b) cachear `sessions/{shareId}` 60s en Redis para reducir Firestore reads
- **Recomendado**: (b) — añade caching útil + reduce Upstash ops simultáneamente
- **Esfuerzo**: M (3-4h opción b)

### AUDIT-028 [P1] Validar tamaño imagen antes de Sharp
- **Origen**: T3.2-C
- **Archivos**: `src/app/api/generate-images/route.ts`
- **Aceptación**: si buffer > 10MB, redimensionar antes con `sharp().resize({ width: 2048, withoutEnlargement: true })`; previene OOM
- **Esfuerzo**: S

### AUDIT-029 [P1] Bump eslint-config-next a v16
- **Origen**: T0.5
- **Archivos**: `package.json`
- **Aceptación**: `pnpm up eslint-config-next@^16`; correr `pnpm lint` y arreglar nuevas reglas (probablemente cero o mínimas)
- **Esfuerzo**: S

### AUDIT-030 [P1] CI corre `test:auth` con emulador Firebase
- **Origen**: T4.2 + T0.6
- **Archivos**:
  - `.github/workflows/ci.yml`
  - Posible: convertir `tests/auth.integration.test.mjs` a vitest contra emulador
- **Aceptación**: CI step "Auth Integration" usa Firebase Local Emulator Suite + tests de IDOR pasan automáticamente
- **Esfuerzo**: M (4-6h, primer setup de emulador en CI)

### AUDIT-031 [P1] Crear workflow smoke.yml contra preview deployment
- **Origen**: T4.2
- **Archivos**: nuevo `.github/workflows/smoke.yml`
- **Aceptación**: trigger en `deployment_status` de Vercel; corre `pnpm test:smoke` con `TEST_BASE_URL=<preview-url>`; falla PR si smoke falla
- **Esfuerzo**: M (3-4h)

### AUDIT-032 [P1] Tests para spendLimiter + qualityGates
- **Origen**: T4.1
- **Archivos**: nuevos `src/lib/spendLimiter.test.ts`, `src/lib/qualityGates.test.ts`
- **Aceptación**: cobertura de race conditions, fail-modes, retry budgets
- **Esfuerzo**: M (4-6h)

### AUDIT-033 [P1] Tracking en BookingCTA
- **Origen**: T5.1-B
- **Archivos**: `src/components/BookingCTA.tsx`
- **Aceptación**: `onClick` emite `cta_clicked` con `{ source: 'booking', shareId }` antes de abrir Calendly
- **Esfuerzo**: S (3 líneas + test)

### AUDIT-034 [P1] Telemetría en genesis-demo
- **Origen**: T5.3-A
- **Archivos**: `src/app/s/[shareId]/demo/page.tsx`, `src/components/genesis/DemoChat.tsx`
- **Aceptación**: emit `demo_started` (mount), `demo_message_sent` (cada interacción), `demo_completed` (al llegar a 5/5), `demo_abandoned` (unmount sin completar)
- **Esfuerzo**: S

### AUDIT-035 [P1] Resolver inconsistencias FF en docs
- **Origen**: T5.2-B + T5.2-D
- **Archivos**: `.env.example`, `CLAUDE.md`, `GEMINI.md`
- **Aceptación**: tabla única de defaults consensuada; los 3 archivos coinciden; código respeta los defaults documentados
- **Esfuerzo**: S

### AUDIT-036 [P1] Variant assignment estable (A/B base)
- **Origen**: T5.2-C + T5.4-A
- **Archivos**: nuevo `src/lib/variants.ts`, integrar en componentes con flags
- **Aceptación**: función `getVariant(shareId, flagName): 'A' | 'B'` con `hash(shareId + flagName) % 2`; estable entre sesiones; permite gradual rollout (% configurable)
- **Esfuerzo**: M (3-4h)

### AUDIT-037 [P1] Crear sentry.edge.config.ts
- **Origen**: T6.1-B
- **Archivos**: nuevo `sentry.edge.config.ts`
- **Aceptación**: misma config que `sentry.server.config.ts`; verificar que OG image errors aparecen en Sentry
- **Esfuerzo**: S

### AUDIT-038 [P1] Sentry beforeSend PII filter
- **Origen**: T6.1-C + T6.8-C
- **Archivos**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **Aceptación**:
  ```ts
  beforeSend(event) {
    // redact emails, photoPath, biometric data
    if (event.request?.data) { /* deep clean */ }
    return event;
  }
  ```
  Validar con test que un event con email en body llega a Sentry sin email
- **Esfuerzo**: M (3-4h escritura + tests)

### AUDIT-039 [P1] Logger estructurado (pino)
- **Origen**: T6.3-A
- **Archivos**: nuevo `src/lib/logger.ts`; reemplazar `console.*` en 30+ archivos
- **Aceptación**: pino con JSON output; logger.info/warn/error/debug; reemplazos automated via codemod (jscodeshift)
- **Esfuerzo**: L (1-2 días)

### AUDIT-040 [P1] Habilitar Firestore PITR
- **Origen**: T6.6-C
- **Aceptación**: PITR habilitado en Firebase Console (paid feature ~$0.18/GB/month); documentar en RUNBOOK
- **Esfuerzo**: S (5 min UI + decisión de costo)

### AUDIT-041 [P1] Documentar AI kill switch en RUNBOOK
- **Origen**: T6.6-D
- **Archivos**: `docs/RUNBOOK.md` (nuevo, ver AUDIT-013)
- **Aceptación**: sección "How to disable AI generation" con paso-a-paso para activar manualmente vía Firestore Console
- **Esfuerzo**: S (incluido en AUDIT-013)

### AUDIT-042 [P1] Cookie consent banner
- **Origen**: T6.8-A
- **Archivos**: nuevo componente `src/components/ConsentBanner.tsx`; persistir choice en localStorage
- **Aceptación**: 3 niveles (necessary / analytics / marketing); telemetry respeta `analytics: false`; enlace a `/privacy`
- **Esfuerzo**: M (4-6h)

### AUDIT-043 [P1] Routing de privacy/terms
- **Origen**: T6.8-B
- **Archivos**: `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` (verificar si ya existen — CLAUDE.md las menciona)
- **Aceptación**: rutas accesibles en runtime, contenido renderizado, links desde footer
- **Esfuerzo**: S si ya existen como Markdown, M si hay que crearlas

### AUDIT-044 [P1] SSOT de versionado
- **Origen**: T7.4
- **Archivos**: `CLAUDE.md`, `STATUS_REPORT.md`, `docs/AGENTS.md`
- **Aceptación**: añadir tabla de versiones a CLAUDE.md (Producto, Doctrina, Stack); referenciar desde otros docs en lugar de duplicar
- **Esfuerzo**: S

### AUDIT-045 [P1] CLAUDE.md API Routes actualizada
- **Origen**: T7.5
- **Aceptación**: comando `find src/app/api -name route.ts` produce la tabla; verificar D5/D10/D14, telemetry, feedback presentes
- **Esfuerzo**: S

### AUDIT-046 [P1] docs/FEATURE_FLAGS.md como SSOT
- **Origen**: T7.6
- **Archivos**: nuevo `docs/FEATURE_FLAGS.md`
- **Aceptación**: tabla con `Flag | Default | Owner | Status (kill/keep/AB) | Notas`; CLAUDE.md/GEMINI.md/RELEASE_CHECKLIST referencian esto
- **Esfuerzo**: M (2-3h)

---

## Fase 3 — Trimestre 1 (P2)

### AUDIT-047 [P2] Coverage instrumentada en vitest
- **Origen**: T4.3
- **Aceptación**: `pnpm test --coverage` produce reporte HTML; threshold 10% inicial; meta 50% en Q3
- **Esfuerzo**: S

### AUDIT-048 [P2] Tests de componentes React
- **Origen**: T4.4
- **Aceptación**: vitest-environment-jsdom + Testing Library; tests para los 10 componentes más grandes
- **Esfuerzo**: L (1-2 días setup + ongoing)

### AUDIT-049 [P2] Playwright E2E (happy path)
- **Origen**: T4.5
- **Aceptación**: 5-10 tests cubriendo wizard → results → demo → plan → CTA; corre en CI contra preview
- **Esfuerzo**: L (2-3 días)

### AUDIT-050 [P2] CDN delante de Firebase Storage
- **Origen**: T3.2-E
- **Aceptación**: evaluar Cloud CDN o Vercel proxy; egress reducido al menos 30% (medido)
- **Esfuerzo**: M (4-6h investigation + setup)

### AUDIT-051 [P2] EventSource cleanup en componentes
- **Origen**: T3.2-F
- **Archivos**: `src/components/genesis/AgentOrchestration.tsx:127`
- **Aceptación**: `useEffect` cleanup `() => eventSource.close()`; auditar otros componentes con SSE
- **Esfuerzo**: S

### AUDIT-052 [P2] Persistir cache genesis-voice
- **Origen**: T3.1-E
- **Aceptación**: cache en Upstash con TTL 7 días; key = `voice:${hash(sessionId+'intro')}`; cache hit rate >80%
- **Esfuerzo**: M

### AUDIT-053 [P2] Latency monitoring en /api/health
- **Origen**: T6.2-B
- **Aceptación**: respuesta JSON incluye `{ services: { firestore: { latency_ms }, redis: { latency_ms }, gemini: { latency_ms }}}`
- **Esfuerzo**: S

### AUDIT-054 [P2] Gemini check real en health
- **Origen**: T6.2-C
- **Aceptación**: hacer una llamada ligera a Gemini (e.g. listar modelos) y reportar status real
- **Esfuerzo**: S

### AUDIT-055 [P2] Auth en health en dev
- **Origen**: T6.2-D
- **Aceptación**: requerir CRON_API_KEY también en dev; documentar token de dev en README
- **Esfuerzo**: S

### AUDIT-056 [P2] Correlation IDs en logs
- **Origen**: T6.3-B
- **Aceptación**: middleware genera `x-request-id`, propagado a logger context y a respuesta
- **Esfuerzo**: M (incluido si se hace junto con AUDIT-039)

### AUDIT-057 [P2] Métricas funnel en PostHog
- **Origen**: T6.4-A
- **Aceptación**: dashboard PostHog con conversion rate por stage del wizard
- **Esfuerzo**: M (3-4h setup)

### AUDIT-058 [P2] SLOs runtime + alertas
- **Origen**: T6.7-B
- **Aceptación**: definir SLOs (analyze p95 < 8s, image-gen p95 < 15s); Sentry alerts cuando se violan
- **Esfuerzo**: M

### AUDIT-059 [P2] Validación size en client antes de upload
- **Origen**: T6.7-C
- **Archivos**: `src/app/wizard/page.tsx`
- **Aceptación**: si `File.size > MAX_UPLOAD_BYTES`, mostrar error UX antes de POST
- **Esfuerzo**: S

### AUDIT-060 [P2] Endpoint de data export (GDPR Art. 20)
- **Origen**: T6.8-D
- **Aceptación**: `GET /api/user/export` (auth required) devuelve ZIP con sessions JSON + photos del user
- **Esfuerzo**: M

### AUDIT-061 [P2] Limpieza de branches abandonadas
- **Origen**: T0.7
- **Aceptación**: borrar `infra-ci-cleanup` (mergeada); decidir destino de `codex/ngx-v3-2-hybrid-launch`, `infra-ci-sentry-vitest`, `revert-my-sprints`, `sprint-2-readiness-hybrid`, `sprint-trust-compliance` (cherry-pick si tienen valor o borrar); borrar `origin/checkpoint/launch-readiness`
- **Esfuerzo**: S (necesita validar antes de borrar)

### AUDIT-062 [P2] Archivar PLAN.md
- **Origen**: T7.7
- **Aceptación**: mover a `docs/_archive/PLAN_2026-02.md`; consolidar items pendientes a RELEASE_CHECKLIST.md
- **Esfuerzo**: S

### AUDIT-063 [P2] README detallar deps externas
- **Origen**: T7.8
- **Aceptación**: sección "Required external services" con: Firebase, Upstash, Resend, ElevenLabs, Sentry; links de signup
- **Esfuerzo**: S

### AUDIT-064 [P2] N8N_WEBHOOKS.md link a implementación
- **Origen**: T7.9
- **Aceptación**: añadir sección "Implementación" con paths a `sendN8NWebhook()` en src/lib
- **Esfuerzo**: S

### AUDIT-065 [P2] Error pages personalizadas
- **Origen**: T5.1-C
- **Archivos**: nuevos `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`
- **Aceptación**: branding NGX, CTA de retorno a home, telemetry `error_page_viewed`
- **Esfuerzo**: S

### AUDIT-066 [P2] Email open/click tracking via Resend webhooks
- **Origen**: T5.3-B
- **Aceptación**: nuevo endpoint `/api/email/webhook` (firma verificada), emite `email_opened` / `email_clicked`
- **Esfuerzo**: M

### AUDIT-067 [P2] Track time_spent en results
- **Origen**: T5.3-C
- **Aceptación**: emit `results_dwell` al unmount con duración
- **Esfuerzo**: S

### AUDIT-068 [P2] Refactor ESLint con reglas de seguridad
- **Origen**: T0.4
- **Aceptación**: añadir `eslint-plugin-security`, `eslint-plugin-no-secrets`; resolver findings
- **Esfuerzo**: M

---

## Sección extra — T2 Arquitectura

### AUDIT-069 [P0] Resolver TODO bloqueante de Identity Chain
- **Origen**: T2.3-A
- **Contexto**: TODO `// [P1] Investigar fallo en generación de imágenes Identity Chain.` aparece duplicado en 2 archivos. Identity Chain es **el feature core** del producto — si está roto hay face drift entre m4/m8/m12 (catastrófico para virality del producto).
- **Archivos afectados**:
  - `src/app/api/generate-images/route.ts`
  - `src/lib/nanobanana.ts`
- **Criterio de aceptación**:
  1. Investigar root cause del fallo (revisar logs de las últimas 50 generaciones, identificar patrón)
  2. Implementar fix o documentar workaround si no es resoluble
  3. Si es feature flag de Gemini, ajustar `FF_IDENTITY_CHAIN`
  4. Eliminar el TODO de ambos archivos (si se resuelve) o consolidar en uno solo (si se posterga)
  5. Test e2e que valide consistencia facial m4 vs original (cosine similarity >0.85)
- **Esfuerzo**: M-L (depende de root cause, 1-2 días)
- **Bloquea**: ningún release público sin validar este feature

### AUDIT-070 [P1] Refactor AgentOrchestration en custom hook
- **Origen**: T2.1-A
- **Contexto**: 465 LOC con 4 responsabilidades + race condition en `setAgentStates` dentro de `setProgress` callback.
- **Archivos afectados**:
  - `src/components/genesis/AgentOrchestration.tsx`
  - Nuevo: `src/hooks/useAgentOrchestration.ts`
- **Criterio de aceptación**:
  1. Hook devuelve `{ states, progress, currentPhase, isComplete, hasError }`
  2. Componente reduce a <250 LOC, solo render
  3. Eliminar race condition (usar functional setState o reducer)
  4. EventSource cleanup robusto
- **Esfuerzo**: M (4-6h)

### AUDIT-071 [P2] DemoChat AbortController + magic number
- **Origen**: T2.1-B
- **Archivos**: `src/components/genesis/DemoChat.tsx` líneas 154-159, 224-240
- **Aceptación**: setTimeout reemplazados por AbortController con cleanup; constante `MIN_REMAINING_MESSAGES = 1` extraída
- **Esfuerzo**: S

### AUDIT-072 [P1] Migrar 8 pages a RSC
- **Origen**: T2.2-A
- **Archivos**:
  - `src/app/auth/page.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/app/account/page.tsx`
  - `src/app/s/[shareId]/page.tsx`
  - + 4 más identificadas en revisión
- **Aceptación**: pages son RSC; client logic encapsulada en componentes hijos con `"use client"`; bundle JS reducido (medir Lighthouse antes/después)
- **Esfuerzo**: M (4-6h)

### AUDIT-073 [P1] Centralizar extractors AI
- **Origen**: T2.3-B
- **Archivos**:
  - Nuevo: `src/lib/analysis/extractors.ts`
  - Refactorizar: `src/lib/promptBuilder.ts`, `src/lib/gemini.ts`
- **Aceptación**: `extractVisualAnchor()`, `extractStyleProfile()`, etc. en un solo módulo; ambos archivos lo importan; tests cubren extractors
- **Esfuerzo**: M (3-4h)

### AUDIT-074 [P1] Refactor buildImagePrompt en strategies
- **Origen**: T2.3-D
- **Archivos**: `src/lib/promptBuilder.ts`
- **Aceptación**: extraer `strategyByGoal()`, `strategyByLevel()`, `strategyByBodyType()`, `strategyByFocusZone()`; función principal <50 LOC; cada strategy testeable independientemente
- **Esfuerzo**: M (3-5h)

### AUDIT-075 [P2] Zod parse en jobManager
- **Origen**: T2.3-C
- **Archivos**: `src/lib/jobManager.ts:76`
- **Aceptación**: `JobStateSchema.safeParse(snap.data())` antes del cast; error claro si schema diverge; test que simula schema antiguo
- **Esfuerzo**: S

### AUDIT-076 [P2] Type narrowing en SessionViewer data
- **Origen**: T2.4-B
- **Archivos**: `src/app/s/[shareId]/page.tsx`
- **Aceptación**: eliminar `(viewerData as any).updatedAt`; definir `ViewerData` con `updatedAt` opcional o requerido según realidad
- **Esfuerzo**: S

### AUDIT-077 [P2] Repository pattern Firebase
- **Origen**: T2.7-A
- **Archivos**: nuevos en `src/lib/repositories/`: `sessionRepository.ts`, `jobRepository.ts`, `referralRepository.ts`, etc.
- **Aceptación**: 13 API routes consumen repositories en lugar de `getDb()` directo; tests pueden mockear repositories; documentado en CLAUDE.md
- **Esfuerzo**: L (1-2 días)

### AUDIT-078 [P1] Centralizar CAPABILITY_META
- **Origen**: T2.6
- **Contexto**: capability labels (color, icon, internal modules) duplicadas en 3 archivos
- **Archivos**:
  - Nuevo: `src/lib/capabilities.ts`
  - Refactor: `src/components/genesis/AgentOrchestration.tsx:360-374`, `src/components/genesis/DemoChat.tsx:37-42`, `src/lib/genesis-orchestrator.ts`
- **Aceptación**: una sola fuente para `CAPABILITY_META`; los 3 sites importan de ahí; agregar capability nueva requiere editar 1 lugar
- **Esfuerzo**: S (2h)

---

## Tickets agregados — actualizan tabla maestra

| ID | Sev | Tier | Título | Esfuerzo |
|---|---|---|---|---|
| AUDIT-069 | P0 | T2 | Resolver TODO Identity Chain (feature core) | M-L |
| AUDIT-070 | P1 | T2 | Refactor AgentOrchestration en hook | M |
| AUDIT-071 | P2 | T2 | DemoChat AbortController + magic number | S |
| AUDIT-072 | P1 | T2 | Migrar 8 pages a RSC | M |
| AUDIT-073 | P1 | T2 | Centralizar extractors AI | M |
| AUDIT-074 | P1 | T2 | Refactor buildImagePrompt strategies | M |
| AUDIT-075 | P2 | T2 | Zod parse en jobManager | S |
| AUDIT-076 | P2 | T2 | Type narrowing SessionViewer | S |
| AUDIT-077 | P2 | T2 | Repository pattern Firebase | L |
| AUDIT-078 | P1 | T2 | Centralizar CAPABILITY_META | S |

**Total tickets**: 78 (16 P0, 36 P1, 26 P2)

---

## Notas finales

### Convenciones de PRs
- Branch: `fix/AUDIT-NNN-slug-corto`
- PR title: `[AUDIT-NNN] título descriptivo`
- PR body: link al ticket en este backlog + criterio de aceptación cumplido
- Labels: `audit`, `p0`/`p1`/`p2`, tier (`security`, `infra`, `docs`, etc.)

### Validación antes de cerrar Fase 1
- [ ] Los 16 P0 tienen PR mergeado
- [ ] Smoke test post-deploy verde
- [ ] Runbook validado con al menos 1 dry-run
- [ ] Re-correr esta auditoría parcial (solo T1 + T6) confirma cierre

### Re-auditoría sugerida
- Tras cerrar Fase 1: re-correr T1 + T6 (asegurar P0 cerrados, no regresiones)
- Tras cerrar Fase 2: re-correr T1 + T3 + T4 (cobertura + costos + observabilidad)
- Q3 2026: auditoría completa nueva con foco en escala (10k+ usuarios)
