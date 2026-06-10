# Fix 06 — Ciclo de vida del entitlement HYBRID (vigencia, expiración y cron)

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** ~1 semana (1 dev) | **Hallazgos cubiertos:** #1012

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision (repo `genesis-scann`, Next.js 16 App Router con código en `src/` en la raíz — **no existe carpeta `app/`**) es un lead magnet de transformación física que vende el programa de pago "NGX HYBRID" vía Mercado Pago Checkout Pro, con 3 SKUs: `monthly`, `quarterly` (12 semanas) y `annual` (definidos en `src/lib/mercadoPago.ts`). El estado comercial del cliente vive en el documento de sesión de Firestore (colección `sessions`), en el campo `hybridStatus`.

El problema: `hybridStatus` solo conoce dos valores en todo el código y la transición es **permanente e irreversible**. Se escribe `"prospect"` al crear la sesión (`src/app/api/sessions/route.ts:154-155`, junto con `hybridConvertedAt: null`) y `"converted"` cuando el webhook de Mercado Pago confirma un pago aprobado (`src/app/api/checkout/webhook/route.ts:265-268`). No existe ningún campo de fin de acceso (`accessEndsAt`), ningún estado `expired`/`cancelled`, y ningún proceso que evalúe vencimientos: `vercel.json` (8 líneas) no tiene bloque `"crons"` y el único endpoint cron del repo es `/api/cron/cleanup` (limpieza de sesiones abandonadas, sin relación con entitlements). Resultado: quien paga el SKU mensual queda registrado exactamente igual — para siempre — que quien paga el anual.

Impacto de negocio: es imposible distinguir clientes activos de vencidos (un pago mensual de hace 8 meses sigue como `converted`), no hay base sobre la cual ejecutar renovaciones, win-back ni reporting de churn. Además, el único consumidor del estado (`src/app/api/email/send/route.ts:139-152`) **suprime permanentemente** los emails de nurture tras la conversión (`suppressEmail(email, "hybrid_converted", ...)`): un cliente mensual que no renueva queda excluido para siempre del canal de re-conversión por email.

Este fix añade: (a) campos de vigencia `accessSku`/`accessStartsAt`/`accessEndsAt` derivados del SKU al momento de la conversión, (b) los estados `expired` y `cancelled`, (c) un cron diario que expira accesos vencidos, dispara recordatorios de renovación (vía n8n, patrón ya existente en el repo) y reactiva el nurture al expirar, y (d) un script de backfill para las sesiones ya convertidas sin vigencia. Nota: existe un hallazgo hermano sobre reembolsos/contracargos que no revierten `converted` (otro fix); aquí solo se define el estado `cancelled` y su semántica para que ese fix tenga dónde aterrizar.

## Archivos involucrados

Rutas relativas a la raíz del repo, verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/app/api/checkout/webhook/route.ts` | 23 (imports), 159-199, 201-209 (guard SKU mismatch), 243-272 (mapeo de status + `sessionRef.set`, conversión en 265-268) | **Modificar**: escribir vigencia al convertir; renovaciones extienden `accessEndsAt` |
| `src/app/api/checkout/webhook/route.test.ts` | ~151 (assert de `hybridStatus: "converted"`) | **Modificar**: cubrir nuevos campos y renovación |
| `src/lib/mercadoPago.ts` | 11 (`export type HybridSku`), 73-106 (`getHybridSkuConfig`) | Solo lectura: el tipo `HybridSku` se reutiliza |
| `src/lib/entitlements.ts` | — (nuevo) | **Crear**: duraciones por SKU, `computeAccessEndsAt`, tipo `HybridStatus` |
| `src/lib/entitlements.test.ts` | — (nuevo) | **Crear**: tests unitarios del helper |
| `src/lib/cronAuth.ts` | — (nuevo) | **Crear**: validación de clave cron compartible (patrón copiado de `src/app/api/cron/cleanup/route.ts:48-58`) |
| `src/app/api/cron/entitlements/route.ts` | — (nuevo) | **Crear**: cron que expira accesos, manda recordatorios y reactiva nurture |
| `src/app/api/cron/entitlements/route.test.ts` | — (nuevo) | **Crear**: tests del cron (mismo patrón de mocks que el test del webhook) |
| `src/lib/emailSuppression.ts` | 15-32 (`suppressEmail`) | **Modificar**: añadir `unsuppressEmail` (borra el doc de `email_suppressions` solo si la razón coincide) |
| `src/app/api/email/send/route.ts` | 139-152 (gate `hasConverted`) | **Modificar**: suprimir nurture solo mientras `hybridStatus === "converted"` |
| `src/lib/telemetry.ts` | 15-88 (union `FunnelEvent`, termina en `"voice_agent_cta_clicked"`) | **Modificar**: añadir 3 eventos de ciclo de vida |
| `src/lib/n8nWebhook.ts` | 1-35 (`sendN8NWebhook(event, payload)`) | Solo lectura: se reutiliza tal cual |
| `vercel.json` | 1-8 (sin bloque `crons`) | **Modificar**: añadir cron diario |
| `firestore.indexes.json` | bloque `"indexes"` (ya tiene varios índices de `sessions`) | **Modificar**: índice compuesto `hybridStatus + accessEndsAt` |
| `.env.example` | ~95-110 (pricing HYBRID), 167 (`CRON_API_KEY`) | **Modificar**: documentar duraciones por SKU y `CRON_SECRET` |
| `scripts/backfill-entitlements.mjs` | — (nuevo) | **Crear**: backfill one-off para sesiones `converted` sin `accessEndsAt` |
| `src/app/api/sessions/route.ts` | 154-155 | Solo lectura (referencia del estado `prospect`; no requiere cambios) |
| `src/app/api/cron/cleanup/route.ts` | 48-58, 80-96 | Solo lectura: patrón de auth (`x-cron-key`/Bearer + `secureCompare`) y de paginación por lotes a imitar. **No tocar.** |

## Pasos

### 1. Crear `src/lib/entitlements.ts` (helper central de vigencia)

```ts
import type { HybridSku } from "./mercadoPago";

/** Ciclo de vida del cliente HYBRID. Antes solo existían los 2 primeros. */
export type HybridStatus = "prospect" | "converted" | "expired" | "cancelled";

const DEFAULT_DURATION_DAYS: Record<HybridSku, number> = {
  monthly: 30,
  quarterly: 84, // "12 semanas (cohorte completa)" — ver DEFAULT_LABELS en mercadoPago.ts
  annual: 365,
};

/** Duración del acceso en días; sobreescribible por env HYBRID_DURATION_DAYS_{MONTHLY|QUARTERLY|ANNUAL}. */
export function getSkuDurationDays(sku: HybridSku): number { /* leer env, validar Number.isFinite && > 0, fallback al default */ }

/**
 * Fecha de fin de acceso. Si el SKU no es reconocido (metadata corrupta),
 * usar la duración de `monthly` (conservador) y loggear warning.
 */
export function computeAccessEndsAt(sku: HybridSku | null, from: Date): Date { /* from + días * 86_400_000 */ }

/**
 * Base de cálculo para una compra: si hay un accessEndsAt previo todavía en el
 * futuro, la renovación EXTIENDE desde esa fecha (no se pierde tiempo pagado).
 */
export function resolveAccessBase(now: Date, previousAccessEndsAt?: Date | null): Date { /* max(now, previous) */ }
```

**Decisión de producto (default recomendado, marcado ✅):** ✅ monthly=30 días, quarterly=84 días, annual=365 días, configurables por env sin redeploy de código. ✅ Las renovaciones acumulan (extienden desde el `accessEndsAt` vigente), no reinician.

### 2. Modificar el webhook de pago — `src/app/api/checkout/webhook/route.ts`

1. Importar desde `@/lib/entitlements`: `computeAccessEndsAt`, `resolveAccessBase` (el import de `HybridSku` ya existe en la línea 23).
2. El snapshot de la sesión ya se lee en la línea 172 (`const snap = await sessionRef.get()`). Antes del `sessionRef.set(...)` (línea 248), extraer la vigencia previa:
   ```ts
   const prevAccessEndsAt: Date | null =
     snap.data()?.accessEndsAt?.toDate?.() ?? null; // Firestore Timestamp → Date
   ```
3. En el spread condicional de conversión (líneas 265-268), ampliar a:
   ```ts
   ...(mappedStatus === "completed" && {
     hybridStatus: "converted",
     hybridConvertedAt: FieldValue.serverTimestamp(),
     accessSku: sku,
     accessStartsAt: payment.date_approved ? new Date(payment.date_approved) : new Date(),
     accessEndsAt: computeAccessEndsAt(
       (["monthly", "quarterly", "annual"] as const).includes(sku as HybridSku) ? (sku as HybridSku) : null,
       resolveAccessBase(new Date(), prevAccessEndsAt)
     ),
     renewalReminderSentAt: null, // reset: el nuevo ciclo vuelve a disparar recordatorio
   }),
   ```
   El Admin SDK convierte `Date` a `Timestamp` automáticamente (mismo patrón que `approvedAt: new Date(payment.date_approved)` en la línea 260-262). Nota: la conversión también re-activa a un cliente `expired`/`cancelled` que vuelve a pagar — eso es correcto y deseado.
4. **Renovaciones cross-SKU** — el guard de las líneas 201-209 devuelve 409 si `existing.internalId !== internalId`, lo que bloquearía a un cliente mensual que renueva comprando el anual (nuevo `internalId`). Relajarlo para que **solo aplique mientras el checkout previo no esté completado** (su propósito original es impedir manipulación de un checkout pendiente):
   ```ts
   if (existing?.internalId && existing.internalId !== internalId && existing.status !== "completed") { ... 409 ... }
   ```
   ✅ Decisión recomendada: permitir cambio de SKU una vez que el pago anterior fue completado (es una compra nueva legítima).
5. **Estado `cancelled` (mínimo, coordina con el fix de reembolsos):** tras calcular `mappedStatus` (líneas 243-246), si `status === "refunded" || status === "charged_back"` y `snap.data()?.hybridStatus === "converted"`, incluir en el mismo `set`:
   ```ts
   hybridStatus: "cancelled",
   hybridCancelledAt: FieldValue.serverTimestamp(),
   accessEndsAt: new Date(), // corta el acceso ya
   ```
   y trackear `mp_checkout_failed` con `reason` (ya existe esa rama de telemetría). Si al implementar encuentras que otro fix de la auditoría ya cubrió refunds aquí, no lo dupliques: solo asegúrate de que ese código setee `hybridStatus: "cancelled"` (no deje `converted`).
6. Telemetría: cuando la conversión ocurra sobre una sesión cuyo `hybridStatus` previo era `expired` o `cancelled`, emitir además `trackEvent({ sessionId: ref.shareId, event: "hybrid_access_renewed", metadata: { sku, paymentId } })`.

### 3. Añadir eventos a `src/lib/telemetry.ts`

Al final de la union `FunnelEvent` (tras `| "voice_agent_cta_clicked"`, ~línea 88), añadir:

```ts
  // Fix 06 — Entitlement lifecycle
  | "hybrid_access_expired"
  | "hybrid_renewal_reminder"
  | "hybrid_access_renewed"
```

### 4. Añadir `unsuppressEmail` a `src/lib/emailSuppression.ts`

Junto a `suppressEmail` (líneas 15-32), siguiendo su mismo estilo:

```ts
/**
 * Elimina una supresión. Si `onlyIfReason` se pasa, solo borra cuando la razón
 * almacenada coincide (no debe revertir un "user_unsubscribe" del usuario).
 */
export async function unsuppressEmail(email: string, onlyIfReason?: string): Promise<boolean> {
  // get del doc email_suppressions/{email normalizado}; si no existe → false
  // si onlyIfReason y doc.data().reason !== onlyIfReason → false
  // doc.ref.delete() → true
}
```

### 5. Crear `src/lib/cronAuth.ts`

Extraer el patrón de `validateCronKey` de `src/app/api/cron/cleanup/route.ts:48-58` **sin modificar ese archivo**:

```ts
import { secureCompare } from "./crypto";

export function validateCronKey(req: Request): boolean {
  const provided =
    req.headers.get("x-cron-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const keys = [process.env.CRON_API_KEY, process.env.CRON_SECRET].filter(
    (k): k is string => Boolean(k)
  );
  if (keys.length === 0) return false; // fail closed
  return keys.some((key) => secureCompare(provided, key));
}
```

Se acepta `CRON_SECRET` además de `CRON_API_KEY` porque Vercel Cron invoca con `GET` y header `Authorization: Bearer ${CRON_SECRET}` (si esa env var existe en el proyecto).

### 6. Crear `src/app/api/cron/entitlements/route.ts`

Estructura espejo de `src/app/api/cron/cleanup/route.ts` (header doc-comment, `export const runtime = "nodejs"`, `export const maxDuration = 60`, paginación por lotes con `orderBy(...).limit(BATCH).startAfter(lastDoc)`). Lógica:

**a) Expiraciones.** Query paginada:
```ts
db.collection("sessions")
  .where("hybridStatus", "==", "converted")
  .where("accessEndsAt", "<=", Timestamp.fromDate(graceCutoff)) // graceCutoff = now - HYBRID_GRACE_DAYS
  .orderBy("accessEndsAt")
  .limit(200)
```
✅ Decisión recomendada: periodo de gracia de 3 días (`HYBRID_GRACE_DAYS`, default `3`) para no cortar acceso por un retraso de pago de horas. Los docs sin `accessEndsAt` no matchean queries de rango en Firestore — por eso el backfill del paso 9 es necesario para sesiones históricas.

Por cada doc vencido:
1. `doc.ref.set({ hybridStatus: "expired", hybridExpiredAt: FieldValue.serverTimestamp() }, { merge: true })` (puede hacerse en `db.batch()` por lote).
2. `trackEvent({ sessionId: doc.id, event: "hybrid_access_expired", metadata: { sku: data.accessSku } })`.
3. **Reactivar nurture:** si `data.email` existe y `data.emailOptOut !== true`, llamar `unsuppressEmail(data.email, "hybrid_converted")` — solo borra la supresión creada por la conversión (`src/app/api/email/send/route.ts:147`), nunca un unsubscribe explícito del usuario.
4. `sendN8NWebhook("hybrid_access_expired", { shareId: doc.id, email: data.email, sku: data.accessSku, accessEndsAt: ... })` para la automatización de win-back (mismo patrón que `src/app/api/events/hybrid-offer/route.ts:40`). `sendN8NWebhook` ya es no-op silencioso si `N8N_WEBHOOK_BASE_URL`/`N8N_WEBHOOK_URL` no están configurados.

**b) Recordatorios de renovación.** Query con el mismo índice:
```ts
.where("hybridStatus", "==", "converted")
.where("accessEndsAt", ">", Timestamp.fromDate(now))
.where("accessEndsAt", "<=", Timestamp.fromDate(reminderCutoff)) // now + HYBRID_RENEWAL_REMINDER_DAYS
.orderBy("accessEndsAt").limit(200)
```
✅ Default recomendado: `HYBRID_RENEWAL_REMINDER_DAYS=7`. Filtrar **en código** los docs con `renewalReminderSentAt` ya seteado (Firestore no permite "campo ausente" + rango en otro campo). Por cada candidato: `sendN8NWebhook("hybrid_renewal_reminder", {...})`, `trackEvent(... "hybrid_renewal_reminder" ...)` y `set({ renewalReminderSentAt: FieldValue.serverTimestamp() }, { merge: true })` para idempotencia entre corridas.

**c) Handlers.** `POST` valida `validateCronKey(req)` (401 si falla, igual que cleanup) y ejecuta a+b devolviendo `{ success, expiredCount, remindersSent, duration_ms, timestamp }`. `GET` **también ejecuta el job** (a diferencia de cleanup) con la misma validación — Vercel Cron solo hace GET. Errores por-documento no deben abortar el lote completo (try/catch por doc, contar `errorCount`).

### 7. Programar el cron — `vercel.json`

Añadir al JSON existente (sin tocar las claves actuales):
```json
"crons": [
  { "path": "/api/cron/entitlements", "schedule": "0 6 * * *" }
]
```
Nota operativa (no bloqueante): en Vercel hay que definir la env var `CRON_SECRET` para que el cron llegue autenticado; alternativamente un scheduler externo (n8n) puede hacer `POST` con `x-cron-key: $CRON_API_KEY`.

### 8. Índice compuesto — `firestore.indexes.json`

Añadir al array `"indexes"` (mismo formato que los índices de `sessions` existentes):
```json
{
  "collectionGroup": "sessions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "hybridStatus", "order": "ASCENDING" },
    { "fieldPath": "accessEndsAt", "order": "ASCENDING" }
  ]
}
```
Nota operativa: se despliega con `firebase deploy --only firestore:indexes` (no lo ejecutes tú; déjalo documentado).

### 9. Backfill — `scripts/backfill-entitlements.mjs`

Script one-off estilo `scripts/seed-emulator.mjs` (Node ESM, `firebase-admin` con credenciales de env, ejecutable con `node --env-file=.env.local scripts/backfill-entitlements.mjs [--dry-run]`):
- Pagina `sessions` con `hybridStatus == "converted"`.
- Para cada doc **sin** `accessEndsAt`: derivar `sku` de `checkout.sku` (fallback: parsear `checkout.internalId`, p.ej. `hybrid_monthly_v1`; último fallback ✅ `monthly`), base = `checkout.approvedAt || hybridConvertedAt`, y escribir `accessSku`, `accessStartsAt`, `accessEndsAt` (misma aritmética de duraciones que `entitlements.ts`; al ser `.mjs` fuera del build de TS, duplica las constantes con un comentario que apunte a `src/lib/entitlements.ts`).
- `--dry-run` imprime lo que escribiría sin tocar Firestore. Loggear resumen `{ scanned, updated, skipped }`. **No ejecutar contra producción en este fix; solo dejar el script listo.**

### 10. Corregir el gate de nurture — `src/app/api/email/send/route.ts` (líneas 139-152)

Reemplazar:
```ts
const hasConverted =
  sessionData?.hybridStatus === "converted" || Boolean(sessionData?.hybridConvertedAt);
```
por:
```ts
const hasActiveHybrid = sessionData?.hybridStatus === "converted";
```
(y usar `hasActiveHybrid` en el `if`). Razón: `hybridConvertedAt` queda seteado para siempre; con el OR actual un cliente `expired` seguiría suprimido aunque el cron lo reactive. Eliminar también `hybridConvertedAt` del type-cast local de `sessionData` (línea 142) para que el grep del criterio de aceptación quede limpio. El import de `suppressEmail` (línea 13) no cambia.

### 11. Documentar env vars — `.env.example`

Junto al bloque de pricing HYBRID (~líneas 95-110), añadir comentadas con sus defaults:
```bash
# Vigencia del acceso HYBRID por SKU (días). Defaults: 30 / 84 / 365
HYBRID_DURATION_DAYS_MONTHLY=30
HYBRID_DURATION_DAYS_QUARTERLY=84
HYBRID_DURATION_DAYS_ANNUAL=365
# Cron de entitlements (/api/cron/entitlements)
HYBRID_GRACE_DAYS=3
HYBRID_RENEWAL_REMINDER_DAYS=7
# Vercel Cron manda Authorization: Bearer $CRON_SECRET (alternativa a CRON_API_KEY)
CRON_SECRET=
```

### 12. Tests (Vitest — `pnpm test`)

- `src/lib/entitlements.test.ts`: duraciones default por SKU, override por env (usa `vi.stubEnv`), SKU desconocido → 30 días, `resolveAccessBase` con vigencia futura (extiende) y vencida (parte de `now`).
- `src/app/api/checkout/webhook/route.test.ts`: extender el caso de pago aprobado existente (assert actual de `hybridStatus: "converted"` ~línea 151) para verificar que el `set` incluye `accessSku: "monthly"` y un `accessEndsAt` ≈ now+30d; añadir caso de renovación (sesión con `accessEndsAt` futuro y `checkout.status: "completed"` previo + nuevo `paymentId`) que extiende la fecha y **no** devuelve 409 aunque cambie el `internalId`.
- `src/app/api/cron/entitlements/route.test.ts`: mockear `@/lib/firebaseAdmin`, `@/lib/telemetry`, `@/lib/n8nWebhook` y `@/lib/emailSuppression` (mismo patrón de `vi.mock` del test del webhook). Casos: (1) sin `x-cron-key` → 401; (2) sesión vencida → update a `expired`, `unsuppressEmail(email, "hybrid_converted")` llamado, n8n `hybrid_access_expired` enviado; (3) sesión con `emailOptOut: true` → no llama `unsuppressEmail`; (4) recordatorio: dentro de ventana y sin `renewalReminderSentAt` → n8n + marca; con `renewalReminderSentAt` ya seteado → no re-envía.

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

1. `pnpm exec tsc --noEmit` → sin errores.
2. `pnpm lint` → sin errores.
3. `pnpm test` → **toda** la suite en verde (los tests existentes de `route.test.ts` del webhook, `emailConfig`, `rateLimit`, etc. no deben romperse) + los tests nuevos de `entitlements`, webhook ampliado y cron.
4. `grep -n "accessEndsAt\|accessSku" src/app/api/checkout/webhook/route.ts` → hits dentro del bloque de conversión.
5. `grep -n '"crons"' vercel.json` → 1 hit; `python3 -c "import json;json.load(open('vercel.json'))"` → JSON válido.
6. `grep -n "hybridStatus" src/lib/entitlements.ts src/app/api/cron/entitlements/route.ts` → el tipo incluye `expired` y `cancelled`; el cron consulta `"converted"`.
7. `grep -n "hybridConvertedAt" src/app/api/email/send/route.ts` → **sin resultados** (el gate ya no depende del timestamp permanente).
8. `grep -n "unsuppressEmail" src/lib/emailSuppression.ts src/app/api/cron/entitlements/route.ts` → definición + uso.
9. `grep -n "hybrid_access_expired" src/lib/telemetry.ts` → el evento existe en `FunnelEvent`.
10. `grep -A4 "hybridStatus" firestore.indexes.json` → índice compuesto `hybridStatus + accessEndsAt` presente.
11. Comportamiento observable (manual, con `pnpm dev` y env local): `curl -s -X POST http://localhost:3000/api/cron/entitlements` (sin header) → `401`; `curl -s -X POST http://localhost:3000/api/cron/entitlements -H "x-cron-key: $CRON_API_KEY"` → `200` con JSON `{ success, expiredCount, remindersSent, ... }` (con Firestore vacío, contadores en 0).
12. `node scripts/backfill-entitlements.mjs --dry-run` no escribe nada y termina con código 0 (puede fallar limpio con mensaje claro si faltan credenciales Firebase — aceptable).

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos). En particular, **no modifiques** `src/app/api/cron/cleanup/route.ts` ni `src/app/api/sessions/route.ts`.
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente (no lo pide: todo se hace con `firebase-admin`, Vitest y utilidades ya presentes).
- NO ejecutes el backfill ni despliegues índices/crons contra producción; solo deja código, config y documentación listos.
- Si encuentras algo inesperado que bloquee el fix (p.ej. otro fix de la auditoría ya cambió el webhook o el gate de email de forma incompatible), repórtalo y detente en vez de improvisar.
