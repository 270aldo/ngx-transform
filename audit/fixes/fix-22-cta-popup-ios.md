# Fix 22 — CTA principal bloqueado en iOS: window.open después de awaits de red

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** <1d | **Hallazgos cubiertos:** #64

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision convierte en la página de resultados con `src/components/results/HybridOfferV2.tsx` (la salida comercial del funnel: checkout MercadoPago, agendar Calendly, WhatsApp, brief). Los handlers `onCalendly` y `onWhatsapp` ejecutan `await getOwnerToken()` y `await emitTelemetry(...)` — que hacen fetch a `/api/telemetry` y `/api/events/hybrid-offer` (`HybridOfferV2.tsx:92-101`) — **ANTES** de llamar `window.open(url, "_blank")` (`:289-294` y `:296-301`).

Safari en iOS (y otros navegadores en menor medida) bloquea `window.open` que no ocurre en el call stack síncrono del gesto del usuario: tras un await de red, el popup se bloquea **silenciosamente**. El botón "Agendar diagnóstico HYBRID" es el CTA primario recomendado de toda la página.

**Negocio:** en iPhone — el dispositivo dominante del tráfico viral de Instagram/TikTok — el usuario toca el botón principal de conversión y no pasa nada visible. Parece un botón roto; deprime la tasa de agendado de forma invisible en las métricas.

## Archivos involucrados
- `src/components/results/HybridOfferV2.tsx:92-101` (emitTelemetry), `:289-294` (onCalendly), `:296-301` (onWhatsapp) — revisar también cualquier otro handler del archivo con el patrón `await ... window.open` (grep `window.open` en el archivo).
- `src/components/AgentBridgeCTA.tsx:59-62` — mismo patrón potencial (abre pestaña; ver hallazgo #75 relacionado: pestaña en blanco sin URL).

## Pasos
1. En cada handler afectado, invertir el orden: abrir la navegación de forma SÍNCRONA dentro del gesto y disparar la telemetría sin await:
   ```ts
   const onCalendly = () => {
     if (!calendlyUrl) return;
     window.open(calendlyUrl, "_blank", "noopener,noreferrer");   // síncrono, dentro del gesto
     void emitTelemetry(shareId, "calendly_v2_click");            // fire-and-forget
   };
   ```
   Alternativa preferida donde el markup lo permita: convertir el botón en `<a href={url} target="_blank" rel="noopener noreferrer">` con `onClick={() => void emitTelemetry(...)}` — inmune al popup blocker por diseño.
2. Si `getOwnerToken()` era necesario para la telemetría autenticada, moverlo DENTRO de `emitTelemetry` (que ya es async) — nunca antes del open.
3. Para fiabilidad de la telemetría al navegar, usar `navigator.sendBeacon("/api/telemetry", blob)` como fallback cuando esté disponible (el endpoint acepta POST público con zod — `src/app/api/telemetry/route.ts`).
4. En `AgentBridgeCTA.tsx`: además del mismo patrón síncrono, no abrir nada si la URL no está configurada (cubre #75: hoy abre pestaña en blanco).
5. Test: el repo ya tiene tests estáticos de este componente (`src/components/results/HybridOfferV2.telemetry.test.ts`) — añadir assert de que `window.open` NO aparece después de `await` en los handlers (regex sobre el fuente, mismo estilo del archivo) y que los CTAs usan `noopener`.

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde (incluido `HybridOfferV2.telemetry.test.ts` ajustado).
- `grep -n "await" src/components/results/HybridOfferV2.tsx` no precede a ningún `window.open` en el mismo handler.
- Manual (o test de componente): click en "Agendar" → `window.open` se invoca en el mismo tick del evento; la telemetría se dispara igualmente (spy llamado).
- Los eventos de telemetría siguen llegando con los mismos nombres (no renombrar eventos).

## Restricciones
- NO toques nada fuera de los archivos listados (y tests junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO cambies textos ni diseño de los CTAs.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
