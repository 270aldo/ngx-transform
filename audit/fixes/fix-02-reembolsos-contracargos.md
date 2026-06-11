# Fix 02 — Procesar reembolsos y contracargos de MercadoPago
**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3 días | **Hallazgos cubiertos:** #54

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision es una app Next.js (App Router, código en `src/` en la raíz del repo — NO existe carpeta `app/` raíz) que vende el programa "NGX HYBRID" vía MercadoPago Checkout Pro. El webhook de pagos vive en `src/app/api/checkout/webhook/route.ts`: recibe la notificación de MP, consulta el estado real del pago con `fetchMpPayment()` (de `src/lib/mercadoPago.ts`), y cuando el pago es `approved` marca la sesión de Firestore (`sessions/{shareId}`) con `checkout.status: "completed"` y `hybridStatus: "converted"` + `hybridConvertedAt`.

El problema tiene dos defectos combinados que hacen que **los reembolsos y contracargos se descarten en silencio**:

1. **Idempotencia demasiado agresiva** (líneas 190-195 de `route.ts`): si la sesión ya tiene `checkout.paymentId === paymentId` con `checkout.status === "completed"`, el webhook responde `{ ok: true, alreadyProcessed: true }` sin tocar nada. Pero las notificaciones de refund/chargeback de MP llegan con el **mismo `paymentId`** y un `status` nuevo (`refunded` / `charged_back`), así que se descartan siempre. El test `"treats an already completed payment as idempotent"` (líneas 231-249 de `route.test.ts`) codifica este comportamiento como correcto.
2. **Mapeo de estados incompleto** (líneas 243-246 de `route.ts`): `mappedStatus` solo contempla `approved`/`rejected`/`cancelled`/`in_process`/`pending`; cualquier otro estado (incluidos `refunded`, `charged_back`, `in_mediation`) cae al default `"pending"`. El propio comentario de la línea 199 admite que esos estados existen (`// approved | pending | rejected | in_process | refunded | etc`).

Resultado de negocio: `hybridStatus` queda en `"converted"` para siempre aunque el dinero se haya devuelto, la supresión de emails post-conversión sigue activa (ver `src/app/api/email/send/route.ts` líneas 139-152: suprime si `hybridStatus === "converted"` **o** si `hybridConvertedAt` tiene valor), la contabilidad interna sobre-reporta ventas, y nadie se entera de un contracargo — y MP exige responder disputas con evidencia en plazos cortos, así que sin alerta las disputas se pierden por default (monto + comisión + penalización de reputación de la cuenta MP). No existe ninguna otra ruta de reembolso en el repo (un grep de `refund` solo encuentra ese comentario).

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`). Líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---------|--------|-------|
| `src/app/api/checkout/webhook/route.ts` | 171-195 (idempotencia), 180-188 (cast de `existing`), 197-199 (`status`), 243-246 (mapeo), 248-272 (escritura Firestore), 274-297 (telemetría) | **Archivo principal a modificar.** Webhook MP. |
| `src/app/api/checkout/webhook/route.test.ts` | 9-26 (mocks), 72-88 (`setupDb`), 90-106 (`approvedPayment`), 231-249 (test de idempotencia) | Tests del webhook (vitest). Añadir mocks y casos nuevos. |
| `src/lib/telemetry.ts` | 66-70 (union `FunnelEvent`, eventos `mp_checkout_*`) | Añadir 2 eventos nuevos al union type. |
| `src/lib/emailSuppression.ts` | 1-33 (todo el archivo: `isEmailSuppressed`, `suppressEmail`, colección `email_suppressions`) | Añadir `unsuppressEmail()`. |
| `src/lib/n8nWebhook.ts` | 1-35 | **Solo lectura** — helper `sendN8NWebhook(event, payload)` ya existente (nunca lanza, timeout 5s). Patrón de uso: `src/app/api/sessions/route.ts:192` y `src/app/api/events/hybrid-offer/route.ts:40`. |
| `src/app/api/email/send/route.ts` | 139-152 | **Solo lectura** — explica por qué hay que poner `hybridConvertedAt: null` al revertir (el check usa `hybridStatus === "converted" || Boolean(hybridConvertedAt)`). NO modificar. |
| `src/lib/mercadoPago.ts` | 212-246 (`MpPaymentDetails`, `fetchMpPayment`) | **Solo lectura** — `status` ya es `string`, no requiere cambios. |

Notas de contexto verificadas:
- El doc de sesión se crea en `src/app/api/sessions/route.ts` (~línea 150) con `email` a nivel raíz, `hybridStatus: "prospect"` y `hybridConvertedAt: null`.
- La supresión por conversión se escribe con `suppressEmail(email, "hybrid_converted", ...)` en `src/app/api/email/send/route.ts:147`. La de unsubscribe usa reason `"user_unsubscribe"` (`src/app/api/unsubscribe/route.ts:16`) — **nunca** debe levantarse esa.
- `trackEvent` (telemetría) es best-effort: puede dropear escrituras tras 5s (`src/lib/telemetry.ts:177-200`). Por eso el registro de auditoría del refund debe ser una escritura Firestore directa, no solo telemetría.

## Pasos

### 1. `src/lib/emailSuppression.ts` — añadir `unsuppressEmail`

Añadir al final del archivo (mismo estilo que `suppressEmail`):

```ts
/**
 * Elimina una supresión de email. Si se pasa `onlyReason`, solo borra
 * cuando la supresión existente tiene exactamente ese reason (p. ej.
 * nunca levantar "user_unsubscribe" al procesar un reembolso).
 */
export async function unsuppressEmail(
  email: string,
  options?: { onlyReason?: string }
): Promise<boolean> {
  const db = getDb();
  const ref = db.collection("email_suppressions").doc(normalizeEmail(email));
  const doc = await ref.get();
  if (!doc.exists) return false;
  if (options?.onlyReason && doc.data()?.reason !== options.onlyReason) {
    return false;
  }
  await ref.delete();
  return true;
}
```

### 2. `src/lib/telemetry.ts` — nuevos eventos de funnel

En el union `FunnelEvent`, junto a los existentes `"mp_checkout_completed" | "mp_checkout_failed" | "mp_checkout_pending"` (líneas 68-70), añadir:

```ts
  | "mp_checkout_refunded"
  | "mp_checkout_chargeback"
```

No tocar nada más de este archivo.

### 3. `src/app/api/checkout/webhook/route.ts` — el cambio principal

**3a. Imports.** Añadir:

```ts
import { sendN8NWebhook } from "@/lib/n8nWebhook";
import { unsuppressEmail } from "@/lib/emailSuppression";
```

**3b. Ampliar el cast de `existing`** (líneas 180-188) para incluir `mpStatus?: string`.

**3c. Mover la lectura del status arriba y arreglar la idempotencia** (líneas 190-199). Definir `const status = payment.status;` ANTES del bloque de idempotencia y reemplazar el `if` actual por:

```ts
const isReversalStatus =
  status === "refunded" || status === "charged_back" || status === "in_mediation";

// Idempotencia:
// 1) Notificación repetida de un pago ya completado (replay de "approved",
//    o llegada tardía de "pending"/"in_process") → no reprocesar.
//    PERO un refund/chargeback del mismo paymentId SÍ debe procesarse.
if (
  existing?.paymentId === paymentId &&
  existing?.status === "completed" &&
  !isReversalStatus
) {
  return NextResponse.json({ ok: true, alreadyProcessed: true });
}

// 2) Notificación repetida de un refund/dispute ya procesado → no duplicar alertas.
if (
  existing?.paymentId === paymentId &&
  (existing?.status === "refunded" || existing?.status === "disputed") &&
  existing?.mpStatus === status
) {
  return NextResponse.json({ ok: true, alreadyProcessed: true });
}

// 3) Estado terminal: una vez refunded/disputed, ignorar replays de
//    "approved"/"pending" tardíos — nunca re-convertir.
if (
  existing?.paymentId === paymentId &&
  (existing?.status === "refunded" || existing?.status === "disputed") &&
  !isReversalStatus
) {
  return NextResponse.json({ ok: true, alreadyProcessed: true });
}
```

(La línea 199 actual `const status = payment.status; // ...` se elimina/reubica para no redeclarar.)

**3d. Mapeo de estados** (líneas 243-246). Ampliar el union y el mapeo:

```ts
let mappedStatus:
  | "completed"
  | "pending"
  | "failed"
  | "redirected"
  | "refunded"
  | "disputed" = "pending";
if (status === "approved") mappedStatus = "completed";
else if (status === "rejected" || status === "cancelled") mappedStatus = "failed";
else if (status === "refunded") mappedStatus = "refunded";
else if (status === "charged_back" || status === "in_mediation") mappedStatus = "disputed";
else if (status === "in_process" || status === "pending") mappedStatus = "pending";
```

> Decisión de producto (default recomendado, marcado ✅): `in_mediation` (disputa abierta en MP, previa al chargeback) se trata como `"disputed"` ✅. Alternativa: tratarla como estado aparte — no vale el esfuerzo ahora.

**3e. Escritura en Firestore** (bloque `sessionRef.set`, líneas 248-272). Mantener lo existente y añadir, junto al spread condicional de `completed`:

```ts
...(mappedStatus === "refunded" && {
  hybridStatus: "refunded",
  hybridConvertedAt: null,
  hybridRefundedAt: FieldValue.serverTimestamp(),
}),
...(mappedStatus === "disputed" && {
  hybridStatus: "disputed",
  hybridConvertedAt: null,
  hybridDisputedAt: FieldValue.serverTimestamp(),
}),
```

`hybridConvertedAt: null` es imprescindible: `src/app/api/email/send/route.ts:144-145` considera convertido a cualquiera con `hybridConvertedAt` truthy. El timestamp original de conversión no se pierde — queda en el registro de auditoría del paso 3f.

**3f. Registro de auditoría durable** (después del `sessionRef.set`, solo para `refunded`/`disputed`). La telemetría puede dropear escrituras, así que el rastro contable va a una subcolección con ID determinístico (idempotente ante replays):

```ts
if (mappedStatus === "refunded" || mappedStatus === "disputed") {
  await sessionRef
    .collection("checkout_events")
    .doc(`${paymentId}_${status}`)
    .set({
      paymentId,
      mpStatus: status,
      mpStatusDetail: payment.status_detail || null,
      mappedStatus,
      amount: payment.transaction_amount || null,
      previousCheckoutStatus: existing?.status ?? null,
      previousHybridConvertedAt: snap.data()?.hybridConvertedAt ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
}
```

**3g. Levantar la supresión de emails** (solo `refunded`). El email del dueño está en el doc de sesión a nivel raíz (`snap.data()?.email`); fallback `payment.payer?.email`. Solo se borra la supresión cuyo reason sea `"hybrid_converted"` (la que escribe `email/send` tras convertir) — jamás un `"user_unsubscribe"`:

```ts
if (mappedStatus === "refunded") {
  const ownerEmail =
    (snap.data()?.email as string | undefined) || payment.payer?.email;
  if (ownerEmail) {
    await unsuppressEmail(ownerEmail, { onlyReason: "hybrid_converted" }).catch(
      (e) => console.error("[MP_WEBHOOK] unsuppress failed", e)
    );
  }
}
```

> Decisión de producto (default recomendado ✅): en **chargeback NO se levanta la supresión** — un cliente que disputó el cargo no debe recibir emails de nurture; el caso lo gestiona el equipo vía la alerta n8n.

**3h. Telemetría + alerta n8n.** En el bloque de telemetría (líneas 274-297), añadir ramas antes del `else` final:

```ts
} else if (mappedStatus === "refunded") {
  await trackEvent({
    sessionId: ref.shareId,
    event: "mp_checkout_refunded",
    metadata: { sku, paymentId, amount: payment.transaction_amount },
  });
  await sendN8NWebhook("payment_refunded", {
    shareId: ref.shareId,
    paymentId,
    sku,
    amount: payment.transaction_amount ?? null,
    mpStatus: status,
    mpStatusDetail: payment.status_detail || null,
  });
} else if (mappedStatus === "disputed") {
  await trackEvent({
    sessionId: ref.shareId,
    event: "mp_checkout_chargeback",
    metadata: { sku, paymentId, amount: payment.transaction_amount, mpStatus: status },
  });
  await sendN8NWebhook("payment_chargeback", {
    shareId: ref.shareId,
    paymentId,
    sku,
    amount: payment.transaction_amount ?? null,
    mpStatus: status,
    mpStatusDetail: payment.status_detail || null,
    actionRequired: "Responder disputa en MercadoPago con evidencia — plazo corto",
  });
}
```

Usar `await` (no `void`) con `sendN8NWebhook`: en Vercel un fire-and-forget puede morir al responder; el helper nunca lanza y tiene timeout interno de 5s, así que no rompe el webhook ni excede el timeout de MP. Las alertas llegan al destino configurado por `N8N_WEBHOOK_BASE_URL` / `N8N_WEBHOOK_URL` (ya documentadas en `.env.example:161-162` — no hay env vars nuevas).

**3i. Actualizar el comentario de cabecera del archivo** (bloque "Idempotencia", líneas 14-16) para reflejar que refunds/chargebacks del mismo `paymentId` sí se reprocesan.

### 4. `src/app/api/checkout/webhook/route.test.ts` — tests

**4a. Mocks nuevos** junto a los existentes (líneas 9-26):

```ts
vi.mock("@/lib/n8nWebhook", () => ({
  sendN8NWebhook: vi.fn(async () => undefined),
}));
vi.mock("@/lib/emailSuppression", () => ({
  unsuppressEmail: vi.fn(async () => true),
}));
```

**4b. Helper `setupDb`**: extender `sessionRef` mock con `collection: vi.fn(() => ({ doc: vi.fn(() => ({ set: vi.fn(async () => undefined) })) }))` para la subcolección `checkout_events` (o capturar el `set` para aserciones).

**4c. Casos nuevos** (usar `approvedPayment({ status: "refunded", status_detail: "refunded" })` etc.):

1. **Refund sobre pago completado**: sesión con `checkout: { paymentId: "pay_1", status: "completed", mpStatus: "approved", internalId: "hybrid_monthly_v1", amount: 199, currency: "MXN" }` + `email: "owner@test.com"`; `fetchMpPayment` devuelve `status: "refunded"`. Esperar: 200 con `status: "refunded"`; `sessionRef.set` con `checkout.status: "refunded"`, `hybridStatus: "refunded"`, `hybridConvertedAt: null`; escritura en subcolección `checkout_events`; `unsuppressEmail` llamado con `"owner@test.com"` y `{ onlyReason: "hybrid_converted" }`; `trackEvent` con `mp_checkout_refunded`; `sendN8NWebhook` con `"payment_refunded"`.
2. **Chargeback sobre pago completado**: igual pero `status: "charged_back"`. Esperar `status: "disputed"`, `hybridStatus: "disputed"`, `sendN8NWebhook` con `"payment_chargeback"`, y que `unsuppressEmail` **no** fue llamado.
3. **Refund repetido es idempotente**: sesión con `checkout: { paymentId: "pay_1", status: "refunded", mpStatus: "refunded", ... }` y payment `refunded` → `alreadyProcessed: true`, sin `set`, sin n8n, sin telemetría.
4. **"approved" tardío tras refund no re-convierte**: sesión con `checkout.status: "refunded"`, payment `approved` → `alreadyProcessed: true`, sin `set`.

**4d.** El test existente `"treats an already completed payment as idempotent"` (línea 231) debe seguir pasando **sin modificarlo**: el payment mockeado ahí es `approved`, que sigue siendo idempotente sobre un `completed`.

### Limitación conocida (documentar, no implementar)

Los **reembolsos parciales** en MP mantienen `status: "approved"` y solo cambian `transaction_amount_refunded`; este fix cubre reembolso total y contracargo. Dejar un comentario en el webhook indicándolo (p. ej. junto al mapeo de estados).

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

1. `pnpm vitest run src/app/api/checkout/webhook/route.test.ts` → verde, con los 6 tests previos intactos + ≥4 tests nuevos (refund, chargeback, refund repetido idempotente, approved tardío post-refund).
2. `pnpm test` → toda la suite vitest en verde (baseline actual: verde).
3. `pnpm exec tsc --noEmit` → exit 0 (baseline actual: exit 0).
4. `pnpm lint` → sin errores nuevos.
5. `grep -n "charged_back" src/app/api/checkout/webhook/route.ts` → al menos una coincidencia en el mapeo de estados (ya no cae al default `pending`).
6. `grep -n "alreadyProcessed" src/app/api/checkout/webhook/route.ts` → la condición de idempotencia ya NO devuelve `alreadyProcessed` cuando `payment.status` es `refunded`/`charged_back`/`in_mediation` sobre un `completed` (verificable por el test nuevo #1).
7. `grep -n "unsuppressEmail" src/lib/emailSuppression.ts src/app/api/checkout/webhook/route.ts` → función exportada y usada en el webhook con `onlyReason: "hybrid_converted"`.
8. `grep -n "mp_checkout_refunded\|mp_checkout_chargeback" src/lib/telemetry.ts` → ambos eventos en el union `FunnelEvent`.
9. `grep -n "payment_refunded\|payment_chargeback" src/app/api/checkout/webhook/route.ts` → alertas n8n presentes.
10. Comportamiento observable (vía tests): tras un refund, el doc de sesión queda con `hybridStatus: "refunded"` y `hybridConvertedAt: null` — es decir, el check de supresión de `src/app/api/email/send/route.ts:144-145` (`hybridStatus === "converted" || Boolean(hybridConvertedAt)`) ya no lo trata como convertido.

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente.
- Si encuentras algo inesperado que bloquee el fix, repórtalo y detente en vez de improvisar.
