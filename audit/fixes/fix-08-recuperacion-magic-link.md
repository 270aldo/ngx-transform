# Fix 08 — Recuperación multi-dispositivo: magic link que re-ancla el ownership

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #1007, #1009, #73

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision (Next.js 16 App Router, código en `src/` en la raíz — NO existe `app/`; Firestore vía Admin SDK; sesiones en `sessions/{shareId}` con `ownerUid`) identifica al usuario con Firebase **anónimo** y una cookie `__session` de 5 días (`src/app/api/auth/session/route.ts:28-29`). El wizard promete "Ese mismo correo te permite recuperar el resultado" (`src/components/wizard/WizardClosingStep.tsx:53`) y el email de confirmación enlaza a `/s/{shareId}` (`src/app/api/sessions/route.ts:222`).

**El problema:** la página `/s/[shareId]` decide dueño-vs-público comparando la cookie con `ownerUid` (`src/app/s/[shareId]/page.tsx:147-148`) y el `shareScope` se crea todo en `false` (`src/app/api/sessions/route.ts:156-162`). En otro dispositivo/navegador (o tras ~7 días en iOS, donde ITP purga la credencial anónima), el usuario NO es dueño y ve "Transformación privada / Imágenes en proceso..." con CTA "Crear mi transformación" — un callejón sin salida. Peor: **pagar** exige ser dueño (`requireSessionOwner` en `src/app/api/checkout/create-preference/route.ts:23`), así que el lead que vuelve con intención de compra recibe 401/403; y el cliente que YA pagó queda atado al uid efímero (el webhook guarda `payerEmail` en `src/app/api/checkout/webhook/route.ts:259` pero nunca se usa para recuperar nada).

**Negocio:** el canal de retorno nº1 (emails D0-D7) aterriza en un muro justo cuando el lead vuelve con intención; conversión perdida + clientes pagados bloqueados → contracargos.

## Archivos involucrados
- **CREAR** `src/lib/accessToken.ts` — token HMAC firmado por shareId (copiar patrón exacto de `src/lib/unsubscribeToken.ts:1-36`: HMAC-SHA256 sobre `v1:access:${shareId}`, secreto `ACCESS_TOKEN_SECRET || CRON_API_KEY`).
- **CREAR** `src/app/api/sessions/[shareId]/claim/route.ts` — `POST {token}` que valida el HMAC con `secureCompare` (`src/lib/crypto.ts:23`) y reasigna `ownerUid` al uid autenticado actual (`requireAuth` de `src/lib/authServer.ts:90-96`).
- `src/app/api/sessions/route.ts:211-226` — el email de confirmación: añadir `?access={token}` a la URL.
- `src/emails/sequence/*` y `src/lib/emailScheduler.ts` — propagar el mismo parámetro en los links de nurture.
- `src/app/s/[shareId]/page.tsx:147-162` — si llega `?access=` válido y hay usuario (anónimo o no), disparar el claim client-side (pequeño componente) y `router.refresh()`.
- `src/app/api/auth/session/route.ts:28-29` — subir `SESSION_DURATION_MS` a 14 días (máximo de Firebase Admin), mitigación parcial de #1009.

## Pasos
1. Crear `accessToken.ts` con `generateAccessToken(shareId)` y `verifyAccessToken(shareId, token)` (HMAC, `secureCompare`, mismo estilo que `unsubscribeToken.ts`).
2. Crear el endpoint claim: `requireAuth` → valida token → `sessionRef.update({ ownerUid: authUser.uid })` → telemetría `session_reclaimed`. Rate limit con clave existente `api:general` (`src/lib/rateLimit.ts`). Si la sesión tiene `checkout.status === "completed"`, registrar también en telemetría (es un cliente pagado recuperándose).
3. Añadir el token a la URL del email de `sessions/route.ts:222` y a los templates de secuencia (los links se construyen en `emailScheduler.ts`/templates — grep `"/s/"` en `src/emails/`).
4. En `/s/[shareId]`: leer `searchParams.access`; si existe y `!isOwner`, renderizar un client component mínimo que asegure sesión anónima (`ensureAnonymousSession` de `src/lib/firebaseClient.ts:37-41`), llame al claim con Bearer token y refresque.
5. Subir cookie a 14 días.
6. Tests: unit del endpoint claim (401 sin auth, 403 token inválido, 200 reasigna; patrón de mocks de `src/app/api/checkout/create-preference/route.test.ts`) + unit de `accessToken.ts` (copiar `src/lib/unsubscribeToken.test.ts`).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- Con emulador (`pnpm test:gate:local` verde): abrir `/s/{shareId}?access={token válido}` en un contexto SIN cookie del dueño → tras el claim, la página muestra vista de dueño y `POST /api/checkout/create-preference` responde 200.
- Token de otro shareId → 403 y `ownerUid` intacto.
- `grep -n "SESSION_DURATION_MS" src/app/api/auth/session/route.ts` muestra 14 días.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias.
- Si algo inesperado bloquea el fix (p.ej. ya existe un mecanismo de claim de otro fix de esta auditoría — fix-07 crea claim por email verificado, este por token de URL; son complementarios), repórtalo y detente en vez de improvisar.
