# Fix 09 — Derecho ARCO ejecutable: entregar el link de borrado al titular por email

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1–2 días | **Hallazgos cubiertos:** #1008

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision (este repo) es un lead magnet viral de transformación física (Next.js 16 App Router, código en `src/` en la raíz — **no existe carpeta `app/` separada**; Firebase Admin/Firestore en servidor; emails transaccionales con Resend; aviso de privacidad bajo LFPDPPP en `src/app/privacy/page.tsx`). Cada sesión guarda datos sensibles del titular: foto corporal original, imágenes generadas por IA, biometría (edad, sexo, peso, altura), niveles de estrés/sueño/disciplina y email.

**El problema:** el `DELETE /api/sessions/[shareId]` (`src/app/api/sessions/[shareId]/route.ts`, líneas 107–158) acepta dos vías: el header `X-Delete-Token` (validado con `validateDeleteToken`, línea 113) o autenticación del dueño vía `requireSessionOwner` (línea 119). Pero el `deleteToken` se genera al crear la sesión (`src/app/api/sessions/route.ts`, línea 144) y se guarda **únicamente en Firestore** (línea 177): la respuesta del `POST /api/sessions` devuelve solo `{ sessionId, latency_ms }` (líneas 232–235) y el email de confirmación que se dispara fire-and-forget (líneas 200–227) solo contiene el link a los resultados — **el token jamás llega al titular por ningún canal** (verificado: ningún otro punto de `src/` lo expone al cliente). En la práctica, el único camino de borrado es el uid de Firebase Auth (frecuentemente anónimo/efímero); si el usuario cambia de dispositivo, borra el navegador o ITP expira la sesión, pierde toda vía self-service para ejercer Cancelación/Oposición (derechos ARCO) sobre su fotografía y datos de salud.

**Por qué importa:** el aviso de privacidad (`src/app/privacy/page.tsx`, sección "V. Derechos ARCO", líneas ~200–235) promete esos derechos y la tabla de retención dice "hasta solicitud de eliminación", pero hoy cada solicitud real exige soporte manual con acceso directo a Firestore. Es riesgo de cumplimiento LFPDPPP ante una solicitud formal del titular o del INAI, además de carga operativa.

**La buena noticia:** toda la infraestructura existe. El token aleatorio de 32 bytes ya se genera y persiste por sesión, `validateDeleteToken` ya lo valida contra `sessions/{shareId}.deleteToken` (fallback en `src/lib/jobManager.ts`, líneas ~318–350), y el repo ya tiene el patrón completo de "magic link por email + página de confirmación" en el flujo de unsubscribe (`src/lib/unsubscribeToken.ts` → link en emails → `src/app/unsubscribe/page.tsx` → `POST /api/unsubscribe`). Solo hay que entregar el link de borrado en el email de confirmación y dar una vía para re-solicitarlo.

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`), líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/app/api/sessions/route.ts` | 144 (`generateDeleteToken()`), 177 (persistencia en Firestore), 200–227 (bloque fire-and-forget del email de confirmación con Resend), 232–235 (respuesta JSON) | **MODIFICAR** — añadir el link de borrado al HTML del email de confirmación |
| `src/app/api/sessions/[shareId]/request-delete/route.ts` | (nuevo) | **CREAR** — endpoint POST que reenvía el link de borrado al email del dueño de la sesión (para sesiones antiguas o emails perdidos) |
| `src/app/delete/page.tsx` | (nuevo) | **CREAR** — página de confirmación de borrado (`/delete?shareId=...&token=...`) con botón explícito; también permite solicitar el reenvío del link |
| `src/app/privacy/page.tsx` | ~200–235 (sección "V. Derechos ARCO") | **MODIFICAR** — mencionar la vía self-service (link en el email / página `/delete`) |
| `src/app/api/sessions/[shareId]/request-delete/route.test.ts` | (nuevo) | **CREAR** — unit tests vitest del endpoint nuevo |

Solo lectura (patrones a seguir, **NO modificar**):

- `src/app/api/sessions/[shareId]/route.ts` (107–158): el `DELETE` ya acepta `X-Delete-Token` — **no requiere cambios**. OJO: el test estático `src/app/api/security-p1.static.test.ts` exige que este archivo siga conteniendo los strings `requireSessionOwner`, `validateDeleteToken` y `owner auth is the primary path`; no tocarlo evita romperlo.
- `src/lib/jobManager.ts` (~318–350): `validateDeleteToken(sessionId, providedToken)` — valida primero contra `jobs/{sessionId}_analysis` y como fallback contra `sessions/{sessionId}.deleteToken`. **Importante:** el job de análisis se crea con `{ generateDeleteToken: false }` (`src/app/api/sessions/route.ts:187`), por lo que el token vigente vive SOLO en el doc de sesión; el helper `getDeleteToken()` de jobManager (lee del job) devuelve `null` para las sesiones actuales — **no usarlo**; leer `sessions/{shareId}.deleteToken` directamente.
- `src/app/api/email/route.ts`: patrón de seguridad "solo enviar al email del dueño guardado en la sesión" + uso de `Resend`, `getConfiguredFromEmail()` y `checkRateLimit`.
- `src/app/api/unsubscribe/route.ts` + `src/app/unsubscribe/page.tsx`: patrón de magic link + página cliente con `useSearchParams` envuelto en `<Suspense>`.
- `src/app/api/unsubscribe/route.test.ts`: patrón de mocks vitest (`vi.mock` de `@/lib/firebaseAdmin`, `@/lib/rateLimit`; `vi.hoisted` para spies).
- `src/lib/rateLimit.ts`: `checkRateLimit(endpoint, id)`, `getClientIP`, `getRateLimitHeaders`; clave existente `"api:email"` = 5/hora por IP.
- `src/lib/emailConfig.ts`: `getConfiguredFromEmail(context)`.

Env vars: se reutilizan las existentes (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_BASE_URL`/`VERCEL_URL`). **No hay que crear env vars nuevas** (decisión por defecto: se reutiliza el `deleteToken` aleatorio ya persistido, no se introduce un esquema HMAC nuevo tipo `unsubscribeToken.ts`).

## Pasos

### 1. Incluir el link de borrado en el email de confirmación (`src/app/api/sessions/route.ts`)

En el bloque fire-and-forget (líneas 200–227), donde ya se construye `baseUrl` y `url` (líneas 205–211), construir también:

```ts
const deleteUrl = `${String(baseUrl).startsWith("http") ? baseUrl : `https://${baseUrl}`}/delete?shareId=${shareId}&token=${encodeURIComponent(deleteToken)}`;
```

(`deleteToken` ya está en scope desde la línea 144.) Añadir al `html` del `resend.emails.send` (líneas 218–223) un párrafo discreto al final, p. ej.:

```html
<p style="font-size:12px;color:#888">¿Quieres eliminar tu sesión y todos tus datos (foto, imágenes generadas y perfil)? Puedes hacerlo en cualquier momento desde este enlace: <a href="${deleteUrl}">Eliminar mis datos</a>.</p>
```

No cambiar nada más del bloque ni de la respuesta JSON (el token NO debe devolverse en la respuesta del POST; el canal de entrega es el email, que verifica posesión del buzón).

### 2. Crear `src/app/api/sessions/[shareId]/request-delete/route.ts` (reenvío del link para sesiones existentes)

Endpoint `POST` sin auth (la verificación es la posesión del buzón: el link solo se envía al email guardado en la sesión — mismo principio de seguridad que `POST /api/email`). Lógica exacta:

1. `const { shareId } = await context.params;` (firma: `POST(req: Request, context: { params: Promise<{ shareId: string }> })`, igual que el route hermano).
2. Rate limiting primero: `checkRateLimit("api:email", getClientIP(req))` → si falla, 429 con `getRateLimitHeaders` (patrón de `src/app/api/email/route.ts`). **Por defecto reutilizar la clave `"api:email"` (5/hora por IP)** para no tocar `src/lib/rateLimit.ts`; solo si se prefiere un bucket propio, añadir una clave nueva en ese archivo (no recomendado para este fix).
3. `getDb().collection("sessions").doc(shareId).get()` → si no existe, `404 { error: "Session not found" }`.
4. Leer `email` y `deleteToken` del doc. Si no hay `email`, `400 { error: "No email associated with this session" }`.
5. Si el doc **no tiene** `deleteToken` (sesiones muy antiguas): generar uno nuevo con `randomBytes(32).toString("base64url")` (de `node:crypto`, mismo patrón que `src/app/api/sessions/route.ts:22-24`) y persistirlo con `ref.set({ deleteToken }, { merge: true })` antes de enviar.
6. Construir `deleteUrl` con la misma lógica de `baseUrl` del paso 1 (`NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_BASE_URL || VERCEL_URL || "http://localhost:3000"`).
7. Enviar con Resend: `from = getConfiguredFromEmail("RequestDelete")` (si `null` o falta `RESEND_API_KEY`, responder `503 { error: "Email sender not configured" }`), `to: email` (el de la sesión, NUNCA uno del request), asunto p. ej. `"Enlace para eliminar tus datos de NGX Vision"`, html con el `deleteUrl` y una nota de que el borrado es irreversible. **NO consultar `isEmailSuppressed`**: este email es transaccional/legal (ejercicio de derechos ARCO), no marketing, y debe llegar aunque el usuario se haya dado de baja del nurture.
8. Responder `200 { ok: true }` **sin incluir el email ni el token** en el cuerpo (anti-enumeración de PII; el shareId ya es semi-público por las URLs compartibles, pero el email no debe exponerse).
9. Todo en try/catch → `500 { error: "Internal server error" }` con `console.error` (patrón del repo).

No aceptar `GET` (devolver 405, como hace `src/app/api/unsubscribe/route.ts:76-78`).

### 3. Crear la página `src/app/delete/page.tsx`

Client component (`"use client"`), espejo estructural de `src/app/unsubscribe/page.tsx` (incluido el `<Suspense>` alrededor del contenido que usa `useSearchParams` — sin él, `pnpm build` falla por el CSR bailout de Next). Diferencias clave:

- **NUNCA disparar el borrado automáticamente al cargar.** A diferencia del unsubscribe (que auto-ejecuta en `useEffect`), aquí los escáneres de seguridad de email y los prefetchers de links seguirían el enlace y destruirían los datos del usuario. La página debe mostrar un resumen ("Se eliminará tu foto original, las imágenes generadas y tu perfil. Esta acción no se puede deshacer.") y un botón explícito tipo "Eliminar definitivamente mis datos" (usar el copy de confirmación ya existente en `src/app/dashboard/[shareId]/page.tsx:104-106` como referencia).
- Al confirmar, llamar:

```ts
fetch(`/api/sessions/${shareId}`, {
  method: "DELETE",
  headers: { "X-Delete-Token": token },
});
```

  (el endpoint DELETE existente ya valida ese header; no requiere `Authorization`). Mostrar estado success ("Tus datos fueron eliminados.") o error (en 403, indicar que el enlace ya no es válido y ofrecer re-solicitarlo).
- Si la URL trae `shareId` pero **no** trae `token` (o el DELETE devolvió 403), ofrecer un botón "Enviarme el enlace de borrado a mi correo" que haga `POST /api/sessions/${shareId}/request-delete` y muestre "Si la sesión existe, enviamos el enlace al correo asociado."
- Estética mínima consistente con `/unsubscribe` (fondo negro, acento `#6D00FF`).

### 4. Actualizar el aviso de privacidad (`src/app/privacy/page.tsx`, sección V)

Añadir un punto (o párrafo) en la sección "V. Derechos ARCO" (líneas ~200–235) indicando la vía self-service: que todo correo de confirmación incluye un enlace directo de eliminación y que el titular puede solicitar el reenvío de ese enlace al correo asociado a su sesión. Mantener intacto el procedimiento por email a `{contacto}` (sigue siendo la vía formal LFPDPPP). Cambio de copy únicamente; no tocar `legalConfig`.

### 5. Tests: `src/app/api/sessions/[shareId]/request-delete/route.test.ts`

Seguir el patrón exacto de `src/app/api/unsubscribe/route.test.ts` (vitest; `vi.mock` de `@/lib/firebaseAdmin` y `@/lib/rateLimit`; `vi.hoisted` para los spies de `set`; mock de `resend` — mockear el módulo `resend` con una clase `Resend` cuyo `emails.send` sea un `vi.fn`). Casos mínimos:

1. Sesión existente con `email` y `deleteToken` → 200, `emails.send` llamado con `to` = email de la sesión y un html que contiene `/delete?shareId=` y el token; el cuerpo de la respuesta NO contiene ni el email ni el token.
2. Sesión inexistente → 404 y `emails.send` no llamado.
3. Sesión sin `deleteToken` → se persiste uno nuevo (`set` con `{ merge: true }`) y se envía.
4. Rate limit excedido (mock `checkRateLimit` → `success: false`) → 429 y `emails.send` no llamado.
5. (Opcional) `RESEND_API_KEY` ausente → 503.

Para el paso 1 (email de confirmación) no hay test unitario previo del POST de sesiones; basta el check estático por grep del criterio de aceptación.

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

1. `pnpm test` → todo verde, incluyendo los tests nuevos de `request-delete` y, sin cambios, `src/app/api/security-p1.static.test.ts` y `src/app/api/unsubscribe/route.test.ts`.
2. `pnpm lint` → sin errores nuevos.
3. `pnpm exec tsc --noEmit` → sin errores de tipos.
4. `pnpm build` → compila (verifica en particular que `/delete` no rompe por `useSearchParams` sin `Suspense`).
5. El email de confirmación incluye el link de borrado:
   `grep -n "delete?shareId" src/app/api/sessions/route.ts` → al menos 1 match dentro del bloque del email (líneas ~200–227).
6. El token sigue sin exponerse en la respuesta del POST:
   `grep -n "deleteToken" src/app/api/sessions/route.ts` → aparece en la generación (l. ~144), persistencia (l. ~177) y construcción del `deleteUrl`, pero NO dentro del `NextResponse.json` final (líneas ~232–235 deben seguir devolviendo solo `sessionId` y `latency_ms`).
7. El DELETE existente no fue modificado:
   `git diff --stat -- "src/app/api/sessions/[shareId]/route.ts"` → sin cambios.
8. Endpoint nuevo responde (con dev server `pnpm dev` corriendo y un `shareId` inexistente):
   `curl -s -X POST http://localhost:3000/api/sessions/noexiste1234/request-delete` → `{"error":"Session not found"}` con status 404 (`curl -s -o /dev/null -w "%{http_code}"` → `404`).
9. La página `/delete` carga y NO ejecuta el borrado sin click:
   `curl -s http://localhost:3000/delete?shareId=x\&token=y` → 200, y el borrado solo ocurre tras pulsar el botón de confirmación (verificación manual en navegador: la página muestra el botón y no hay request DELETE en Network al cargar).
10. Flujo end-to-end manual (opcional, requiere emuladores o entorno con Firestore + Resend): crear sesión → recibir email con link → abrir `/delete?...` → confirmar → `GET /api/sessions/{shareId}` devuelve 404 y los archivos de Storage de la sesión desaparecen.

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos). En particular, NO modificar `src/app/api/sessions/[shareId]/route.ts` ni `src/lib/jobManager.ts` ni `src/lib/rateLimit.ts`.
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente (no lo pide: Resend, vitest y todo lo necesario ya están instalados).
- Si encuentras algo inesperado que bloquee el fix (p. ej. el shape del doc de sesión difiere, o el test estático de seguridad falla por otro motivo), repórtalo y detente en vez de improvisar.
