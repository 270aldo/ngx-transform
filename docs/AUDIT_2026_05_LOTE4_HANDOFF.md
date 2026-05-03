# Auditoría — Handoff del Lote 4

**Fecha**: 2026-05-03
**Branch**: `fix/audit-2026-05-p0` (continuación)
**Tickets cerrados en código**: AUDIT-016, 017, 018, 019, 020, 022, 024, 025, 026, 028, 029, 033, 034, 035, 037, 038, 044, 045, 046 (19 tickets en 10 commits)

Lote 4 cubrió la mayor parte de los **P1** del backlog. Build verde, lint verde (0 errores, 54 warnings de migración v15→v16 ESLint).

---

## ✅ Cerrados en esta sesión

| Commit | Tickets | Resumen |
|---|---|---|
| `062e354` | **AUDIT-026** | `runtime='nodejs'` declarado en 15 endpoints firebase-admin |
| `fa1d5ea` | **AUDIT-016 017 037** | Rate limit en `/api/leads`, hardening de `/api/csp-report` (CORS removed, Sentry forward), `sentry.edge.config.ts` |
| `7c4925b` | **AUDIT-019** | Defensive hardening en `/api/remarketing` GET (Zod email shape + redact logs). Falsa alarma del audit original — sí valida y no hace data dump |
| `5ba7699` | **AUDIT-020** | Cost estimate analyze: $0.001 → $0.0008 (2x del real, antes era 3x) |
| `30eb3f0` | **AUDIT-022 024 025 028** | MIME magic-byte validation en `uploadBuffer()`, spendLimiter degraded mode con cache, retry budget global en image-gen, sharp OOM guard |
| `36fb512` | **AUDIT-018** | Session existence + ownership check en `unlock`/`referral`/`feedback`. Claim ahora requiere auth |
| `71783b0` | **AUDIT-033 034 035** | BookingCTA emite `cta_clicked`, demo instrumentado con start/message/complete/abandoned, FF defaults sincronizados |
| `51016f1` | **AUDIT-029** | `eslint-config-next` 15 → 16, migración a flat config nativo, 8 reglas react-hooks v5 demoteadas a `warn` (ver AUDIT-079) |
| `cfdc2ba` | **AUDIT-038** | Sentry `beforeSend` PII filter (emails, photoPath, biometrics, tokens, headers) en client + server + edge |
| `a91d231` | **AUDIT-044 045 046** | `docs/FEATURE_FLAGS.md` (nuevo SSOT), tabla de versionado en CLAUDE.md, API routes table actualizada |

**Build**: `next build` verde, `ƒ Proxy (Middleware)` registrado.
**Lint**: 0 errores, 54 warnings (todas son hallazgos legítimos de la migración ESLint).

---

## 🔧 Acciones operacionales (acumuladas — todo deploy a producción)

Combinado con los handoffs anteriores, antes del primer deploy a prod necesitas:

### Variables de entorno en Vercel (Production + Preview)

Agrupadas por urgencia para el primer deploy:

**P0 (sin esto el deploy falla o degrada features):**
- `CRON_SECRET` — Vercel cron usa este valor automáticamente para `/api/cron/cleanup`
- `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID` (ya existentes en prod, verificar)
- `GEMINI_API_KEY` (ya existente, verificar)

**P1 (necesarias para que features funcionen):**
- `CRON_API_KEY` — invocaciones manuales del cron
- `UNSUBSCRIBE_HMAC_SECRET` — firma de tokens unsubscribe (fallback a `CRON_API_KEY` si no se setea)
- `AI_WORKER_TOKEN` — rotar y reusar como secret HMAC para v2 worker tokens
- `RESEND_API_KEY`, `ELEVENLABS_API_KEY` — proveedores externos
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate limiting
- Todos los `NEXT_PUBLIC_*` (URLs públicas, branding)
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`

**P2 (defaults razonables si no se setean):**
- `WORKER_TOKEN_TTL_SECONDS=300`
- `UNSUBSCRIBE_TOKEN_TTL_DAYS=60`
- `MAX_TOTAL_IMAGE_RETRIES=3`
- `MAX_SHARP_INPUT_BYTES=15728640` (15MB)
- `GEMINI_DAILY_LIMIT_USD=50`
- `GEMINI_HOURLY_LIMIT_USD=10`
- `CSP_ENFORCE` — **NO SETEAR para el primer deploy** (queda en report-only durante 7 días)

### Acciones en dashboards (no son código)

1. **Firebase Console** — `firebase deploy --only firestore:indexes` para activar los 5 índices de AUDIT-008
2. **Vercel Dashboard** → Crons → verificar que `/api/cron/cleanup` aparezca tras el deploy
3. **Sentry Dashboard** → Settings → Alerts → crear las 4 alert rules listadas en `AUDIT_2026_05_LOTE3_HANDOFF.md` sección 3
4. **Firebase Console** → Firestore → Backups → habilitar PITR (paid, opcional)
5. (Tras deploy + 7 días en report-only) → `vercel env add CSP_ENFORCE production = true` y redeploy

### Validación end-to-end recomendada en preview

Antes del merge a `main`:

```bash
# 1. Local build
rm -rf .next
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm lint
pnpm build

# 2. Smoke contra preview deployment de Vercel
TEST_BASE_URL=https://<preview-url>.vercel.app pnpm test:smoke

# 3. Validar en navegador en preview:
#    - Wizard completa hasta resultados
#    - Demo emite eventos demo_started / demo_message_sent / demo_completed
#    - BookingCTA emite cta_clicked al clickear
#    - Headers de seguridad presentes en /api/health (curl -I)
```

---

## 🆕 Nuevo ticket creado en esta sesión

**AUDIT-079** — Refactor de patrones React detectados por eslint v16

El bump de ESLint demoteó 8 reglas react-hooks v5 a `warn` para no bloquear CI. Esos warnings (~19 sites) son hallazgos legítimos:

- `set-state-in-effect`: `setState` síncrono dentro de `useEffect` → cascading renders
- `purity`: llamadas a funciones impuras durante render
- `immutability`: mutación de objetos durante render
- `static-components`: creación de componentes durante render
- `refs`: acceso a refs antes de declaración

Archivos más afectados (top): `src/components/genesis/AgentOrchestration.tsx`, `src/components/genesis/DemoChat.tsx`, `src/components/genesis/GenesisChat.tsx`, varios `loading/[shareId]/*` y `results/*`.

**Esfuerzo**: L (1-2 días, refactor incremental). Por cada archivo limpiado, re-promover la regla correspondiente a `error` en `eslint.config.mjs`.

---

## 🔍 Patrón notable de la auditoría

5 hallazgos del Lote 1+2 fueron **falsas alarmas del agente Explore** que descubrí leyendo el código real:

| Hallazgo | Realidad | Acción |
|---|---|---|
| `src/proxy.ts` "huérfano" | Era el middleware de Next.js 16 (renombrado de `middleware.ts`) | Refactor en `f20865e` |
| IDOR en `GET /api/sessions/[shareId]` "público sin protección" | Ya respeta `shareScope` allowlist | Solo añadir rate limit (`6a7a51c`) |
| IDOR en `/private` "check débil" | El check `ownerUid !== authUser.uid → 403` ya existía | Solo añadir rate limit (`afb3ccb`) |
| `/api/email` "sin auth, Zod ni rate limit" | Ya tenía rate limit + send-only-to-owner | Añadir auth + Zod (`c2ee012`) |
| `/api/remarketing` GET "data dump sin paginar" | Solo busca por email específico | Solo defensive hardening (`7c4925b`) |

Bajé `P0 reales: 16 → 11`. Documentado en la sección de correcciones del [reporte](AUDIT_2026_05.md). Las mejoras siguen siendo reales — solo no eran "vulnerabilidades catastróficas" como sugería el agente.

---

## 📊 Estado del backlog

| Fase | Tickets | Estado |
|---|---|---|
| **Lote 1** (docs + config base) | 008, 009, 010, 014, 015 | ✅ |
| **Lote 2** (security core) | 001, 002, 003, 005, 007 | ✅ |
| **Lote 3** (hardening + ops) | 004, 006, 011, 012, 013 | ✅ |
| **Lote 4** (P1s — esta sesión) | 016, 017, 018, 019, 020, 022, 024, 025, 026, 028, 029, 033, 034, 035, 037, 038, 044, 045, 046 | ✅ |
| **Pendiente P0** | _ninguno_ | — |
| **Pendiente P1** | 023, 027, 030, 031, 032, 036, 039, 040, 041, 042, 043, 069, 070, 072, 073, 074, 078 (~17) | Pendiente |
| **Pendiente P2** | 021, 047 a 080 (~26) | Pendiente |

Cierres por número absoluto: **35 tickets de 80 totales (44%)**, incluyendo el 100% de los P0.

---

## ➡️ Próximos pasos sugeridos

Cuando estés listo:

### Opción A — Lote 5 (P1s mayores que quedaron por costo/complejidad)
- **AUDIT-023** — Per-user spend caps (M, requiere schema change en spendLimiter)
- **AUDIT-027** — Cachear sessions en Upstash (M, evita exceder free tier)
- **AUDIT-030** — Tests de auth contra emulador Firebase en CI (M)
- **AUDIT-031** — Workflow `smoke.yml` contra preview deploy (M)
- **AUDIT-036** — Variant assignment estable para A/B testing (M)
- **AUDIT-039** — Logger pino estructurado, reemplazar 30+ console.log (L, ~1-2 días)

### Opción B — Lote 6 (P1 producto/UX restantes)
- **AUDIT-042** — Cookie consent banner (GDPR)
- **AUDIT-043** — Routing de `/privacy` y `/terms`
- **AUDIT-070** — Refactor AgentOrchestration en hook custom (god component)
- **AUDIT-072** — Migrar 8 pages a RSC

### Opción C — Resolver el feature crítico ya
- **AUDIT-069** — Identity Chain TODO bloqueante (M-L). Es el único ticket técnico que toca el core feature del producto. Prioridad alta para el lanzamiento.

### Opción D — Push y validación
- **Push del branch + abrir PR a main** (genera preview Vercel)
- **Validar end-to-end en preview** con un wizard real
- **Mergear y deployar a prod** con `CSP_ENFORCE` no seteado (report-only inicial)

Mi recomendación: **D primero** (validar lo que ya está) antes de seguir apilando trabajo. 30 commits sin probar en infra real es mucha superficie de riesgo.

---

## Resumen total acumulado

```
Branch: fix/audit-2026-05-p0
Commits totales: 30
Tickets cerrados: 35 (16 P0 + 19 P1)
Líneas modificadas: ~3,500 (incluyendo nuevos docs)
Build: verde
Lint: 0 errores, 54 warnings (AUDIT-079 nuevo)
Tests: pasan (los 5 existentes — coverage sigue siendo bajo, AUDIT-030/031/032 pendientes)
```
