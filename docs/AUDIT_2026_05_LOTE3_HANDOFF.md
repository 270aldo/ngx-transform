# Auditoría — Handoff del Lote 3

**Fecha**: 2026-05-02
**Branch**: `fix/audit-2026-05-p0` (continuación)
**Tickets cerrados en código**: AUDIT-013, 011, 012 (código), 004, 006 (5 commits)

---

## ✅ Cerrados en esta sesión

| Commit | Ticket | Resumen |
|---|---|---|
| `259e95c` | **AUDIT-013** | `docs/RUNBOOK.md` con 5 escenarios + setup operacional + comandos |
| `c2373f4` | **AUDIT-011** | Cron cleanup en `vercel.json` (0 3 * * *) + endpoint acepta `CRON_SECRET` además de `CRON_API_KEY` |
| `aad0667` | **AUDIT-012** | `Sentry.captureMessage` en spendLimiter (80%/100%) y aiKillSwitch (state changes) |
| `6a48a83` | **AUDIT-004** | Worker token v2: HMAC firmado, scoped a sessionId, TTL 5min, header-only. Legacy raw-token sigue aceptado con warning Sentry |
| `374f1b2` | **AUDIT-006** | Unsubscribe con tokens HMAC firmados (60 días TTL) + rate limit. Legacy email/shareId sigue aceptado con warning |

Build verde: `next build` pasa con `ƒ Proxy (Middleware)` activo.

---

## 🔧 Acciones operacionales que necesitas tomar

### 1. (URGENTE — antes del próximo deploy) Configurar env vars en Vercel

Estas variables **deben existir en Vercel** (Production + Preview) para que el código nuevo funcione en producción:

| Var | Para qué | Sugerencia |
|---|---|---|
| `CRON_SECRET` | Vercel cron invoca `/api/cron/cleanup` con `Authorization: Bearer <CRON_SECRET>` automáticamente. **Sin esto el cron falla en cada ejecución.** | `openssl rand -hex 32` |
| `CRON_API_KEY` | Triggers manuales (curl, scripts). Puede ser igual a `CRON_SECRET` o diferente. Si solo defines `CRON_SECRET`, los triggers manuales por header `Authorization: Bearer` funcionan; los que usan `x-cron-key` no. | `openssl rand -hex 32` |
| `UNSUBSCRIBE_HMAC_SECRET` | Firma los links de unsubscribe en emails. **Si no se define, el código usa `CRON_API_KEY` como fallback** — funciona pero acopla dos cosas no relacionadas. Recomendado: dedicado. | `openssl rand -hex 32` |
| `WORKER_TOKEN_TTL_SECONDS` | TTL del v2 worker token para `/api/generate-images`. Default 300 (5 min). Bajar a 60 cuando v2 esté plenamente adoptado. | `300` por ahora |
| `UNSUBSCRIBE_TOKEN_TTL_DAYS` | TTL del token de unsubscribe. Default 60. Suficiente para emails D0–D14 + ~45 días extra de bandeja. | `60` |
| `CSP_ENFORCE` | Toggle del CSP entre report-only (default) y enforce. **No setear todavía** — primero observar 7 días de `Report-Only`. | _no setear aún_ |

Comando rápido para añadirlas vía Vercel CLI:
```bash
vercel env add CRON_SECRET production
vercel env add CRON_API_KEY production
vercel env add UNSUBSCRIBE_HMAC_SECRET production
# (repetir para preview environment también)
```

### 2. Rotar `AI_WORKER_TOKEN` (cuando estés listo)

**El token actual sigue funcionando** gracias al legacy path en [src/lib/workerAuth.ts](../src/lib/workerAuth.ts). Cuando rotes:

1. Generar nuevo: `openssl rand -hex 32`
2. Vercel: `vercel env add AI_WORKER_TOKEN production` (sobreescribe el viejo)
3. Redeploy
4. Actualizar TODOS los callers externos (n8n workflows, scripts manuales, etc.) para usar el nuevo formato v2:
   ```js
   import { signWorkerToken } from '@/lib/workerAuth';
   const token = signWorkerToken(sessionId);
   // luego: header 'x-worker-token': token
   ```
   Si el caller no puede importar el helper, replica con crypto:
   ```js
   const crypto = require('crypto');
   const iat = Math.floor(Date.now() / 1000);
   const payload = `${sessionId}:${iat}`;
   const sig = crypto.createHmac('sha256', AI_WORKER_TOKEN).update(payload).digest('hex');
   const tokenB64 = Buffer.from(payload).toString('base64')
     .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
   const token = `${tokenB64}.${sig}`;
   ```

### 3. Configurar 4 alertas en Sentry dashboard

El código ya emite los eventos. Necesitas crear las **alert rules** en Sentry > Settings > Alerts. Aquí el copy listo:

#### Alerta 1 — Spend cap
- **Condición**: An event matches the filter `tags.component:spendLimiter` and `tags.scope:daily` and `level >= warning`
- **Frecuencia**: At most once every 1 hour
- **Acción**: Email a owner; opcional Slack/Discord webhook
- **Razón**: te avisa al cruzar 80% del cap diario, antes del bloqueo total

#### Alerta 2 — Spend cap excedido (hard block)
- **Condición**: An event matches `tags.component:spendLimiter` and `level:error`
- **Frecuencia**: Immediately, no dedup
- **Acción**: Email a owner + Slack/Discord
- **Razón**: hard cap activo — usuarios viendo 503

#### Alerta 3 — AI kill switch state change
- **Condición**: An event matches `tags.component:aiKillSwitch`
- **Frecuencia**: Immediately
- **Acción**: Email a owner
- **Razón**: alguien activó/desactivó el kill switch — siempre relevante

#### Alerta 4 — Unsubscribe legacy / abuse signals
- **Condición**: An event matches `tags.component:unsubscribe`
- **Frecuencia**: Cada 24h max
- **Acción**: Email a owner
- **Razón**: monitorea (a) cuándo se puede retirar el legacy path y (b) abuse de tokens inválidos

### 4. Migrar templates de email (separado, no en este branch)

Para que los nuevos emails generen links de unsubscribe firmados, hay que tocar:

```
src/emails/sequence/D0Results.tsx
src/emails/sequence/D1Reminder.tsx
src/emails/sequence/D3Plan.tsx
src/emails/sequence/D7Conversion.tsx
+ D5, D10, D14 (mencionados en CHANGELOG, verificar nombres exactos)
```

En cada uno: reemplazar el footer actual de unsubscribe por:
```tsx
import { buildUnsubscribeUrl } from "@/lib/unsubscribeToken";
// ...
const unsubUrl = buildUnsubscribeUrl(appUrl, recipientEmail, shareId);
```

Si `buildUnsubscribeUrl` retorna `null` (no hay secret configurado), caer al formato viejo:
```tsx
const fallbackUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&shareId=${shareId}`;
```

Esto es un PR separado — sugiero abrirlo cuando tengas `UNSUBSCRIBE_HMAC_SECRET` configurado en Vercel.

### 5. (Opcional) Habilitar Firestore PITR

Recomendado por **AUDIT-040** del backlog. Es un toggle en Firebase Console:

1. Firebase Console > Firestore Database > Backups
2. Enable Point-in-time Recovery
3. Costo aproximado: $0.18/GB/mes (cuelga de tamaño de Firestore actual)

Si no lo activas: cero recovery options ante delete accidental.

---

## 🔍 Validación local recomendada

Antes de mergear este branch a `main`:

```bash
# 1. Build limpio pasa
rm -rf .next
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm build

# 2. Dev server arranca (verifica middleware/proxy carga)
pnpm dev
# Abre http://localhost:3000/api/health en navegador
# Verifica DevTools > Network > Headers que aparezcan:
#   - Content-Security-Policy-Report-Only (NO enforced en dev)
#   - Strict-Transport-Security
#   - X-Frame-Options: SAMEORIGIN
#   - x-nonce header (cada request tiene uno único)

# 3. Test del endpoint de cleanup manualmente (con CRON_API_KEY local)
source .env.local
curl -X POST -H "x-cron-key: $CRON_API_KEY" \
  http://localhost:3000/api/cron/cleanup
# Debería retornar JSON con deletedCount

# 4. Test del endpoint unsubscribe con token nuevo
node -e "
const { signUnsubscribeToken } = require('./.next/server/chunks/...');
// O genera el token con un mini-script standalone usando el snippet del lib
"
```

---

## 📊 Estado del backlog tras Lote 3

| Fase | Tickets | Estado |
|---|---|---|
| **Lote 1** (docs + config) | AUDIT-008, 009, 010, 014, 015 | ✅ Cerrado |
| **Lote 2** (security core) | AUDIT-001, 002, 003, 005, 007 | ✅ Cerrado |
| **Lote 3** (hardening + ops) | AUDIT-004, 006, 011, 012, 013 | ✅ Cerrado |
| **Pendiente P0** | _ninguno_ | — |
| **Pendiente P1** (Lote 4 sugerido) | AUDIT-016 a 046 (30 tickets) | Pendiente |
| **Pendiente P2** (Lote 5+) | AUDIT-047 a 080 (30+ tickets) | Pendiente |

**Todos los P0 originales están cerrados** (con las correcciones de severidad documentadas en el reporte).

---

## ➡️ Próximos pasos sugeridos

Antes de seguir con Lote 4 (P1s), te recomiendo:

1. **Push del branch + abrir PR** (cuando hayas validado local) — esto activa preview deployment de Vercel, donde puedes verificar que el middleware funciona en infra Vercel real
2. **Configurar las env vars críticas** (`CRON_SECRET` mínimo) **antes** del merge, para que el primer cron post-deploy no falle
3. **Confirmar 1 deploy a producción** y observar logs/Sentry 24-48h antes de seguir
4. **Después**: arrancar Lote 4 con los P1s prioritarios. Recomiendo empezar por:
   - **AUDIT-026** (`runtime='nodejs'` en endpoints restantes) — quick wins, S
   - **AUDIT-029** (bump `eslint-config-next` a v16) — quick win, S
   - **AUDIT-033** (tracking en BookingCTA) — quick win, S
   - **AUDIT-036** (variant assignment estable A/B) — habilita A/B real, M
   - **AUDIT-038** (Sentry beforeSend PII filter) — GDPR, M

---

## Stash recordatorio

El wizard wip de feat/hybrid-copy quedó consolidado en commit `6fb525a` de este branch. Si finalmente quieres llevarlo de vuelta a feat/hybrid-copy:
```bash
git checkout feat/hybrid-copy
git cherry-pick 6fb525a
git checkout fix/audit-2026-05-p0
git revert 6fb525a   # opcional, si no quieres el wizard wip en este branch
```

---

## Resumen total del trabajo (todos los lotes)

```
Branch: fix/audit-2026-05-p0
Commits: 19 (1 base + 16 tickets + 1 wizard wip + 1 doc correction)
Cobertura P0: 16/16 cerrados (con 5 correcciones de severidad)
Tiempo estimado del Lote 4 (P1s): 80-120h ingeniero (~3-4 semanas a 1 dev)
```
