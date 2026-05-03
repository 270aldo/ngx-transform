# Auditoría — Handoff del Lote 1

**Fecha**: 2026-05-02
**Branch**: `fix/audit-2026-05-p0`
**Tickets cerrados en código**: AUDIT-008, 009, 014, 015 (4 commits atómicos)
**Tickets que requieren acción manual del owner**: AUDIT-010 + 3 acciones de validación

---

## ✅ Cerrados en esta sesión (commits en `fix/audit-2026-05-p0`)

| Commit | Ticket | Descripción |
|---|---|---|
| `4a8dcbb` | base | Reporte + backlog auditoría completos |
| `0a46fa9` | AUDIT-014 | CLAUDE.md Security CSP/Headers marcados como diseño objetivo |
| `33bc035` | AUDIT-015 | STATUS_REPORT path obsoleto reemplazado |
| `801dcb1` | AUDIT-008 | 5 índices Firestore añadidos (`firestore.indexes.json`) |
| `1a1fdf1` | AUDIT-009 | pnpm declarado como único package manager |

---

## 🚨 Acciones que tú debes tomar antes de continuar al Lote 2

### 1. AUDIT-010 — Sincronizar `.env.local` (60 vars faltantes)

Tu `.env.local` tiene 18 vars; `.env.example` documenta 77. Las 60 vars faltantes incluyen secrets reales que **yo no puedo escribir** (CRON_API_KEY, AI_WORKER_TOKEN, etc.). Algunas son opcionales (Edge Config, ElevenLabs) pero la mayoría son necesarias.

**Vars críticas a llenar (P0)**:
```
# Security tokens (genera con `openssl rand -hex 32`)
CRON_API_KEY=
AI_WORKER_TOKEN=

# AI providers
ELEVENLABS_API_KEY=                    # de https://elevenlabs.io/app/settings
ELEVENLABS_GENESIS_VOICE_ID=

# Email
RESEND_FROM_EMAIL=transform@ngxgenesis.com
EMAIL_FROM=transform@ngxgenesis.com

# AI controls
ENABLE_AI_GENERATION=true
GEMINI_HOURLY_LIMIT_USD=20
GEMINI_DAILY_LIMIT_USD=250
MAX_ANALYSIS_RETRIES=3
MAX_IMAGE_GENERATION_RETRIES=2
MAX_UPLOAD_BYTES=10485760

# Session limits
MAX_SESSIONS_PER_IP_PER_DAY=100
MAX_SESSIONS_PER_EMAIL_PER_DAY=50
SESSION_TTL_DAYS=30
ALLOW_RATE_LIMIT_FALLBACK=false

# Sentry (de https://sentry.io/settings/)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# AI Flag config
AI_FLAGS_FIRESTORE_PATH=config/aiFlags/global
AI_FLAG_CACHE_TTL_MS=30000

# Plan generation
PLAN_GENERATION_MODEL=gemini-3.1-flash

# Build
NODE_ENV=development
```

**Feature flags faltantes** (todos default `true` salvo donde indique):
```
FF_TELEMETRY_ENABLED=true
FF_DELETE_TOKEN_REQUIRED=true
FF_AGENT_BRIDGE_CTA=false              # único en false por default
FF_SHARE_UNLOCK=true
FF_SHARE_TO_UNLOCK=true
FF_EMAIL_SEQUENCE=true
FF_PLAN_7_DIAS=true
FF_SOCIAL_COUNTER=true
FF_EXPOSE_ORIGINAL=true
FF_CINEMATIC_AUTOPLAY=true
FF_COMPARE_SLIDER=true
FF_LETTER_FROM_FUTURE=true
FF_DRAMATIC_REVEAL=true
FF_OG_SPLIT_SCREEN=true
FF_REFERRAL_TRACKING=true
FF_QUALITY_GATES=true
FF_IDENTITY_CHAIN=true
```

**Vars de UI/marketing** (rellena con tus valores reales):
```
NEXT_PUBLIC_APP_URL=https://transform.ngxgenesis.com
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/ngx-genesis
NEXT_PUBLIC_WHATSAPP_NUMBER=+521XXXXXXXXXX
NEXT_PUBLIC_COHORT_LABEL=
NEXT_PUBLIC_COHORT_SPOTS_TOTAL=
NEXT_PUBLIC_COHORT_SPOTS_LEFT=
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME=
NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS=
NEXT_PUBLIC_WAITLIST_URL=
NEXT_PUBLIC_DEMO_MODE=
SHARE_UNLOCK_DELAY_SECONDS=5
SOCIAL_COUNTER_SEED_TOTAL=8547
SOCIAL_COUNTER_SEED_WEEKLY=2341
VERCEL_URL=
```

**Vars opcionales (Edge Config)**:
```
EDGE_CONFIG_ID=
EDGE_CONFIG_URL=
EDGE_CONFIG_TOKEN=
VERCEL_EDGE_CONFIG_ID=
VERCEL_EDGE_CONFIG_TOKEN=
```

**Comando rápido**: una vez rellenado, valida que coincide con `.env.example`:
```bash
diff <(grep -oE "^[A-Z_]+" .env.local | sort -u) <(grep -oE "^[A-Z_]+" .env.example | sort -u)
```

### 2. Deploy de los nuevos índices Firestore (AUDIT-008)

```bash
firebase deploy --only firestore:indexes
```

- Tarda 5–30 min en construir (visible en Firebase Console > Firestore > Indexes)
- Sin esto, las 5 queries cubiertas siguen sin índice en producción → 500 errors o queries lentas

### 3. (Opcional) Borrar `package-lock.json` del disco local

Lo desindexamos del repo (`git rm --cached`), pero el archivo sigue en tu directorio local:

```bash
rm package-lock.json
```

Es seguro borrarlo — `pnpm install --frozen-lockfile` ignora completamente este archivo.

### 4. Validar que el build sigue funcionando

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Si algo falla por las modificaciones del Lote 1, dime y lo investigamos.

---

## 🔄 Hallazgos secundarios descubiertos durante el Lote 1

Estos NO estaban en el backlog original — los descubrí mientras ejecutaba. Decide si crear tickets:

### A. Índices Firestore preexistentes con field names erróneos
Los 2 índices que ya existían (`userId`+`createdAt`, `status`+`updatedAt`) usan campos que **no aparecen en ninguna query del código**:
- El código usa `ownerUid`, no `userId`
- El código usa `generatedAt`/`createdAt`, no `updatedAt` para counter

→ Los nuevos índices que añadí cubren las queries reales. Los viejos quedan como "by-default" pero podrían eliminarse después de validar 1 semana sin uso. Sugerencia: **AUDIT-079** (P2) — auditar y limpiar índices unused tras 1 semana.

### B. Query con `where(completedAt != null)` sospechosa
[src/lib/viral/referralTracking.ts:142-145](../src/lib/viral/referralTracking.ts) usa:
```ts
.where("referrerId", "==", ...)
.where("completedAt", "!=", null)
.where("rewardClaimed", "==", false)
```

Firestore tiene comportamiento limitado con `!=` (sólo permite uno por query, requiere índice especial). Esta query puede romperse o devolver resultados inesperados. Sugerencia: **AUDIT-080** (P1) — refactorizar a `where("completedAt", ">", new Date(0))` o usar un campo booleano `isCompleted`.

---

## 📋 Próximos pasos sugeridos

Cuando estés listo para continuar:

**Lote 2 — Security core** (sin acciones manuales tuyas, todo código nuevo):
- AUDIT-001 middleware.ts (M)
- AUDIT-002 IDOR sessions/[shareId] (M)
- AUDIT-003 IDOR sessions/[shareId]/private (S)
- AUDIT-005 /api/email proteger (S)
- AUDIT-007 genesis-voice spendLimiter (S)

**Antes de Lote 3** vamos a parar y confirmar contigo varias cosas que requieren rotación de keys o config externa:
- AUDIT-004 (rotar `AI_WORKER_TOKEN` actual)
- AUDIT-006 (migración de templates de email para tokens HMAC)
- AUDIT-011 (vercel.json crons — afecta deploy)
- AUDIT-012 (alertas — config en Sentry/Vercel dashboards)

Cuando me digas "sigue", arranco con el Lote 2 directo.

---

## Estado git al cerrar Lote 1

```
Branch: fix/audit-2026-05-p0
Commits: 5 (1 base + 4 tickets)
Stash pendiente: src/app/wizard/page.tsx (work-in-progress de feat/hybrid-copy)
Remote: NO pusheado todavía
```

Para revertir todo el Lote 1 si algo sale mal:
```bash
git checkout feat/hybrid-copy
git stash pop   # recupera tu wizard wip
git branch -D fix/audit-2026-05-p0
```
