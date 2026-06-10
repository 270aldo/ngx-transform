# Fix 20 — Pantalla de carga con salida: estado partial, errores visibles y timeout de polling

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #11, #62, #72

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision: el usuario sube foto en `/wizard`, espera en `/loading/[shareId]` (`src/app/loading/[shareId]/LoadingExperience.tsx`, client component que sondea `GET /api/sessions/[shareId]` cada 3s) y aterriza en `/s/[shareId]`. Tres trampas verificadas que dejan al usuario atrapado PARA SIEMPRE en la espera:

1. **Estado `partial` ignorado:** si falla 1 de 3 imágenes tras los reintentos, el backend deja `status: "partial"` (`src/app/api/generate-images/route.ts:486-489`). El cliente solo maneja `failed` (muestra error+retry, `LoadingExperience.tsx:223-227`) y `ready`/3 imágenes (redirige, `:227`). Con `partial` + 2 imágenes: sin error, sin retry, sin redirect — progreso clavado ~75%. La página de resultados SÍ sabe mostrar sesiones partial (`src/app/s/[shareId]/page.tsx:235`: `isReady = status === "ready" || status === "partial"`).
2. **Fallos del disparo silenciosos:** cuando `POST /api/generate-images` falla, solo se muestra error para 2 strings exactos ("Unauthorized" / "AI generation is temporarily disabled"); cualquier otro fallo (límite de gasto, rate limit, lock, 500) va solo a `console.error` (`:208-216`) y `startedGenerationRef` queda `true` impidiendo reintentar (`:181-188`). Lo mismo si el `POST /api/analyze` del wizard falla (fire-and-forget, `src/app/wizard/page.tsx:586-595`): status se queda en `processing` eternamente.
3. **Sin timeout:** el polling de 3s corre indefinidamente (`:246-247`), sin "esto está tardando demasiado".

**Negocio:** cada fallo = ~$0.27-0.40 de IA ya pagados + lead quemado en silencio, justo cuando el límite de gasto o rate limit se activan (pico viral). Sin telemetría del estado, nadie lo ve.

## Archivos involucrados
- `src/app/loading/[shareId]/LoadingExperience.tsx:181-188, 208-227, 246-247, 352` — toda la lógica de polling/errores/redirect.
- `src/app/wizard/page.tsx:571-595` — manejo del fallo de analyze (propagar a la pantalla de carga, p.ej. query param o estado de sesión).
- `src/lib/telemetry.ts` — eventos nuevos `loading_stuck_partial`, `generation_trigger_failed`, `loading_timeout`.

## Pasos
1. **partial = listo:** en el poll, tratar `nextStatus === "partial"` igual que `ready` → `router.replace(\`/s/\${shareId}\`)` (la página ya muestra 2 imágenes y el RefreshClient de resultados seguirá refrescando si llega la 3ª). Emitir telemetría `loading_stuck_partial` antes de redirigir para medir frecuencia.
2. **Errores siempre visibles:** en el catch/`!genRes.ok` del disparo de generación, SIEMPRE `setError(mensaje genérico con marca)` + resetear `startedGenerationRef.current = false` para que el botón "Reintentar generación" (que ya existe y re-llama generate-images, `:368`) funcione — el backend ya es reanudable (`getPendingMilestones` retoma solo los pasos faltantes). Emitir `generation_trigger_failed` con el código de error.
3. **Timeout máximo:** contador desde el mount; a los 4 minutos sin `ready/partial/failed`, mostrar bloque de recuperación: botón de reintento + enlace directo "Ver mi resultado" a `/s/[shareId]` + el copy de email solo si `confirmationEmailSent` (ver fix-19). Emitir `loading_timeout`.
4. **Analyze fallido:** en el wizard, si el POST analyze falla, además del console.error, pasar `?analyzeFailed=1` al push de `/loading/[shareId]`; la pantalla de carga, al verlo y status `processing` sin `ai`, muestra retry inmediato (re-POST analyze — el botón `:368` ya existe).
5. Tests: el repo ya usa tests estáticos de layout (`src/app/wizard/wizardLayout.test.ts`); añadir asserts de que LoadingExperience contiene el manejo de `"partial"` y el reset del ref; idealmente un test de componente con renderToStaticMarkup como `src/components/landing/LandingHero.mobile.test.tsx`.

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `grep -n '"partial"' src/app/loading/[shareId]/LoadingExperience.tsx` ≥ 1 (hoy 0 en la lógica de salida).
- Simulación: sesión con status partial + 2 imágenes → redirect a resultados (no spinner).
- Simulación: generate-images responde 429/500 → error visible + botón retry re-dispara (ref reseteado).
- A los 4 min simulados (fake timers) aparece el bloque de recuperación.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO cambies el backend de jobs (ya es reanudable).
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
