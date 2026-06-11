# Fix 21 — 10.8MB de animación decorativa en la espera móvil + cero code splitting

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #63

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision es un producto viral mobile-first. El orbe animado de GENESIS (`src/components/RiveOrb.tsx`) descarga `public/orb.riv` (**8,943,320 bytes**) + `public/rive.wasm` (**1,851,093 bytes**) — verificado con `ls -la` — cada vez que se monta. Se monta en la pantalla de carga `/loading/[shareId]` que ve el 100% de los usuarios del wizard (`LoadingExperience.tsx:8,281`), en BiometricLoader y en HybridVoiceAgent. `RuntimeLoader.setWasmUrl("/rive.wasm")` y `useRive({src: "/orb.riv"})` están en `RiveOrb.tsx:9,41-49`. Existe un **fallback estático que pesa cero** (`RiveOrb.tsx:110`).

Además, NO existe ni un solo `dynamic()` de next/dynamic ni `React.lazy()` en todo `src/` (grep = 0): framer-motion se importa estático en ~30 archivos cliente y todo el árbol de componentes de resultados (DramaticReveal, ShareToUnlockModal, VideoFounderModal, etc.) se descarga junto, se use o no.

**Negocio:** en 4G real (~5 Mbps), solo el orbe son 15-20 segundos y ~11 MB del plan de datos del usuario — en la pantalla donde se le pide esperar, compitiendo con el polling. Cada segundo de carga es abandono directo.

## Archivos involucrados
- `src/components/RiveOrb.tsx:9, 41-49, 110` — carga del asset + fallback.
- `public/orb.riv` — asset a re-exportar/optimizar (8.9MB es anómalo para un orbe; sugiere texturas embebidas sin comprimir).
- `src/app/loading/[shareId]/LoadingExperience.tsx:8,281`, `src/components/BiometricLoader.tsx`, `src/components/results/HybridVoiceAgent.tsx` — los 3 montadores.
- `src/components/TransformationViewer2.tsx` — imports estáticos de modales/reveal pesados a dividir.
- `src/app/s/[shareId]/page.tsx` — page que monta el viewer (server; no cambia, solo referencia).

## Pasos
1. **Asset:** re-exportar `orb.riv` optimizado desde Rive (objetivo <500KB; revisar texturas embebidas). Si no hay acceso al archivo fuente de Rive, documentarlo y aplicar solo los pasos 2-4 (el gating reduce el daño igual).
2. **Gating por conexión:** en `RiveOrb.tsx`, cargar Rive solo si `navigator.connection?.effectiveType === "4g" && !navigator.connection?.saveData` (con default conservador cuando la API no existe: cargar solo en viewport ≥768px, móvil usa el fallback estático de `:110`). Montar vía `next/dynamic(() => import(...), { ssr: false, loading: fallback })`.
3. **Code splitting de resultados:** en `TransformationViewer2.tsx`, convertir a `next/dynamic` los componentes que no se ven en el primer paint: `ShareToUnlockModal`, `VideoFounderModal`, `LetterFromFuture`, `DramaticReveal` (este último con `loading` que muestre la imagen m0 estática).
4. **No tocar** los imports de framer-motion archivo por archivo (riesgo/beneficio bajo aquí); el grueso del problema es el .riv.
5. Verificación de tamaño: `pnpm build` y revisar el output de tamaños de First Load JS de `/loading/[shareId]` y `/s/[shareId]` antes/después (anotar números en el resumen).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde; `pnpm build` compila.
- `grep -rn "next/dynamic" src/components/ src/app/loading/` ≥ 4 (hoy 0 en todo src/).
- `ls -la public/orb.riv` < 1MB (si el paso 1 fue posible; si no, documentado).
- En móvil simulado (o viewport <768px), la pantalla de carga renderiza el fallback estático sin requests a `/orb.riv` ni `/rive.wasm` (verificable con las DevTools o un assert del gating).
- First Load JS de `/s/[shareId]` se reduce respecto a la línea base registrada.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO elimines el orbe (es parte de la marca) — solo hazlo condicional y barato.
- Si algo inesperado bloquea el fix, repórtalo y detente en vez de improvisar.
