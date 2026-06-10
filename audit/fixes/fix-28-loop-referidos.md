# Fix 28 — Loop de referidos: conectarlo end-to-end o eliminarlo (hoy K-factor = 0)

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1sem (conectar) / 1-3d (eliminar) | **Hallazgos cubiertos:** #1000, #1002

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision se declara "viral lead magnet" con crecimiento por referidos. La cadena está cortada en CUATRO puntos independientes (verificado; cualquiera la mata solo):
1. **Atribución:** `ReferralCard` genera `${baseUrl}/?ref=${referralCode}` (`src/components/ReferralCard.tsx:25`), pero NINGÚN código fuera de `src/app/api` lee el parámetro `ref` — grep exhaustivo de `.get("ref")`/`searchParams`: 0 lectores (el único `searchParams.get` del wizard es `"stage"`, `src/app/wizard/page.tsx:239`). Las visitas referidas jamás se registran.
2. **Render:** `ReferralCard` solo se renderiza con `{!isLeadMagnet && ...}` (`src/components/TransformationViewer2.tsx:526,547-553`), pero la página de resultados SIEMPRE pasa `surfaceMode="lead-magnet"` (`src/app/s/[shareId]/page.tsx:271-280`) → la tarjeta nunca aparece.
3. **Recompensa (#1002):** el único camino que otorga la recompensa — `claimReferralReward` (`src/lib/viral/referralTracking.ts:160-169`, marca `unlockState.unlocked=true`) — exige `CRON_API_KEY` (`src/app/api/referral/route.ts:123-126`) y NADA en el repo invoca esa acción.
4. El backend `/api/referral` (visit/complete/claim/stats) y `referralTracking.ts` están completos y testeados — es la conexión con el producto lo que no existe.

**Negocio:** el K-factor es exactamente 0 por construcción; todo el CAC recae en adquisición directa. Las proyecciones de crecimiento viral no tienen soporte en el código.

## Decisión de producto (elegir UNA; por defecto recomendada: A)
**A. Conectar end-to-end** · **B. Eliminar** (borrar ReferralCard, /api/referral, referralTracking, shareMessages relacionados — menos superficie y mantenimiento; ver fix-29 para el patrón de eliminación).

## Archivos involucrados (opción A)
- `src/app/page.tsx` (+ `/j`, `/m`) — leer `?ref=` server-side y propagarlo (cookie httpOnly `ngx_ref` de 7 días o param al wizard).
- `src/app/wizard/page.tsx:~499-541` — incluir el referrerId en el POST de creación.
- `src/app/api/sessions/route.ts:~150-190` — al crear sesión con referrer: llamar `recordReferralVisit`/registrar atribución (funciones de `src/lib/viral/referralTracking.ts`).
- `src/app/api/generate-images/route.ts:~506` — ya llama referral completion al terminar (verificar que con la atribución nueva, `completeReferral` corre de verdad).
- `src/app/api/referral/route.ts:123-134` — sustituir el gate CRON_API_KEY de `claim` por elegibilidad server-side, o disparar el claim automático desde `completeReferral` al cruzar el umbral (≥3 completados — revisar el umbral en referralTracking).
- `src/components/TransformationViewer2.tsx:526,547-553` — mostrar ReferralCard también en lead-magnet (decisión de UI: sección post-resultados).
- `src/app/s/[shareId]/page.tsx:271-280` — pasar `referralCode`/stats al viewer (el GET público puede exponer `referralStats` agregadas — sin PII).

## Pasos (opción A)
1. Landing: en el server component, si `searchParams.ref` existe, setear cookie `ngx_ref` (httpOnly, 7d) vía route handler o propagar `?ref` al link del wizard (más simple, sin cookie).
2. Wizard → sessions: añadir `referrerId` opcional al `CreateSessionSchema` (`src/lib/validators.ts`) con validación de formato; en el handler, si viene, `recordReferralVisit(newShareId, referrerId)` (transacción — ver fix de race conditions #35).
3. Al completar imágenes, `completeReferral` ya existe en generate-images — verificar wiring con la atribución y añadir telemetría `referral_completed`.
4. Claim automático: en `completeReferral`, si el referrer cruza el umbral, ejecutar la lógica de `claimReferralReward` server-side (sin endpoint público nuevo).
5. UI: renderizar ReferralCard en lead-magnet bajo los resultados; mostrar progreso (X/3) desde stats del GET.
6. Tests: route test de sessions con referrerId (atribución llamada); unit del claim automático; ampliar `src/app/api/referral/route.test.ts`.

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- Flujo con emulador: visita con `?ref=R` → sesión nueva atribuida → al completar imágenes, stats de R incrementan → al 3º completado, `unlockState.unlocked=true` de R sin intervención manual.
- `grep -rn 'searchParams.*ref\|"ngx_ref"' src/app` ≥ 1 (hoy 0).
- ReferralCard visible en el render de resultados (assert tipo `seasonVisionReportPage.test.ts`).

## Restricciones
- NO toques nada fuera de los archivos listados (y tests junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias. Si eliges B (eliminar), bórralo TODO de una vez (componente+endpoint+lib+tests) y nada más.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
