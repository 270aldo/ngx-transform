# Fix 03 — Libro de órdenes: colección `payments` append-only + exclusión de sesiones pagadas en el cron de cleanup
**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-2 días | **Hallazgos cubiertos:** #55

## Contexto (para una sesión nueva, sin conocimiento previo)

NGX Vision es un lead magnet Next.js (App Router, código en `src/` en la raíz del repo — NO existe carpeta `app/`) que vende el programa "NGX HYBRID" vía MercadoPago Checkout Pro, con Firestore (Firebase Admin SDK, reglas deny-all) como única base de datos.

**El problema:** no existe ninguna colección `payments`/`orders` en Firestore. El único registro contable de un pago (paymentId, monto, moneda, fecha de aprobación, email del pagador) vive como objeto anidado `checkout` dentro de `sessions/{shareId}`, escrito por el webhook de MercadoPago (`src/app/api/checkout/webhook/route.ts`, el `sessionRef.set(...)` de las líneas 248-272). Eso tiene tres consecuencias graves:

1. **Se sobreescribe:** cada nuevo intento de checkout pisa ese objeto con `status: "redirected"` (`src/app/api/checkout/create-preference/route.ts`, líneas 88-103). Para el SKU `monthly` — cuya descripción en `src/lib/mercadoPago.ts:61-62` dice literalmente "Renovable" — la renovación del mes 2 destruye la evidencia del pago del mes 1.
2. **Es borrable:** el cron de limpieza (`src/app/api/cron/cleanup/route.ts`) borra sesiones con más de `SESSION_TTL_DAYS` (30) días cuyo `status` de pipeline esté en `["pending", "processing", "analyzed", "generating", "failed", "partial"]` (línea 83), y su doble verificación (línea 107) solo mira `data.status === "ready" || data.status === "completed"` — NUNCA consulta `data.checkout` ni `data.hybridStatus`. Una sesión **pagada** cuyo pipeline de imágenes quedó en `failed` se borra a los 30 días junto con su registro de pago.
3. **No se puede conciliar:** no hay índice ni colección por `paymentId` (`firestore.indexes.json` no tiene ninguna entrada relacionada con pagos), así que responder "el pago X que reporta MP, ¿a qué cliente corresponde?" requiere un scan manual de toda la colección `sessions`.

**Impacto de negocio:** sin un registro inmutable de transacciones, conciliar el dinero que reporta MercadoPago contra lo que el negocio cree haber vendido es imposible. Ante una auditoría fiscal (SAT), una disputa/contracargo con MP o un simple cierre de mes, no hay fuente de verdad: los registros se pisan entre sí o se borran solos a los 30 días.

**El fix:** crear una colección `payments` (un documento por `paymentId`, escrito de forma append-only desde el webhook — nunca se borra ni se sobreescriben sus datos contables, solo se le anexan transiciones de estado), añadir índice para consultas por `shareId`, y excluir del cron de cleanup las sesiones que tengan un pago registrado.

## Archivos involucrados

Rutas relativas a la raíz del repo (`/Users/aldoolivas/genesis-scann`). Líneas verificadas contra el código actual:

| Archivo | Líneas | Papel |
|---|---|---|
| `src/lib/paymentLedger.ts` | (NUEVO) | Lib del libro de órdenes: `upsertPaymentRecord()`, `mapMpStatus()`, `sessionHasPayment()` |
| `src/lib/paymentLedger.test.ts` | (NUEVO) | Tests unitarios de la lib nueva |
| `src/app/api/checkout/webhook/route.ts` | 159-272 (parse de `external_reference`, idempotencia, mapeo de status en 243-246, `sessionRef.set` en 248-272) | Único escritor del estado de pago; aquí se añade la escritura al ledger |
| `src/app/api/checkout/webhook/route.test.ts` | 72-88 (mock `setupDb`), suite completa | Tests existentes del webhook — hay que extender el mock de Firestore y añadir asserts del ledger |
| `src/app/api/cron/cleanup/route.ts` | 80-85 (query base), 102-137 (loop por doc; doble verificación en 106-110), 203-243 (`cleanupRelatedData`) | Cron que hoy borra sesiones pagadas con pipeline fallido |
| `firestore.indexes.json` | (raíz del repo) | Añadir índice compuesto para `payments` |
| `src/firestoreIndexes.test.ts` | 22-29 | Test que valida los índices declarados — añadir assert del índice nuevo |
| `firestore.rules` | (raíz del repo) | Solo VERIFICAR: el `match /{document=**} { allow read, write: if false; }` ya cubre `payments` (Admin SDK bypasea rules). No requiere cambios |
| `src/app/api/checkout/create-preference/route.ts` | 88-103 | Solo contexto: aquí se pisa `checkout` con `status: "redirected"`. NO se modifica en este fix (el registro durable pasa a vivir en `payments`) |

## Pasos

### 1. Crear `src/lib/paymentLedger.ts`

Sigue el estilo de las libs existentes en `src/lib/` (camelCase, JSDoc en español, server-side only). Contenido:

**a) `mapMpStatus(status: string)`** — función pura que replica exactamente el mapeo que hoy está inline en el webhook (líneas 243-246 de `src/app/api/checkout/webhook/route.ts`):

```typescript
export type LedgerStatus = "completed" | "pending" | "failed";

export function mapMpStatus(status: string): LedgerStatus {
  if (status === "approved") return "completed";
  if (status === "rejected" || status === "cancelled") return "failed";
  return "pending"; // in_process | pending | refunded | etc.
}
```

**b) `upsertPaymentRecord(db, payment, ref)`** — escribe `payments/{paymentId}` de forma append-only. Firma:

```typescript
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { MpPaymentDetails } from "@/lib/mercadoPago";

export async function upsertPaymentRecord(
  db: Firestore,
  payment: MpPaymentDetails,
  ref: { shareId: string; internalId: string } | null
): Promise<void>
```

Lógica exacta:
- `const docRef = db.collection("payments").doc(String(payment.id));` — **el doc ID es el paymentId** de MP, lo que da idempotencia natural (re-notificaciones del mismo pago caen en el mismo doc) y lookup O(1) para conciliación.
- `const snap = await docRef.get();` para saber si es la primera escritura.
- `docRef.set({...}, { merge: true })` con estos campos:
  - `paymentId: String(payment.id)`
  - `provider: "mercadopago"`
  - `shareId: ref?.shareId ?? null` y `internalId: ref?.internalId ?? null` (nullable a propósito: un pago con `external_reference` corrupto DEBE quedar registrado igualmente — es dinero real)
  - `sku: (payment.metadata?.sku as string) || "unknown"`
  - `externalReference: payment.external_reference ?? null`
  - `status: mapMpStatus(payment.status)`
  - `mpStatus: payment.status`, `mpStatusDetail: payment.status_detail ?? null`
  - `amount: payment.transaction_amount ?? null`, `currency: payment.currency_id ?? null`
  - `payerEmail: payment.payer?.email ?? null`
  - `approvedAt: payment.date_approved ? new Date(payment.date_approved) : null`
  - `updatedAt: FieldValue.serverTimestamp()`
  - `createdAt: FieldValue.serverTimestamp()` **solo si `!snap.exists`** (spread condicional `...(!snap.exists && { createdAt: ... })`) — así la fecha del primer registro nunca se pisa.
  - `statusHistory: FieldValue.arrayUnion({ mpStatus: payment.status, mpStatusDetail: payment.status_detail ?? null, at: Timestamp.now() })` — historial append-only de transiciones (pending → approved, approved → refunded...). **OJO:** dentro de `arrayUnion` NO se puede usar `FieldValue.serverTimestamp()` (Firestore lo rechaza); usa `Timestamp.now()`.
- La función **deja propagar las excepciones** (no las traga): si el ledger no se puede escribir, el webhook debe devolver 500 para que MercadoPago reintente la notificación. El registro contable es lo único que no puede perderse en silencio.

**c) `sessionHasPayment(data)`** — predicado puro que usará el cron:

```typescript
export function sessionHasPayment(data: FirebaseFirestore.DocumentData | undefined): boolean {
  if (!data) return false;
  const checkout = data.checkout as { paymentId?: string } | undefined;
  return Boolean(checkout?.paymentId) || data.hybridStatus === "converted";
}
```

(Va en esta lib y no exportado desde `route.ts` porque los route files del App Router solo admiten exports reservados — un export extra rompe la validación de tipos del build de Next.)

### 2. Integrar el ledger en el webhook (`src/app/api/checkout/webhook/route.ts`)

- Importa `upsertPaymentRecord` y `mapMpStatus` desde `@/lib/paymentLedger`.
- **Punto de inserción:** inmediatamente después del bloque `parseExternalReference` (líneas 159-166) y **ANTES** de `const db = getDb(); const sessionRef = ...` (líneas 168-169)... con un matiz: hoy, si `ref` es null se hace `return` temprano en la línea 165. Reordena así:

```typescript
const ref = parseExternalReference(payment.external_reference);

// Libro de órdenes — registro append-only del pago verificado contra MP.
// Se escribe ANTES de cualquier early-return: un pago sin sesión o ya
// procesado también es dinero real que debe quedar en el ledger.
const db = getDb();
await upsertPaymentRecord(db, payment, ref);

if (!ref?.shareId) {
  console.error("[MP_WEBHOOK] external_reference inválido:", payment.external_reference);
  return NextResponse.json({ ok: true, skipped: "no-share-id" });
}

const sessionRef = db.collection("sessions").doc(ref.shareId);
```

  Con esto el ledger queda escrito también en los caminos `skipped: "no-share-id"`, `skipped: "unknown-session"` y `alreadyProcessed: true` (re-notificaciones backfillean el doc), y en los rechazos 409 por mismatch de SKU/monto/moneda (el ledger guarda los datos **crudos verificados contra la API de MP**, que es justamente la verdad que se quiere conservar; la sesión sigue sin tocarse en esos casos, igual que hoy).
- Sustituye el mapeo inline de las líneas 243-246 (`let mappedStatus = ...; if (status === "approved") ...`) por `const mappedStatus = mapMpStatus(status);` para no duplicar la lógica.
- **No cambies nada más**: la validación de firma, los checks de mismatch, el `sessionRef.set` con `hybridStatus: "converted"` y los `trackEvent` quedan idénticos.

### 3. Excluir sesiones pagadas del cron (`src/app/api/cron/cleanup/route.ts`)

- Importa `sessionHasPayment` desde `@/lib/paymentLedger`.
- En el loop `for (const doc of snapshot.docs)` (líneas 102-137), justo después del double-check existente de `data.status` (líneas 106-110), añade:

```typescript
// NUNCA borrar sesiones con pago registrado, aunque su pipeline haya fallado:
// el objeto checkout/hybridStatus es evidencia contable (ver payments/).
if (sessionHasPayment(data)) {
  skippedCount++;
  console.log(`[Cleanup] Skipping paid session: ${sessionId}`);
  continue;
}
```

- **Decisión de producto (default recomendado, marcado):** se excluye solo si hay `checkout.paymentId` o `hybridStatus === "converted"`. Una sesión con `checkout.status === "redirected"` pero SIN `paymentId` (el usuario fue a MP y nunca pagó) **sí** se sigue borrando a los 30 días — es un carrito abandonado, no un pago. Si el negocio prefiere ser ultraconservador, el predicado podría ampliarse a "existe cualquier objeto `checkout`", pero el default es el primero.
- Nota: el filtro principal de la query (línea 83) se queda como está — el `where("status", "in", ...)` no puede expresar "y no tiene checkout.paymentId" sin índices/desnormalización extra; el skip en memoria dentro del loop es suficiente porque el cron pagina de a 100.
- **Verifica y NO toques** `cleanupRelatedData` (líneas 203-243): borra `jobs` y `session_metrics` asociados a la sesión. La colección `payments` NO debe añadirse ahí jamás — el ledger sobrevive al borrado de su sesión por diseño.

### 4. Índice para conciliación por `shareId` (`firestore.indexes.json`)

El lookup por `paymentId` es un `doc get` directo (no necesita índice). Para la query de conciliación "todos los pagos de este shareId, del más reciente al más viejo", añade al array `indexes`:

```json
{
  "collectionGroup": "payments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "shareId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

Y en `src/firestoreIndexes.test.ts`, dentro del `it("covers launch-critical composite queries")` (líneas 22-29), añade:

```typescript
expect(hasIndex(config.indexes, "payments", ["shareId", "createdAt"])).toBe(true);
```

(El deploy del índice se hace luego con `firebase deploy --only firestore:indexes`; NO lo ejecutes en este fix — solo deja el JSON listo y anótalo al reportar.)

### 5. Tests

**a) `src/lib/paymentLedger.test.ts` (nuevo)** — sigue el estilo vitest del repo (`describe/it/expect/vi`, sin globals):
- `mapMpStatus`: `approved → "completed"`, `rejected`/`cancelled → "failed"`, `pending`/`in_process`/`refunded` y desconocidos → `"pending"`.
- `sessionHasPayment`: `true` con `{ checkout: { paymentId: "pay_1" } }`; `true` con `{ hybridStatus: "converted" }`; `false` con `{ checkout: { status: "redirected" } }` (sin paymentId); `false` con `undefined` y con `{}`.
- `upsertPaymentRecord` con un mock de Firestore (mismo patrón que `setupDb` en `src/app/api/checkout/webhook/route.test.ts`): verifica (1) doc ID = paymentId, (2) `set` con `{ merge: true }`, (3) `createdAt` presente cuando `snap.exists === false` y AUSENTE cuando `exists === true`, (4) `shareId: null` cuando `ref` es null, (5) que la excepción de `set` se propaga.

**b) Extender `src/app/api/checkout/webhook/route.test.ts`:**
- El mock `setupDb` (líneas 72-88) hoy devuelve el mismo `doc` para cualquier colección. Cámbialo para que `collection("sessions")` devuelva el `sessionRef` actual y `collection("payments")` devuelva un `paymentRef` propio (`get` → `{ exists: false }`, `set` → resuelto), y retorna ambos refs.
- Test nuevo: pago aprobado válido → `paymentRef.set` llamado con `expect.objectContaining({ paymentId: "pay_1", shareId: "share_1", status: "completed", mpStatus: "approved", amount: 199, payerEmail: "owner@test.com" })` y `{ merge: true }`.
- Test nuevo: camino `alreadyProcessed` (sesión con `checkout.paymentId: "pay_1", status: "completed"`) → responde 200 con `alreadyProcessed: true` **y aun así** `paymentRef.set` fue llamado (el ledger se backfillea), mientras `sessionRef.set` NO.
- Ajusta los tests existentes de mismatch (SKU/monto/moneda): siguen esperando 409 y `sessionRef.set` no llamado, pero ahora `paymentRef.set` SÍ se llama (el ledger registra el pago crudo). El test de firma inválida sigue esperando que NADA se escriba.

## Criterio de aceptación (verificable)

Desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

1. `pnpm exec tsc --noEmit` — sin errores (el baseline actual está limpio).
2. `pnpm lint` — sin errores nuevos.
3. `pnpm test` — toda la suite vitest en verde, incluyendo:
   - los 6 tests preexistentes de `src/app/api/checkout/webhook/route.test.ts` (adaptados según paso 5b),
   - los nuevos de `src/lib/paymentLedger.test.ts`,
   - `src/firestoreIndexes.test.ts` con el assert nuevo de `payments`.
4. `grep -n 'collection("payments")' src/lib/paymentLedger.ts` — al menos 1 hit (la escritura del ledger vive en la lib).
5. `grep -n 'upsertPaymentRecord' src/app/api/checkout/webhook/route.ts` — al menos 2 hits (import + llamada), y la llamada aparece ANTES de `db.collection("sessions")` en el flujo del POST.
6. `grep -n 'sessionHasPayment' src/app/api/cron/cleanup/route.ts` — al menos 2 hits (import + uso en el loop de borrado).
7. `grep -n 'payments' src/app/api/cron/cleanup/route.ts` — NINGÚN hit de borrado de la colección `payments` (solo el skip/import; `cleanupRelatedData` no la toca).
8. `grep -n '"collectionGroup": "payments"' firestore.indexes.json` — 1 hit.
9. `git diff --stat` — solo aparecen los archivos listados en "Archivos involucrados" (más los 2 tests nuevos).
10. Comportamiento observable (razonado o vía test): una sesión con `createdAt` > 30 días, `status: "failed"` y `checkout.paymentId` presente queda en `skippedCount` del cron, no en `deletedCount`.

## Restricciones

- NO toques nada fuera de los archivos listados (y los tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo que el fix lo pida explícitamente (no lo pide).
- NO ejecutes `firebase deploy` ni escribas en Firestore real; el índice solo se declara en el JSON.
- Si encuentras algo inesperado que bloquee el fix (p. ej. el shape de `checkout` cambió, o el webhook ya escribe en otra colección de pagos), repórtalo y detente en vez de improvisar.
