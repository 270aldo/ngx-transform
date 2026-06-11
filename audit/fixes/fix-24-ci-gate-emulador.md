# Fix 24 — CI corre el gate de emulador: los tests de authz A-vs-B dejan de ser manuales

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #100

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision guarda fotos corporales y datos de salud; la autorización vive en `src/lib/authServer.ts` (`requireSessionOwner`). Los ÚNICOS tests que verifican de verdad que el usuario B no puede ver/borrar/usar lo del usuario A están en `tests/auth.integration.test.mjs` y `tests/delete.integration.test.mjs` — y **NO corren en CI**: `.github/workflows/ci.yml` (único workflow) solo ejecuta lint, tsc, build con placeholders y `pnpm test` (Vitest), con comentario explícito "Smoke tests intentionally not run here" (`ci.yml:49-53`). Corren solo si un humano ejecuta `pnpm test:gate:local` (`scripts/run-local-gate.sh`: levanta emuladores Firebase auth/firestore/storage proyecto demo-ngx, Next dev, siembra fixtures con `scripts/seed-emulator.mjs`, mintea tokens A/B con `scripts/mint-token.mjs` y corre test:auth+test:smoke+test:delete, líneas 24-79).

Peor: cada test hace `t.skip()` si faltan las env vars (`auth.integration.test.mjs:13-17`) — ejecutado mal configurado produce verde sin probar nada. Y `authServer.ts` nunca se ejecuta en ningún test Vitest (siempre mockeado); la única "cobertura" en CI de los invariantes es un grep de substring (`src/app/api/security-p1.static.test.ts`).

**Negocio:** una regresión de permisos (refactor inocente) llegaría a producción con CI verde = fuga de datos personales sensibles con riesgo legal.

## Archivos involucrados
- `.github/workflows/ci.yml` — añadir job `gate` (o paso) con emuladores.
- `scripts/run-local-gate.sh:1-80` — ya hace el 95% del trabajo; parametrizar para CI.
- `tests/auth.integration.test.mjs:13-17` (+ delete, smoke) — modo estricto: fallar en vez de skip.
- `package.json:13-19` — scripts test:auth/test:smoke/test:delete/test:gate:local.

## Pasos
1. **Modo estricto en los .mjs:** soportar `GATE_STRICT=1` — si está activo y faltan `TEST_USER_A_TOKEN`/fixtures, `assert.fail("fixture faltante")` en lugar de `t.skip()`. (Cambio mínimo: helper compartido `requireEnvOrSkip(t, name)` que decide skip vs fail según la env.)
2. **run-local-gate.sh para CI:** verificar que no asume nada interactivo; exportar `GATE_STRICT=1` dentro del script cuando `CI=true`. Java y firebase-tools: en GitHub Actions, `actions/setup-java@v4` (temurin 21) + `npm i -g firebase-tools` (o `pnpm dlx firebase-tools`).
3. **Nuevo job en ci.yml** (paralelo al actual, mismo trigger):
   ```yaml
   gate:
     runs-on: ubuntu-latest
     timeout-minutes: 20
     steps:
       - uses: actions/checkout@v4
       - uses: pnpm/action-setup@v4
       - uses: actions/setup-node@v4   # node 22 + cache pnpm (copiar del job existente)
       - uses: actions/setup-java@v4
         with: { distribution: temurin, java-version: "21" }
       - run: pnpm install --frozen-lockfile
       - run: npm i -g firebase-tools
       - run: cp .env.emulator.example .env.emulator.local   # valores demo, sin secretos
       - run: CI=true pnpm test:gate:local
   ```
   Revisar `.env.emulator.example` — debe bastar para el gate (el script fuerza hosts de emulador; nunca toca producción, comentarios en run-local-gate.sh:5-8).
4. Si el dev server necesita env mínimas para arrancar (Firebase client keys), usar los mismos placeholders que ya usa el paso build del CI (`ci.yml:36-47`).
5. Marcar el job como requerido en branch protection (documentar en el resumen; no es configurable desde el repo).

## Criterio de aceptación (verificable)
- `pnpm test:gate:local` local sigue verde (sin GATE_STRICT, comportamiento idéntico al actual).
- `GATE_STRICT=1 node --test tests/auth.integration.test.mjs` SIN fixtures → **falla** (no verde-vacío).
- El workflow nuevo pasa en un push de prueba (verificable en Actions) y ejecuta los 3 suites con asserts reales (ver el log: "owner can access private session" etc. sin skips).
- `pnpm lint && pnpm exec tsc --noEmit && pnpm test` en verde (los .mjs no son Vitest, no se ven afectados).

## Restricciones
- NO toques nada fuera de los archivos listados.
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias del package.json (firebase-tools va global en el runner).
- Si algo inesperado bloquea el fix (p.ej. el emulador necesita puertos ya ocupados en runners), repórtalo y detente en vez de improvisar.
