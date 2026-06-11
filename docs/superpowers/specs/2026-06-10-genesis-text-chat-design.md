# GENESIS Text Chat (Fase 2 · #13) — Design Spec

- **Fecha:** 2026-06-10
- **Estado:** Aprobado (diseño). Pendiente: plan de implementación.
- **Workstream:** Fase 2 — Experiencia de confianza (lead-gen sin cobro).
- **Plan maestro:** `~/.claude/plans/organizate-completamente-para-esto-playful-clock.md`

## Objetivo

Segundo canal conversacional de GENESIS — **texto** — sobre la **misma knowledge base**
y el **mismo funnel** que el agente de voz existente. Un cerebro
(`buildGenesisSystemPrompt`), dos canales. El chat de texto es el canal de **menor
fricción** (sin micrófono, sin permisos) y refuerza la experiencia de confianza que
mueve al lead hacia el diagnóstico humano.

Cerebro: **Gemini Flash** (ya en stack, el más barato). Entrega: **streaming** token a
token. Ubicación: **sección propia** encima del agente de voz en `/s/[shareId]`.

## No-objetivos (sin scope creep)

- Superficie unificada voz｜texto (se mantiene el agente de voz intacto; unificar es futuro).
- Almacenar transcript del chat en servidor (stateless; privacidad de fotos/salud).
- RAG sobre la FAQ completa (la FAQ clave ya va en el system prompt; RAG es mejora futura).
- Contabilidad de gasto por tokens vía `reserveSpend` (es fix-14, deliberadamente aparte).
- Acceso cross-device (es fix-07/08).
- Migración de voz a ElevenLabs (workstream separado).

## Arquitectura y flujo de datos

```
GenesisTextChat.tsx (client, useAuth → Bearer ID token)
   │  POST /api/genesis-chat  { shareId, messages: [{role, content}] }
   ▼
/api/genesis-chat/route.ts  (runtime nodejs)
   1. zod.parse  (shareId; messages acotados)
   2. feature flag  (FF_HYBRID_TEXT_CHAT | NEXT_PUBLIC_… ) → 403 si off
   3. requireSessionOwner(req, shareId) → authUser   (mismo gate que voz)
   4. checkRateLimit("api:genesis-chat", authUser.uid) → 429 si excede
   5. system = buildGenesisSystemPrompt({ channel: "text", shareId })
   6. ai.models.generateContentStream({ model, contents, config:{ systemInstruction } })
      envuelto con timeout (GENESIS_CHAT_TIMEOUT_MS)
   7. ReadableStream → text/plain; charset=utf-8  (no-store)
   ◄── tokens
   │
   client acumula el texto del asistente
   → parseClassification(texto)  (helper compartido)
   → al detectar etiqueta: POST /api/sessions/[shareId]/classify  (YA existe; sin summary)
   → CTA segmentada (Agendar HYBRID / ver opciones / brief por correo)
```

**Servidor stateless:** el cliente mantiene el historial y lo envía cada turno. No se
guarda transcript. Solo `/classify` persiste, y **sin** `summary` (`consentSummary:false`)
→ cero texto de chat en Firestore.

## Componentes (unidades con un propósito claro)

| Pieza | Tipo | Qué hace / depende de |
|---|---|---|
| `src/app/api/genesis-chat/route.ts` | API (nuevo) | Espeja `realtime/session`: zod→flag→`requireSessionOwner`→`checkRateLimit`→Gemini stream. Depende de `prompt.ts`, `@google/genai`, `rateLimit.ts`, `authServer.ts`, `utils.withTimeout`. |
| `src/components/results/GenesisTextChat.tsx` | Client (nuevo) | UI de chat NGX-glass; estado de mensajes; fetch streaming; muestra CTA segmentada. Depende de `useAuth`, `leadClassification.ts`. |
| `src/lib/genesis/leadClassification.ts` | Lib (nuevo) | **DRY**: `parseClassification(text)`, `CLASSIFICATION_LABELS`, `CTA_BY_CLASSIFICATION`, tipo `FitClassification`. Hoy viven inline en `HybridVoiceAgent`; pasan a ser fuente única que comparten voz y texto. Pura, sin deps de React. |

**Modificados:**
- `src/app/s/[shareId]/page.tsx` — montar `<GenesisTextChat shareId={…}/>` como sección encima de `<HybridVoiceAgent/>`, detrás del flag.
- `src/lib/rateLimit.ts` — bucket `api:genesis-chat` en los **dos** lugares (mapa de `Ratelimit` + `RATE_LIMIT_CONFIG`). **Fail-open** (consistente con `realtime-session`).
- `src/components/results/HybridVoiceAgent.tsx` — importar `parseClassification` + CTA desde `leadClassification.ts` (refactor quirúrgico; comportamiento idéntico).
- `.env.example` — `NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT` (default true), `GENESIS_CHAT_MODEL` (default `gemini-2.5-flash`), `GENESIS_CHAT_TIMEOUT_MS`.
- `CLAUDE.md` — corregir la fila stale de `/api/genesis-chat` (hoy describe el demo v3.0 eliminado) por la real.

## Modelo, costo y seguridad

- **Modelo:** `GENESIS_CHAT_MODEL`, default `gemini-2.5-flash`.
- **Rate limit:** `api:genesis-chat`, ~30 req / 10 min por dueño de sesión. **Fail-open**
  (canal conversacional barato; disponibilidad > estrictez, igual que `realtime-session`).
- **Caps de input:** máx 20 mensajes de historial; máx 2000 chars por mensaje. Acota
  tamaño de prompt y costo.
- **Spend limiter:** **NO** se cablea `reserveSpend`. El texto Flash es ~gratis; acoplarlo
  al presupuesto de imágenes ($50/día) lo distorsionaría. El rate-limit es el guard de
  costo del chat. Token accounting → fix-14.
- **Auth:** `requireSessionOwner` (mismo gate que voz). El dueño debe tener su sesión
  abierta. Cross-device → fix-07/08.
- **Privacidad:** stateless; sin checkbox de "guardar resumen"; solo persiste clasificación.

## Manejo de errores

| Situación | Respuesta |
|---|---|
| Body inválido | 400 (zod issues) |
| Flag off | 403 |
| No es dueño / sin token | 401/403 vía `isSessionOwnerAuthError` |
| Rate limit | 429 + headers |
| `GEMINI_API_KEY` ausente | 503 (fail-closed, accionable) |
| Timeout Gemini | el stream cierra con un mensaje de error legible; cliente muestra estado "reintentar" |
| Error de stream a medias | cliente conserva lo recibido y ofrece reintentar el turno |

## Testing (TDD — tests antes del código)

- **Ruta** (`route.test.ts`): zod inválido→400; flag off→403; auth error→401/403;
  rate-limit→429; happy path → stream no vacío con conocimiento real de NGX (Gemini
  mockeado). Espeja el patrón de tests de rutas existentes.
- **`leadClassification.test.ts`**: detecta cada una de las 3 etiquetas; null si no hay.
- **Página**: `seasonVisionReportPage.test.ts` (o gemelo) afirma que la fuente incluye
  `GenesisTextChat` (igual que ya afirma `HybridVoiceAgent`).
- **Gate de verificación del fix:** `tsc` + `lint` + `test` + **`build`** (toca
  ruta + página + config → build importa).

## Criterio de aceptación (verificable)

1. `tsc`, `lint`, todos los tests y `build` verdes.
2. En `/s/[shareId]` aparece el chat de texto encima del agente de voz (con el flag on).
3. Enviar un mensaje devuelve respuesta **en streaming** con conocimiento real de
   NGX/Aldo/HYBRID (no genérico).
4. Cuando GENESIS emite una etiqueta de fit, el cliente llama a `/classify` y la CTA se
   adapta al track — idéntico al agente de voz.
5. Grep: `api:genesis-chat` presente en los dos lugares de `rateLimit.ts`;
   `parseClassification` ya **no** está duplicado (vive solo en `leadClassification.ts`).

## Qué sigue (después de este fix)

Fase 1 "no perder el lead": fix-20 (loading con salida) o fix-19 (emails con disparador).
La migración de voz a ElevenLabs reusará `leadClassification.ts` y el mismo `/classify`.
