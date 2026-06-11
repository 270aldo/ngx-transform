# Fix 29 — Share-to-unlock y social pack: conectar o eliminar (hoy doble fachada)

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1sem (conectar) / 1-3d (eliminar) | **Hallazgos cubiertos:** #1001, #1003, #1004

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
El segundo pilar del loop viral de NGX Vision es "comparte para desbloquear" + un "social pack" (imágenes story/post/square). Estado real verificado:

1. **Share-to-unlock es teatro de UI en dos capas:** `ShareToUnlockModal` NUNCA llama a `/api/unlock` ni a `/api/social-pack` — sus únicas salidas de red son telemetría (`src/components/viral/ShareToUnlockModal.tsx:88-96`) y clipboard/window.open (`:107-126`). El "desbloqueo" es `onUnlock(content.id)` → `handleContentUnlock` que solo hace setState + **localStorage** (`src/components/TransformationViewer2.tsx:203-210`): se obtiene gratis sin compartir. Y además el modal es **inalcanzable** (el trigger está detrás del mismo `!isLeadMagnet` que nunca es true — invariante incluso codificado en un test de layout).
2. **Social pack muerto en 3 capas (#1003):** `getSocialPackDownloadUrls` (`src/lib/viral/socialPackGenerator.ts:57-73`) no se importa en NINGÚN sitio; ningún componente referencia `/api/social-pack`; y su gate `unlockState.unlocked` (`src/app/api/social-pack/[shareId]/route.ts:74`) solo se activaría por caminos también muertos.
3. **(#1004) Siete endpoints públicos sin ningún consumidor** en el producto: `/api/unlock`, `/api/referral`, `/api/social-pack`, `/api/leads` (la captura real va por `/api/sessions` — `src/app/wizard/page.tsx:541`), `/api/plan`, `/api/generate-plan`, `/api/email` — superficie pública y mantenimiento muertos contra una base deny-all diseñada para minimizar superficie.

**Negocio:** el motor que convertiría cada resultado en distribución orgánica no opera; mientras tanto se paga mantenimiento y superficie de ataque de código que nada ejercita.

## Decisión de producto (elegir UNA; por defecto recomendada: B para unlock/social-pack 一 el valor viral real está en fix-28/referidos — y limpieza de endpoints muertos)
**A. Conectar:** trigger real del modal en lead-magnet → `POST /api/unlock {action: share_intent}` al compartir → `request_unlock` → derivar el desbloqueo del `unlockState` del SERVIDOR (no localStorage) → botones de descarga del social pack usando `getSocialPackDownloadUrls`.
**B. Eliminar:** borrar `ShareToUnlockModal`, el estado `unlockedContent`/localStorage del viewer, `/api/unlock`, `src/lib/viral/shareUnlock.ts`, `socialPackGenerator.ts`, `/api/social-pack`, y los flags `FF_SHARE_TO_UNLOCK`/`FF_SHARE_UNLOCK` de `src/lib/validators.ts:208-239` y `.env.example`; conservar `SocialShareButton` simple (compartir sin gate).

## Archivos involucrados
- `src/components/viral/ShareToUnlockModal.tsx` (completo), `src/components/TransformationViewer2.tsx:203-210, 526+` (estado unlock + triggers).
- `src/app/api/unlock/route.ts`, `src/lib/viral/shareUnlock.ts`, `src/lib/viral/socialPackGenerator.ts`, `src/app/api/social-pack/[shareId]/route.ts`.
- `src/lib/validators.ts:208-239` (flags), `.env.example` (flags), tests asociados (`TransformationViewer2.layout.test.ts` codifica que el modal no se auto-abre).
- Si opción B: revisar también `/api/leads` y `/api/email` (decidir conservar como integraciones documentadas para n8n o borrar — documenta la decisión).

## Pasos (opción B, la recomendada)
1. Borrar componente + imports + estado `unlockedContent`/localStorage del viewer (verificar que ningún render queda colgando de `unlocked`).
2. Borrar `/api/unlock` + `shareUnlock.ts` + sus referencias en validators (`UnlockRequestSchema`) y flags en `.env.example`.
3. Borrar `socialPackGenerator.ts` + `/api/social-pack` + `recordDownload` asociado; si se desea conservar la descarga simple de la imagen m12, moverla a un endpoint mínimo SIN gate (decisión: por defecto, borrar).
4. Ajustar/eliminar los tests que referencian lo borrado (`TransformationViewer2.layout.test.ts` y cualquier grep de "unlock").
5. `grep -rn "unlock\|socialPack\|social-pack" src/` debe quedar solo con usos legítimos (p.ej. `unlockState` puede desaparecer del tipo de sesión si nada lo lee — verificar `sessions/[shareId]/route.ts`).
6. Documentar en el resumen qué endpoints públicos quedan y por qué (leads/email para n8n, o borrados).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test && pnpm build` en verde.
- Opción B: `grep -rln "ShareToUnlockModal\|shareUnlock\|socialPackGenerator" src/` = 0; las rutas `/api/unlock` y `/api/social-pack` no existen.
- Opción A: con emulador, compartir → `unlockState.unlocked=true` en el doc (no localStorage) → GET social-pack devuelve imagen; borrar localStorage NO desbloquea.
- La página de resultados renderiza igual que antes para el caso normal (sin regresión visual del flujo principal).

## Restricciones
- NO toques nada fuera de los archivos listados (y tests junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias. NO mezcles esta decisión con la de referidos (fix-28) en el mismo cambio.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
