# Fix 10 — Retención y borrado completo: DELETE íntegro, TTL de sesiones y cron agendado

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1–3 días | **Hallazgos cubiertos:** #21, #22, #23

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision (este repo) es un lead magnet viral de transformación física: el usuario sube una **foto de su cuerpo** + perfil (edad, peso, estrés, sueño) y recibe proyecciones generadas por IA. Stack: Next.js 16 App Router con el código en `src/` en la raíz (**no existe carpeta `app/` separada**), Firebase Admin (Firestore + Storage) en servidor, deploy en Vercel. Es la categoría de dato más sensible posible (fotos corporales identificables por email), y hoy el sistema tiene tres agujeros de retención/borrado:

**1. El DELETE de sesión es incompleto (hallazgo #21).** `DELETE /api/sessions/[shareId]` (`src/app/api/sessions/[shareId]/route.ts`, líneas 142–152) borra el doc de `sessions`, la foto original, las imágenes generadas y el prefijo `sessions/{shareId}/` en Storage — pero deja vivos: (a) `transform_reports/{shareId}` en Firestore con el reporte completo derivado del perfil, (b) el PDF en Storage bajo `reports/{shareId}/season-vision-report-v1.pdf` (prefijo distinto a `sessions/`, ver `src/app/api/report/route.ts` líneas 70–72), (c) `email_sequences/{shareId}` con email + nombre y `status: "active"`, por lo que la secuencia de nurture D0–D14 **sigue mandando correos de marketing** ("Última oportunidad para entrar a HYBRID") a alguien que borró sus datos, y (d) `leads/{email}` y `remarketing_leads/{email}`. Bajo LFPDPPP eso es un derecho de cancelación incumplido, además de receta para spam-reports que queman el dominio de email.

**2. El cron de limpieza existe pero nada lo ejecuta (hallazgo #22).** `POST /api/cron/cleanup` implementa el borrado de sesiones abandonadas (>30 días), pero `vercel.json` no tiene sección `"crons"` y ningún workflow lo agenda. El propio archivo dice "Should be called by Vercel Cron or external scheduler". Resultado: la retención prometida en el aviso de privacidad simplemente no ocurre; fotos y datos se acumulan sin límite.

**3. No hay TTL para sesiones completadas ni para fotos huérfanas (hallazgo #23).** Aun corriendo, el cron excluye explícitamente las sesiones `ready`/`completed` (query línea 83 y double-check línea 107 de `src/app/api/cron/cleanup/route.ts`): una sesión exitosa guarda foto corporal + datos de salud **para siempre**. Además, el wizard sube la foto a `uploads/{uid}/{seed}/original.{ext}` (`src/app/wizard/page.tsx`, línea 515) **antes** de crear la sesión vía `POST /api/sessions`; si la creación falla (rate limit, error, abandono), esa foto queda huérfana en Storage y ningún proceso barre el prefijo `uploads/`.

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`), líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/app/api/sessions/[shareId]/route.ts` | 11–15 (interfaz `DeleteSessionDocument`), 107–158 (handler `DELETE`), 142–152 (bloque de borrado actual) | **MODIFICAR** — completar el borrado de artefactos derivados |
| `src/lib/sessionPurge.ts` | (nuevo) | **CREAR** — helper compartido que borra datos ligados a sesiones (única fuente de verdad para DELETE y cron) |
| `src/app/api/cron/cleanup/route.ts` | 28 (config TTL), 48–58 (`validateCronKey`), 80–85 (query de abandonadas), 203–243 (`cleanupRelatedData`), 344–375 (`POST`), 378–389 (`GET`) | **MODIFICAR** — TTL de completadas, sweep de `uploads/`, usar el helper, soportar invocación GET de Vercel Cron |
| `vercel.json` | 1–9 (hoy sin `crons`) | **MODIFICAR** — agendar el cron diario |
| `firestore.indexes.json` | 2–68 (array `indexes`) | **MODIFICAR** — índice compuesto `sessions(status, lastActivityAt)` |
| `src/firestoreIndexes.test.ts` | 22–29 | **MODIFICAR** — asertar el índice nuevo |
| `.env.example` | 153 (`SESSION_TTL_DAYS`), 164–171 (sección Security / Cron, `CRON_API_KEY` en 167) | **MODIFICAR** — documentar `COMPLETED_SESSION_TTL_DAYS`, `UPLOADS_ORPHAN_TTL_HOURS`, `CRON_SECRET` |
| `src/lib/sessionPurge.test.ts` | (nuevo) | **CREAR** — unit tests del helper |
| `src/app/api/sessions/[shareId]/route.test.ts` | (nuevo; hoy no existe test junto a esa ruta) | **CREAR** — tests del DELETE completo |

Solo lectura (patrones a seguir, NO modificar):
- `src/lib/storage.ts` — `deletePath(path)` (ignora not-found) y `deletePrefix(prefix)` (lista y borra todo bajo un prefijo); `getBucket()` viene de `src/lib/firebaseAdmin.ts` (línea 40).
- `src/app/api/report/route.ts` — `reportStoragePath()` (líneas 70–72: `reports/${shareId}/season-vision-report-v1.pdf`), colección `transform_reports` keyed por `shareId` (línea 164); además guarda `report.pdfStoragePath` dentro del doc de sesión (líneas 215–230).
- `src/lib/emailScheduler.ts` — `email_sequences` keyed por `shareId` (línea 63), campos `email`, `name`, `status` (líneas 71–88).
- `src/app/api/leads/route.ts` — `leads` keyed por `email.toLowerCase()` (línea 30).
- `src/app/api/remarketing/route.ts` — `remarketing_leads` keyed por `email` normalizado a lowercase (línea 60).
- `src/app/api/sessions/route.ts` — el doc de sesión guarda `email` (línea 152) y `lastActivityAt` (línea 181; también se actualiza en checkout, feedback, classify, brief y hybrid-offer).
- `src/lib/jobManager.ts` — `jobs` con doc id `${sessionId}_${type}` y campo `sessionId` (líneas 68–69, 108–109).
- `src/lib/telemetry.ts` — `session_metrics` con doc id = `sessionId` (línea 265).
- `src/app/api/unsubscribe/route.test.ts` — patrón de tests vitest con `vi.mock("@/lib/firebaseAdmin")`, etc.
- `tests/delete.integration.test.mjs` + `scripts/run-local-gate.sh` — gate de integración existente del DELETE (emulador); debe seguir pasando.

## Pasos

### 1. Crear `src/lib/sessionPurge.ts` (helper compartido)

Exportar dos funciones con `getDb()` de `@/lib/firebaseAdmin` y `deletePrefix` de `@/lib/storage`:

```ts
/** Borra los datos derivados/ligados a una lista de sesiones (Firestore + Storage).
 *  NO borra el doc de sessions ni la foto/imágenes (eso lo hace el caller). */
export async function purgeSessionLinkedData(
  db: FirebaseFirestore.Firestore,
  sessionIds: string[]
): Promise<void>
```

Lógica (replicar el estilo defensivo de `cleanupRelatedData` en el cron — nunca lanzar, solo `console.error`):
- En chunks de 10 (límite de `in` en Firestore): borrar en batch los docs de `jobs` donde `sessionId in chunk` y de `session_metrics` donde `sessionId in chunk` (mismas queries que hoy usa `cleanupRelatedData`, líneas 214–237 del cron).
- Para cada `shareId`: `batch.delete()` directo de `transform_reports/{shareId}` y `email_sequences/{shareId}` (ambas colecciones usan el shareId como doc id; `delete()` sobre doc inexistente no falla). **Decisión de producto: borrar el doc de `email_sequences`, no marcarlo `unsubscribed`** — es una cancelación de datos, no un opt-out (recomendado por defecto).
- Para cada `shareId`: `deletePrefix(\`reports/${shareId}/\`)` en Storage (cubre el PDF del reporte, exista o no el doc). Usar `Promise.allSettled` y loguear fallos sin abortar.

```ts
/** Borra los registros de lead asociados a un email (solo para borrado iniciado por el usuario). */
export async function purgeLeadRecords(
  db: FirebaseFirestore.Firestore,
  email: string | undefined | null
): Promise<void>
```

- Si `email` es falsy, no-op.
- Normalizar `email.trim().toLowerCase()` y borrar `leads/{email}` y `remarketing_leads/{email}`.
- **Decisión de producto (recomendada por defecto): sí borrar ambos docs en el DELETE del usuario**, aunque el mismo email pudiera tener otra sesión viva — quien ejerce cancelación espera desaparecer del marketing; el lead se recrea si vuelve a entrar al wizard. NO añadir el email a `email_suppressions` (la supresión retiene el email; eso es para opt-out vía `/api/unsubscribe`, no para cancelación).

### 2. Completar el `DELETE` en `src/app/api/sessions/[shareId]/route.ts`

- Ampliar la interfaz `DeleteSessionDocument` (líneas 11–15) con `email?: string;`.
- Tras el bloque actual de borrado (líneas 142–152), y **antes** de `await ref.delete()`, añadir:

```ts
// Purga de artefactos derivados (reporte, PDF, secuencia de emails, jobs, métricas)
await purgeSessionLinkedData(db, [shareId]);
// Cancelación: eliminar registros de lead asociados al email de la sesión
await purgeLeadRecords(db, data?.email);
```

- Importar ambas funciones desde `@/lib/sessionPurge`.
- Mantener el contrato actual del endpoint (responde `{ ok: true }`; los fallos parciales de Storage se loguean, no rompen la respuesta — el helper ya es defensivo).
- No tocar la lógica de auth (token legacy + `requireSessionOwner`), que ya está bien.

### 3. TTL para sesiones completadas en `src/app/api/cron/cleanup/route.ts`

- Nueva config junto a `SESSION_TTL_DAYS` (línea 28): `const COMPLETED_SESSION_TTL_DAYS = Number(process.env.COMPLETED_SESSION_TTL_DAYS || "365");` — **decisión de producto: 365 días de inactividad por defecto** (alternativas razonables: 180 o 730; 365 equilibra "el usuario puede volver a su resultado" con "no retener fotos corporales indefinidamente").
- Nueva función `cleanupExpiredCompletedSessions(): Promise<CleanupResult>` modelada sobre `cleanupAbandonedSessions` (líneas 64–198), con estas diferencias:
  - Query: `db.collection("sessions").where("status", "in", ["ready", "completed"]).where("lastActivityAt", "<", cutoffTimestamp).orderBy("lastActivityAt").limit(BATCH_SIZE)` con cutoff = ahora − `COMPLETED_SESSION_TTL_DAYS` días. (`lastActivityAt` se setea en la creación — `src/app/api/sessions/route.ts:181` — y se refresca en checkout/feedback/classify/brief/hybrid-offer, así que mide inactividad real. Docs legacy sin el campo no matchean la query de rango: aceptable, no improvisar backfill aquí.)
  - Sin double-check de status invertido; borrar foto original, imágenes generadas y `deletePrefix(\`sessions/${id}/\`)` igual que la función existente.
  - Tras cada batch: `await purgeSessionLinkedData(db, sessionsToDelete)` (NO llamar `purgeLeadRecords` aquí — el lead tiene consentimiento de marketing propio y el cron no es una solicitud de cancelación).
- Refactor: reemplazar el cuerpo de `cleanupRelatedData` (líneas 203–243) para que delegue en `purgeSessionLinkedData` (así las sesiones abandonadas también purgan `transform_reports`, `email_sequences` y `reports/` — hoy solo purgan jobs y métricas).
- Índice compuesto requerido por la query nueva: añadir a `firestore.indexes.json`:

```json
{
  "collectionGroup": "sessions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "lastActivityAt", "order": "ASCENDING" }
  ]
}
```

  y en `src/firestoreIndexes.test.ts` añadir: `expect(hasIndex(config.indexes, "sessions", ["status", "lastActivityAt"])).toBe(true);`. (El deploy real del índice es `firebase deploy --only firestore:indexes` — documentarlo en el mensaje final, no ejecutarlo.)

### 4. Sweep de fotos huérfanas en `uploads/` (mismo cron)

Nueva función `cleanupOrphanUploads(): Promise<number>` en `src/app/api/cron/cleanup/route.ts`:

- Config: `const UPLOADS_ORPHAN_TTL_HOURS = Number(process.env.UPLOADS_ORPHAN_TTL_HOURS || "48");` (48 h de gracia: cubre wizard abandonado y fallos de creación, sin riesgo de borrar una foto cuya sesión está creándose).
- Importar `getBucket` desde `@/lib/firebaseAdmin`.
- `const [files] = await getBucket().getFiles({ prefix: "uploads/", maxResults: 500, autoPaginate: false });` — límite de 500 por corrida para respetar `maxDuration = 60`; corridas diarias convergen.
- Para cada `file` cuyo `new Date(String(file.metadata.timeCreated))` sea anterior al cutoff:
  - Verificar referencia: `db.collection("sessions").where("photo.originalStoragePath", "==", file.name).limit(1).get()` (igualdad sobre campo anidado: usa índices single-field automáticos, no requiere índice compuesto).
  - Si la query viene vacía → `file.delete({ ignoreNotFound: true })` y contar.
- Cap defensivo de borrados por corrida (p.ej. 200) y `Promise.allSettled` para los deletes; nunca lanzar (devolver el contador, loguear errores), siguiendo el patrón de `cleanupOldSpendRecords`.

Integración en el handler `POST` (líneas 344–375): añadir `cleanupExpiredCompletedSessions()` y `cleanupOrphanUploads()` al `Promise.all` y exponer en la respuesta JSON campos nuevos, p.ej. `completedSessions: {...}` (o `completedDeletedCount`) y `orphanUploadsDeleted`, más `completedTtlDays`.

### 5. Agendar el cron en Vercel

- `vercel.json`: añadir al objeto raíz (sin tocar lo demás):

```json
"crons": [
  { "path": "/api/cron/cleanup", "schedule": "0 9 * * *" }
]
```

  (Diario 09:00 UTC; compatible con el plan Hobby de Vercel, que admite crons de frecuencia diaria.)
- **Vercel Cron invoca con `GET`** y solo añade `Authorization: Bearer ${CRON_SECRET}` si existe la env var `CRON_SECRET` en el proyecto. Por tanto, en `src/app/api/cron/cleanup/route.ts`:
  - `validateCronKey` (líneas 48–58): aceptar tanto `CRON_SECRET` como `CRON_API_KEY` — comparar el valor recibido (`x-cron-key` o `Authorization: Bearer`) con `secureCompare` contra cada una de las claves configuradas (filtrar las undefined; si ninguna está configurada, seguir devolviendo `false`).
  - Cambiar el handler `GET` (líneas 378–389) para que, autenticado, **ejecute la misma limpieza que `POST`** (extraer el cuerpo del `POST` a una función `runCleanup()` y llamarla desde ambos). El modo "info" actual del GET puede eliminarse o conservarse detrás de `?info=1` — recomendado: eliminarlo, el POST manual ya sirve para probar.
- `.env.example`: en la sección `Security / Cron` (líneas 164+), añadir `CRON_SECRET=` con comentario "usado por Vercel Cron (Authorization: Bearer); puede ser el mismo valor que CRON_API_KEY", y junto a `SESSION_TTL_DAYS` (línea 153) añadir `COMPLETED_SESSION_TTL_DAYS=365` y `UPLOADS_ORPHAN_TTL_HOURS=48`.
- **Paso operativo (no se hace en el repo — documentarlo en tu resumen final):** crear `CRON_SECRET` en las env vars del proyecto Vercel (Production) antes del siguiente deploy; sin ella, el cron correrá pero recibirá 401.

### 6. Tests

- **`src/lib/sessionPurge.test.ts` (nuevo):** mockear `@/lib/firebaseAdmin` (`getDb`) y `@/lib/storage` (`deletePrefix`) con `vi.mock` siguiendo el patrón de `src/app/api/unsubscribe/route.test.ts`. Casos: (1) `purgeSessionLinkedData` borra `transform_reports/{id}` y `email_sequences/{id}` y llama `deletePrefix("reports/{id}/")`; (2) consulta `jobs` y `session_metrics` por `sessionId`; (3) no lanza si Storage falla; (4) `purgeLeadRecords` borra `leads/{email}` y `remarketing_leads/{email}` con email normalizado a lowercase y es no-op sin email.
- **`src/app/api/sessions/[shareId]/route.test.ts` (nuevo):** mockear `@/lib/firebaseAdmin`, `@/lib/storage`, `@/lib/jobManager` (`validateDeleteToken` → `true`) y `@/lib/authServer`; invocar `DELETE` con header `X-Delete-Token` y asertar que, además del doc de sesión y `sessions/{shareId}/`, se purgan reporte, PDF, secuencia y leads (puede mockearse `@/lib/sessionPurge` y asertar que se llamó con `[shareId]` y con el email de la sesión).
- **`src/firestoreIndexes.test.ts`:** añadir el assert del índice `sessions(status, lastActivityAt)` (paso 3).
- Los tests viven junto al código (`src/**/*.test.ts`), que es lo que incluye `vitest.config.ts`.

## Criterio de aceptación (verificable)

Ejecutar desde la raíz del repo:

- [ ] `pnpm test` — verde, incluyendo los tests nuevos (`sessionPurge.test.ts`, `route.test.ts` del DELETE, `firestoreIndexes.test.ts` actualizado) y **todos los existentes**.
- [ ] `pnpm exec tsc --noEmit` — sin errores.
- [ ] `pnpm lint` — sin errores nuevos.
- [ ] `grep -n "purgeSessionLinkedData\|purgeLeadRecords" "src/app/api/sessions/[shareId]/route.ts" src/app/api/cron/cleanup/route.ts` — el DELETE usa ambas; el cron usa `purgeSessionLinkedData` (y NO `purgeLeadRecords`).
- [ ] `grep -n "transform_reports\|email_sequences\|reports/" src/lib/sessionPurge.ts` — devuelve las tres referencias.
- [ ] `grep -n "crons" vercel.json` — existe la sección con `/api/cron/cleanup`.
- [ ] `grep -n "lastActivityAt" firestore.indexes.json` — el índice nuevo está declarado.
- [ ] `grep -n "COMPLETED_SESSION_TTL_DAYS\|UPLOADS_ORPHAN_TTL_HOURS\|CRON_SECRET" .env.example src/app/api/cron/cleanup/route.ts` — env vars documentadas y usadas.
- [ ] Comportamiento del cron (con dev server corriendo, `pnpm dev`, y `CRON_API_KEY` definido en `.env.local`):
  - `curl -s -X POST http://localhost:3000/api/cron/cleanup -H "x-cron-key: $CRON_API_KEY"` → JSON 200 que incluye los contadores nuevos (sesiones completadas expiradas y uploads huérfanos) además de los existentes.
  - `curl -s http://localhost:3000/api/cron/cleanup -H "Authorization: Bearer $CRON_API_KEY"` → **ejecuta la limpieza** (mismo JSON que el POST), no solo info — así funcionará la invocación GET de Vercel Cron.
  - `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/cron/cleanup` → `401`.
- [ ] (Opcional, requiere java + firebase CLI) `pnpm test:gate:local` — el gate de emulador existente, incluido `tests/delete.integration.test.mjs`, sigue verde.

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente.
- NO ejecutes `firebase deploy` ni cambies configuración del proyecto Vercel; los pasos operativos (env var `CRON_SECRET` en Vercel, deploy del índice de Firestore) solo se documentan en tu resumen final.
- Si encuentras algo inesperado que bloquee el fix (p.ej. otro consumidor de `email_sequences` que asuma que el doc existe tras un DELETE), repórtalo y detente en vez de improvisar.
