# Fix 12 — Upgrade de Next.js (13 CVEs publicados) + Dependabot

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 2-4 horas | **Hallazgos cubiertos:** #92, #99

## Contexto (para una sesión nueva, sin conocimiento previo)

Este repo es **NGX Vision**, un lead magnet viral (Next.js App Router + Firebase + MercadoPago, desplegado en Vercel) donde el usuario sube una foto y recibe una proyección de transformación física de 12 meses. El código vive en `src/` en la raíz del repo (NO existe carpeta `app/` raíz; ignora cualquier documentación que diga lo contrario).

El proyecto tiene `next` y `eslint-config-next` **pineados en `16.2.4`** (`package.json` líneas 43 y 61, pin exacto sin caret). `pnpm audit --prod` reporta **13 avisos de seguridad contra `next@16.2.4`** — 7 de severidad *high*, 4 *moderate*, 2 *low* — todos parcheados en `16.2.5` o `16.2.6`. La última versión publicada de la rama es **`16.2.9`** (dist-tag `latest`), es decir, el proyecto está 5 parches atrás. Los avisos high incluyen: DoS con Server Components (GHSA-8h8q-6873-q5fj, afecta a cualquier app App Router `>=16.0.0 <16.2.5`), **bypass de middleware/proxy** vía rutas segment-prefetch (CVE-2026-44575 y su fix incompleto CVE-2026-45109 / GHSA-26hh-7cqf-hhc6, que solo se cierra en `16.2.6`), bypass vía inyección de parámetros de ruta dinámica (CVE-2026-44574), SSRF vía WebSocket upgrades (CVE-2026-44578) y DoS por agotamiento de conexiones (CVE-2026-44579). También hay XSS moderados y un DoS en la API de optimización de imágenes (CVE-2026-44577), que esta app **sí usa** (`next.config.ts:14-22` define `images.remotePatterns`).

Por qué importa: el middleware de esta app (`src/proxy.ts` — en Next 16 el middleware se llama "proxy") aplica CSP con nonce, cabeceras de seguridad y validación de origen a prácticamente todas las rutas (matcher en líneas 162-171). Los CVEs de bypass permiten servir respuestas **saltándose exactamente esa capa**, y los DoS permiten tumbar el sitio con técnicas ya públicas, justo cuando el producto busca tráfico viral. El arreglo del hallazgo #92 es cambiar un número de versión, regenerar lockfile y validar.

La causa raíz (hallazgo #99) es que **no existe ningún mecanismo automatizado de actualización de dependencias**: `.github/` solo contiene `workflows/ci.yml` (no hay `dependabot.yml`) y no existe `renovate.json` ni `.renovaterc` en la raíz. Por eso el framework acumuló 5 parches sin que nadie lo notara. Este fix también añade Dependabot para que no vuelva a pasar; el CI existente (lint + tsc + build + vitest en `ci.yml`) sirve de red de seguridad para los PRs automáticos.

## Archivos involucrados

| Archivo | Línea(s) | Papel |
|---|---|---|
| `package.json` | 43 (`"next": "16.2.4"`), 61 (`"eslint-config-next": "16.2.4"`) | **MODIFICAR** — subir ambos a `16.2.9` (pin exacto, igual que ahora) |
| `pnpm-lock.yaml` | — | **REGENERAR** — vía `pnpm` (nunca a mano); hoy resuelve `next@16.2.4` |
| `.github/dependabot.yml` | — | **CREAR** — no existe; hoy `.github/` solo tiene `workflows/ci.yml` |
| `.github/workflows/ci.yml` | 1-66 | Solo lectura — define la suite (lint, `tsc --noEmit`, build con env placeholders, vitest) que valida el upgrade. NO tocar |
| `src/proxy.ts` | 162-171 | Solo lectura — matcher del middleware cuyo bypass parchean los CVEs. NO tocar |
| `next.config.ts` | 14-22 | Solo lectura — `images.remotePatterns` (la app usa la API de optimización de imágenes afectada por CVE-2026-44577). NO tocar |

Notas de contexto que NO se tocan en este fix:
- `package.json` líneas 68-78 tiene un bloque `pnpm.overrides` con pins de CVEs transitivos (congelado desde mayo 2026). Déjalo exactamente como está — revisarlo es otro fix de la auditoría.
- `pnpm audit --prod` también reporta avisos en `fast-uri`, `protobufjs` y `brace-expansion` (transitivos vía `@sentry/nextjs` y `firebase-admin`). **Fuera de alcance aquí** — el criterio de aceptación es solo que desaparezcan los 13 avisos de `next`.

## Pasos

1. **Línea base.** Desde la raíz del repo, confirma el estado actual antes de cambiar nada:
   ```bash
   pnpm audit --prod 2>&1 | grep -c "│ next"
   ```
   Debe devolver `13`. Si devuelve otro número, anótalo (pueden haberse publicado avisos nuevos) y continúa.

2. **Sube `next` y `eslint-config-next` a `16.2.9`** manteniendo el patrón del repo (pin exacto, sin `^`). Usa pnpm con `-E` para que escriba la versión exacta y regenere el lockfile en el mismo paso:
   ```bash
   pnpm add -E next@16.2.9
   pnpm add -DE eslint-config-next@16.2.9
   ```
   Verifica que `package.json` quedó con `"next": "16.2.9"` y `"eslint-config-next": "16.2.9"` (sin caret) y que `pnpm-lock.yaml` cambió. **Decisión de producto (default recomendado): `16.2.9` exacto**, no `16.2.6` (mínimo que cierra los CVEs) ni rangos con caret — los pins exactos son el patrón existente del repo y Dependabot (paso 4) se encargará de los bumps futuros.

3. **Corre la suite completa local**, replicando lo que hace `.github/workflows/ci.yml` (Node 22, pnpm 10.28.2 vía el campo `packageManager`):
   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm build
   pnpm test
   ```
   - Si `pnpm build` falla por variables de entorno ausentes (no hay `.env.local`), exporta los mismos placeholders que usa el CI (ver bloque `env:` del step "Build" en `ci.yml`: `NEXT_PUBLIC_FIREBASE_API_KEY=ci-placeholder`, `FIREBASE_CLIENT_EMAIL=ci@placeholder.iam.gserviceaccount.com`, la `FIREBASE_PRIVATE_KEY` dummy multilinea, `GEMINI_API_KEY=ci-placeholder`, etc.). `next.config.ts` llama a `assertLegalConfigForProductionDeploy()`, pero es no-op fuera de `VERCEL_ENV=production`, así que no bloquea el build local.
   - NO corras `test:smoke` / `test:auth` / `test:delete` — golpean una URL viva o el emulador de Firebase y están explícitamente excluidos del CI.
   - 16.2.4 → 16.2.9 son releases de parche: no se esperan breaking changes. Si `tsc` o `build` rompen por algún cambio interno de Next, repórtalo y detente (ver Restricciones) — no parchees código de la app para "hacer pasar" el upgrade.

4. **Crea `.github/dependabot.yml`** (hallazgo #99) con este contenido exacto:
   ```yaml
   version: 2
   updates:
     # Dependencias npm (el repo usa pnpm; Dependabot lo soporta y actualiza pnpm-lock.yaml)
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
         day: "monday"
       open-pull-requests-limit: 5
       groups:
         minor-and-patch:
           applies-to: version-updates
           update-types:
             - "minor"
             - "patch"
       # Los majors quedan fuera del grupo: abren PR individual para revisión manual.
       # Los security updates NO se agrupan ni esperan al lunes: abren PR inmediato
       # (requiere "Dependabot security updates" activado en GitHub — ver paso 5).

     # Mantén también las GitHub Actions del CI al día (actions/checkout, pnpm/action-setup, etc.)
     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"
         day: "monday"
   ```
   **Decisión de producto (default recomendado): Dependabot, no Renovate** — cero infraestructura adicional, nativo de GitHub, y el CI existente ya valida cada PR (lint + tsc + build + vitest en push/PR a `main`).

5. **Deja una nota para el operador del repo** (en la descripción del PR o como comentario al revisor; NO crees archivos de reporte): para que los avisos de seguridad generen PRs inmediatos, hay que activar en GitHub **Settings → Advanced Security (Code security) → "Dependabot alerts" y "Dependabot security updates"** del repo `270aldo/genesis-scann`. Eso no se puede hacer desde el working tree; el `dependabot.yml` del paso 4 solo habilita los *version updates* semanales.

6. **Verificación final de seguridad:**
   ```bash
   pnpm audit --prod 2>&1 | grep "│ next"
   ```
   No debe devolver ninguna línea (los avisos restantes de `fast-uri`/`protobufjs`/`brace-expansion` son esperados y fuera de alcance).

## Criterio de aceptación (verificable)

Todos desde la raíz del repo (`/Users/aldoolivas/genesis-scann`):

- [ ] `grep -n '"next": "16.2.9"' package.json` → 1 match (línea ~43), y `grep -n '"eslint-config-next": "16.2.9"' package.json` → 1 match (línea ~61). Ningún caret en ninguno de los dos.
- [ ] `grep -c 'next@16.2.4' pnpm-lock.yaml` → `0` (el lockfile ya no resuelve la versión vulnerable).
- [ ] `pnpm audit --prod 2>&1 | grep -c "│ next"` → `0` (cero avisos contra el paquete `next`; otros paquetes pueden seguir apareciendo).
- [ ] `pnpm lint` → sale con código 0.
- [ ] `pnpm exec tsc --noEmit` → sale con código 0.
- [ ] `pnpm build` → compila sin errores (con los env placeholders del CI si no hay `.env.local`).
- [ ] `pnpm test` → toda la suite de Vitest en verde (mismos tests que pasaban antes del upgrade; cero regresiones).
- [ ] `.github/dependabot.yml` existe, y `python3 -c "import yaml,sys; yaml.safe_load(open('.github/dependabot.yml'))"` (o cualquier validador YAML) sale con código 0. Contiene los dos ecosistemas: `npm` y `github-actions`.
- [ ] Smoke manual del middleware: `pnpm dev` y en otra terminal `curl -sI http://localhost:3000/ | grep -i content-security-policy` → la cabecera CSP sigue presente (el proxy `src/proxy.ts` sigue interceptando tras el upgrade).
- [ ] `git status` muestra modificados únicamente: `package.json`, `pnpm-lock.yaml` y el nuevo `.github/dependabot.yml` (más `tsconfig.tsbuildinfo` si el build lo regenera — ese artefacto es aceptable).

## Restricciones

- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos). En particular: no toques `src/proxy.ts`, `next.config.ts`, `.github/workflows/ci.yml` ni el bloque `pnpm.overrides` de `package.json`.
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias salvo las que este fix pide explícitamente (`next`, `eslint-config-next` y lo que pnpm resuelva transitivamente al regenerar el lockfile para esos dos paquetes). Nada de `pnpm up` global ni bumps "ya que estamos" de `firebase-admin`, `@sentry/nextjs`, `react`, `resend`, etc.
- Si encuentras algo inesperado que bloquee el fix (p. ej. `16.2.9` introduce un error de build/tipos en este código, o pnpm no puede resolver la versión), repórtalo y detente en vez de improvisar. Fallback aceptable solo si `16.2.9` está roto para este repo: `16.2.6` (versión mínima que cierra los 13 avisos, incluido el fix incompleto del bypass de middleware), documentando por qué.
