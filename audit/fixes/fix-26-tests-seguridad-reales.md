# Fix 26 — Convertir los grep-tests de seguridad en tests de handler reales

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1sem (priorizado, se puede partir) | **Hallazgos cubiertos:** #102

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
En NGX Vision, 13 de los 34 archivos Vitest no ejecutan ni una línea del código que dicen probar: hacen `readFileSync` del fuente y buscan substrings. El caso grave es `src/app/api/security-p1.static.test.ts:10-19` — la ÚNICA verificación en CI de que 5 routes mutadores están protegidos — que solo comprueba que cada archivo CONTIENE la string "requireSessionOwner". Pasaría en verde si la llamada estuviera comentada, si su resultado se ignorara o si la función tuviera un bug. Igual `src/app/api/generate-images/workerToken.test.ts:5-11` (worker token por query) y `src/lib/jobManager.test.ts` (cubierto por fix-25).

**El patrón bueno YA existe en el repo:** `src/app/api/checkout/create-preference/route.test.ts` importa el handler POST real, mockea `requireSessionOwner`/`rateLimit`/`mercadoPago`/`telemetry` (`:8-34`) y asserta status codes y efectos (200 dueño / 401 anónimo / 403 no-dueño / 503 sin token). Este fix replica ese patrón en los routes que hoy solo tienen grep-tests.

**Negocio:** el CI aparenta cubrir seguridad cuando solo verifica que ciertas palabras existen en ciertos archivos — confianza inflada en cada PR mergeado.

## Archivos involucrados
- `src/app/api/security-p1.static.test.ts` — se CONSERVA (capa barata) pero deja de ser la única defensa.
- **CREAR** route tests reales junto a cada handler (los 5 de security-p1 + generate-images):
  - `src/app/api/sessions/[shareId]/classify/route.test.ts`
  - `src/app/api/events/hybrid-offer/route.test.ts`
  - `src/app/api/feedback/route.test.ts`
  - `src/app/api/brief/send/route.test.ts`
  - (checkout/create-preference ya tiene) 
  - `src/app/api/generate-images/route.authz.test.ts` — 401 anónimo, 403 no-dueño, worker token por header OK, worker token por query RECHAZADO (reemplaza al grep-test).
- Plantilla de referencia: `src/app/api/checkout/create-preference/route.test.ts:1-180`.

## Pasos
1. Para cada route: copiar la estructura del test de checkout — `vi.mock` de `@/lib/authServer` (variantes: requireSessionOwner lanza 401/403/resuelve), `@/lib/rateLimit` (allow), `@/lib/firebaseAdmin` (getDb con stubs mínimos), y los side-effects propios (n8nWebhook, telemetry, resend). Importar el handler real (`import { POST } from "./route"`).
2. Asserts mínimos por route: 401 sin auth; 403 usuario distinto; 200 dueño con el efecto principal verificado (doc escrito / webhook llamado con payload correcto); 400 con body inválido (zod).
3. `generate-images/route.authz.test.ts`: además de authz, assert de que `?workerToken=` en query NO autentica (la request con query y sin header → 401) — comportamiento que el grep-test viejo solo "leía". Mockear `nanobanana`/`storage`/`spendLimiter` para no generar nada.
4. Mantener los grep-tests de copy/layout tal cual (costo-beneficio aceptable allí); puedes borrar el assert duplicado de workerToken del test estático cuando el real lo cubra.
5. Si los handlers usan APIs de runtime (NextRequest), seguir exactamente cómo el test de checkout construye las requests.

## Criterio de aceptación (verificable)
- `pnpm test` en verde con ≥5 archivos route.test nuevos visibles en el output.
- Mutación de humo (probar y revertir): comentar `requireSessionOwner` en `feedback/route.ts` → el test NUEVO falla (el estático viejo también, pero ahora hay dos capas).
- `pnpm lint && pnpm exec tsc --noEmit` en verde.
- Cobertura de los 4 asserts mínimos en cada route nuevo (401/403/200+efecto/400).

## Restricciones
- NO modifiques los handlers de producción — SOLO tests (si un handler es intesteable sin un cambio mínimo de export, repórtalo antes).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
