# Fix 17 — Quality gates: cablear el retry correctivo (hoy código muerto) y corregir el bug de tamaño

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1sem (fase 1 cableado: 1d) | **Hallazgos cubiertos:** #13

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision genera imágenes de transformación donde la promesa central es "la MISMA persona". Los "quality gates" (`src/lib/qualityGates.ts`) hoy solo verifican: bytes presentes, tamaño de archivo, MIME y finishReason de la API. Los tipos `face_not_visible`, `multiple_subjects`, `identity_drift`, `severe_artifacts` están **definidos con mensajes correctivos pero ninguna función los produce** (`qualityGates.ts:43-47`) — no hay detección facial ni de sujetos.

Peor: el mecanismo de retry correctivo está **desconectado**. `nanobanana.ts` solo usa `buildCorrectivePrompt` si recibe `isRetry`/`retryReason` (`src/lib/nanobanana.ts:280-281`), pero el único caller — `withRetry` en `src/app/api/generate-images/route.ts:396-417` — **nunca pasa esos parámetros** (grep repo-wide: nada setea `isRetry`). Cada reintento repite el prompt idéntico. Bug menor adicional: un archivo demasiado GRANDE se reporta como `image_too_small` (`qualityGates.ts:119-124`).

**Negocio:** una imagen con la cara de otra persona pasa los gates con score 100 y se le muestra al usuario. El retry "inteligente" diseñado para corregirlo nunca se ejecuta.

## Archivos involucrados
- `src/app/api/generate-images/route.ts:396-417` — el loop `withRetry`: propagar el motivo del fallo del gate al siguiente intento.
- `src/lib/nanobanana.ts:280-281` — ya soporta `isRetry`/`retryReason`; solo recibirlos.
- `src/lib/qualityGates.ts:43-47, 119-124` — bug de `image_too_small` para archivos grandes; (fase 2) gate de identidad.
- Tests: `src/app/api/generate-images/workerToken.test.ts` existe (estático); crear unit tests reales junto a `qualityGates.ts`.

## Pasos
**Fase 1 — cablear lo que ya existe (1 día, hacer ahora):**
1. En el callback de `withRetry`, capturar el resultado del gate del intento anterior y pasar `isRetry: attempt > 0, retryReason: lastGateIssue?.type` a `generateTransformedImage`. Revisar la firma de `withRetry` en `src/lib/jobManager.ts:385-407` — si no expone el número de intento, pasar el estado vía closure local del route.
2. Corregir `qualityGates.ts:119-124`: archivo > MAX_SIZE_BYTES debe reportar `severe_artifacts` o un nuevo tipo `image_too_large` con mensaje propio (no `image_too_small`).
3. Unit tests de qualityGates: buffer pequeño → `image_too_small`; buffer gigante → tipo correcto; MIME inválido; y un test del route (o helper extraído) que verifique que el 2º intento recibe `retryReason`.

**Fase 2 — gate de identidad real (recomendación, ~1sem, puede ser PR separado):**
4. Añadir un verificador con el propio Gemini Vision como juez: tras generar, enviar (foto original + imagen generada) con un prompt de veredicto JSON `{same_person: bool, single_subject: bool, artifacts: bool}` y mapear a los tipos ya definidos. Umbral: si `same_person=false` → gate falla → retry correctivo con `identity_drift`. Contabilizar el costo del juez en el spend limiter (ver fix-14) y proteger con un flag `FF_IDENTITY_JUDGE` (default off hasta calibrar).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `grep -n "isRetry" src/app/api/generate-images/route.ts` ≥ 1 (hoy 0).
- Test que simula gate fallido en intento 1 → el intento 2 llama a `generateTransformedImage` con `retryReason` poblado.
- `grep -n "image_too_small" src/lib/qualityGates.ts` ya no aparece en la rama de archivo grande.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias (la fase 2 usa Gemini vía el cliente ya existente, no librerías de face detection).
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
