# Fix 07 — Identidad: upgrade de cuenta anónima + claim server-side de sesiones por email verificado
**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 4-6 días | **Hallazgos cubiertos:** #1006, #1010

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision es un lead magnet Next.js (App Router, código en `src/` en la raíz del repo — NO existe carpeta `app/`) que genera proyecciones de transformación física con IA y vende el programa "NGX HYBRID" vía MercadoPago. Toda la persistencia es Firestore vía Firebase Admin SDK (reglas client-side deny-all); la identidad del usuario es Firebase Auth en el cliente.

**El problema (causa raíz estructural):** el único sign-in del funnel principal es `ensureAnonymousSession()` → `signInAnonymously` (`src/lib/firebaseClient.ts:37-42`). El wizard lo invoca al montar (`src/app/wizard/page.tsx:291`) y al enviar (línea 499), y la sesión se crea en Firestore con `ownerUid: authUser.uid` = ese uid anónimo (`src/app/api/sessions/route.ts:153`). Un grep global en `src/` de `linkWithCredential|linkWithPopup|linkWithRedirect|signInWithCustomToken|createCustomToken` devuelve **0 resultados**: no existe upgrade de la cuenta anónima, ni claim de sesiones por email, ni endpoint que reasigne `ownerUid` — a pesar de que el email del usuario se conoce y se guarda en el propio doc de sesión (`sessions/route.ts:152`, campo `email`). La credencial anónima vive solo en IndexedDB/localStorage del navegador: cambiar de dispositivo, borrar datos del navegador, o la purga automática de ITP en iOS Safari (~7 días de inactividad) la destruye de forma irreversible. Todo lo protegido por `requireSessionOwner`/`requireAuth` (`src/lib/authServer.ts:102-129`; FORBIDDEN 403 en líneas 124-126 si `ownerUid !== authUser.uid`) queda inaccesible para siempre: checkout de pago, brief, voz realtime, classify, datos privados, share-settings y borrado.

**El agravante (hallazgo #1010):** la página `/auth` promete "Accede para generar tu transformación y ver tu dashboard privado" (`src/app/auth/page.tsx:96`), pero `createUserWithEmailAndPassword`/`signInWithEmailAndPassword` (líneas 58-62) y `signInWithPopup` con Google (líneas 76-77) generan un uid **distinto** al uid anónimo que posee las sesiones, sin ningún paso posterior de vinculación ni claim. `/api/sessions/me` filtra estrictamente por `where("ownerUid", "==", authUser.uid)` (`src/app/api/sessions/me/route.ts:11-16`), así que el usuario que hace lo razonable — crear cuenta con el MISMO email con el que registró su sesión — recibe un dashboard vacío y 403 en cualquier intento sobre su shareId. La única superficie de "cuenta" del producto es hoy una falsa vía de recuperación.

**Impacto de negocio:** un lead que vuelve desde el email de nurture en otro dispositivo (o tras ~7 días en iOS) no puede pagar HYBRID ni ver su resultado completo: pérdida directa de conversiones. Peor: un cliente que YA pagó queda con su compra, su foto y sus datos de salud atados a una credencial efímera irrecuperable. El fix es el "puente" que falta: (a) **upgrade in-place** de la cuenta anónima en `/auth` (linkWithCredential/linkWithPopup, mismo uid → conserva ownership), (b) **magic link** (email-link de Firebase) como vía de acceso sin contraseña con email verificado de fábrica, y (c) **claim server-side**: un endpoint que, con email VERIFICADO en el token, reasigna `ownerUid` de las sesiones cuyo `email` coincida y cuyo dueño actual sea una cuenta anónima (nunca roba sesiones de cuentas permanentes).

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`). Líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/lib/authClient.ts` | (NUEVO, "use client") | Helpers de vinculación cliente: `registerOrUpgradeWithPassword`, `signInOrUpgradeWithGoogle`, `requestMagicLink`, `completeMagicLink`, `claimSessions` |
| `src/lib/sessionClaim.ts` | (NUEVO, server) | Lógica del claim: `claimSessionsForUser(db, adminAuth, user)` con invariantes de seguridad |
| `src/lib/sessionClaim.test.ts` | (NUEVO) | Tests unitarios vitest de la lib de claim |
| `src/app/api/sessions/claim/route.ts` | (NUEVO) | `POST /api/sessions/claim` — requireAuth + email verificado + rate limit + claim |
| `src/lib/authServer.ts` | 7-10 (`AuthUser`), 40-41 (`getAuthUser`), 67-71 (`getAuthUserFromCookie`) | Exponer `emailVerified` desde el token decodificado |
| `src/app/auth/page.tsx` | 5-10 (imports), 48-52 (redirect que expulsa a anónimos), 54-70 (`handleEmailAuth`), 72-85 (`handleGoogle`), 100-164 (UI) | Upgrade in-place, verificación de email, modo magic link, llamada al claim |
| `src/app/dashboard/page.tsx` | 27-38 (auth + redirect), 40-65 (efecto de carga que llama `/api/sessions/me`) | Claim best-effort antes de listar sesiones |
| `src/app/api/sessions/route.ts` | 150-184 (`ref.set`, `email` en 152), 200-227 (email Resend fire-and-forget) | Añadir `emailLower` al doc + CTA de acceso multi-dispositivo en el email |
| `src/lib/rateLimit.ts` | 39-144 (`getRateLimiters`), 156-173 (`IN_MEMORY_LIMITS`), 211-218 (`CRITICAL_ENDPOINTS` — NO tocar) | Añadir limiter `"api:claim"` |
| `src/lib/telemetry.ts` | 15-90 (`FunnelEvent`), 339+ (objeto `telemetry`) | (Opcional recomendado) evento `sessions_claimed` |
| `src/components/auth/AuthProvider.tsx` | 52-73 | Solo VERIFICAR: `onIdTokenChanged` ya re-sincroniza la cookie `__session` cuando el token cambia tras link/claim. No requiere cambios |
| `src/app/api/auth/session/route.ts` | — | Solo contexto: cookie de sesión ya existente. No requiere cambios |

## Pasos

### 0. Prerrequisito de consola Firebase (acción de ops, NO de código)

El magic link requiere habilitar **"Email link (passwordless sign-in)"** dentro del proveedor Email/Password en Firebase Console → Authentication → Sign-in method, y que el dominio de la app esté en *Authorized domains*. No puedes hacerlo desde el repo: implementa el código igualmente y **repórtalo como acción pendiente** al terminar. El resto del fix (link con password, link con Google, claim) funciona sin ese toggle.

### 1. Exponer `emailVerified` en `src/lib/authServer.ts`

- En la interfaz `AuthUser` (líneas 7-10) añade `emailVerified?: boolean;`.
- En `getAuthUser` (línea 41) devuelve `{ uid: decoded.uid, email: decoded.email, emailVerified: decoded.email_verified === true }`.
- En `getAuthUserFromCookie` (línea 71) lo mismo: `emailVerified: decoded.email_verified === true` (las claims de la session cookie también incluyen `email_verified`).
- No toques `requireSessionOwner` ni nada más: el campo es aditivo y opcional, ningún caller existente se rompe.

### 2. Crear `src/lib/sessionClaim.ts` (server-side)

Sigue el estilo de las libs de `src/lib/` (camelCase, JSDoc en español, server-only). Firma:

```typescript
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

export interface ClaimResult {
  claimed: number;
  skipped: number;
  claimedShareIds: string[];
}

export async function claimSessionsForUser(
  db: Firestore,
  adminAuth: Auth,
  user: { uid: string; email: string }
): Promise<ClaimResult>
```

Lógica exacta:

1. `const emailLower = user.email.toLowerCase();`
2. **Buscar candidatas** (máx 50 docs, dedupe por id):
   - Query principal: `db.collection("sessions").where("emailLower", "==", emailLower).limit(50).get()` (campo nuevo, ver paso 5).
   - Query legacy (docs creados antes de este fix, que solo tienen `email` tal cual lo tecleó el usuario): `db.collection("sessions").where("email", "in", [...new Set([user.email, emailLower])]).limit(50).get()`. Firebase Auth normaliza emails a minúsculas, así que esto cubre la gran mayoría; documenta en un comentario que docs legacy con email mixed-case ("Aldo@Gmail.com") no matchearán hasta un backfill (fuera de alcance).
3. **Determinar si el dueño actual es "reclamable"** con un helper exportado (para test):

```typescript
/** Reclamable = cuenta anónima (sin providers) o uid ya inexistente. */
export async function isClaimableOwner(adminAuth: Auth, ownerUid: string): Promise<boolean>
```

   - `adminAuth.getUser(ownerUid)` → si `userRecord.providerData.length === 0` (cuenta anónima) → `true`.
   - Si lanza error con `code === "auth/user-not-found"` (uid borrado) → `true`.
   - Cualquier cuenta con providers (password, google.com, etc.) → `false`. **Invariante de seguridad: NUNCA se reasigna una sesión cuyo dueño actual es una cuenta permanente** — eso evita robo de cuenta entre dos usuarios permanentes que compartan email en el doc.
   - Cachea resultados por `ownerUid` en un `Map` dentro de `claimSessionsForUser` para no repetir llamadas.
4. **Reasignar** cada candidata con `doc.data().ownerUid !== user.uid` y dueño reclamable, en una **transacción por documento** (mismo patrón que las transacciones de rate-limit en `src/app/api/sessions/route.ts:83-105`): dentro de la transacción re-lee el doc, verifica que `ownerUid` no cambió desde la lectura inicial, y haz `tx.update(ref, {...})` con:
   - `ownerUid: user.uid`
   - `emailLower` (backfill del campo en docs legacy)
   - `ownerHistory: FieldValue.arrayUnion({ uid: previousOwnerUid, replacedAt: Timestamp.now(), method: "email_claim" })` — **OJO:** dentro de `arrayUnion` NO se puede usar `FieldValue.serverTimestamp()` (Firestore lo rechaza); usa `Timestamp.now()`.
   - `updatedAt: FieldValue.serverTimestamp()`
   - **No toques** `deleteToken`, `shareScope`, `consents` ni ningún otro campo.
5. Devuelve `{ claimed, skipped, claimedShareIds }`. Sesiones ya poseídas por `user.uid` no cuentan en ninguno de los dos contadores. Deja propagar errores inesperados de Firestore (la route los convierte en 500).

(La lógica va en lib y no en el route file porque los route files del App Router solo admiten exports reservados — un export extra rompe la validación de tipos del build de Next; mismo criterio que el resto del repo.)

### 3. Crear `POST /api/sessions/claim` (`src/app/api/sessions/claim/route.ts`)

Sigue el patrón de `src/app/api/sessions/me/route.ts` (requireAuth por Bearer + try/catch con mapeo de "UNAUTHORIZED"):

```typescript
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, getDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/authServer";
import { claimSessionsForUser } from "@/lib/sessionClaim";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const authUser = await requireAuth(req);

    if (!authUser.email || !authUser.emailVerified) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED", message: "Verifica tu correo para recuperar tus sesiones." },
        { status: 403 }
      );
    }

    const rl = await checkRateLimit("api:claim", authUser.uid);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const result = await claimSessionsForUser(getDb(), getAuth(getAdminApp()), {
      uid: authUser.uid,
      email: authUser.email,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SESSIONS_CLAIM]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- El endpoint es **idempotente**: segunda llamada devuelve `claimed: 0`.
- No acepta body ni shareId: el claim es exclusivamente por email verificado del token. **Conocer un shareId ajeno no sirve de nada** (eso cierra el vector de account-takeover señalado en el hallazgo #1010).
- (Opcional recomendado) telemetría: si `result.claimed > 0`, `trackEvent({ sessionId: result.claimedShareIds[0], event: "sessions_claimed", metadata: { count: result.claimed } })` — requiere el paso 9.

### 4. Rate limit `"api:claim"` en `src/lib/rateLimit.ts`

- En `getRateLimiters()` añade junto a los demás (p. ej. después de `"api:brief"`, ~línea 137):

```typescript
rateLimiters.set("api:claim", new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 claims por uid por hora
  prefix: "rl:claim",
}));
```

- En `IN_MEMORY_LIMITS` (líneas 156-173) añade `"api:claim": { max: 10, windowMs: 3600000 },  // 10/hour`.
- **NO** lo añadas a `CRITICAL_ENDPOINTS` (líneas 211-218): si Redis cae, el claim debe degradar a fallback in-memory, no bloquear la recuperación de cuentas (no es gasto de IA).

### 5. `emailLower` + CTA de acceso en `src/app/api/sessions/route.ts`

- En el `ref.set({...})` (líneas 150-184), justo después de `email: userEmail,` (línea 152), añade `emailLower: userEmail.toLowerCase(),`. (Equality query sobre campo simple: Firestore lo auto-indexa, NO hace falta tocar `firestore.indexes.json` ni `src/firestoreIndexes.test.ts`.)
- **Decisión de producto (default recomendado, marcado):** en el email Resend fire-and-forget (líneas 200-227), añade al `html` (línea 222) un segundo párrafo: `<p>¿Cambias de dispositivo? Entra con este mismo correo en <a href="${baseUrl}/auth?next=/dashboard">${baseUrl}/auth</a> para recuperar tu resultado.</p>`. Así el propio email de confirmación se convierte en vía de recuperación. Alternativa descartada por defecto: generar el magic link server-side con `getAuth().generateSignInWithEmailLink()` e incrustarlo — los enlaces de acción caducan y un link muerto en el email D0 genera más soporte del que ahorra; mejor enlazar a `/auth`, donde el usuario pide un link fresco.
- No cambies nada más de esta route (rate limits, validación de foto, webhook n8n quedan idénticos).

### 6. Crear `src/lib/authClient.ts` (helpers cliente)

Archivo `"use client"` que importa `getClientAuth` desde `@/lib/firebaseClient` y todo lo necesario de `firebase/auth` (`EmailAuthProvider`, `GoogleAuthProvider`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signInWithPopup`, `linkWithCredential`, `linkWithPopup`, `sendEmailVerification`, `sendSignInLinkToEmail`, `isSignInWithEmailLink`, `signInWithEmailLink`). Helpers:

- **`registerOrUpgradeWithPassword(email, password): Promise<User>`** — núcleo del hallazgo #1006:
  - Si `auth.currentUser?.isAnonymous` → `linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password))` → **el uid anónimo se convierte en permanente conservando todas sus sesiones** (no hace falta claim en este camino).
  - Si el link falla con `auth/email-already-in-use` o `auth/credential-already-in-use` → fallback a `signInWithEmailAndPassword` (el claim del paso 3 recupera las sesiones del uid anónimo abandonado).
  - Si no hay usuario anónimo → `createUserWithEmailAndPassword` (comportamiento actual).
  - Tras crear/linkear cuenta de password: `await sendEmailVerification(user)` best-effort (try/catch con `console.warn`) — sin email verificado el claim devuelve 403 a propósito.
- **`signInOrUpgradeWithGoogle(): Promise<User>`** — si `auth.currentUser?.isAnonymous` → `linkWithPopup(currentUser, new GoogleAuthProvider())`; captura `auth/credential-already-in-use` (la cuenta Google ya existe) → fallback `signInWithPopup`. Si no hay anónimo → `signInWithPopup` directo. Google entrega `email_verified: true`, así que el claim funciona inmediatamente.
- **`requestMagicLink(email): Promise<void>`** — `sendSignInLinkToEmail(auth, email, { url: \`${window.location.origin}/auth?next=/dashboard\`, handleCodeInApp: true })` y guarda `window.localStorage.setItem("ngx:emailForSignIn", email)`.
- **`completeMagicLink(email): Promise<User>`** — asume `isSignInWithEmailLink(auth, window.location.href) === true`:
  - Si `auth.currentUser?.isAnonymous` → `linkWithCredential(currentUser, EmailAuthProvider.credentialWithLink(email, window.location.href))` (upgrade in-place, email queda verificado); fallback a `signInWithEmailLink` si el credential ya está en uso.
  - Si no → `signInWithEmailLink(auth, email, window.location.href)`.
  - Limpia `ngx:emailForSignIn`.
- **`claimSessions(): Promise<{ claimed: number }>`** — `await auth.currentUser.getIdToken(true)` (**forzar refresh**: tras link/verificación el token viejo aún dice `email_verified: false`) y `fetch("/api/sessions/claim", { method: "POST", headers: { Authorization: \`Bearer ${token}\` } })`. Si responde 403 `EMAIL_NOT_VERIFIED`, devuelve `{ claimed: 0 }` sin lanzar (el caller decide si avisa).

### 7. Reescribir los handlers de `src/app/auth/page.tsx`

- **Bug del redirect (líneas 48-52):** hoy `if (!loading && user) router.push(nextUrl)` expulsa de `/auth` a cualquier usuario **anónimo** (que es justo quien necesita hacer upgrade). Cámbialo a `if (!loading && user && !user.isAnonymous) router.push(nextUrl);`.
- **`handleEmailAuth` (líneas 54-70):** en modo `register` usa `registerOrUpgradeWithPassword`; en `login` deja `signInWithEmailAndPassword`. Tras éxito en ambos modos: `const { claimed } = await claimSessions()` (best-effort, try/catch) y si `claimed > 0` muestra toast success "Recuperamos {claimed} transformación(es) asociadas a tu correo". En modo `register` añade toast info "Te enviamos un correo de verificación — confírmalo para recuperar sesiones de otros dispositivos". Después `router.push(nextUrl)` como hoy.
- **`handleGoogle` (líneas 72-85):** usa `signInOrUpgradeWithGoogle`, luego el mismo `claimSessions()` + toast + `router.push(nextUrl)`.
- **Modo magic link (nuevo):** añade un tercer botón "Enviarme enlace de acceso" (deshabilitado si `!email`) que llama `requestMagicLink(email)` y muestra toast "Revisa tu correo: te enviamos un enlace de acceso". Y un `useEffect` al montar: si `isSignInWithEmailLink(getClientAuth(), window.location.href)` → toma el email de `localStorage.getItem("ngx:emailForSignIn")` o, si no existe (cross-device), pide al usuario confirmarlo en el input de email existente antes de continuar → `completeMagicLink(email)` → `claimSessions()` → `router.push(nextUrl)`. Maneja errores (`auth/invalid-action-code` = link caducado) con toast y deja la página usable para pedir otro link.
- Mantén los patrones existentes del archivo: `useToast` para errores, `setSubmitting`, `safeNextPath`. No toques el copy de la línea 96 — con el claim implementado la promesa del "dashboard privado" pasa a ser verdadera.

### 8. Claim best-effort en `src/app/dashboard/page.tsx`

En el efecto de carga (líneas ~40-65), **antes** del `fetch("/api/sessions/me", ...)` y solo cuando `user && !user.isAnonymous && user.email`: llama `claimSessions()` de `@/lib/authClient` dentro de try/catch silencioso; si `claimed > 0`, toast success igual que en `/auth`. Esto cubre al usuario que verificó su email días después (clic en el correo de verificación y vuelta directa al dashboard sin pasar por `/auth`). El fetch de sesiones se hace después, así la lista ya incluye lo reclamado.

### 9. (Opcional recomendado) Evento de telemetría en `src/lib/telemetry.ts`

- Añade `| "sessions_claimed"` al union `FunnelEvent` (líneas 15-90).
- Añade al objeto `telemetry` (línea 339+): `sessionsClaimed: (sessionId: string, count: number) => trackEvent({ sessionId, event: "sessions_claimed", metadata: { count } }),` y úsalo en la route del paso 3.
- NO toques el enum espejo de `src/lib/validators.ts` (es el allowlist del endpoint público `/api/telemetry`, que es client-side; este evento se emite server-side).

### 10. Tests: `src/lib/sessionClaim.test.ts`

Estilo vitest del repo (`describe/it/expect/vi`, sin globals — mismo patrón de mocks de Firestore que `setupDb` en `src/app/api/checkout/webhook/route.test.ts:72-88`). Mockea `db` (chains `collection().where().limit().get()` y `runTransaction`) y `adminAuth.getUser`. Casos mínimos:

1. Sesión con `emailLower` coincidente y owner anónimo (`providerData: []`) → transacción ejecutada con `ownerUid` nuevo, `ownerHistory` con el uid previo, `claimed: 1`.
2. Sesión cuyo owner actual es cuenta permanente (`providerData: [{ providerId: "password" }]`) → NO se escribe nada, `skipped: 1`.
3. Owner uid inexistente (`adminAuth.getUser` lanza `{ code: "auth/user-not-found" }`) → se reclama.
4. Sesión ya poseída por `user.uid` → no se escribe, no cuenta ni en `claimed` ni en `skipped` (idempotencia).
5. Doc legacy sin `emailLower` que matchea por la query de `email` exacto → se reclama y se backfillea `emailLower`.
6. Dedupe: mismo doc devuelto por ambas queries → una sola escritura.

Los helpers de `src/lib/authClient.ts` no se testean unitariamente (Firebase client SDK en jsdom no aporta señal); su verificación es el criterio manual de abajo. Si el entorno tiene Firebase Emulator configurado (`pnpm emulators`, `pnpm test:gate:local`), ejecútalo como verificación adicional, pero no es bloqueante.

## Criterio de aceptación (verificable)

Desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

1. `pnpm exec tsc --noEmit` — sin errores.
2. `pnpm lint` — sin errores nuevos.
3. `pnpm test` — toda la suite vitest en verde, incluyendo los nuevos tests de `src/lib/sessionClaim.test.ts` y sin romper los existentes (`rateLimit.test.ts`, `validators.test.ts`, `telemetry.trust.test.ts`, etc.).
4. `grep -rn "linkWithCredential\|linkWithPopup" src/lib/authClient.ts` — ≥ 2 hits (upgrade por password y por Google/email-link).
5. `grep -n "isAnonymous" src/app/auth/page.tsx` — ≥ 1 hit (el redirect ya no expulsa a usuarios anónimos).
6. `grep -n "emailLower" src/app/api/sessions/route.ts` — 1 hit en el `ref.set`.
7. `grep -n "claimSessionsForUser" src/app/api/sessions/claim/route.ts src/lib/sessionClaim.ts` — hit en ambos (definición + uso).
8. `grep -n '"api:claim"' src/lib/rateLimit.ts` — 2 hits (limiter Redis + `IN_MEMORY_LIMITS`); y `grep -n '"api:claim"' src/lib/rateLimit.ts | grep -c CRITICAL` → 0 (no está en fail-closed).
9. Endpoint sin token: `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/sessions/claim` → `401`. (Con `pnpm dev` corriendo; con un Bearer de usuario anónimo el mismo curl devuelve `403` con `EMAIL_NOT_VERIFIED` — verificable con `pnpm mint:token` + emulador si está disponible.)
10. Comportamiento observable (razonado en el reporte final o vía emulador): (a) usuario anónimo con sesión creada que se registra con password en `/auth` conserva el MISMO uid → `/api/sessions/me` sigue devolviendo su sesión sin claim; (b) usuario en OTRO dispositivo que entra con Google usando el mismo email → `POST /api/sessions/claim` devuelve `claimed ≥ 1` y su dashboard muestra la sesión; (c) una sesión cuyo `ownerUid` es una cuenta permanente distinta NUNCA cambia de dueño.
11. `git diff --stat` — solo aparecen los archivos listados en "Archivos involucrados" (más los tests nuevos).

## Restricciones

- NO toques nada fuera de los archivos listados (y los tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente (no lo pide: `firebase@^12` y `firebase-admin@^13` ya incluyen todas las APIs usadas).
- NO ejecutes `firebase deploy` ni escribas en Firestore/Auth de producción; la habilitación del proveedor "Email link" en consola se reporta como acción pendiente de ops, no se ejecuta.
- El claim NUNCA debe reasignar sesiones cuyo dueño actual tenga `providerData.length > 0`, y NUNCA debe aceptar shareIds del cliente como criterio — si durante la implementación esto entra en conflicto con algo existente, repórtalo y detente.
- Si encuentras algo inesperado que bloquee el fix (p. ej. ya existe un endpoint de claim, el shape del doc de sesión cambió, o `/auth` fue rediseñada), repórtalo y detente en vez de improvisar.
