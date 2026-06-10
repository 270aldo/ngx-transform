# Fix 15 — Footgun de configuración: con flags por defecto, la generación responde 503 al 100%

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** <1d | **Hallazgos cubiertos:** #10

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision genera imágenes de transformación con Gemini. Cadena del bug (verificada): `FF_IDENTITY_CHAIN` es **true por defecto** (`src/lib/validators.ts:230` — `!== "false"`), `FF_NB_PRO` es **false por defecto** (`validators.ts:229` — `=== "true"`), y sin `GEMINI_IMAGE_MODEL`/`GEMINI_MODEL` el modelo resuelto es `gemini-3.1-flash-image-preview` (`src/lib/imageConfig.ts:85-87`), que NO soporta Identity Chain — `supportsIdentityChain` solo acepta `gemini-3-pro-image-preview` (`imageConfig.ts:239-242`). Resultado: `src/app/api/generate-images/route.ts:210-221` responde **503 `identity_chain_model_unsupported` antes de generar nada**, para el 100% de las sesiones (incluido `/api/pipeline` que lo invoca internamente).

Es decir: un deploy a Vercel donde falte `FF_NB_PRO=true` (o esté mal escrita) **brickea el corazón del producto**, visible solo en logs del servidor (la pantalla de carga del usuario se queda colgada — ver fix-20). El TODO "[P1] Investigar fallo en generación de imágenes Identity Chain" (`src/lib/nanobanana.ts:15-17`) sugiere que ya ocurrió. `.env.example` y `.env.local` sí traen `FF_NB_PRO=true`, pero la config de Vercel producción no es verificable desde el repo.

**Negocio:** el producto entero depende de una env var bien escrita, sin validación al arranque ni alarma. El repo ya tiene el patrón correcto para esto: `assertLegalConfigForProductionDeploy()` en `next.config.ts:7` + `src/lib/legalConfig.ts:50-59` falla el build si faltan datos legales.

## Archivos involucrados
- `src/lib/imageConfig.ts:58-88, 239-242` — resolución de modelo y `supportsIdentityChain`.
- **CREAR** función `assertImageConfigForProductionDeploy()` (en `imageConfig.ts` o `src/lib/legalConfig.ts` como vecina) siguiendo el patrón de `legalConfig.ts:50-59`.
- `next.config.ts:1-10` — invocarla junto a la legal.
- `src/app/api/generate-images/route.ts:210-221` — degradación elegante como segunda capa.
- `src/lib/validators.ts:229-230` — solo lectura (flags).
- `src/lib/nanobanana.ts:15-17` — borrar el TODO al cerrar.

## Pasos
1. **Fail-fast en build (opción por defecto recomendada):** crear `assertImageConfigForProductionDeploy()` que, cuando `process.env.VERCEL_ENV === "production"`, resuelva flags+modelo exactamente como lo hace el route (reusar `resolveImageModel` y `supportsIdentityChain`) y lance un Error con mensaje accionable ("FF_IDENTITY_CHAIN=true pero el modelo X no lo soporta: define FF_NB_PRO=true, o GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview, o FF_IDENTITY_CHAIN=false") si la combinación es inválida. Invocarla en `next.config.ts` junto al assert legal.
2. **Degradación en runtime (segunda capa):** en `generate-images/route.ts:210-221`, en lugar de 503 total, degradar a generación SIN identity chain registrando un evento de telemetría `identity_chain_degraded` (usar `trackEvent` de `src/lib/telemetry.ts` como hacen los demás eventos del route). Mantener un 503 solo si la degradación también es imposible.
3. Borrar el TODO P1 de `nanobanana.ts:15-17` (queda resuelto o documentado en el assert).
4. Test unit del assert (combinaciones válidas/ inválidas, no-op fuera de producción — mismo estilo que el test de legalConfig si existe, o nuevo junto a `imageConfig.test.ts`).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `VERCEL_ENV=production FF_NB_PRO=false FF_IDENTITY_CHAIN=true pnpm build` **FALLA** con el mensaje accionable; con `FF_IDENTITY_CHAIN=false` o `FF_NB_PRO=true` compila.
- Simulación del route con combinación inválida → genera sin chain + evento `identity_chain_degraded` (no 503).
- `grep -n "TODO: \[P1\]" src/lib/nanobanana.ts` = 0.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO cambies los defaults de los flags (eso es decisión de producto).
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
