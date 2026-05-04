# Fixes aplicados — branch `audit/ui-ux-2026-05`

**Fecha:** 2026-05-03
**Base:** `feat/hybrid-copy` (HEAD `4cd1b28`)
**Smoke test final:** sesión `5dfc3165ceac` generada end-to-end con timeline AI completo + 3 imágenes en ~1m45s.

---

## P0 — Producto desbloqueado

### ✅ P0-1: Gemini text model 404 → fixed

**Problema:** `GEMINI_MODEL=gemini-3.1-flash` no existe en la API de Google. Devolvía 404 sistemático desde el commit `292e4c3` (1 mayo 2026), dejando `ai: null` en TODA sesión nueva.

**Fix aplicado en 4 lugares:**
- `src/lib/gemini.ts:285,395` — default `gemini-3.1-flash` → `gemini-flash-latest`
- `src/app/api/analyze/route.ts:26` — `MODEL_ID` default → `gemini-flash-latest`
- `.env.local:18` — `GEMINI_MODEL` → `gemini-flash-latest`
- `.env.example:22,140` — `GEMINI_MODEL` y `PLAN_GENERATION_MODEL` → `gemini-flash-latest`

**Por qué `gemini-flash-latest`:** alias dinámico que Google mantiene apuntando al Flash más fresco que ellos consideren production-ready. Hoy responde a `gemini-2.5-flash` (GA, lo que tenías antes del bug). Si Google promueve Gemini 3 Flash a GA, tu app lo recibe automáticamente sin redeploy.

**Verificación:**
- ✅ Live API: `curl gemini-flash-latest:generateContent` → "OK"
- ✅ Smoke wizard end-to-end → sesión `5dfc3165ceac`:
  - `analyzedAt: 2026-05-04T01:38:02` (analyze terminó en 17s)
  - `generatedAt: 2026-05-04T01:39:29` (3 imágenes en 87s más)
  - `ai.insightsText`: "Tu base genética mesomorfa es una ventaja metabólica significativa..."
  - `ai.timeline.m0/m4/m8/m12` con titles ("GÉNESIS ESTRUCTURAL" → "DESPERTAR NEUROMUSCULAR" → "RECOMPOSICIÓN ACTIVA" → "CÚSPIDE ESTÉTICA"), stats progresivos, mental notes, risks
  - `assets.images: m4 + m8 + m12`
  - **Sin lastError**, sin 404

---

## P1 — Críticos arreglados

### ✅ P1-3: Loading screen estados reales + botón retry

**Antes:** `LoadingExperience.tsx` mostraba estados optimistas. "GENERANDO MES 8: Listo" cuando solo m4 existía en Firestore. "Procesando..." en pasos sin actividad. Sin botón de retry cuando fallaba.

**Fix:** `src/app/loading/[shareId]/LoadingExperience.tsx`
- Track `imageKeys: string[]` y `hasAi: boolean` desde Firestore real, no contador optimista
- `stepStates` derivados: `done = has("m4")`, no `count >= 1`
- Estados explícitos: `Listo` / `Procesando...` / `Pendiente` / `Detenido` (cuando failed + no done)
- Visual: paso done = border violet, paso active = border violet/40 con pulse, paso stopped = border red, paso pending = sin highlight
- **Botón "Reintentar generación"** que dispara `POST /api/analyze` + `POST /api/generate-images` cuando hay error

### ✅ P1-4: Copy engañoso de shareScope

**Antes:** `/s/{shareId}` con `shareInsights=false` (default) mostraba *"Este usuario decidió compartir solo las imágenes"* — falso, era el default.

**Fix:** `src/app/s/[shareId]/page.tsx`
- Header: `"Transformación compartida"` → `"Transformación privada"`
- Detecta `data.shareScope !== undefined` para distinguir decisión activa vs default:
  - Default: `"Esta visualización es privada por defecto. Solo el creador puede ver el análisis completo."`
  - Decisión activa: `"El creador decidió compartir solo las imágenes. El análisis permanece privado."`

### ✅ P1-6: NotFoundState component premium

**Antes:** `/s/{shareId-inexistente}` mostraba solo `<div>"Sesión no encontrada"</div>` en top-left, sin estilo, sin CTA, dead-end.

**Fix:** `src/app/s/[shareId]/page.tsx:113-176`
- Two states premium centrados: "Esta sesión ya no existe" / "Datos incompletos"
- Tipografía bold + kicker NGX violet
- Copy explicativa razonable
- 2 CTAs: violet "Crear mi transformación" + outlined "Volver al inicio"

### ✅ P1-7: Color contrast WCAG (footer)

**Antes:** Lighthouse a11y 94/100 — 4 elementos con contraste insuficiente:
- `text-slate-600` sobre `#050505` = 2.68:1 (necesita 4.5:1)
- `text-slate-500` sobre `#050505` = 4.27:1

**Fix:** `src/components/landing/LandingFooter.tsx`
- `slate-600` → `slate-400` (ratio ~7:1) para brand status + copyright
- `slate-500` → `slate-300` (ratio ~10:1) para links Privacy/Terms/Contacto
- `text-white/60` → `text-white/80` para brand name

---

## P2 — Polish aplicado

### ✅ P2-1: Self-host noise.svg

**Antes:** 4 componentes referenciaban `https://grainy-gradients.vercel.app/noise.svg` → 404 en cada page load (texture grain rota, contribuía a Lighthouse `errors-in-console: 0`).

**Fix:**
- `public/noise.svg` creado (SVG fractalNoise inline, ~250 bytes)
- Reemplazadas 4 referencias en:
  - `src/components/EliteCard.tsx:38`
  - `src/components/EliteOptionCard.tsx:73`
  - `src/components/landing/LandingBridge.tsx:14`
  - `src/components/widgets/GlassCard.tsx:45`
- Cero peticiones externas, cero 404s

### ✅ P2-3: Heading order broken

**Antes:** `<h4>` en `LandingBridge.tsx:56` para card titles dentro de sección con `<h2>` parent — saltaba h3.

**Fix:** `src/components/landing/LandingBridge.tsx:56` → `<h4>` → `<h3>`

### ✅ P2-4: Meta description

**Antes:** Lighthouse `meta-description: 0` — la home heredaba metadata de layout.tsx pero Lighthouse no la detectaba consistentemente.

**Fix:** `src/app/page.tsx`
- `export const metadata: Metadata = { title, description }` explícito en la home
- Description rica con HYBRID copy (~210 chars, dentro del rango óptimo SEO)

---

## NO aplicados (pendientes para PR siguiente)

### P1-1: Owner bypass shareInsights — código muerto

`getAuthUser()` requiere `Authorization: Bearer <token>` header pero Server Components solo reciben cookies. Firebase Anonymous Auth no setea cookies HTTP. Resultado: dueño de sesión NUNCA ve Results 2.0 después del wizard.

**Por qué no lo arreglé en este branch:** requiere migrar a Firebase Session Cookies (`createSessionCookie`) o crear `/api/auth/session` POST que el cliente llame post-signin. Es ~150 líneas con cambios en AuthProvider, layout, middleware. Riesgo alto si no se prueba bien.

**Recomendación:** PR dedicado con session cookies + tests.

### P1-2: Wizard fire-and-forget /api/analyze

Parcialmente mitigado por P1-3 (botón retry en LoadingExperience). El fire-and-forget en `wizard/page.tsx:429-454` sigue ahí pero con el bug P0-1 arreglado y el retry button en loading, el riesgo de UX bloqueado es bajo.

**Recomendación:** dejar como está, monitorear sentry/telemetry, fix completo en sprint siguiente si se ve impacto.

### P1-5: Header inconsistente landing vs legales

Decisión de producto. No la toqué.

### P2-5: Telemetry endpoint timeout 60s

Necesita refactor para usar Upstash QStash o `void` con queue. Es más invasivo y requiere medir impacto antes.

### P2-6: `unoptimized` en next/image (ComparisonSlider)

Probablemente intencional por signed URLs. Bajo impacto, requiere validación con next.config.

### P2-7: Stage 3 wizard buttons accessibility tree

Necesita inspección detallada del componente, no urgente.

### P3-1 a P3-5: Documentación

CLAUDE.md desactualizada, FF_RESULTS_2 default, Firestore index, fonts unloaded, watermark size. Todos son docs/config menor, fuera de scope visual.

### P0-2 (descartado): Identity drift en imágenes

**No era un bug real**. Mi auditoría inicial usó la sesión `d529692a5dbb` (Dic 2025) que se generó con Nano Banana 1 (`gemini-2.5-flash-image`) y prompt builder antiguo. Las sesiones recientes (`283c666e4081` del 3 mayo) muestran identidad CONSISTENTE entre m4/m8/m12 con Nano Banana Pro (`gemini-3-pro-image-preview`, `FF_NB_PRO=true`). El image pipeline actual está bien.

---

## Verificación final

| Componente | Antes | Después |
|---|---|---|
| `/api/analyze` | 404 sistemático | 200 OK, ai generado en ~17s |
| Sesión nueva | `status: "failed"`, `ai: null` | `status: "ready"`, `ai.timeline` completo |
| Loading screen | "GENERANDO MES 8: Listo" (mentira) | Estados desde Firestore real, sin retry button | con retry button |
| Vista compartida copy | "Este usuario decidió..." (engañosa) | "Esta visualización es privada por defecto..." (honesta) |
| `/s/{id-inexistente}` | "Sesión no encontrada" texto plano | NotFoundState premium con 2 CTAs |
| Footer contrast | slate-600/500 (2.68-4.27:1) | slate-400/300 (7-10:1) |
| `noise.svg` | 404 externo en cada page load | Self-hosted local, 0 errors |
| `<h4>` orphan | Heading order broken | h3 correcto |
| Meta description | Lighthouse score 91 | Description explícita en page.tsx |

**Smoke test runtime confirmado:**
- Wizard golden path → submit → loading screen → polling Firestore → status: ready → 3 imágenes + ai.timeline completo
- Tiempo total: ~1m45s
- Modelo: `gemini-flash-latest` (apuntando a `gemini-2.5-flash` GA en este momento)
- Image model: `gemini-3-pro-image-preview` (NB Pro, `FF_NB_PRO=true`)

**TypeScript:** `npx tsc --noEmit` → exit 0 ✓
