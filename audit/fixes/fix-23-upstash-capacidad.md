# Fix 23 — Upstash: el free tier se agota en un día viral y apaga la generación (fail-closed)

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** <1d | **Hallazgos cubiertos:** #85 (relacionado: #18)

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision usa Upstash Redis para rate limiting distribuido (`src/lib/rateLimit.ts`). CLAUDE.md afirma que el free tier (10K ops/día) soporta "~1,600 users/day" (`CLAUDE.md:510`), pero el consumo real es mucho mayor: hay ~10 emisores cliente de POST `/api/telemetry` y CADA evento pasa por `checkRateLimit("api:telemetry", ip)` (`src/app/api/telemetry/route.ts:20`; limiter 120/min en `rateLimit.ts:105-109` — "noisy by design"). Sumando sessions/analyze/generate-images/plan/leads, un recorrido completo consume ~15-25 comandos Redis → el free tier se agota entre **~400-700 usuarios/día**.

Lo grave es el modo de falla: los endpoints CRÍTICOS fallan **CERRADOS** por diseño — `CRITICAL_ENDPOINTS` incluye api:analyze, api:generate-images, api:plan, api:generate-plan, api:report (`rateLimit.ts:211-218`) y ante error de Redis en producción se devuelve `success:false` (`rateLimit.ts:327-336`). Correcto para seguridad, pero significa que agotar la cuota **apaga la generación de transformaciones** (el producto entero) justo en el pico viral. Relacionado #18: el límite de gasto default ($50/día, `src/lib/spendLimiter.ts:19-20`) ≈ 186 usuarios/día — los dos techos hay que subirlos a la vez conscientemente.

**Negocio:** el producto se apaga exactamente el día que justifica su existencia. Arreglo de centavos.

## Archivos involucrados
- `src/app/api/telemetry/route.ts:~20` — sacar la telemetría pública del rate limit por Redis.
- `src/lib/rateLimit.ts:105-109, 156-173, 211-218` — limiter de telemetría y fallback in-memory ya existente.
- `CLAUDE.md:~510` — corregir el supuesto de capacidad (~400-700 usuarios/día en free tier con el patrón actual).
- (Operativo, no código) plan de Upstash y límites de gasto en Vercel.

## Pasos
1. **Telemetría fuera de Redis:** `api:telemetry` NO es crítico para seguridad (el endpoint ya marca `trusted:false` y sanitiza). Cambiarlo al limitador **in-memory** que ya existe en `rateLimit.ts:156-173`: añadir un parámetro/lista `MEMORY_ONLY_ENDPOINTS = ["api:telemetry", "api:csp-report"]` en `checkRateLimit` que salte Redis para esas claves. Esto elimina el mayor consumidor de ops (~el 50-70% del tráfico Redis).
2. **Presupuesto de ops visible:** en el fallo de Redis (`:327-336`), emitir un evento de telemetría server-side `redis_unavailable` (vía `trackEvent`, que escribe a Firestore, no a Redis) para que el agotamiento sea visible en datos (hoy solo console.error).
3. **Docs:** corregir CLAUDE.md:510 con el cálculo real y la instrucción operativa: "antes de campañas, subir Upstash a plan pago y revisar GEMINI_DAILY_LIMIT_USD".
4. **Operativo (documentar en el resumen final, no ejecutar):** contratar plan pago de Upstash (pay-as-you-go) y subir `GEMINI_DAILY_LIMIT_USD` en Vercel con conocimiento del costo real por usuario (~$0.40-0.50 tras fix-14).
5. Test: unit de `checkRateLimit` con clave de memoria-only → no llama al cliente Redis (mock); los endpoints críticos siguen fail-closed (mantener el test existente `src/lib/rateLimit.test.ts` verde y ampliar).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- Test: con Redis caído (mock que lanza), `api:telemetry` sigue respondiendo success (memoria) y `api:generate-images` sigue devolviendo `success:false` (fail-closed intacto).
- `grep -n "MEMORY_ONLY\|api:telemetry" src/lib/rateLimit.ts` muestra la nueva ruta.
- `grep -n "1,600 users" CLAUDE.md` = 0.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO debilites el fail-closed de los endpoints críticos.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
