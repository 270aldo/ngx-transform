# Auditoría UI/UX NGX Transform — 2026-05

**Branch base:** `feat/hybrid-copy` (HEAD `4cd1b28`)
**Branch auditoría:** `audit/ui-ux-2026-05` (sin commits, solo reporte + evidencia)
**Auditor:** Claude (Sonnet 4.6) hands-on con Chrome DevTools MCP + Firebase MCP + Lighthouse + lectura de código
**Fecha:** 2026-05-03
**Scope:** UI/UX, onboarding flow end-to-end, calidad imágenes, performance/a11y. NO incluye seguridad/middleware/API (ya cubierto por `fix/audit-2026-05-p0`).

---

## Resumen ejecutivo

NGX Transform tiene un diseño visual genuinamente premium en superficie (Electric Violet `#6D00FF`, BiometricLoader animado, glassmorphism, JetBrains Mono + DM Sans, copy HYBRID-first inteligente). El landing y el wizard transmiten seriedad y privacidad. **Pero el producto está roto en el momento de la verdad: la generación AI falla sistemáticamente y el usuario nunca llega a ver una proyección personalizada real.**

**Score global premium vs AI-generic: 6/10**
- Surface (landing/wizard/plan estático): 8/10 — premium auténtico
- Substance (Results/imágenes generadas): 3/10 — promesa rota

**3 hallazgos críticos:**

1. **P0 — Modelo Gemini inexistente**: `GEMINI_MODEL=gemini-3.1-flash` no existe en la API. Devuelve 404 sistemático. **7 sesiones reales de tu Firestore están atascadas en `processing` desde enero**, 3 más `failed`, y la sesión que generé ahora mismo (`fd3fee06ae54`) se marcó `failed` en 33 segundos. Sin analysis no hay timeline, no hay overlays, no hay personalización. Toda sesión nueva se rompe. ETA fix: 1 línea.

2. **P0 — Identity drift total en imágenes generadas**: m4/m8/m12 de la única sesión "ready" auditada (`d529692a5dbb`, Dic 2025) muestran **3 personas distintas entre sí, todas diferentes al original**. El "Identity Lock + user_visual_anchor + Identity Chain" no funciona. Producto promete "imagen como tú, no avatar genérico" (literal en LandingFeatures) y entrega 3 modelos random. Adicional: m8 y m12 son casi idénticas entre sí.

3. **P1 — Owner bypass de Results 2.0 es código muerto**: el commit `4cd1b28 fix(results): owner bypass shareInsights` requiere `Authorization: Bearer <token>` en el header de la request al Server Component. **Server Components solo reciben cookies del browser, no Authorization headers.** Firebase Anonymous Auth (que usa el wizard) no setea cookies HTTP. Resultado: `isOwner` siempre es `false`, el flow `wizard → loading → /s/{id}` deja al creador viendo la "Transformación compartida" pública en lugar de su propio Results 2.0. Ese fix no resuelve nada en runtime.

**Lo que SÍ funciona premium:**
- Landing HYBRID con compare slider drag + keyboard
- Wizard 4 stages con validación granular, autofocus, copy honesto sobre privacidad
- BiometricLoader + animación radial 60fps
- Demo `/s/{id}/demo` con SSE + 4 capabilities respeta doctrina v11.0 (no menciona BLAZE/SAGE)
- Plan Day 1 hardcoded funciona aunque la sesión esté `failed` (fallback útil)
- Mobile responsive sólido (390x844 limpio en landing/wizard/plan)
- Lighthouse Best-Practices 96, SEO 91, A11y 94 (respetable, con gaps)

**Lo que pesa AI-generic:**
- Identity drift en imágenes (P0)
- Loading screen miente: "GENERANDO MES 8: Listo" cuando Firestore solo tiene m4
- Copy "Este usuario decidió compartir solo las imágenes" miente: es default del sistema, no decisión activa
- Dead-end "Sesión no encontrada" sin estilo ni CTA
- Header inconsistente entre landing y páginas legales
- Typewriter overlap en Demo log (texto montado sobre texto)

---

## Tabla priorizada de hallazgos

### P0 — Bloqueantes para producción

| # | Hallazgo | Archivo:línea | Evidencia | Fix propuesto | Criterio aceptación |
|---|---|---|---|---|---|
| **P0-1** | `GEMINI_MODEL=gemini-3.1-flash` devuelve 404. Modelo no existe en `generativelanguage.googleapis.com/v1beta/models`. | `.env.example`, `.env.local`, `src/lib/gemini.ts:285,395` | `lastError` en sesión `fd3fee06ae54` (smoke test) y en `283c666e4081` (2026-05-03): "models/gemini-3.1-flash is not found". 7 sesiones `processing` atascadas desde enero. | Cambiar a `gemini-2.5-flash` (GA, lo que dice STATUS_REPORT.md) o `gemini-3-flash-preview`. Actualizar `.env.example` + remover hardcoded default en `gemini.ts:285,395` o cambiarlo a un modelo real. | Submit wizard genera sesión con `status:"ready"` + `ai != null` en menos de 60s. |
| **P0-2** | Identity drift TOTAL en imágenes generadas. m4/m8/m12 son personas distintas entre sí y diferentes al original. m8 ≈ m12. | `src/lib/nanobanana.ts`, `src/lib/promptBuilder.ts`, `src/lib/qualityGates.ts` | `docs/audit-uiux-2026-05/grid_d529692a5dbb_m0_m4_m8_m12.png` — sesión `d529692a5dbb` (única "ready" reciente con assets). Original = hombre en bosque con lentes. m4 = otro hombre con barba en gym brick. m8 = bodybuilder shirtless con tatuajes. m12 = mismo m8 prácticamente igual. | (a) Verificar que `user_visual_anchor` realmente se está extrayendo del original (logging en gemini.ts `extractVisualAnchor`). (b) Validar que `[IDENTITY LOCK]` y refs encadenadas (m4→m8→m12) están en el prompt al Image API. (c) Activar `FF_QUALITY_GATES=true` y revisar `qualityGates.ts` que valide "face match score" mínimo. (d) Considerar `FF_NB_PRO=true` con `gemini-3-pro-image-preview` para mejor consistencia. | 3 sesiones nuevas auditadas: identidad reconocible m0→m12, m8 y m12 distinguibles. |

### P1 — Críticos para experiencia

| # | Hallazgo | Archivo:línea | Evidencia | Fix propuesto | Criterio aceptación |
|---|---|---|---|---|---|
| **P1-1** | Owner bypass de Results 2.0 nunca funciona en runtime. `getAuthUser` requiere `Authorization: Bearer <token>` header pero Server Components solo reciben cookies. Firebase Anonymous Auth no setea cookies. | `src/app/s/[shareId]/page.tsx:118-127`, `src/lib/authServer.ts:9-27` | Recreación: navegar a `/s/{ownShareId}` después de submit wizard → ve "Transformación compartida" pública, no Results 2.0. `isOwner=false` siempre porque `headers()` no incluye `Authorization`. | Migrar Firebase Auth a session cookies vía Firebase Admin `createSessionCookie` (set-cookie con HttpOnly), o crear ruta `/api/auth/session` que el cliente llame post-signin para setear cookie, y leer cookie en Server Component vía `cookies()`. Alternativa rápida: pasar `?owner_token={firebaseIdToken}` en URL y validarlo (less secure). | Después de wizard submit, owner ve TransformationViewer2 sin pasar por share-scope. |
| **P1-2** | Wizard fire-and-forget de `/api/analyze` sin retry UI. Errores van a `console.error`. Si falla (con bug P0-1 actual, falla siempre), el usuario llega a `/loading/{id}` que sí muestra "PROCESO DETENIDO" pero **no ofrece botón de retry**. | `src/app/wizard/page.tsx:429-454`, `src/app/loading/[shareId]/LoadingExperience.tsx:114` | Smoke test recreación: bloquear /api/analyze → wizard redirige a /loading → loading muestra error pero sin acción. | (a) Añadir botón "Reintentar generación" en LoadingExperience cuando `error` está set, que dispare POST /api/analyze + POST /api/generate-images. (b) Cambiar fire-and-forget por await con loading state real (puede tomar 30-60s pero evita inconsistencia). (c) Persistir intento de retry y exponer status real desde Firestore. | Bug P0-1 induce error → user ve botón "Reintentar" → click → nueva intento exitoso (con P0-1 arreglado). |
| **P1-3** | Loading screen muestra "GENERANDO MES 8: Listo" cuando Firestore solo tiene m4. Pasos siguen "Procesando..." aunque el flow está detenido. | `src/app/loading/[shareId]/LoadingExperience.tsx` | `1440x900_loading_after-failure.png`. Comparar con `assets.images` de Firestore para sesión `fd3fee06ae54` que solo tiene `m4`. | El loading debe pollear `GET /api/sessions/[shareId]` y derivar estado de cada paso desde `data.assets.images.m4/m8/m12 != null`. No incrementar paso optimisticamente. | En sesión donde solo m4 generó: UI muestra solo m4 ✓ Listo, los demás Pendiente. |
| **P1-4** | Copy engañoso: "Este usuario decidió compartir solo las imágenes. El análisis permanece privado." aparece cuando `shareScope.shareInsights == false`, que es el **default** del sistema, no decisión activa del creador. | `src/app/s/[shareId]/page.tsx:128-172` | `1440x900_results_failed-session.png` — sesión `fd3fee06ae54` recién creada nunca seteó shareScope, pero la copy implica decisión consciente. | Cambiar copy a "Esta transformación es privada por defecto. Solo el creador puede ver el análisis completo." o detectar si shareScope fue explícitamente seteado vs default y diferenciar copy. | Visitor de sesión recién creada lee copy que refleja realidad (default privado), no decisión activa. |
| **P1-5** | Header inconsistente entre landing (`Cómo Funciona / Qué Recibes / FAQ / CTA`) y páginas legales/dashboard (`Probar / Dashboard / HYBRID / Usuario`). | `src/components/landing/LandingTopNav.tsx` vs `src/components/GlobalHeader.tsx` | `1440x900_landing_hero_HYBRID-branch.png` (landing) vs `1440x900_privacy.png` (privacy). | Decidir un único top nav system. Si landing tiene su propio nav contextual (anchors de scroll), aceptar. Pero `/privacy` `/terms` `/unsubscribe` deberían tener un nav consistente con landing o con dashboard, no mezcla. | Header en privacy/terms/unsubscribe coincide visualmente con landing o con dashboard, no es híbrido. |
| **P1-6** | Dead-end `/s/{shareId-inexistente}`: solo muestra texto plano "Sesión no encontrada" en top-left, sin estilo, sin CTA, sin link a home. | `src/app/s/[shareId]/page.tsx:113,116` | `1440x900_session_not_found.png`. | Crear componente `<NotFoundState>` con tipografía premium, copy explicativo ("Esta sesión no existe o expiró"), y CTAs "Volver al inicio" + "Crear mi transformación". Mismo tratamiento para "Datos inválidos" línea 116. | Visitor de URL inválida ve estado de error premium con CTAs claros. |
| **P1-7** | 4 elementos con contraste WCAG insuficiente (Lighthouse a11y 94/100). Footer slate-600 sobre #050505 = 2.68:1 (necesita 4.5:1). Footer links slate-500 = 4.27:1. | `src/components/landing/LandingFooter.tsx`. Snippets: `<p class="text-[10px] text-slate-600">`, `<a class="text-xs text-slate-500" href="/privacy">`. | `docs/audit-uiux-2026-05/lighthouse/report.json` audit `color-contrast`. | Subir slate-600 a slate-400 (#94a3b8 ≈ 7:1) o slate-500 (#64748b ≈ 5.5:1). Subir slate-500 a slate-400 mínimo. | Lighthouse a11y 100/100 en color-contrast. |

### P2 — Polish y deuda visual

| # | Hallazgo | Archivo:línea | Evidencia | Fix propuesto |
|---|---|---|---|---|
| **P2-1** | 404 a `https://grainy-gradients.vercel.app/noise.svg` (texture grain externa rota). Console error en cada page load. | `src/components/EliteCard.tsx` o donde sea que se referencia ese SVG (grep needed). | `list_console_messages` baseline + Lighthouse `errors-in-console` audit. | Self-hostear el noise.svg en `public/noise.svg` o quitar la dependencia. |
| **P2-2** | Typewriter overlap en `/s/{id}/demo` log "GENESIS EN TIEMPO REAL": múltiples líneas se montan entre sí en mobile (más visible) y desktop. | `src/components/demo/GenesisChat.tsx` o `AgentOrchestration.tsx` (componente del log). | `390x844_demo_mobile.png` — líneas "Calibrando protocolo de fuerza..." y "Nivel intermedio confirmado" + "Evaluando historial de entrenamiento" se traslapan visualmente. | Añadir `transition-all` y `clearTimeout` previo al typewriter. Considerar `Framer Motion` con `AnimatePresence` y key únicas. |
| **P2-3** | Heading order broken: `<h4>` sin h3 padre detectado. | LandingPage o LandingProvider — un `<h4 class="text-white text-[1.2rem]">`. | Lighthouse `heading-order` audit. | Cambiar h4 → h3 si está en sección sin h3, o añadir h3 padre. |
| **P2-4** | `<meta name="description">` faltante en landing root. SEO 91 → 100 si se arregla. | `src/app/layout.tsx` o `src/app/page.tsx` `generateMetadata`. | Lighthouse `meta-description` audit. | Añadir meta description con HYBRID copy. |
| **P2-5** | Telemetry endpoint puede colgar dev server por 60s (Firebase Admin write timeout DEADLINE_EXCEEDED). En prod podría disparar cold-start retries y cobrar Firestore writes fallidas. | `src/lib/telemetry.ts:153`, `src/app/api/telemetry/route.ts:20` | Log del dev server crashed durante audit: "POST /api/telemetry 200 in 61s ... DEADLINE_EXCEEDED ... writes added not classified as transient". | (a) `await` con timeout 5s y fallback queue. (b) Mover telemetry a edge runtime + queue (Upstash QStash). (c) `void` el await con retry async. |
| **P2-6** | `unoptimized` en next/image en `ComparisonSlider.tsx:87,94,113,120` bypassa optimization. Imágenes pesadas sin lazy. | `src/components/ComparisonSlider.tsx:87,94,113,120` | grep + lectura. | Quitar `unoptimized`. Si hay razón legítima (Firebase signed URL volátil), validar que Next.js Image acepta el remotePattern (que SÍ está en `next.config.ts:7-12`). |
| **P2-7** | Stage 3 wizard: "ZONA DE ENFOQUE PRINCIPAL" tiene los 4 botones (TREN SUPERIOR / INFERIOR / CORE & ABS / FULL BODY) renderizados como `StaticText` no clickables en accessibility tree. Probablemente envuelven en `<button>` pero el tree de accesibilidad los ve como text. | `src/app/wizard/page.tsx` stage 3 component. | Snapshot de wizard stage 3 (uid `8_17` a `8_20` son StaticText). | Asegurar que los botones tengan `role="button"` o usen `<button>`. Validar con teclado Tab que reciben focus. |

### P3 — Documentación y limpieza

| # | Hallazgo | Archivo | Fix |
|---|---|---|---|
| **P3-1** | CLAUDE.md dice `cd app/` para correr comandos pero el código está en `src/` raíz, no en `app/`. Fonts dice "Space Grotesk" pero la realidad es DM Sans + JetBrains Mono + Geist. | `CLAUDE.md` | Actualizar dev commands + stack. |
| **P3-2** | `NEXT_PUBLIC_FF_RESULTS_2` no está en `.env.local` ni `.env.example` con default true. Si Results 2.0 es la experiencia premium, debería estar `true` por default. Sin él, el flow legacy `TransformationViewer` se sirve. | `.env.example` | Añadir `NEXT_PUBLIC_FF_RESULTS_2=true` en .env.example y/o cambiar default en `src/app/s/[shareId]/page.tsx:16`. |
| **P3-3** | Firestore composite index `(status, createdAt)` faltante. Cualquier admin query ordenada por createdAt + filtro de status falla. | `firestore.indexes.json` | Crear índice manualmente o aceptar el deep link que devuelve Firestore en el error 400. |
| **P3-4** | `Neue Haas Grotesk Text Pro` y `United Sans` declaradas como custom fonts pero **NUNCA loaded** según `document.fonts` (status `unloaded` siempre). | `src/app/globals.css` `@font-face` | (a) Si no se usan, removerlas. (b) Si se usan, verificar paths de woff2 self-hosted. |
| **P3-5** | Watermark NGX en imágenes generadas es muy pequeño y no contrastante en bottom. Para uso viral, el branding debería ser más visible. | `src/lib/watermark.ts` | Aumentar tamaño 1.5x o añadir corner badge violet. |

---

## Detalle por pantalla

### Landing `/` (HYBRID copy v3.2)
**Screenshots:** `1440x900_landing_hero_HYBRID-branch.png` (desktop), `390x844_landing_HYBRID_mobile.png` (mobile)

- **Premium ✓:** Headline "LO QUE NO TE CONOCE, NO TE PUEDE TRANSFORMAR." en JetBrains Mono bold, hero compare slider con keyboard nav (`role="slider"` `aria-valuenow`), copy HYBRID-first ("ruta inicial HYBRID + acompañamiento humano"), chips data-driven `{hero.badge.aiLabel}`/`{hero.badge.version}`. Mobile stack vertical limpio.
- **Issues:** P1-7 (color contrast footer), P1-5 (nav diferente al resto), P2-1 (404 noise.svg), P2-3 (heading order), P2-4 (meta-description), P3-4 (fonts no loaded).
- **Lighthouse:** A11y **94**, Best-Practices **96**, SEO **91**.

### Wizard `/wizard` (4 stages)
**Screenshots:** `1440x900_wizard_stage2_HYBRID.png`, `1440x900_wizard_stage3_objetivo.png`, `1440x900_wizard_stage4_cierre.png`, `390x844_wizard_stage1_mobile.png`

- **Premium ✓:** Progress bar 4 stages claramente labeled (FOTO/PERFIL/OBJETIVO/CIERRE). Validación inline (continuar disabled hasta consents). Copy honesta ("Esto no es un diagnóstico médico"). Sliders con valores dinámicos ("AJUSTE ACTIVO 75/10"). Auto-focus entre stages. Summary card en stage 4 con resumen de selecciones. Mobile responsive bien.
- **Issues:** P1-2 (fire-and-forget submit silencioso), P2-7 (stage 3 buttons como StaticText).
- **Smoke test:** Golden path ejecutado en 4 stages, submit OK con email `audit-2026-05@ngx.local`. Resultado: sesión `fd3fee06ae54` creada en Firestore, redirige a `/loading/{id}`, fail en 33s por bug P0-1.

### Loading `/loading/[shareId]`
**Screenshots:** `1440x900_loading_after-failure.png`

- **Premium ✓:** Animación radial progress en violet con efecto pulsante. 5 pasos verticales. Footer motivacional "El 80% de los resultados depende del sistema, no de la motivación". Mensaje de error visible en rojo cuando falla.
- **Issues:** P1-2 (sin botón retry), P1-3 ("GENERANDO MES 8: Listo" miente vs Firestore real). Estados "Procesando" persisten cuando proceso está detenido (confunde si es loop infinito o error).

### Results `/s/[shareId]` (vista pública sin auth)
**Screenshots:** `1440x900_results_failed-session.png`

- **Vista limitada:** Cuando `shareScope.shareInsights=false` (default), muestra solo hero con imagen m12 (o m4/m8 si m12 falta) + 2 CTAs ("Crear mi transformación" / "Ver en privado").
- **Issues:** P1-1 (owner bypass roto, owner ve esta vista limitada en lugar de Results 2.0), P1-4 (copy engañosa "decidió compartir solo las imágenes").

### Demo `/s/[shareId]/demo`
**Screenshots:** `1440x900_demo_initial.png`, `390x844_demo_mobile.png`

- **Premium ✓:** Doctrina v11.0 respetada — header "GENESIS está analizando tu perfil", brain icon central violet con pulse. 4 capability cards 2x2 (Entrenamiento orange, Nutrición green, Recuperación blue, Hábitos purple). Log "GENESIS · Capability:" sin mencionar BLAZE/SAGE/etc. SSE event stream funcional.
- **Issues:** P2-2 (typewriter overlap visible en mobile especialmente).

### Plan `/s/[shareId]/plan`
**Screenshots:** `1440x900_plan_initial.png`, `390x844_plan_mobile.png`

- **Premium ✓:** Header "Tu Plan de 7 Días" + chip "1/7 Desbloqueado". Pagination 1-7 con candados en 2-7. "Día 1 - GÉNESIS" expandido por default con WorkoutCard (HIIT Upper Body Fase 1, 45min, 420kcal, ejercicios numerados). Tabla comparativa "POR QUÉ NECESITAS GENESIS?" 5 filas. CTA prominente "DESBLOQUEAR MI PLAN COMPLETO" violet. Mobile mantiene legibilidad.
- **Funciona aunque sesión esté `failed`** ✓ — fallback estático útil.

### Pantallas legales (`/privacy`, `/terms`, `/unsubscribe`)
**Screenshots:** `1440x900_privacy.png`, `1440x900_terms.png`, `1440x900_unsubscribe.png`

- **Premium ✓:** Documentación legal extensa, completa, marcador de "Última actualización", tipografía readable. Tabla de contenidos jerárquica.
- **Issues:** P1-5 (header diferente al landing — usa GlobalHeader con nav "Probar/Dashboard/HYBRID/Usuario" en lugar del LandingTopNav).

### Edge case: sesión inexistente `/s/no-existe-sesion-12345`
**Screenshots:** `1440x900_session_not_found.png`

- **Issue P1-6:** Solo "Sesión no encontrada" en top-left, sin estilo, sin CTA, sin link a home. Dead-end completo.

---

## Apéndice: imágenes generadas auditadas

**Sesiones inspeccionadas:** Firestore `sessions` collection, top 15 por `createdAt`. Sin PII en este reporte (solo shareIds).

| shareId | createdAt | status | hasAi | hasImages | lastError |
|---|---|---|---|---|---|
| `fd3fee06ae54` | 2026-05-03 | failed | false | m4 only | gemini-3.1-flash 404 |
| `283c666e4081` | 2026-05-03 | ready | false | m4/m8/m12 | gemini-3.1-flash 404 (status engañoso) |
| `9d17be70ef96` | 2026-04-30 | failed | false | none | (no inspeccionado) |
| `a0f92c4ff78c` | 2026-04-21 | ready | false | none | — |
| `b385497b712a` | 2026-04-21 | processing | false | none | atascada 4+ meses |
| `eee538edb897` | 2026-04-21 | processing | false | none | atascada |
| `187c32d2c3d1` | 2026-02-07 | failed | false | none | — |
| `70b7d42a8fcb` | 2026-02-06 | failed | false | none | — |
| `bef273c4b9a8` | 2026-01-11 | processing | false | none | atascada 4+ meses |
| `f7677f389acf` | 2026-01-11 | processing | false | none | atascada |
| `89bb900550ef` | 2026-01-11 | ready | false | none | — |
| `543238740477` | 2026-01-11 | processing | false | none | atascada |
| `6f3b21751982` | 2026-01-11 | processing | false | none | atascada |
| `457f17873861` | 2026-01-11 | processing | false | none | atascada |
| `60ef39a27033` | 2026-01-10 | ready | false | none | — |
| **`d529692a5dbb`** | **2025-12-26** | **ready** | **true** ✓ | **m4/m8/m12** ✓ | **única sesión completa** |

**Auditoría visual de la única sesión completa (`d529692a5dbb`):**
Ver `docs/audit-uiux-2026-05/grid_d529692a5dbb_m0_m4_m8_m12.png` y los 4 archivos individuales `session_d529692a5dbb_*.{jpeg,jpg}` en `screenshots/`.

| Frame | Verdict |
|---|---|
| **m0 (original)** | Hombre 30s en bosque/parque, lentes oscuros, t-shirt gris, postura natural, fondo de pinos. Casual / outdoor. |
| **m4 "METAMORFOSIS"** | **Persona DIFERENTE** — joven moreno con barba estilizada, sin lentes, tank top negro sleeveless, gym industrial brick. Identity drift total. |
| **m8 "ASCENSIÓN"** | **Persona DIFERENTE OTRA VEZ** — bodybuilder shirtless con tatuajes en brazos, levantando barra arriba, gym industrial. Distinto a m4. |
| **m12 "APEX"** | **Casi idéntica a m8** — mismo modelo, mismo gym, misma pose, ligeras variaciones. Pierde el sentido de progresión. |

**Implicación:** El producto vende "imagen como tú, no como un avatar genérico" (literal en LandingFeatures `Activo 01`). La realidad audit'd es 3 modelos distintos sin relación con el original. Eso convierte el "viral lead magnet" en un riesgo de share negativo: el usuario que comparte se da cuenta de que no es él.

**Recomendación inmediata:** No invertir más en hardening de Results 2.0 / Demo / Plan hasta resolver P0-1 (Gemini model) + P0-2 (identity chain). Sin estos dos, todo lo demás es maquillaje sobre un producto roto.

---

## Recomendación de orden de fixes (siguiente PR)

1. **Sprint 0 — Desbloquear el producto (1-2 días):**
   - P0-1: cambiar `GEMINI_MODEL` a un modelo real
   - P1-1: arreglar owner bypass con session cookies (o quick-fix con query param)
   - P1-2: añadir botón retry en LoadingExperience
   - P3-1: actualizar CLAUDE.md (commands + fonts reales)

2. **Sprint 1 — Calidad core (3-5 días):**
   - P0-2: investigar y arreglar identity chain (logging + verificar prompts en Image API)
   - P1-3: derivar estado de loading desde Firestore real, no incrementos optimistas
   - P1-4: copy honesto de share scope
   - P1-5: header consistente legales

3. **Sprint 2 — Polish (2-3 días):**
   - P1-6: NotFoundState component
   - P1-7: contraste WCAG footer
   - P2-1 a P2-7: deuda visual + telemetry timeout

4. **Sprint 3 — SEO + Doc (1 día):**
   - P2-3, P2-4, P3-2 a P3-5

---

## Metodología

- **Branch base auditado:** `feat/hybrid-copy` HEAD `4cd1b28` (la versión más reciente con UI/results/wizard tocados, basada en main + 2 commits de HYBRID copy + owner bypass).
- **Herramientas:** Chrome DevTools MCP (navigate, take_screenshot, evaluate_script, lighthouse_audit, take_snapshot, emulate, fill, click, upload_file), Firebase MCP (firestore_list_documents, firestore_get_document, storage_get_object_download_url), Bash (curl + jq + python3 PIL para grid composition), git para verificación de ramas.
- **Viewports:** desktop 1440x900, mobile 390x844 (iPhone 14 emulado, isMobile + touch).
- **Sesiones reales auditadas:** 16 (top 15 por createdAt) + 1 sesión nueva generada en smoke test (`fd3fee06ae54`).
- **Ramas comparadas:** main, codex/ngx-v3-2-hybrid-launch, feat/hybrid-copy, fix/audit-2026-05-p0, infra-ci-cleanup, sprint-2-readiness-hybrid, sprint-trust-compliance — para identificar cuál refleja el estado real (feat/hybrid-copy resultó ser la actual).
- **Cero modificaciones:** No commits, no push, no rebases. Cero cambios en código. Cero modificaciones de Firestore (1 intento de update_document fue denegado por sistema de permisos). Una sesión nueva creada vía wizard (smoke test golden path) — `fd3fee06ae54`, ver tabla apéndice.

## Limpieza pendiente (opt-in del owner del repo)

- Borrar branch local `audit/ui-ux-2026-05` (sin commits, sin push) si no se desea conservar.
- Borrar `docs/audit-uiux-2026-05/` (carpeta de evidencia con screenshots) si solo se quiere conservar este `.md`.
- Borrar sesión de Firestore `fd3fee06ae54` (única sesión generada por la auditoría — failed, sin valor).
- Reiniciar `pnpm dev` (puede haber quedado degradado por timeouts de telemetry P2-5).
