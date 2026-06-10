# Fix 04 — Pagos legítimos rechazados con 409: registrar como `needs_review` en vez de perder la notificación

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3 días | **Hallazgos cubiertos:** #56

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision es una app Next.js 16 (App Router, código en `src/` en la raíz del repo — NO existe carpeta `app/` raíz) que vende el programa "NGX HYBRID" vía MercadoPago Checkout Pro. El flujo de pago es: `POST /api/checkout/create-preference` crea una preference de MP y guarda el "intent" en el documento de sesión de Firestore (`sessions/{shareId}.checkout`), el usuario paga en MP, y MP notifica a `POST /api/checkout/webhook`, que consulta el pago real a la API de MP (`fetchMpPayment`) y reconcilia el estado en Firestore (`checkout.status: "completed"` + `hybridStatus: "converted"`).

El bug: el webhook valida el pago contra el **último intent guardado en la sesión**, y ante cualquier mismatch responde **409 sin registrar nada**. Dos escenarios legítimos y probables lo disparan:

1. **Cambio de plan en otra pestaña**: el usuario genera la preference de `monthly` (la sesión guarda `checkout.internalId = "hybrid_monthly_v1"`), luego genera la de `quarterly` (`create-preference` **sobrescribe** el intent con `hybrid_quarterly_v1` — ver `src/app/api/checkout/create-preference/route.ts` líneas 88-103), pero termina pagando el checkout de `monthly` que quedó abierto en la otra pestaña. El webhook detecta `existing.internalId !== internalId` y responde `409 "SKU mismatch"` (`src/app/api/checkout/webhook/route.ts` líneas 201-209) sin escribir nada en Firestore.
2. **Cambio de precio desplegado con checkout abierto**: la validación de monto usa el precio **actual** de los env vars (`getHybridSkuConfig(sku)?.price`, líneas 211-228 del webhook). Si se despliega un cambio de `NEXT_PUBLIC_HYBRID_PRICE_*` mientras un cliente tiene el checkout abierto, su pago legítimo se rechaza con `409 "Amount mismatch"`, igualmente sin registrar.

Impacto de negocio: MP reintenta la notificación, recibe 409 cada vez y eventualmente se rinde. El cliente **fue cobrado** pero la sesión queda en `status: "redirected"`, `hybridStatus` nunca pasa a `"converted"`, no hay telemetría de venta y el negocio no sabe que le debe algo a alguien — se descubriría solo cuando el cliente reclame o al comparar manualmente el panel de MP contra Firestore. El fix: validar el pago contra los **datos embebidos en el propio payment de MP** (que vienen del servidor de MP vía `fetchMpPayment`, no del cliente), y ante mismatch de monto/moneda **registrar el pago en estado `needs_review` + alertar** (Sentry + n8n), devolviendo 200 para que MP no pierda la notificación.

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`), líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/app/api/checkout/webhook/route.ts` | 180-241 (validaciones), 243-304 (persistencia + telemetría) | **Archivo principal a modificar.** Webhook de MP. Líneas 201-209: rechazo 409 por SKU mismatch contra la sesión. Líneas 211-228: rechazo 409 por amount mismatch contra precio actual de env. Líneas 229-241: rechazo 409 por currency mismatch. |
| `src/app/api/checkout/webhook/route.test.ts` | 183-229 | Tests vitest existentes del webhook. Los 3 tests de mismatch (409) deben actualizarse al nuevo comportamiento, y añadir tests nuevos. |
| `src/lib/telemetry.ts` | 15-88 (union `FunnelEvent`; los eventos `mp_checkout_*` están en ~66-70) | Añadir el evento `"mp_checkout_needs_review"` al union type. |
| `src/lib/mercadoPago.ts` | 73-106 (`getHybridSkuConfig`), 140-172 (metadata de la preference: `{ shareId, sku, internalId }` y `external_reference: "shareId__internalId"`), 224-246 (`fetchMpPayment`), 251-261 (`parseExternalReference`) | **Solo lectura** — referencia de dónde salen los datos embebidos en el payment. No modificar. |
| `src/lib/n8nWebhook.ts` | 1-35 (`sendN8NWebhook(event, payload)`) | Helper de alertas existente (fire-and-forget, no lanza). Se usará para alertar `needs_review`. No modificar. |
| `src/app/api/csp-report/route.ts` | 9 (import), 68-89 | **Solo lectura** — patrón de referencia del repo para `Sentry.captureMessage` gateado por `process.env.SENTRY_DSN \|\| process.env.NEXT_PUBLIC_SENTRY_DSN`. |
| `src/app/api/checkout/create-preference/route.ts` | 88-103 | **Solo lectura** — contexto: aquí se sobrescribe el intent en la sesión (causa raíz del mismatch). No modificar. |

## Pasos

### 1. Añadir el evento de telemetría

En `src/lib/telemetry.ts`, dentro del union `FunnelEvent`, junto a los demás eventos `mp_checkout_*` (líneas ~66-70), añade:

```ts
| "mp_checkout_needs_review"
```

### 2. Reescribir las validaciones del webhook (`src/app/api/checkout/webhook/route.ts`)

Principio rector: el payment fetched de la API de MP (`fetchMpPayment`) es la fuente de verdad. Su `metadata` (`sku`, `internalId`) y `external_reference` (`shareId__internalId`) los fijó **nuestro servidor** al crear la preference (ver `createMpPreference` en `src/lib/mercadoPago.ts` líneas 164-171) y no son manipulables por el cliente. El "intent" guardado en la sesión es solo el ÚLTIMO intento, no la verdad.

**2a. Imports nuevos** (arriba del archivo, siguiendo el patrón del repo):

```ts
import * as Sentry from "@sentry/nextjs";
import { sendN8NWebhook } from "@/lib/n8nWebhook";
```

**2b. Eliminar el rechazo 409 por SKU mismatch (líneas 201-209 actuales).** Sustituirlo por una detección informativa que NO bloquea:

```ts
const intentMismatch = Boolean(
  existing?.internalId && existing.internalId !== internalId
);
if (intentMismatch) {
  console.warn("[MP_WEBHOOK] Payment is for a different preference than the last saved intent (user likely switched plans in another tab). Proceeding with the payment's own SKU.", {
    shareId: ref.shareId,
    lastIntentInternalId: existing?.internalId,
    paymentInternalId: internalId,
    paymentId,
  });
}
```

El pago se procesa con el `sku`/`internalId` **del propio payment** (que es lo que el código ya hace al persistir: líneas 250-253 actuales escriben `sku` e `internalId` derivados del payment). Nota: `internalId` ya se deriva con fallback robusto en la línea 198 actual (`payment.metadata?.internalId || ref.internalId`); MP a veces normaliza las keys de metadata a snake_case, así que es recomendable ampliar el fallback a `payment.metadata?.internalId ?? payment.metadata?.internal_id ?? ref.internalId` (cast a string).

**2c. Convertir los rechazos 409 de monto/moneda (líneas 211-241 actuales) en clasificación `needs_review`.** Mantener el cálculo de `expectedAmount`/`expectedCurrency` tal como está (ya valida contra el precio configurado del SKU **que el payment dice ser** — `configuredSku` se deriva de `payment.metadata.sku` —, con fallback al intent de la sesión), pero en vez de `return 409`, acumular una razón:

```ts
let needsReviewReason: "amount_mismatch" | "currency_mismatch" | null = null;
// (mismas condiciones que hoy)
if (typeof expectedAmount === "number" && typeof payment.transaction_amount === "number" &&
    Math.abs(payment.transaction_amount - expectedAmount) > 0.01) {
  needsReviewReason = "amount_mismatch";
}
if (!needsReviewReason && expectedCurrency && payment.currency_id &&
    payment.currency_id !== expectedCurrency) {
  needsReviewReason = "currency_mismatch";
}
```

**Decisión de producto (default recomendado, marcado ✅):** la ruta `needs_review` aplica solo cuando `payment.status === "approved"` (hubo cobro real). Para pagos `rejected`/`cancelled`/`pending` con mismatch, basta `console.warn` y procesarlos con el mapeo normal (no hay dinero en riesgo; si un `pending` con mismatch luego se aprueba, MP enviará otra notificación y esa caerá en `needs_review`). Alternativa más estricta (no recomendada): aplicar `needs_review` a cualquier status — complica el funnel sin beneficio.

**2d. Persistencia y alerta cuando `needsReviewReason !== null && status === "approved"`.** En vez del bloque actual de `mappedStatus` + `set` (líneas 243-272), bifurca:

- **Rama `needs_review`:**
  1. Escribir en Firestore (mismo `sessionRef.set(..., { merge: true })`):
     ```ts
     {
       checkout: {
         provider: "mercadopago",
         sku,
         internalId,
         paymentId,
         status: "needs_review",
         needsReviewReason,
         expectedAmount: expectedAmount ?? null,
         expectedCurrency: expectedCurrency ?? null,
         lastIntentInternalId: existing?.internalId ?? null,
         mpStatus: status,
         mpStatusDetail: payment.status_detail || null,
         amount: payment.transaction_amount || null,
         currency: payment.currency_id || null,
         payerEmail: payment.payer?.email || null,
         approvedAt: payment.date_approved ? new Date(payment.date_approved) : null,
         updatedAt: FieldValue.serverTimestamp(),
       },
       lastActivityAt: FieldValue.serverTimestamp(),
     }
     ```
     **NO** escribir `hybridStatus: "converted"` ni `hybridConvertedAt` en esta rama — eso lo decide un humano al resolver la revisión.
  2. Telemetría: `await trackEvent({ sessionId: ref.shareId, event: "mp_checkout_needs_review", metadata: { sku, paymentId, reason: needsReviewReason, expectedAmount, receivedAmount: payment.transaction_amount, expectedCurrency, receivedCurrency: payment.currency_id } })`.
  3. Alerta Sentry (mismo patrón que `src/app/api/csp-report/route.ts` líneas 68-89 — gateada por DSN):
     ```ts
     if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
       Sentry.captureMessage("MP payment needs manual review", {
         level: "error",
         tags: { area: "payments", reason: needsReviewReason },
         extra: { shareId: ref.shareId, paymentId, sku, internalId, expectedAmount, receivedAmount: payment.transaction_amount, expectedCurrency, receivedCurrency: payment.currency_id },
       });
     }
     ```
  4. Alerta n8n fire-and-forget (mismo patrón que `src/app/api/sessions/route.ts` línea 192): `void sendN8NWebhook("mp_payment_needs_review", { shareId: ref.shareId, paymentId, sku, reason: needsReviewReason, amount: payment.transaction_amount });` — `sendN8NWebhook` ya no-opea si no hay `N8N_WEBHOOK_BASE_URL`/`N8N_WEBHOOK_URL` configurado y nunca lanza.
  5. **Responder 200** para que MP deje de reintentar: `return NextResponse.json({ ok: true, paymentId, shareId: ref.shareId, status: "needs_review" });`

- **Rama normal:** igual que hoy (mapeo `approved→completed`, `rejected|cancelled→failed`, resto `pending`; `set` con `hybridStatus: "converted"` si completed; telemetría `mp_checkout_completed|failed|pending`). Añade `intentMismatch` al `metadata` del `trackEvent` de `mp_checkout_completed` cuando aplique, para tener trazabilidad del escenario "cambió de plan en otra pestaña".

**2e. Idempotencia para `needs_review`.** Amplía el short-circuit actual (líneas 190-195) para no re-alertar en notificaciones duplicadas del mismo payment:

```ts
if (
  existing?.paymentId === paymentId &&
  (existing?.status === "completed" || existing?.status === "needs_review")
) {
  return NextResponse.json({ ok: true, alreadyProcessed: true });
}
```

(El tipo inline de `existing` en líneas 180-188 ya tipa `status?: string`, no requiere cambio; si tipas `mappedStatus` con el nuevo valor, añade `"needs_review"` al union local de la línea 243.)

### 3. Actualizar tests existentes (`src/app/api/checkout/webhook/route.test.ts`)

Añade mocks arriba del archivo, junto a los existentes:

```ts
vi.mock("@/lib/n8nWebhook", () => ({ sendN8NWebhook: vi.fn(async () => undefined) }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
```

Cambios a los 3 tests de mismatch (líneas 183-229 actuales):

1. **"does not convert when the internal SKU mismatches..."** (sesión con `internalId: "hybrid_quarterly_v1"`, payment de `monthly` con amount 199 que SÍ cuadra con el precio configurado de monthly): ahora espera **200** con `status: "completed"`, `sessionRef.set` llamado con `checkout.internalId: "hybrid_monthly_v1"` y `hybridStatus: "converted"`, y `trackEvent` con `mp_checkout_completed`. Renombra el test a algo como `"completes a legitimate payment for an older preference when the user switched plans in another tab"`.
2. **Amount mismatch** (payment approved con `transaction_amount: 999` vs precio configurado 199): ahora espera **200** con `status: "needs_review"`; `sessionRef.set` llamado con `checkout.status: "needs_review"`, `needsReviewReason: "amount_mismatch"` y **sin** `hybridStatus` en el payload (`expect.not.objectContaining({ hybridStatus: "converted" })` o aserción equivalente sobre el primer argumento); `trackEvent` con `mp_checkout_needs_review`; `sendN8NWebhook` llamado con `"mp_payment_needs_review"`.
3. **Currency mismatch** (`currency_id: "USD"`): igual que el anterior con `needsReviewReason: "currency_mismatch"`.

Tests nuevos:

4. **Idempotencia de needs_review**: sesión con `checkout: { paymentId: "pay_1", status: "needs_review", ... }` → 200 `alreadyProcessed: true`, sin `set`, sin `trackEvent`, sin `sendN8NWebhook`.
5. **Mismatch con pago no aprobado**: payment `status: "rejected"` con `transaction_amount: 999` → se procesa por la rama normal (`checkout.status: "failed"`, evento `mp_checkout_failed`), sin alerta needs_review.

Los tests 1 ("marks a valid approved payment as converted"), 2 (firma inválida) y el de idempotencia `completed` existentes deben seguir pasando sin cambios.

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo (`/Users/aldoolivas/genesis-scann` — NO hay carpeta `app/`):

1. `pnpm exec vitest run src/app/api/checkout/webhook/route.test.ts` → todos los tests en verde, incluyendo los 2 nuevos.
2. `pnpm test` → la suite completa de vitest sigue en verde (sin regresiones en otros tests).
3. `pnpm exec tsc --noEmit` → sin errores de tipos (en particular, `"mp_checkout_needs_review"` aceptado por `FunnelEvent`).
4. `pnpm lint` → sin errores nuevos.
5. `grep -n "409" src/app/api/checkout/webhook/route.ts` → **cero** resultados (ya no existe ningún rechazo 409 en el webhook; la única respuesta de error que queda para notificaciones firmadas válidas es 4xx/5xx por payment inexistente o error interno).
6. `grep -n "needs_review" src/app/api/checkout/webhook/route.ts` → aparece en la persistencia, la respuesta y la idempotencia.
7. `grep -n "mp_checkout_needs_review" src/lib/telemetry.ts` → 1 resultado en el union `FunnelEvent`.
8. Comportamiento observable esperado (cubierto por tests, no requiere MP real):
   - Payment approved cuyo monto coincide con el precio configurado de SU PROPIO sku → `completed` + `hybridStatus: "converted"`, aunque la sesión tuviera guardado el intent de otro plan.
   - Payment approved con monto distinto al configurado → respuesta **HTTP 200** con `status: "needs_review"`, documento `sessions/{shareId}.checkout.status === "needs_review"`, evento `mp_checkout_needs_review`, llamada a `sendN8NWebhook("mp_payment_needs_review", ...)`, y nunca `hybridStatus: "converted"`.

## Restricciones

- NO toques nada fuera de los archivos listados como modificables (`src/app/api/checkout/webhook/route.ts`, `src/app/api/checkout/webhook/route.test.ts`, `src/lib/telemetry.ts`) y sus tests junto a ellos.
- NO modifiques `src/app/api/checkout/create-preference/route.ts`, `src/lib/mercadoPago.ts` ni `src/lib/n8nWebhook.ts` (son solo contexto/lectura). En particular, NO toques la validación de firma `x-signature` del webhook (líneas 40-100) — está fuera del alcance de este fix.
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias (`@sentry/nextjs` ya está en `package.json`).
- Caso límite conocido y FUERA de alcance: dos pagos aprobados distintos para la misma sesión (doble cobro) se sobrescriben mutuamente en `checkout` — comportamiento pre-existente; no intentes resolverlo aquí.
- Si encuentras algo inesperado que bloquee el fix (p. ej. los números de línea ya no coinciden con la estructura descrita, o la validación de firma cambió), repórtalo y detente en vez de improvisar.
