# Fix 13 — Migrar del SDK abandonado @google/generative-ai a @google/genai

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #93

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision (Next.js 16, código en `src/` en la raíz) usa Gemini para su propuesta de valor central: el análisis de transformación (`src/lib/gemini.ts`) y el plan de 7 días (`src/lib/plan/planGenerator.ts`). Ambos importan `GoogleGenerativeAI` de **`@google/generative-ai` ^0.24.1** (`package.json:22`), un SDK **abandonado**: el repo github.com/google-gemini/generative-ai-js está archivado y su última publicación en npm fue 2025-04-30. El reemplazo oficial es **`@google/genai`** (v2.x). Sin parches de seguridad ni soporte para modelos nuevos.

El acoplamiento es bajo (verificado): solo 2 archivos importan el SDK con el patrón `new GoogleGenerativeAI(key)` → `getGenerativeModel({model, ...})` → `generateContent(...)`. La generación de imágenes (`src/lib/nanobanana.ts`) NO usa el SDK — llama a la API REST con fetch directo y no se toca.

**Negocio:** toda la propuesta de valor descansa sobre una librería muerta; bloquea adoptar modelos Gemini nuevos (mejor calidad/costo) y no recibirá arreglos si algo se rompe.

## Archivos involucrados
- `package.json:22` — quitar `@google/generative-ai`, añadir `@google/genai` (única excepción permitida a "no tocar dependencias").
- `src/lib/gemini.ts:11` — `import { GoogleGenerativeAI } from "@google/generative-ai"` + usos de `getGenerativeModel`/`generateContent` (el análisis principal está alrededor de `:324-339`, con `responseMimeType: "application/json"`).
- `src/lib/plan/planGenerator.ts:8` — mismo patrón (su `generateContent` está alrededor de `:233`).
- `src/lib/gemini.test.ts` — contiene un assert estático sobre el fuente (`:61-68`); puede necesitar ajuste si cambia el nombre del import.

## Pasos
1. `pnpm remove @google/generative-ai && pnpm add @google/genai` (cambio mínimo de lockfile; nada más).
2. En ambos archivos, migrar al patrón nuevo:
   ```ts
   import { GoogleGenAI } from "@google/genai";
   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
   const result = await ai.models.generateContent({
     model: MODEL_ID,
     contents: [...],            // mismo shape de parts
     config: { responseMimeType: "application/json", temperature, ... }, // antes generationConfig
   });
   const text = result.text;     // antes result.response.text()
   ```
   Conservar EXACTAMENTE los prompts, modelos (env `GEMINI_MODEL`/`PLAN_GENERATION_MODEL`), parsing (`cleanJsonResponse`) y manejo de errores existentes. Es una migración mecánica de API, no un refactor.
3. Verificar que los tipos de respuesta usados (candidates/finishReason si se leen) tienen equivalente; ajustar solo lo necesario.
4. Ajustar `gemini.test.ts` si el assert estático referencia el import viejo.
5. `grep -rn "generative-ai" src/ package.json` debe devolver 0 resultados.

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `grep -rn "@google/genai" src/lib/gemini.ts src/lib/plan/planGenerator.ts` = 2 archivos; `grep -rn "@google/generative-ai" src/ package.json` = 0.
- `pnpm build` compila.
- (Opcional, si hay GEMINI_API_KEY local) un smoke manual de `/api/analyze` contra una sesión de emulador devuelve JSON válido del schema.

## Restricciones
- NO toques `src/lib/nanobanana.ts` (REST directo, fuera de alcance) ni prompts/temperaturas/modelos.
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices ninguna otra dependencia.
- Si la API de @google/genai no cubre algo que el código usa, repórtalo y detente en vez de improvisar.
