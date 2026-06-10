# Fix 05 — SKUs vendidos como suscripción pero cobrados como pago único (re-etiquetar oferta HYBRID)
**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 0.5–1 día | **Hallazgos cubiertos:** #1011, #1013

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision es un lead magnet viral (Next.js 16 App Router, código en `src/` en la raíz del repo — NO existe carpeta `app/` raíz de proyecto) que tras mostrar una proyección de transformación física ofrece el programa de pago **NGX HYBRID** con 3 SKUs: `monthly`, `quarterly`, `annual`. El cobro se hace con **MercadoPago Checkout Pro**, que es un API de **pagos únicos**: la única llamada de cobro en todo el repo es `POST https://api.mercadopago.com/checkout/preferences` en `src/lib/mercadoPago.ts` (función `createMpPreference`, línea ~174). No existe ninguna integración con MercadoPago Suscripciones (`/preapproval`, `auto_recurring`), ni almacenamiento de medio de pago, ni motor de renovación, ni dunning — `grep -rinE 'preapproval|auto_recurring|recurring' src/` devuelve 0 hits de código.

El problema: **el copy vende una suscripción que el sistema no puede cumplir**. La descripción del item que se envía a MercadoPago (y que aparece impresa en el comprobante del comprador) dice para el SKU mensual `"NGX HYBRID — Acceso mensual al sistema GENESIS + coach humano. Renovable."` (`src/lib/mercadoPago.ts:60-62`) y para el anual `"...seguimiento de adherencia continuo."` (línea 66). La UI de compra (`src/components/results/HybridOfferV2.tsx`) muestra el SKU mensual como `"$X / mes"` (línea 196) y ancla los otros con `"Equivale a $X/mes"` (líneas 206-209 y 220-223) — formato estándar de suscripción recurrente. La página de éxito (`src/app/checkout/success/page.tsx:46-51`) dice "Tu acceso está siendo activado" sin acotar duración. Nada en el flujo aclara que es un cargo único, ni cuándo termina el acceso, y el webhook (`src/app/api/checkout/webhook/route.ts`) tampoco persiste fecha de expiración del entitlement.

Impacto al negocio: (a) cualquier proyección de MRR basada en estos SKUs está estructuralmente inflada — el cliente "mensual" paga 1 vez y nunca vuelve a ser cobrado; (b) riesgo legal/comercial en México: la palabra "Renovable" impresa en el comprobante de MercadoPago es evidencia documental contra la empresa en una disputa PROFECO o contracargo si el servicio cesa sin aviso; (c) nada corta el acceso, así que el comprador mensual puede usarlo indefinidamente. Mitigante actual: el checkout directo está apagado por default tras `NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT=false` (`.env.example:140`), pero este fix debe completarse **antes** de activar ese flag.

**Decisión de producto (default recomendado): Opción A — re-etiquetar todo como pago único por periodo fijo** (30 días / 12 semanas / 12 meses) y persistir `accessUntil` en el webhook. La Opción B (integrar MercadoPago Suscripciones `/preapproval` para el SKU mensual) es fase 2: en este fix solo se documenta como plan, NO se implementa.

## Archivos involucrados

Líneas verificadas contra el código actual (2026-06-09):

| Archivo | Líneas | Papel |
|---|---|---|
| `src/lib/mercadoPago.ts` | 11 (`HybridSku`), 13-25 (`HybridSkuConfig`), 54-58 (`DEFAULT_LABELS`), 60-67 (`DEFAULT_DESCRIPTIONS` con "Renovable." y "continuo"), 73-106 (`getHybridSkuConfig`), 140-151 (item payload enviado a MP), 174-186 (POST `/checkout/preferences`) | Fuente de labels/descripciones que llegan al comprobante de MP. Aquí se re-etiqueta y se añade duración de acceso |
| `src/components/results/HybridOfferV2.tsx` | 185-228 (construcción de cards: 196 `"/ mes"`, 206-209 y 220-223 `"Equivale a $X/mes"`), 630-732 (bloque "Compra directa opcional" tras el flag) | UI de compra. Aquí se corrige el framing de suscripción y se añade disclaimer de pago único |
| `src/app/checkout/success/page.tsx` | 20-25 (`skuLabel`), 46-51 (copy sin duración) | Página post-pago. Aquí se acota la duración del acceso |
| `src/app/api/checkout/webhook/route.ts` | 234-238 (`configuredSku` ya calculado), 243-272 (persistencia del checkout en Firestore, colección `sessions`, campo `checkout`) | Reconciliación del pago. Aquí se persiste `accessUntil` |
| `.env.example` | 87-110 (sección "Mercado Pago Checkout Pro", labels en 103-105), 138-140 (flag `NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT`) | Defaults de labels y documentación operativa |
| `src/lib/mercadoPago.test.ts` | **NUEVO** | Test unitario (vitest) que fija el contrato de pago único |
| `docs/PAGOS_RECURRENTES_FASE2.md` | **NUEVO** | Plan fase 2: integración `/preapproval` |
| `src/components/results/HybridOfferV2.telemetry.test.ts` | 1-37 | Test estático existente sobre el source del componente — NO romper sus asserts (ver paso 7) |

Tests existentes que deben seguir en verde (mockean `@/lib/mercadoPago`, así que los cambios de copy no los afectan, pero verifícalo): `src/app/api/checkout/create-preference/route.test.ts`, `src/app/api/checkout/webhook/route.test.ts` (usa `expect.objectContaining` sobre `checkout`, tolera el campo nuevo `accessUntil`).

## Pasos

1. **`src/lib/mercadoPago.ts` — añadir duración de acceso al modelo.**
   - En la interfaz `HybridSkuConfig` (líneas 13-25) añade el campo `accessDurationDays: number;` con JSDoc `/** Días de acceso que cubre el pago único. */`.
   - Junto a `DEFAULT_LABELS` añade y **exporta** la constante:
     ```ts
     export const ACCESS_DURATION_DAYS: Record<HybridSku, number> = {
       monthly: 30,
       quarterly: 84, // 12 semanas
       annual: 365,
     };
     ```
   - En el objeto de retorno de `getHybridSkuConfig` (líneas 98-105) añade `accessDurationDays: ACCESS_DURATION_DAYS[sku],`.

2. **`src/lib/mercadoPago.ts` — re-etiquetar labels y descripciones (lo que ve el comprador en el comprobante de MP).**
   - Reemplaza `DEFAULT_LABELS` (líneas 54-58) por:
     ```ts
     const DEFAULT_LABELS: Record<HybridSku, string> = {
       monthly: "Acceso 30 días (pago único)",
       quarterly: "12 semanas · cohorte completa (pago único)",
       annual: "Programa de 12 meses (pago único)",
     };
     ```
   - Reemplaza `DEFAULT_DESCRIPTIONS` (líneas 60-67) por descripciones que: eliminan la palabra "Renovable", eliminan "continuo", y declaran explícitamente pago único + periodo cubierto:
     ```ts
     const DEFAULT_DESCRIPTIONS: Record<HybridSku, string> = {
       monthly:
         "NGX HYBRID — Acceso por 30 días al sistema GENESIS + coach humano. Pago único; no genera cargos recurrentes.",
       quarterly:
         "NGX HYBRID — Cohorte de 12 semanas con sistema GENESIS, coach humano y checkpoints semanales. Pago único; no genera cargos recurrentes.",
       annual:
         "NGX HYBRID — Programa de 12 meses con sistema GENESIS, coach humano y seguimiento de adherencia durante el periodo. Pago único; no genera cargos recurrentes.",
     };
     ```
   - No toques `createMpPreference` ni el payload (líneas 140-172): el item ya toma `config.label` y `config.description`, así que hereda el cambio.

3. **`src/components/results/HybridOfferV2.tsx` — quitar el framing de suscripción del bloque de compra directa.**
   - En la construcción de cards (useMemo, líneas 185-228):
     - Card `monthly` (192-198): fallback de label → `"Acceso 30 días (pago único)"`; `priceLabel` → `monthly ? \`${formatMxn(monthly)} · pago único\` : "Próximamente"` (elimina el literal `" / mes"`).
     - Card `quarterly` (200-213): fallback de label → `"12 semanas · cohorte completa (pago único)"`; `perMonthLabel` → `` `Pago único · equivale a ${formatMxn(Math.round(quarterly / 3))}/mes` `` (la equivalencia como ancla de precio es legítima si el card ya declara pago único).
     - Card `annual` (215-225): fallback de label → `"Programa de 12 meses (pago único)"`; `perMonthLabel` análogo con `annual / 12`.
   - Dentro del bloque `directCheckoutEnabled && (...)` (líneas 630-732), después de la lista de SKUs (cierra en línea ~697) y antes del bloque `checkoutError`, añade un disclaimer visible (usa el mismo patrón de párrafo pequeño que el resto del bloque, p.ej. `text-[11px] text-white/45`):
     > "Todos los precios son pagos únicos por el periodo indicado. No hay renovación automática ni cargos posteriores; al terminar el periodo, renovar requiere una nueva compra."
   - **NO elimines** ninguno de estos strings (los asserta el test estático existente): `"Compra directa opcional"`, `"directCheckoutEnabled &&"`, `"NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT"`, `"Agendar diagnóstico HYBRID"`, `"Recibir mi brief por correo"`, `"Ver video del fundador"`, `"Ayudas antes de decidir"`, `"HYBRID_OFFER_WEBHOOK_EVENTS"`. Tampoco introduzcas el string `"Cohorte abierta"` (hay un `expect(...).not.toContain`).

4. **`src/app/checkout/success/page.tsx` — acotar duración del acceso.**
   - Actualiza el mapa `skuLabel` (líneas 20-24) a los nuevos labels del paso 2.
   - Añade un mapa de duración junto a `skuLabel`:
     ```ts
     const skuDuration: Record<string, string> = {
       monthly: "30 días",
       quarterly: "12 semanas",
       annual: "12 meses",
     };
     ```
   - En el párrafo principal (líneas 46-51), tras "Tu acceso está siendo activado.", inserta una frase con la duración cuando `sp.sku` esté en el mapa:
     > "Tu compra es un pago único que cubre {skuDuration[sp.sku]} de acceso a partir de la activación. No se generan cargos automáticos ni renovaciones."
     Si `sp.sku` no está en el mapa, omite la frase de duración pero conserva "pago único, sin cargos automáticos".

5. **`src/app/api/checkout/webhook/route.ts` — persistir `accessUntil` (cierra el gap "nada corta el acceso").**
   - Importa `ACCESS_DURATION_DAYS` desde `@/lib/mercadoPago` (ya se importan `getHybridSkuConfig`, `parseExternalReference`, `fetchMpPayment`, `HybridSku` en la línea 23).
   - Antes del `sessionRef.set` (línea 248), calcula:
     ```ts
     const approvedDate = payment.date_approved ? new Date(payment.date_approved) : new Date();
     const durationDays = ["monthly", "quarterly", "annual"].includes(sku)
       ? ACCESS_DURATION_DAYS[sku as HybridSku]
       : null;
     const accessUntil =
       mappedStatus === "completed" && durationDays
         ? new Date(approvedDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
         : null;
     ```
     (Usa el mapa exportado, NO `configuredSku`, porque `getHybridSkuConfig` devuelve `null` si el precio no está en env y la duración no debe depender del pricing.)
   - Dentro del objeto `checkout` que se persiste (líneas 249-264), añade `accessUntil,` junto a `approvedAt`. No cambies nada más del payload (el campo extra es tolerado por `expect.objectContaining` en `route.test.ts`).

6. **`.env.example` — alinear defaults y documentar el modelo de cobro.**
   - Líneas 103-105: actualiza los valores de ejemplo a los nuevos labels:
     ```
     NEXT_PUBLIC_HYBRID_LABEL_MONTHLY=Acceso 30 días (pago único)
     NEXT_PUBLIC_HYBRID_LABEL_QUARTERLY=12 semanas · cohorte completa (pago único)
     NEXT_PUBLIC_HYBRID_LABEL_ANNUAL=Programa de 12 meses (pago único)
     ```
   - En el encabezado de la sección Mercado Pago (líneas 87-90) añade un comentario:
     ```
     # IMPORTANTE: Checkout Pro = PAGO ÚNICO. Los 3 SKUs NO son suscripciones.
     # Recurrencia real (API /preapproval) es fase 2 — ver docs/PAGOS_RECURRENTES_FASE2.md
     ```
   - Nota operativa (inclúyela como comentario o en el doc de fase 2): si en Vercel ya existen valores para `NEXT_PUBLIC_HYBRID_LABEL_*`, hay que actualizarlos manualmente — los env vars de producción overridean los defaults del código.

7. **Test nuevo `src/lib/mercadoPago.test.ts`** (sigue el patrón de los unit tests existentes en `src/lib/*.test.ts`, vitest):
   - En `beforeEach`, setea `process.env.NEXT_PUBLIC_HYBRID_PRICE_MONTHLY = "199"` (y quarterly/annual), y limpia `NEXT_PUBLIC_HYBRID_LABEL_*` con `delete` para probar los defaults.
   - Asserts mínimos:
     - `getHybridSkuConfig("monthly")!.description` contiene `"Pago único"` y NO contiene `"Renovable"` (idem quarterly/annual: ningún SKU contiene `"Renovable"` ni `"continuo"`).
     - `getHybridSkuConfig(sku)!.accessDurationDays` es 30 / 84 / 365 según SKU.
     - `getHybridSkuConfig("monthly")` devuelve `null` si el precio no está configurado (comportamiento existente, fija la regresión).
   - Opcional pero recomendado: en `src/components/results/HybridOfferV2.telemetry.test.ts` añade un assert al estilo de los existentes (lee el source) — `expect(source).toContain("pago único")` y `expect(source).not.toContain("} / mes")` — para que el framing no regrese en futuros cambios.

8. **Doc nuevo `docs/PAGOS_RECURRENTES_FASE2.md`** — plan de fase 2, SOLO documento (no implementar):
   - Objetivo: convertir el SKU `monthly` en suscripción real con MercadoPago Suscripciones: `POST /preapproval` con `auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount, currency_id: "MXN" }`.
   - Alcance pendiente: webhook de topics `subscription_preapproval` / `subscription_authorized_payment` (hoy `route.ts` solo procesa `payment`, línea 127-135 ignora el resto), renovación del `accessUntil` en cada cobro autorizado, dunning (reintentos/correo en fallo de cobro), cancelación self-service, y migración de los compradores one-time existentes.
   - Decisión a registrar: `quarterly` y `annual` permanecen como pago único por periodo (modelo cohorte); solo `monthly` migra a recurrencia.

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

1. `grep -rn "Renovable" src/` → **0 resultados**.
2. `grep -rn '} / mes' src/components/results/HybridOfferV2.tsx` → **0 resultados** (el priceLabel mensual ya no usa formato de suscripción).
3. `grep -c "Pago único" src/lib/mercadoPago.ts` → **3** (una por SKU en `DEFAULT_DESCRIPTIONS`).
4. `grep -n "accessDurationDays" src/lib/mercadoPago.ts` y `grep -n "accessUntil" src/app/api/checkout/webhook/route.ts` → ambos con resultados.
5. `pnpm test` → verde, incluyendo: el nuevo `src/lib/mercadoPago.test.ts`, y SIN regresión en `src/app/api/checkout/create-preference/route.test.ts`, `src/app/api/checkout/webhook/route.test.ts` y `src/components/results/HybridOfferV2.telemetry.test.ts`.
6. `pnpm exec tsc --noEmit` → sin errores.
7. `pnpm lint` → sin errores nuevos.
8. Comportamiento observable (manual u opcional): con `NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT=true` y un precio configurado en `.env.local`, el bloque "Compra directa opcional" muestra "· pago único" en el SKU mensual y el disclaimer de no-renovación bajo la lista de SKUs; `/checkout/success?sku=monthly` muestra la duración "30 días" y "pago único".
9. `ls docs/PAGOS_RECURRENTES_FASE2.md` → existe y describe la integración `/preapproval` como fase 2.

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente.
- NO actives `NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT` ni cambies su default: este fix prepara el copy para cuando el negocio decida activarlo.
- NO implementes la integración `/preapproval` (fase 2): solo el documento de plan.
- Si encuentras algo inesperado que bloquee el fix (p.ej. las líneas citadas ya no coinciden o el flujo de checkout cambió), repórtalo y detente en vez de improvisar.
