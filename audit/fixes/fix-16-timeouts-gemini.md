# Fix 16 — Timeouts en todas las llamadas a Gemini + maxDuration en /api/analyze

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** <1d | **Hallazgos cubiertos:** #12

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision (Next.js 16 en Vercel, código en `src/`) llama a Gemini en tres puntos y NINGUNO tiene timeout propio (verificado):
- Generación de imágenes: `fetch(endpoint, {...})` sin AbortController en `src/lib/nanobanana.ts:300-305` (los fetch de imágenes de REFERENCIA sí tienen 15s en `:104` — el patrón ya existe en el archivo).
- Análisis: `model.generateContent({...})` en `src/lib/gemini.ts:324-339`, sin timeout.
- Plan: `generateContent` en `src/lib/plan/planGenerator.ts:~233`, sin timeout.

Además `/api/analyze` NO exporta `maxDuration` (solo lo hacen pipeline=300s, generate-images=180s y cron; `vercel.json` no configura functions), así que corre con el default de la plataforma. Si Gemini se cuelga, la función Vercel muere por timeout de plataforma a mitad del job: el lock del job queda `in_progress` y nadie puede reintentar hasta que el stale de **10 minutos** expire (`src/lib/jobManager.ts:152-156`), con el usuario mirando la pantalla de carga.

**Negocio:** una degradación de latencia de Google (común en modelos preview) = usuarios congelados 10+ minutos sin mensaje, en la primera impresión del producto, quemando además el presupuesto reservado sin producir nada.

## Archivos involucrados
- `src/lib/nanobanana.ts:300-305` — fetch principal de imagen (añadir AbortController ~90s; copiar el patrón de `:104`).
- `src/lib/gemini.ts:324-339` — análisis (timeout ~45s).
- `src/lib/plan/planGenerator.ts:~233` — plan (timeout ~30s).
- `src/app/api/analyze/route.ts` — añadir `export const maxDuration = 120;` (mismo patrón que `generate-images/route.ts` y `pipeline/route.ts`).
- `src/app/api/generate-images/route.ts:396-417` — el catch de `withRetry` ya maneja fallos; verificar que un AbortError marca el job (`markJobFailed`/`markJobPartial` de jobManager) y libera el lock.

## Pasos
1. `nanobanana.ts`: envolver el fetch principal con `AbortController` + `setTimeout(90_000)` (limpiar el timer en finally). Ante abort, lanzar un Error tipado (`new Error("gemini_image_timeout")`) para que `withRetry` lo cuente como intento fallido y reintente.
2. `gemini.ts`: el SDK no acepta señal directamente en todas las versiones — envolver con `Promise.race([generateContent(...), timeout(45_000)])` donde `timeout` rechaza con `gemini_analysis_timeout`. (Si fix-13 ya migró a `@google/genai`, usar su soporte de `abortSignal` en `config` si existe.)
3. `planGenerator.ts`: mismo patrón con 30s — el generador ya tiene fallback a plantilla en el catch (`:271-279`), así que el timeout simplemente activará el fallback existente.
4. `analyze/route.ts`: `export const maxDuration = 120;` cerca del resto de exports de config; en el catch global del handler, asegurar que el job se marca fallido (revisar cómo lo hace generate-images y replicar).
5. Hacer los timeouts configurables por env opcional (`GEMINI_IMAGE_TIMEOUT_MS`, etc.) con los defaults indicados.
6. Tests: unit de que el wrapper de timeout rechaza con el error tipado (timer falso con `vi.useFakeTimers()`); que el route de analyze exporta `maxDuration` (assert estático aceptable aquí).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `grep -n "AbortController" src/lib/nanobanana.ts` ≥ 2 (referencias + principal); `grep -n "maxDuration" src/app/api/analyze/route.ts` = 1.
- Simulando un proveedor colgado (mock que nunca resuelve), la llamada rechaza en ≤ timeout configurado y el job NO queda `in_progress` (se marca failed → el retry del cliente puede reintentar sin esperar 10 min).

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO cambies MAX_RETRIES ni la lógica de reintentos (eso es fix-14/fix-17).
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
