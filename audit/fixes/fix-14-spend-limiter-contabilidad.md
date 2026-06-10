# Fix 14 — Spend limiter honesto: precios reales, gasto por intento, una sola tabla

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #9, #15

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision genera 3 imágenes (m4/m8/m12) por sesión con Gemini. El freno financiero del negocio es `src/lib/spendLimiter.ts` (límites `GEMINI_DAILY_LIMIT_USD`/`GEMINI_HOURLY_LIMIT_USD`, transacciones sobre la colección `gemini_spend`, fail-closed). El problema: **contabiliza entre la mitad y un cuarto del gasto real**, verificado así:

1. **Precio "batch" ficticio:** `estimateSessionCost` (`src/lib/imageConfig.ts:203-207`) suma `pricing.batchCost` (−50%) para m8/m12 porque su `processingStrategy` es `"batch"` (`imageConfig.ts:165-172`) — pero NO existe ninguna llamada batch: el único endpoint es `getImageGenerationEndpoint` (`imageConfig.ts:216-221`), siempre `:generateContent` síncrono, usado por `src/lib/nanobanana.ts:291-305` para los 3 pasos (grep `batchGenerateContent|:batch` en src/ = 0). Reserva $0.268 vs costo real ~$0.402 (+50%).
2. **Reintentos no contabilizados:** cada paso se reintenta hasta `MAX_RETRIES=2` más el intento inicial (`src/app/api/generate-images/route.ts:55`, `withRetry` `:396-417`) y cada reintento es una llamada real — pero `reserveSpend` se llama UNA vez por request. Peor caso ~$1.21 real vs $0.268 contado (4.5x).
3. **Tres tablas de precios desincronizadas:** `imageConfig.PRICING`, la constante `analysisCost = 0.001` (`src/app/api/analyze/route.ts:128`) y `estimateCost` → `0.0005` (`src/lib/telemetry.ts:~317`).
4. **#15:** `reserveSpend` se ejecuta ANTES de `acquireJobLock` (`generate-images/route.ts:294-318`) y no hay reembolso si el lock se niega: requests rechazados inflan el contador (sesgo conservador, pero ensucia el dato).

**Negocio:** cuando el contador diga $50/día, la factura real de Gemini puede ir en $75-150+, multiplicándose en picos con fallos del proveedor — exactamente cuando más tráfico hay.

## Archivos involucrados
- `src/lib/imageConfig.ts:160-221` — quitar la ficción batch de `estimateSessionCost` (o eliminar `processingStrategy` del cálculo); exportar `PRICING` como única fuente.
- `src/app/api/generate-images/route.ts:294-318` (orden reserve/lock) y `:396-417` (withRetry) — registrar gasto por intento real.
- `src/lib/spendLimiter.ts` — añadir `recordSpend(amount, kind)` incremental (si solo existe la reserva previa) usando la misma transacción de `gemini_spend`.
- `src/app/api/analyze/route.ts:128` y `src/lib/telemetry.ts:~317` — importar el precio desde `imageConfig.PRICING` (añadir entrada `analysis`).
- Tests nuevos junto a `imageConfig.test.ts` (ya existe, `src/lib/imageConfig.test.ts`).

## Pasos
1. En `imageConfig.ts`: `estimateSessionCost` usa SIEMPRE `standardCost` (documenta con un comentario que no existe API batch). Añade `PRICING.analysis` con el valor real estimado y expórtalo.
2. Reordenar en `generate-images/route.ts`: `acquireJobLock` PRIMERO, `reserveSpend` después (solo si el lock se adquirió). Si la reserva falla, liberar el lock (`markJobFailed` o el mecanismo existente de `src/lib/jobManager.ts`).
3. Contabilidad por intento: dentro del callback de `withRetry`, tras cada llamada real a `generateTransformedImage`, llamar `recordSpend(PRICING[model].standardCost, "image_attempt")`. Convertir la "reserva" inicial en estimación (o reservar 1 intento por paso y registrar los reintentos como gasto adicional). Mantener el chequeo de límite ANTES de gastar (fail-closed se conserva).
4. `analyze/route.ts` y `telemetry.ts` leen el precio de análisis desde `imageConfig.PRICING.analysis` (borrar las constantes locales).
5. Tests: `estimateSessionCost` sin descuento batch; reserva-tras-lock (mock de jobManager); gasto acumulado = intentos × precio en un escenario con 1 retry.

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde (incluye `imageConfig.test.ts` existente, ajustado si asserta el batch viejo).
- `grep -n "batchCost" src/lib/imageConfig.ts` ya no participa en `estimateSessionCost` (o la constante se elimina).
- `grep -rn "0.001\|0.0005" src/app/api/analyze/route.ts src/lib/telemetry.ts` = 0 (precio centralizado).
- En un run simulado con 1 fallo+retry, el total registrado en `gemini_spend` refleja 2 intentos, no 1 sesión plana.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO cambies límites por defecto ($50/$10) ni el carácter fail-closed.
- Si algo inesperado bloquea el fix (p.ej. spendLimiter no permite incrementos parciales sin refactor mayor), repórtalo y detente en vez de improvisar.
