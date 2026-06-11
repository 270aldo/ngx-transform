# Fix 27 — Tests de comportamiento para los flujos núcleo: crear sesión y análisis IA

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #103

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
En NGX Vision, la puerta de entrada de TODO el funnel — `POST /api/sessions` (`src/app/api/sessions/route.ts`: foto + PII + consents + deleteToken + rate limit transaccional + email de confirmación + webhook n8n) — **no tiene ningún test de handler** (solo su schema zod en `src/lib/validators.test.ts`). El análisis IA (`src/app/api/analyze/route.ts`) tiene **cero tests**; de `src/lib/gemini.ts` solo se testea una COPIA re-implementada de `cleanJsonResponse` (`src/lib/gemini.test.ts:10-13`, admitido en comentario). `promptBuilder.ts` (Identity Lock) y `qualityGates.ts` — lógica pura, fácil de testear — tampoco tienen tests de comportamiento.

**El patrón a seguir ya existe:** `src/app/api/checkout/create-preference/route.test.ts` (importa el handler real, mockea dependencias, asserta status + efectos).

**Negocio:** un cambio que rompa la creación de sesiones tira el 100% de la captación de leads y solo se descubriría con usuarios reales fallando en producción — el CI actual (build+lint) no lo detectaría porque compilar no es funcionar.

## Archivos involucrados
- **CREAR** `src/app/api/sessions/route.test.ts`
- **CREAR** `src/app/api/analyze/route.test.ts`
- **CREAR** `src/lib/promptBuilder.test.ts` y ampliar/crear tests de `src/lib/qualityGates.ts` (si fix-17 no los creó ya)
- `src/lib/gemini.ts` — exportar `cleanJsonResponse` (export nombrado) para testear la función REAL y borrar la copia del test (`src/lib/gemini.test.ts:10-19`).
- Referencia de mocks: `src/app/api/checkout/create-preference/route.test.ts:8-34`.

## Pasos
1. **sessions/route.test.ts** — mockear `@/lib/authServer` (requireAuth), `@/lib/firebaseAdmin` (getDb: transacción de rate limit + set de sesión), `@/lib/rateLimit`, `resend`/email, `@/lib/n8nWebhook`, storage metadata. Casos:
   - 401 sin auth;
   - 400 con body inválido (sin consents → zod);
   - 403/400 si `photoPath` NO empieza con `uploads/{uid}/` (validación de `:53`);
   - 201/200 felicidad: doc creado con `ownerUid`, `deleteToken` generado, `shareScope` todo false, `hybridStatus: "prospect"`; webhook `lead_captured` disparado; respuesta NO filtra `deleteToken`;
   - 429 cuando la transacción de rate limit excede (mock del contador).
2. **analyze/route.test.ts** — mockear gemini (`analyzeProfile` o la función exportada que use el route), spendLimiter (permite/bloquea), aiKillSwitch, jobManager, firebaseAdmin. Casos: 401 anónimo; 403 no-dueño; worker token por header OK; 503 con kill switch activo; 429 con spend limit excedido; felicidad: escribe `ai` + status `analyzed`; respuesta de Gemini malformada → error controlado (no 200).
3. **gemini.ts:** `export function cleanJsonResponse(...)` (cambio mínimo, sin tocar lógica); reescribir `gemini.test.ts` para importar la real (mismos casos que ya tiene + JSON con fences + JSON inválido).
4. **promptBuilder.test.ts:** asserts de que el prompt contiene Identity Lock con el anchor del usuario, los negativos (NO: CGI...), y la referencia correcta por step (m4/m8/m12).
5. Mantener TODO el código de producción intacto salvo el export del paso 3.

## Criterio de aceptación (verificable)
- `pnpm test` en verde con los 3-4 archivos nuevos visibles en el output de vitest.
- Mutación de humo (probar y revertir): comentar la validación de `photoPath` en sessions/route.ts → el test nuevo FALLA.
- `grep -n "replicate its exact logic" src/lib/gemini.test.ts` = 0 (la copia se borró).
- `pnpm lint && pnpm exec tsc --noEmit` en verde.

## Restricciones
- NO modifiques handlers de producción (única excepción: el export de `cleanJsonResponse`).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
