# Fix 11 — Sentry nunca se inicializa y no hay alerting: producción está ciega

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 0.5–1 día (≈2 h de código + ≈2 h de configuración en Sentry/Vercel/uptime) | **Hallazgos cubiertos:** #82

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision (este repo) es un lead magnet viral de transformación física (Next.js **16.2.4** App Router con Turbopack, código en `src/` en la raíz — **no existe carpeta `app/` separada**; Firebase Admin en servidor; pagos vía MercadoPago; deploy en Vercel, dominio `https://ngxvision.app`). El repo ya tiene `@sentry/nextjs` v10.51.0 instalado (`package.json` línea 34), dos configs de Sentry bien diseñados con limpieza de PII (`sentry.client.config.ts` y `sentry.server.config.ts` en la raíz), `withSentryConfig` aplicado en `next.config.ts` (líneas 25–28) y el CSP ya permite `https://*.ingest.sentry.io` en `connect-src` (`src/proxy.ts` línea 61).

**El problema:** nada de eso se ejecuta jamás. Con `@sentry/nextjs` v10 sobre Next 16 + Turbopack, los archivos `sentry.*.config.ts` de la raíz **no se cargan solos**: se requiere `src/instrumentation.ts` (servidor) y `src/instrumentation-client.ts` (browser) que los importen — y **ninguno de los dos existe** en el repo (verificado con `git ls-files` y `find`: cero resultados; ningún archivo importa esos configs). Además el DSN está vacío en todas partes (`.env.example` líneas 177–179: `NEXT_PUBLIC_SENTRY_DSN=` / `SENTRY_DSN=` / `SENTRY_AUTH_TOKEN=` sin valor) y ambos inits tienen `enabled: Boolean(dsn)` (`sentry.server.config.ts` línea 35, `sentry.client.config.ts` línea 36), o sea que aunque se cargaran estarían apagados. El único uso de Sentry en todo `src/` es un `Sentry.captureMessage("CSP Violation", ...)` en `src/app/api/csp-report/route.ts` línea 72 — hoy un no-op. No hay `captureException` en ninguna ruta, no hay hook `onRequestError`, no existe `src/app/global-error.tsx` (los errores de render de React en producción no se capturan en ningún lado), no hay otro proveedor de observabilidad (cero hits de @vercel/analytics, posthog o datadog en `package.json`) y no hay ningún monitor de uptime configurado.

**Por qué importa al negocio:** si la web se cae, si Gemini empieza a fallar o si los pagos de MercadoPago dejan de procesarse, **nadie recibe aviso** — el fundador se entera cuando un usuario se queja. En un producto viral, horas de caída silenciosa equivalen a perder el pico de tráfico que justifica todo el proyecto, además de cobros y leads perdidos sin rastro. El arreglo es barato: dos archivos de instrumentación + un `global-error.tsx`, poner el DSN en Vercel, activar alertas de Sentry y un monitor de uptime gratuito.

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`), líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/instrumentation.ts` | (nuevo) | **CREAR** — `register()` que importa `sentry.server.config.ts` + hook `onRequestError` para capturar errores de rutas API/SSR |
| `src/instrumentation-client.ts` | (nuevo) | **CREAR** — importa `sentry.client.config.ts` + hook `onRouterTransitionStart` (único mecanismo que Turbopack soporta para cargar el SDK en el browser) |
| `src/app/global-error.tsx` | (nuevo) | **CREAR** — error boundary raíz del App Router que llama `Sentry.captureException` (sin él, los errores de render en producción se pierden) |
| `sentry.client.config.ts` | 34–39 | **MODIFICAR (menor)** — eliminar las dos líneas de Session Replay inertes (ver paso 4) |
| `.env.example` | 174–179 (bloque `# Sentry (P1 Observability)`) | **MODIFICAR** — documentar `SENTRY_ORG` y `SENTRY_PROJECT` (los necesita `withSentryConfig` para subir source maps) |
| `sentry.server.config.ts` | 1–60 | Solo lectura — ya correcto (DSN con fallback `SENTRY_DSN \|\| NEXT_PUBLIC_SENTRY_DSN`, scrub de PII); NO modificar |
| `next.config.ts` | 25–28 | Solo lectura — `withSentryConfig(nextConfig, { silent: true, authToken: process.env.SENTRY_AUTH_TOKEN })` ya existe; NO requiere cambios (org/project se leen de env) |
| `src/proxy.ts` | 61 | Solo lectura — CSP `connect-src` ya incluye `https://*.ingest.sentry.io`; NO modificar |
| `src/app/api/csp-report/route.ts` | 30, 68–72 | Solo lectura — se usa para la verificación end-to-end (con `CSP_REPORT_SAMPLE_RATE=1` el `captureMessage` es determinista) |
| `src/app/api/health/route.ts` | 189–197 | Solo lectura — endpoint para el monitor de uptime; en producción exige header `X-Api-Key: <CRON_API_KEY>` (401 si falta) |
| `src/app/layout.tsx` | 78 | Solo lectura — `<html lang="es" ...>`; el `global-error.tsx` debe replicar `<html lang="es"><body>` |

Notas de contexto verificadas:
- No existe `sentry.edge.config.ts` y **ninguna ruta usa `runtime = "edge"`** (grep de `runtime = "edge"` en `src/`: cero hits). El middleware es `src/proxy.ts` y en Next 16 corre en runtime Node.js por defecto. Por eso `register()` solo necesita la rama `nodejs`.
- `@sentry/nextjs@10.51.0` exporta `captureRequestError` (server) y `captureRouterTransitionStart` (client) — verificado en `node_modules/@sentry/nextjs/build/types/`.
- Tests: vitest solo incluye `src/**/*.test.ts(x)` (`vitest.config.ts`), así que los archivos nuevos no rompen la suite.

## Pasos

### 1. Crear `src/instrumentation.ts`

Next.js busca `instrumentation.ts` dentro de `src/` cuando el proyecto usa esa carpeta (este es el caso). Contenido exacto:

```ts
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  // No hay rama "edge": el repo no tiene rutas edge y src/proxy.ts corre en
  // Node.js (default de Next 16). Si algún día se añade runtime edge, crear
  // sentry.edge.config.ts e importarlo aquí bajo NEXT_RUNTIME === "edge".
}

// Captura automáticamente los errores no manejados de rutas API, Server
// Components y Server Actions (hook nativo de Next.js >= 15).
export const onRequestError = Sentry.captureRequestError;
```

El import relativo `../sentry.server.config` es correcto: el config vive en la raíz del repo y `src/instrumentation.ts` un nivel abajo. No usar el alias `@/` (apunta a `./src/*`, ver `tsconfig.json`).

### 2. Crear `src/instrumentation-client.ts`

Con Turbopack (default en Next 16 tanto en `dev` como en `build`), `sentry.client.config.ts` jamás se inyecta solo; `instrumentation-client.ts` es el mecanismo oficial. Contenido exacto:

```ts
import * as Sentry from "@sentry/nextjs";

// Ejecuta el Sentry.init existente (DSN: NEXT_PUBLIC_SENTRY_DSN, scrub de PII).
import "../sentry.client.config";

// Instrumenta las navegaciones del App Router para tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

(Alternativa equivalente: mover el contenido de `sentry.client.config.ts` dentro de `instrumentation-client.ts` y borrar el config raíz. **Default recomendado: el import**, minimiza el diff y conserva los dos configs simétricos en la raíz.)

### 3. Crear `src/app/global-error.tsx`

Sin este archivo, los errores de render de React en producción no llegan a Sentry. Debe ser client component y renderizar `<html>` y `<body>` propios (reemplaza al layout raíz cuando explota). Mantener el look mínimo del producto (fondo `#030005`):

```tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          background: "#030005",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Algo salió mal</h1>
        <p style={{ opacity: 0.7, margin: 0 }}>
          El error fue registrado. Intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "12px 24px",
            borderRadius: "9999px",
            border: "none",
            background: "#6D00FF",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
```

No usar Tailwind ni componentes del repo aquí: si el layout raíz falló, cuanto menos dependa este archivo, mejor.

### 4. Limpiar Session Replay inerte en `sentry.client.config.ts`

Hoy las líneas 38–39 declaran `replaysOnErrorSampleRate: 1` y `replaysSessionSampleRate: 0.05`, pero **no se añade `Sentry.replayIntegration()`**, así que Replay nunca grabaría nada aunque el SDK arrancara. **Decisión de producto — default recomendado: ELIMINAR esas dos líneas y NO activar Replay.** Este producto maneja fotos corporales de usuarios; grabar sesiones es un riesgo de PII que contradice el `beforeSend` que tanto cuida el repo. (Alternativa NO recomendada: añadir `integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })]` — requeriría además añadir `worker-src 'self' blob:` al CSP de `src/proxy.ts` y revisar `src/proxy.security.test.ts`.) No tocar nada más del archivo: el `beforeSend` con scrub de emails/tokens debe quedar intacto.

### 5. Documentar `SENTRY_ORG` y `SENTRY_PROJECT` en `.env.example`

En el bloque `# Sentry (P1 Observability)` (líneas 174–179), añadir debajo de `SENTRY_AUTH_TOKEN=`:

```bash
SENTRY_ORG=                      # slug de la org en sentry.io (para subir source maps en build)
SENTRY_PROJECT=                  # slug del proyecto en sentry.io
```

`withSentryConfig` (next.config.ts:25–28) lee estas dos variables del entorno automáticamente; no hay que tocar `next.config.ts`.

### 6. Configuración fuera del repo (Sentry + Vercel) — sin esto el código sigue ciego

Documentar estos pasos en el PR/entrega; ejecutarlos requiere acceso del fundador:

1. **Crear proyecto Sentry**: en sentry.io (plan free sirve), crear proyecto tipo "Next.js", org y project slug propios. Copiar el DSN.
2. **Variables en Vercel** (Production y Preview): `NEXT_PUBLIC_SENTRY_DSN` = DSN, `SENTRY_DSN` = mismo DSN (el server config usa `SENTRY_DSN || NEXT_PUBLIC_SENTRY_DSN`, línea 3 de `sentry.server.config.ts`), `SENTRY_AUTH_TOKEN` = token con scope `project:releases` (para source maps), `SENTRY_ORG` y `SENTRY_PROJECT` = slugs del paso 1. **Importante:** `NEXT_PUBLIC_SENTRY_DSN` se inyecta en build time — hay que redeployar después de añadirla. También añadirlas a `.env.local` para verificación local.
3. **Alertas en Sentry** (Alerts → Create Alert):
   - Issue Alert: "When a new issue is created" → notify email del fundador. Aplicar a todos los issues del proyecto.
   - Metric Alert (default recomendado): "Number of errors" > 10 en 5 minutos → email (detecta picos como Gemini caído o webhook de MercadoPago fallando en masa).
4. **Monitor de uptime externo** (default recomendado: **Better Stack, plan free** — soporta headers custom; alternativa: UptimeRobot free, solo monitor 1):
   - Monitor 1: `GET https://ngxvision.app/` esperando HTTP 200, frecuencia 3 min, alerta por email.
   - Monitor 2: `GET https://ngxvision.app/api/health` con header `X-Api-Key: <valor de CRON_API_KEY en Vercel>` esperando HTTP 200 y keyword `"status":"healthy"` — este endpoint ya verifica Firebase, Redis y Gemini y devuelve 401 sin el header en producción (`src/app/api/health/route.ts` líneas 189–197).
   - Alternativa si no se quiere otra cuenta: Sentry incluye 1 uptime monitor en el plan free (Alerts → Uptime Monitor) apuntando a `https://ngxvision.app/`.

### 7. Verificación end-to-end local (determinista)

Con `NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_DSN` puestos en `.env.local` y añadiendo temporalmente `CSP_REPORT_SAMPLE_RATE=1` (la ruta lo lee en `src/app/api/csp-report/route.ts` línea 30; con `1`, el `Sentry.captureMessage` de la línea 72 se dispara siempre):

```bash
pnpm dev
# en otra terminal:
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/csp-report \
  -H "Content-Type: application/json" \
  -d '{"csp-report":{"document-uri":"http://localhost:3000/","violated-directive":"script-src","blocked-uri":"https://evil.example"}}'
# espera: 204, y en sentry.io aparece un evento "CSP Violation" (warning) en <1 min
```

Esto prueba el init del **servidor**. Para el **cliente**: abrir `http://localhost:3000` en el browser y en la consola ejecutar `window.__SENTRY__` — debe estar definido (objeto, no `undefined`). Quitar `CSP_REPORT_SAMPLE_RATE` de `.env.local` al terminar.

## Criterio de aceptación (verificable)

Ejecutar desde `/Users/aldoolivas/genesis-scann`:

1. Los tres archivos nuevos existen:
   ```bash
   test -f src/instrumentation.ts && test -f src/instrumentation-client.ts && test -f src/app/global-error.tsx && echo OK
   ```
2. Los hooks están exportados:
   ```bash
   grep -n "onRequestError = Sentry.captureRequestError" src/instrumentation.ts
   grep -n "onRouterTransitionStart = Sentry.captureRouterTransitionStart" src/instrumentation-client.ts
   grep -n "sentry.server.config" src/instrumentation.ts
   grep -n "sentry.client.config" src/instrumentation-client.ts
   grep -n "Sentry.captureException" src/app/global-error.tsx
   ```
   Cada grep devuelve al menos 1 línea.
3. Replay inerte eliminado y env vars documentadas:
   ```bash
   ! grep -n "replaysOnErrorSampleRate\|replaysSessionSampleRate" sentry.client.config.ts && echo OK
   grep -n "SENTRY_ORG" .env.example && grep -n "SENTRY_PROJECT" .env.example
   ```
4. Calidad en verde (los tests existentes deben seguir pasando):
   ```bash
   pnpm exec tsc --noEmit
   pnpm lint
   pnpm test
   pnpm build
   ```
   Los cuatro terminan con exit code 0. `pnpm build` no debe emitir errores de Sentry (con DSN vacío el SDK queda `enabled: false` y el build pasa igual — la subida de source maps solo ocurre cuando `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT` están presentes).
5. Verificación E2E del paso 7: el `curl` al endpoint CSP devuelve `204` y el evento "CSP Violation" aparece en el proyecto de Sentry; `window.__SENTRY__` está definido en el browser. (Solo ejecutable con un DSN real en `.env.local`; si no hay DSN disponible en esta sesión, dejar constancia y marcar el paso 6 como pendiente para el fundador.)
6. Comportamiento observable de `global-error.tsx` (opcional, manual): lanzar temporalmente `throw new Error("test")` en un componente de página, abrir la página con `pnpm dev`, comprobar que aparece el fallback "Algo salió mal" y el evento en Sentry, y **revertir el throw**.

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente (`@sentry/nextjs@10.51.0` ya instalado es suficiente; no instalar nada).
- NO modifiques `sentry.server.config.ts`, `next.config.ts` ni `src/proxy.ts` — ya están correctos para este fix.
- Si encuentras algo inesperado que bloquee el fix (p. ej. `pnpm build` falla por una razón ajena, o la versión de Next/Sentry no coincide con lo descrito), repórtalo y detente en vez de improvisar.
