# Fix 18 — El PDF entrega el plan IA real (no la plantilla de testing) y macros con datos reales

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #14, #30, #31

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision promete un "plan personalizado". Hay DOS sistemas de plan que no se comunican (verificado):
- `/api/plan` (`src/app/api/plan/route.ts`) genera un plan con IA (`src/lib/plan/planGenerator.ts`) y lo guarda en `session.plan` (`plan/route.ts:168-171`).
- `/api/generate-plan` (`src/app/api/generate-plan/route.ts`) — el que produce el **PDF descargable** — lo IGNORA y llama a `generateSamplePlan` (`generate-plan/route.ts:75`), función comentada **"Generate sample plan for testing"** (`src/lib/plan-pdf.tsx:424-425`): plantilla fija con los mismos 6 ejercicios para todos, que solo personaliza nombre/objetivo/nivel/días.

Defectos encadenados: (a) el generador IA tiene triple fallback **silencioso** a plantilla devolviendo siempre `success:true` — sin API key (`planGenerator.ts:219-225`), validación Zod fallida (`:253-259`) o excepción (`:271-279`) — sin telemetría de cuántos planes son fallback; (b) `ProfileSummary` (`src/lib/plan/planTypes.ts`) NO transporta `weightKg`, y la plantilla calcula calorías/proteína con **70kg hardcodeados** (`planGenerator.ts:155`); (c) `/api/plan` hardcodea `bodyType: "mesomorph"` (`plan/route.ts:144`) aunque el wizard captura el real; (d) el PDF imprime nombres de módulos internos (BLAZE/SAGE/TEMPO) en mayúsculas (`plan-pdf.tsx:203-205,384`), rompiendo la regla de marca "el usuario solo ve GENESIS".

**Negocio:** un usuario de 110kg recibe macros de 70kg presentadas como personalizadas — incorrecto en un producto de salud; dos usuarios que comparen PDFs idénticos destruyen la credibilidad del CTA de conversión.

## Archivos involucrados
- `src/app/api/generate-plan/route.ts:52-115` — leer `session.plan` (el plan IA guardado) y solo caer a plantilla si no existe.
- `src/lib/plan/planTypes.ts` — añadir `weightKg?: number` y `bodyType` real a `ProfileSummary`.
- `src/lib/plan/planGenerator.ts:155, 219-279` — usar peso real en `NUTRITION_BY_GOAL`; marcar fallback en el resultado (`source: "ai" | "template"`).
- `src/app/api/plan/route.ts:140-150` — pasar `weightKg` y `bodyType` desde `session.input`.
- `src/lib/plan-pdf.tsx:203-205, 384, 424` — render desde `SevenDayPlan` real; sustituir módulos por "GENESIS · {Capacidad}".
- `src/lib/telemetry.ts` — evento `plan_fallback_served`.

## Pasos
1. `planTypes.ts`: extender `ProfileSummary` con `weightKg` y `bodyType` (tipados como en `session.input` — ver `src/lib/validators.ts`).
2. `plan/route.ts`: poblar ambos desde `session.input` (borrar el hardcode "mesomorph").
3. `planGenerator.ts`: `NUTRITION_BY_GOAL[profile.goal](profile.weightKg ?? 70)`; añadir `source` al retorno en los 3 caminos y emitir `trackEvent({event: "plan_fallback_served", ...})` en los fallbacks (patrón de telemetría de cualquier route).
4. `generate-plan/route.ts`: si `session.plan` existe, renderizar el PDF desde ese plan; si no, generar con `generatePlan(profile)` (no `generateSamplePlan`) y persistirlo en `session.plan` como hace `/api/plan`; dejar `generateSamplePlan` SOLO como último recurso con telemetría.
5. `plan-pdf.tsx`: adaptar el render para aceptar `SevenDayPlan` real; mapear `agentNotes.agent` → etiqueta de capacidad ("GENESIS · Entrenamiento/Nutrición/Recuperación") en vez de `toUpperCase()` del módulo.
6. Tests: unit de `generatePlan` con peso real (macros ∝ peso); route test de generate-plan que verifica que usa `session.plan` cuando existe (mocks patrón `checkout/create-preference/route.test.ts`); assert de que el PDF no contiene "BLAZE|SAGE|TEMPO".

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `grep -n "generateSamplePlan" src/app/api/generate-plan/route.ts` solo en la rama de último recurso.
- `grep -n "(70)" src/lib/plan/planGenerator.ts` = 0 como valor efectivo (queda solo como default si falta el dato).
- Test: perfil de 110kg produce proteína/calorías distintas que uno de 60kg.
- `grep -inE "BLAZE|SAGE|TEMPO" src/lib/plan-pdf.tsx` = 0 en strings visibles del PDF.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO rediseñes el contenido del plan (solo conexión de datos y branding).
- Si algo inesperado bloquea el fix (p.ej. el shape de `session.plan` difiere del esperado por el PDF), repórtalo y detente en vez de improvisar.
