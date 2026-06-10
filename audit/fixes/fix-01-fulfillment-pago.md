# Fix 01 — Fulfillment del pago: email de bienvenida + alerta interna al confirmar pago

**Severidad:** 🔴 CRÍTICO | **Esfuerzo estimado:** 1–2 días | **Hallazgos cubiertos:** #53, #1014

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision (este repo) es un lead magnet viral de transformación física (Next.js 16 App Router, código en `src/` en la raíz — **no existe carpeta `app/` separada**; Firebase Admin/Firestore en servidor; pagos vía MercadoPago Checkout Pro). El producto vende "NGX HYBRID" (SKUs `monthly` / `quarterly` / `annual`, $2,999–$24,999 MXN) desde la página de resultados, y MercadoPago confirma los pagos vía webhook en `src/app/api/checkout/webhook/route.ts`.

**El problema:** cuando el webhook recibe un pago `approved`, lo ÚNICO que hace es escribir campos en el documento de sesión de Firestore (`checkout.*`, `hybridStatus: "converted"`, líneas ~248–272) y registrar el evento de telemetría `mp_checkout_completed` (líneas ~274–284). **No envía ningún email, no provisiona nada y no avisa a nadie del equipo.** Sin embargo, la página de éxito `src/app/checkout/success/page.tsx` promete por escrito: "En los próximos minutos recibirás un correo…", "1. Email de bienvenida con tu acceso al sistema (5–10 min)", "2. Tu coach humano te contactará en menos de 24 h", "3. Primer checkpoint agendado en los próximos 7 días" (líneas 46–61) y "Si no recibes el correo en los próximos 30 minutos, escríbenos…" (líneas 86–89). No existe ninguna plantilla de bienvenida en `src/emails/` (grep de `welcome|bienvenida` solo encuentra el copy de la propia página). Peor aún: el único efecto sobre email tras pagar es **suprimir** los correos de nurture (`src/app/api/email/send/route.ts`, bloque `hasConverted` ~líneas 139–153). Lo mismo aplica al flujo `pending` (OXXO/SPEI, muy común en México): `src/app/checkout/pending/page.tsx` líneas 36–41 promete "Te enviaremos un correo en cuanto se confirme", pero la transición pending→approved solo escribe Firestore en silencio.

**Por qué importa:** si se activan los pagos hoy, un cliente paga miles de pesos y recibe NADA automáticamente — ni email, ni contacto — y el negocio ni siquiera se entera de la venta (el fundador tendría que mirar Firestore a mano). Es receta directa para reclamos, reembolsos y contracargos en MercadoPago (que penalizan la cuenta del vendedor), con una promesa escrita de "5–10 min" imposible de cumplir.

**La buena noticia:** toda la infraestructura ya existe en el repo y solo hay que conectarla: Resend ya se usa para emails transaccionales (patrón completo en `src/app/api/brief/send/route.ts` + plantilla `src/emails/transactional/BriefDelivery.tsx`) y ya existe un webhook saliente a n8n (`src/lib/n8nWebhook.ts`, `sendN8NWebhook()`) que hoy se dispara para `lead_captured`, `lead_classified`, `transform_completed` y `hybrid_offer_*` — pero NO para pagos.

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`), líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/app/api/checkout/webhook/route.ts` | 190–195 (early-return idempotente), 243–246 (mapeo de status), 248–272 (write Firestore), 274–297 (telemetría) | **MODIFICAR** — punto único que sabe que un pago se aprobó; aquí se engancha el fulfillment |
| `src/lib/checkoutFulfillment.ts` | (nuevo) | **CREAR** — lógica de fulfillment: email de bienvenida + alerta n8n, idempotente |
| `src/emails/transactional/HybridWelcome.tsx` | (nuevo) | **CREAR** — plantilla react-email de bienvenida (seguir patrón de `BriefDelivery.tsx`) |
| `src/lib/telemetry.ts` | 15–89 (union `FunnelEvent`) | **MODIFICAR** — añadir eventos `hybrid_welcome_email_sent` / `hybrid_welcome_email_failed` |
| `src/app/checkout/success/page.tsx` | 46–61 y 86–89 | **MODIFICAR** — alinear copy con lo que el sistema realmente hace |
| `src/app/checkout/pending/page.tsx` | 36–41 | Solo verificar — su promesa ("correo al confirmarse") se vuelve cierta con este fix; no debería requerir cambios |
| `src/app/api/checkout/webhook/route.test.ts` | todo el archivo | **MODIFICAR** — tests existentes del webhook (vitest, con mocks de `getDb`, `fetchMpPayment`, `trackEvent`); añadir asserts de fulfillment |
| `src/lib/checkoutFulfillment.test.ts` | (nuevo) | **CREAR** — unit tests del módulo nuevo |

Solo lectura (patrones a seguir, NO modificar): `src/app/api/brief/send/route.ts` (patrón Resend completo: `getResend()` local líneas 124–128, `getConfiguredFromEmail()`, envío con `react:` líneas 251–268), `src/lib/n8nWebhook.ts` (función `sendN8NWebhook(event, payload)` — nunca lanza, timeout 5s, no-op si falta env), `src/lib/emailConfig.ts` (`getConfiguredFromEmail(context)`), `src/lib/mercadoPago.ts` (`getHybridSkuConfig()` líneas 73–106, `DEFAULT_LABELS` 54–58, tipo `MpPaymentDetails` ~212), `src/emails/transactional/BriefDelivery.tsx` (estructura react-email + `NEXT_PUBLIC_APP_URL`), `src/app/checkout/failure/page.tsx` líneas 18–25 (patrón de URL de WhatsApp con `NEXT_PUBLIC_WHATSAPP_NUMBER`).

Env vars relevantes (ya documentadas en `.env.example`): `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (línea 46), `NEXT_PUBLIC_APP_URL` (53), `NEXT_PUBLIC_WHATSAPP_NUMBER` (71), `N8N_WEBHOOK_BASE_URL` / `N8N_WEBHOOK_URL` (159–162). No hay que crear env vars nuevas.

## Pasos

### 1. Crear la plantilla `src/emails/transactional/HybridWelcome.tsx`

Copiar la estructura de `BriefDelivery.tsx` (componentes `@react-email/components`: `Html`, `Head`, `Preview`, `Tailwind`, `Body`, `Container`, `Section`, `Text`, `Button`, `Hr`, `Img`; mismo estilo dark `bg-[#0A0A0A]`). Props sugeridas:

```ts
interface HybridWelcomeProps {
  shareId: string;
  skuLabel: string;        // p.ej. "Cohorte de 12 semanas" (de getHybridSkuConfig().label o DEFAULT_LABELS)
  amount?: number | null;  // payment.transaction_amount
  currency?: string | null;
  whatsappUrl?: string | null;
}
```

Contenido (en español, tono NGX): confirmación de la compra (plan + monto si está disponible), y "lo que sigue": (a) tu coach te contactará en las próximas 24 h, (b) primer checkpoint en los próximos 7 días, (c) botón a `${baseUrl}/s/${shareId}` ("Ver mi transformación") y, si `whatsappUrl` existe, enlace de contacto directo. Base URL igual que en `BriefDelivery.tsx`: `process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://ngxvision.app"`. **No prometer "acceso al sistema en 5–10 min"** — no existe provisión automática de acceso en el repo. Es un email transaccional (confirmación de compra): no incluir link de unsubscribe de marketing (a diferencia de BriefDelivery).

### 2. Crear `src/lib/checkoutFulfillment.ts`

Exportar una función única, idempotente y que **nunca lance** (todo en try/catch interno; el webhook no debe romperse por fallos de fulfillment):

```ts
export interface FulfillmentInput {
  shareId: string;
  paymentId: string;
  sku: string;             // "monthly" | "quarterly" | "annual" | "unknown"
  internalId?: string;
  amount?: number | null;
  currency?: string | null;
  payerEmail?: string | null; // payment.payer?.email — fallback
}

export async function runPaymentFulfillment(
  sessionRef: FirebaseFirestore.DocumentReference,
  sessionData: Record<string, unknown> | undefined,
  input: FulfillmentInput
): Promise<void>
```

Lógica interna, en orden:

1. **Idempotencia:** si `sessionData?.fulfillment?.welcomeEmailSentAt` existe → return inmediato (ya cumplido). Este flag es la fuente de verdad, no el `paymentId`.
2. **Alerta interna (n8n) — SIEMPRE primero, incluso si Resend no está configurado:** `await sendN8NWebhook("payment_completed", { shareId, email, sku, internalId, paymentId, amount, currency, source: "mp_webhook" })`. Mirror del payload de `lead_captured` en `src/app/api/sessions/route.ts:192-198`. `sendN8NWebhook` ya hace no-op silencioso si no hay `N8N_WEBHOOK_BASE_URL`/`N8N_WEBHOOK_URL` y nunca lanza, así que se puede `await` sin riesgo. Para no re-alertar en reintentos, guardar también `fulfillment.teamAlertSentAt` y saltarse este paso si ya existe.
3. **Resolver destinatario:** `const email = sessionData?.email || input.payerEmail` (el doc de sesión guarda `email` a nivel raíz — ver `src/app/api/sessions/route.ts:152`). Si no hay email → log `console.error("[FULFILLMENT] no email for shareId", ...)` + `trackEvent` de fallo y return (la alerta n8n del paso 2 ya avisó al equipo para fulfillment manual).
4. **Decisión de producto (default recomendado, marcado):** ✅ **NO consultar `isEmailSuppressed()`** — este es un email transaccional de confirmación de compra (obligación contractual), exento de la supresión de marketing. Dejar comentario en el código explicándolo.
5. **Enviar email vía Resend:** patrón idéntico a `src/app/api/brief/send/route.ts`: `getResend()` local que devuelve `null` sin `RESEND_API_KEY`; `const from = getConfiguredFromEmail("CHECKOUT_FULFILLMENT")`. Si `resend` o `from` son `null`: `console.error` + `trackEvent({ sessionId: shareId, event: "hybrid_welcome_email_failed", metadata: { reason: "resend_not_configured" } })` y return — **sin lanzar** (la venta ya quedó registrada en Firestore y el equipo ya fue alertado por n8n). Si está configurado: `resend.emails.send({ from, to: email, subject: "Bienvenido a NGX HYBRID — confirmación y siguientes pasos", react: HybridWelcome({...}) })`. Para `skuLabel` usar `getHybridSkuConfig(sku)?.label` cuando el sku sea válido, con fallback `"NGX HYBRID"`. Construir `whatsappUrl` con el patrón de `src/app/checkout/failure/page.tsx:18-25`.
6. **Persistir el resultado (merge):**
   ```ts
   await sessionRef.set({
     fulfillment: {
       welcomeEmailSentAt: FieldValue.serverTimestamp(),
       welcomeEmailMessageId: sendData?.id ?? null,
       teamAlertSentAt: ...,
       paymentId: input.paymentId,
     },
   }, { merge: true });
   ```
   Si Resend devolvió `error`: en lugar de `welcomeEmailSentAt`, guardar `fulfillment.welcomeEmailError: String(...)` + `trackEvent("hybrid_welcome_email_failed", { reason: "resend_error" })`, para que el fallo quede visible en Firestore y el equipo (ya alertado vía n8n) pueda actuar.
7. **Telemetría de éxito:** `trackEvent({ sessionId: shareId, event: "hybrid_welcome_email_sent", metadata: { messageId, sku, paymentId } })`.

### 3. Añadir los eventos a `src/lib/telemetry.ts`

En la union `FunnelEvent` (líneas 15–89), junto al bloque `mp_checkout_*` (~líneas 66–70), añadir:

```ts
  | "hybrid_welcome_email_sent"
  | "hybrid_welcome_email_failed"
```

### 4. Enganchar el fulfillment en `src/app/api/checkout/webhook/route.ts`

Dos puntos de enganche (la función es idempotente, llamarla dos veces es seguro):

a) **Rama principal:** dentro del bloque `if (mappedStatus === "completed")` de telemetría (líneas 275–284), después del `trackEvent` de `mp_checkout_completed`, llamar:

```ts
await runPaymentFulfillment(sessionRef, snap.data(), {
  shareId: ref.shareId,
  paymentId,
  sku,
  internalId,
  amount: payment.transaction_amount ?? null,
  currency: payment.currency_id ?? null,
  payerEmail: payment.payer?.email ?? null,
});
```

Usar `await` (no `void`): en Vercel serverless un `void` puede quedar congelado al terminar la respuesta. `runPaymentFulfillment` nunca lanza, así que el webhook sigue devolviendo 200 a MP pase lo que pase. **Esto cubre automáticamente la transición pending→approved de OXXO/SPEI**: el primer webhook escribe `status: "pending"`, y cuando MP notifica `approved` para el mismo `paymentId`, el early-return de idempotencia (líneas 190–195) NO aplica (exige `status === "completed"` previo), por lo que el flujo entra a la rama `completed` y dispara el fulfillment.

b) **Reintentos de MP (recuperación):** en el early-return idempotente (líneas 190–195), ANTES del `return ... alreadyProcessed`, llamar también a `runPaymentFulfillment(sessionRef, snap.data(), {...con datos de `existing`...})`. Así, si el primer intento de email falló (p.ej. Resend caído), un reintento del webhook de MP o una re-notificación lo recupera sin doble envío (el flag `fulfillment.welcomeEmailSentAt` protege). Nota: en este punto aún no se ha llamado `fetchMpPayment`, así que construir el input con `existing.paymentId`, `existing.internalId`, `existing.amount`, `existing.currency` y `sku` derivado de `existing.internalId` o `"unknown"` — el email del destinatario sale del doc de sesión de todos modos.

No tocar nada más del webhook (validación de firma, mismatches de SKU/monto/moneda, mapeo de status quedan igual).

### 5. Alinear el copy de `src/app/checkout/success/page.tsx`

- Párrafo de líneas 46–51: quitar "acceso al sistema GENESIS" como entregable del correo. Nuevo sentido: "En los próximos minutos recibirás un correo de bienvenida con la confirmación de tu compra y los siguientes pasos."
- Lista "Lo que sigue" (líneas 57–61): reemplazar el ítem 1 "Email de bienvenida con tu acceso al sistema (5–10 min)" por "Email de bienvenida con la confirmación y siguientes pasos (en los próximos minutos)". Mantener ítems 2 y 3 (coach <24 h, checkpoint 7 días) — con la alerta n8n el equipo ahora sí se entera al instante y puede cumplirlos; son los mismos compromisos que comunica el email del paso 1.
- Mantener el aviso de las líneas 86–89 (qué hacer si no llega el correo en 30 min) — sigue siendo válido.
- `src/app/checkout/pending/page.tsx` (líneas 36–41) NO necesita cambios: su promesa "te enviaremos un correo en cuanto se confirme" pasa a ser cierta con el paso 4a.

### 6. Tests

a) **Nuevo `src/lib/checkoutFulfillment.test.ts`** (vitest; mockear `resend` — `vi.mock("resend")` —, `@/lib/n8nWebhook`, `@/lib/telemetry`, y pasar un `sessionRef` falso con `set: vi.fn()` como hace `setupDb()` en `src/app/api/checkout/webhook/route.test.ts:72-88`). Casos mínimos:
   - envía email + n8n + persiste `fulfillment.welcomeEmailSentAt` con datos completos;
   - early-return sin enviar nada si `sessionData.fulfillment.welcomeEmailSentAt` existe;
   - sin `RESEND_API_KEY`: dispara n8n igualmente, trackea `hybrid_welcome_email_failed` con `reason: "resend_not_configured"`, NO lanza;
   - sin email en sesión ni payer: trackea fallo, NO lanza;
   - error de Resend: persiste `welcomeEmailError`, trackea fallo, NO lanza.

b) **Extender `src/app/api/checkout/webhook/route.test.ts`**: añadir `vi.mock("@/lib/checkoutFulfillment", () => ({ runPaymentFulfillment: vi.fn(async () => undefined) }))` y asserts:
   - en el test "marks a valid approved payment as converted": `runPaymentFulfillment` fue llamado con `shareId: "share_1"`, `paymentId: "pay_1"`, `sku: "monthly"`;
   - pago `pending` (mock de `fetchMpPayment` con `status: "in_process"`): `runPaymentFulfillment` NO fue llamado;
   - transición pending→approved: `setupDb` con `checkout: { paymentId: "pay_1", status: "pending", internalId: "hybrid_monthly_v1", amount: 199, currency: "MXN" }` + payment approved → `runPaymentFulfillment` SÍ fue llamado;
   - test idempotente existente ("treats an already completed payment as idempotent"): ahora debe esperar que `runPaymentFulfillment` SÍ se llame (recuperación del paso 4b) pero `sessionRef.set` del webhook siga sin llamarse — ajustar ese assert.

c) Si existe un test de copy estático que cite el texto viejo de success page (buscar con `grep -rn "5–10 min" src/`), actualizarlo.

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo (`/Users/aldoolivas/genesis-scann` — los scripts viven en el `package.json` de la raíz):

1. `pnpm test` → todos los tests en verde, incluidos los preexistentes de `src/app/api/checkout/webhook/route.test.ts` (ajustados según paso 6b) y los nuevos de `src/lib/checkoutFulfillment.test.ts`.
2. `pnpm exec tsc --noEmit` → sin errores de tipos.
3. `pnpm lint` → sin errores nuevos.
4. `grep -n "runPaymentFulfillment" src/app/api/checkout/webhook/route.ts` → mínimo 2 hits (rama completed + early-return idempotente), además del import.
5. `grep -n "payment_completed" src/lib/checkoutFulfillment.ts` → 1 hit (evento n8n).
6. `grep -rn "hybrid_welcome_email_sent" src/lib/telemetry.ts src/lib/checkoutFulfillment.ts` → presente en la union `FunnelEvent` y en el módulo de fulfillment.
7. `test -f src/emails/transactional/HybridWelcome.tsx && echo OK` → OK.
8. `grep -c "acceso al sistema (5–10 min)" src/app/checkout/success/page.tsx` → `0` (la promesa incumplible ya no existe).
9. Comportamiento observable (smoke manual opcional con `pnpm dev` + mocks, o razonado vía tests): webhook con pago approved → respuesta 200 `{ ok: true, status: "completed" }` y se invocó el fulfillment; webhook duplicado del mismo `paymentId` → `alreadyProcessed: true` sin segundo email (flag `fulfillment.welcomeEmailSentAt`); pago `rejected`/`pending` inicial → ningún email.
10. Sin `RESEND_API_KEY` ni `N8N_WEBHOOK_BASE_URL` configurados, el webhook sigue devolviendo 200 a MercadoPago (nunca 500 por fulfillment) — cubierto por los tests del paso 6a.

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente (`resend` y `@react-email/components` ya están instaladas; verifica con `grep` en `package.json` antes de asumir lo contrario).
- Si encuentras algo inesperado que bloquee el fix (p.ej. que las líneas citadas se hayan desplazado mucho, que el webhook haya cambiado de forma, o que ya exista un módulo de fulfillment), repórtalo y detente en vez de improvisar.
