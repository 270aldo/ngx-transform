# Fix 25 — Tests para las protecciones de costo: spendLimiter y lock atómico de jobs

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #101

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision es un lead magnet gratuito donde cada usuario cuesta dinero en Gemini. Las dos protecciones financieras son: `src/lib/spendLimiter.ts` (límites `GEMINI_DAILY_LIMIT_USD`=50 / `GEMINI_HOURLY_LIMIT_USD`=10 por defecto en `:19-20`, con transacciones Firestore sobre la colección `gemini_spend`) y el lock atómico de `src/lib/jobManager.ts` (`acquireJobLock`, evita generar imágenes duplicadas — cada generación cuesta ~$0.13-0.40).

**Ninguna tiene un test ejecutable** (verificado): grep de `spendLimiter|aiKillSwitch|recordSpend|checkSpendLimit` sobre `src/**/*.test.*` = 0 referencias. `jobManager.test.ts` existe pero es un "test" que lee el archivo como TEXTO y busca substrings (`src/lib/jobManager.test.ts:5-9`) — la lógica transaccional jamás se ejecuta, mucho menos bajo concurrencia. El pipeline está testeado pero con jobManager mockeado.

**Negocio:** si una regresión rompe estas piezas (un typo en la clave del doc, un cambio en la transacción), la app funciona con apariencia normal pero SIN límite de gasto: la factura de Gemini se dispara sin aviso. Hoy nadie verifica que el freno de mano funcione.

## Archivos involucrados
- **CREAR** `src/lib/spendLimiter.unit.test.ts` — tests unitarios con Firestore mockeado a nivel transacción.
- **CREAR** `tests/joblock.integration.test.mjs` — test de concurrencia contra el emulador (estilo de `tests/auth.integration.test.mjs`).
- `src/lib/spendLimiter.ts` — solo lectura (entender la forma exacta de la transacción y los docs día/hora).
- `src/lib/jobManager.ts:152-156` (acquireJobLock, staleMs 10min) — solo lectura.
- `scripts/run-local-gate.sh:74-79` y `package.json` — añadir el test nuevo al gate.

## Pasos
1. **Unit de spendLimiter:** mockear `getDb().runTransaction` (patrón de mocks de firebaseAdmin ya usado en `src/app/api/checkout/webhook/route.test.ts:` — revisa cómo mockea `getDb`). Casos mínimos:
   - bajo límite → permite y acumula el monto correcto;
   - exactamente en el límite diario → bloquea;
   - sobre límite horario con día disponible → bloquea (el chequeo horario manda);
   - error de Firestore → comportamiento documentado (fail-open o fail-closed: ASSERT del comportamiento ACTUAL leyendo el código, y déjalo explícito en el nombre del test);
   - reset por cambio de ventana (clave de doc por día/hora distinta).
2. **Concurrencia del lock (emulador):** en el nuevo `.mjs`, con `FIRESTORE_EMULATOR_HOST` activo (mismo guard de `scripts/seed-emulator.mjs:12-18`: NEGARSE a correr sin emulador), disparar `Promise.all([acquireJobLock(id, type), acquireJobLock(id, type)])` (importando el lib compilado vía tsx/ts-node o duplicando la llamada vía endpoint si importar TS es complejo — preferible `node --experimental-strip-types` o `pnpm dlx tsx`). Assert: exactamente UNA gana; la otra recibe lock denegado. Tercer caso: lock con `updatedAt` viejo (> staleMs) → se puede re-adquirir.
3. Añadir el `.mjs` al gate: nueva línea en `run-local-gate.sh` (`pnpm test:joblock`) + script en package.json.
4. Si fix-14 ya cambió la contabilidad (recordSpend por intento), cubrirlo también: 2 intentos = 2 incrementos.

## Criterio de aceptación (verificable)
- `pnpm test` en verde e INCLUYE los unit nuevos de spendLimiter (visibles en el output de vitest).
- `pnpm test:gate:local` en verde e incluye el test de concurrencia (1 ganador / 1 denegado impreso en el log).
- Mutación de humo: cambiar temporalmente `DAILY_LIMIT_USD` a 0 hace fallar el test "bajo límite" (probar y revertir) — demuestra que el test ejecuta lógica real, no substrings.
- `pnpm lint && pnpm exec tsc --noEmit` en verde.

## Restricciones
- NO modifiques `spendLimiter.ts` ni `jobManager.ts` salvo exports mínimos necesarios para testear (y solo si es imprescindible).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias (tsx solo vía `pnpm dlx` si hace falta, sin añadirlo al package.json).
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
