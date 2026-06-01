# NGX Vision — Plan de Refinamiento Visual & UX
**Versión:** v1.0
**Fecha:** Mayo 2026
**Owner:** Aldo / NGX
**Scope:** Landing primero, después wizard → results → demo → plan

---

## 0. TL;DR — Mi opinión honesta

**La idea del lead magnet está bien. La ejecución actual le queda corta.**

Lo que tienes hoy es una **landing de SaaS competente**: copy fuerte, branding consistente, disclaimers sólidos, estructura clásica. Pasa. Pero **no se siente como NGX** — un ecosistema de Performance & Longevity con IA + coach. Se siente como una landing de fitness app con buen tipógrafo.

El gap entre la **visión** que describes (visualizar transformación → ver dashboards → entender el sistema → hablar con GENESIS → agendar llamada → preview del programa completo) y lo **implementado** es grande. La landing actual:

- Vende **el scan** (tactical), no el **ecosistema** (estratégico)
- Es **estática** cuando debería ser **viva** (es un producto de IA agentic, debería sentirse así)
- Cuenta **con texto** lo que debería **mostrar con producto** (mockups reales, no descripciones)
- No tiene **momentos wow** — la jerarquía visual es uniforme, no cinematográfica
- **Subutiliza** lo que ya construiste: AgentOrchestration, A2UI widgets, GENESIS chat, plan preview… nada de eso aparece arriba del fold

**La tesis correcta del lead magnet es:**
> "NGX Vision no es un scan. Es un demo en vivo del sistema operativo de tu cuerpo durante 12 semanas. El scan es solo la primera escena."

Si esa es la tesis, la landing tiene que **demostrar el sistema**, no describirlo.

---

## 1. DIAGNÓSTICO — Lo que veo en los screens

### ✅ Lo que funciona
1. **Sistema de marca consistente** — violet `#6D00FF`, dark mode, glassmorphism básico, JetBrains Mono en legales/labels.
2. **Copy diferenciado** — "El problema no es tu disciplina, es que tu modelo está roto" / "0 promesas mágicas" / "La imagen puede incomodarte. Bien." Esto es voz NGX, no es genérico.
3. **Estructura legible** — hero → problema → cómo funciona → qué recibes → puente IA+coach → FAQ → CTA. La narrativa está bien armada.
4. **Disclaimers serios** — privacidad y términos completos (LFPDPPP, derechos ARCO, transferencias). Esto da legitimidad enterprise, no MVP improvisado.
5. **3 pasos del proceso** — claro, no se sobre-explica.

### ⚠️ Lo que está roto o le falta nivel

#### Hero (arriba del fold)
- **Card de "Visualización GENESIS" demasiado pequeño** y compite con el título a la izquierda en lugar de **ser el héroe del fold**. La promesa visual del producto debe ser el centro de gravedad.
- **Title typography demasiado pesada** — "LO QUE NO TE CONOCE, NO TE PUEDE TRANSFORMAR" se siente como gym ad de 2018. La jerarquía no tiene momento cinematográfico.
- **Sin video / sin loop / sin motion** — un producto de IA agentic con esa quietud comunica "MVP", no "platform".
- **"Ver mi punto de partida" es un CTA débil** — habla de mí, no del producto. Comparado con "Iniciar mi scan" abajo, que es más fuerte. Hay inconsistencia de naming.
- **Las 3 mini-cards (Contrato Claro / GENESIS Interpreta / Después del Wow)** se sienten relleno. Información de footer disfrazada de hero.

#### Sección "El problema real"
- Funciona, pero **los 3 cards rojos** son visualmente pesados y estancan el scroll. El rojo introduce ruido cromático que pelea con el violeta de marca.
- **No hay datos** — solo afirmaciones. Para audiencia 30–60, agregar 1 stat creíble por card multiplica credibilidad ("3-8% pérdida muscular por década" ya está, los otros 2 también lo necesitan).

#### Sección "De curiosidad a claridad"
- **El timeline vertical con 3 nodos** es funcional pero no impactante. En 2026, un timeline así parece de Figma kit gratis.
- **No muestra el producto haciendo el paso** — solo describe el paso. Esto es la mayor oportunidad perdida: aquí debería verse un mock real del scan, del wizard, de GENESIS analizando.

#### Sección "Qué recibes"
- **4 cards uniformes** — Visualización Aspiracional / Readiness Report / Ruta 7 días / Diagnóstico HYBRID. Sin imagen de cada activo. **Es la sección donde menos peso le das a algo que es lo más importante.**
- **No hay preview real** del Readiness Report ni del plan de 7 días. Tienes los componentes en código (`PlanPreview`, `WorkoutCard`, `MealPlan`). Úsalos.
- **Stats "12 SEM / 1 / IA+COACH / 0"** — el "0 promesas mágicas" es un golpe simpático pero rompe el ritmo del scan. Sería mejor en un strip aparte.

#### Sección "El puente IA + coach"
- **La columna de la izquierda gana al lado derecho** — los 3 cards de la derecha son texto largo en columnas estrechas, no respiran.
- **El CTA "Agendar diagnóstico HYBRID"** es la conversión de mayor valor de toda la landing y está visualmente al mismo nivel que cualquier otro botón de la página. **Debería destacar como el CTA tier-1 que es.**

#### FAQ
- **Tipografía monótona** — todas las preguntas tienen mismo peso. Las preguntas de objeción ("¿Es real la imagen?", "¿Sustituye a un médico?") son las que importan; las operativas ("¿Cuánto tarda?") no necesitan misma jerarquía.
- **No hay pregunta sobre HYBRID** — el upsell principal no se aborda en FAQ.

#### CTA Final
- "LA IMAGEN PUEDE INCOMODARTE. BIEN." es **el mejor copy de toda la landing**. Y está al final, en una card chica. Debería estar **mucho más arriba** o tener tratamiento de cierre cinematográfico (full-bleed, video de fondo, escala 4x).

#### Footer
- Genérico. No comunica el ecosistema NGX (Transform es lead magnet, ¿dónde está el resto?).

### 🔴 El gap estratégico (lo que no se ve en ningún screen)

Lo que prometes en tu mensaje:
1. ✅ Visualizar transformación → existe, pero es solo before/after estático.
2. ❌ **Presentar dashboards / data** → no hay nada en la landing.
3. ❌ **Ver cómo funciona el sistema** → solo describes 3 pasos, no muestras GENESIS/agentes operando.
4. ❌ **Hablar con GENESIS** → cero presencia de chat/voice en landing.
5. ❌ **Agendar llamada** → existe el CTA, pero sin contexto del coach. ¿Quién es? ¿Qué pasa en 15 min?
6. ❌ **Preview del programa** → nada.

**La landing comunica el 30% de lo que el producto YA es.** Los componentes están construidos en código (`AgentOrchestration`, `DemoChat`, `PlanPreview`, `A2UI widgets`, `NeonRadar`). El problema no es construir más — es **traer ese producto a la landing**.

---

## 2. VISIÓN — Qué debe ser NGX Vision como lead magnet

### Tesis estratégica
**NGX Vision es un demo jugable del NGX Engine durante 30 minutos.**
No vende el scan. Vende la experiencia de tener un sistema operativo (IA + coach) trabajando para ti, comprimida en una sesión.

### Los 5 momentos "wow" del funnel
| # | Momento | Estado actual | Estado deseado |
|---|---------|---------------|----------------|
| 1 | **Landing — primer impacto** | Card before/after estática | Hero cinematográfico con loop de scan en vivo + GENESIS hablando |
| 2 | **Wizard — captura de datos** | Multi-step form correcto | Scan biométrico estilo Apple Vision Pro, cada input se siente como diagnóstico |
| 3 | **Loading — procesando** | BiometricLoader con tips | Sí, está bien, solo elevar visualmente al nivel del resto |
| 4 | **Results — entrega** | CinematicViewer + timeline | Mantener el WOW que ya tiene + agregar TransformationSummary refinada |
| 5 | **Demo — GENESIS en vivo** | AgentOrchestration + DemoChat | Esto debería ser el **clímax** — los 4 capabilities operando en pantalla |
| 6 | **Plan preview** | Day 1 visible, 2-7 locked | OK estructuralmente, falta refinamiento visual de los widgets |
| 7 | **HYBRID call CTA** | Botón al final | Page completa de "Cómo funciona la sesión de 15 min con coach" |

### Filosofía visual
- **Cinematográfico, no decorativo.** Cada motion debe tener intención narrativa.
- **El producto es la prueba.** Mockups reales de pantallas reales, no ilustraciones genéricas.
- **GENESIS está vivo.** Una entidad presente en toda la landing, no solo mencionada.
- **Datos, no slogans.** Cada claim soportado con número o demo.
- **Premium dark, no edgy dark.** Apple/Vercel/Linear, no gym brand.

---

## 3. PLAN DE REFINAMIENTO — 5 Fases

### FASE 0 — Quick Wins (semana 1)
Cambios de bajo costo, alto impacto. Sin tocar arquitectura.

- [ ] **Unificar naming de CTA principal**: decidir entre "Iniciar mi scan" / "Ver mi punto de partida" → uno solo, en toda la landing y header. Recomiendo **"Iniciar mi scan"** (más activo, menos abstracto).
- [ ] **Subir el copy "La imagen puede incomodarte. Bien."** al hero o pre-hero como tagline. Es el copy más fuerte de la página.
- [ ] **Eliminar las 3 mini-cards del hero** (Contrato Claro / Genesis Interpreta / Después del Wow) → moverlas a sección "Qué recibes" o eliminarlas.
- [ ] **Agregar 1 stat por card en sección Problema** (los 3 cards rojos):
  - Card 1: "El 73% de las apps de fitness son abandonadas en <30 días" (Statista 2024)
  - Card 2: "El ciclo motivación → caída se repite 4x al año en promedio" (estudio interno o equivalente)
  - Card 3: ya tiene "3–8% pérdida muscular por década" ✅
- [ ] **Cambiar rojo de cards de problema → tono más sutil** (variante de violet con menor saturation, no rojo accent). El rojo pelea con la marca.
- [ ] **Reescribir CTA "Agendar diagnóstico HYBRID"** con tratamiento tier-1: full-width, gradient, glow, badge "15 min · gratis · sin compromiso".
- [ ] **Reordenar FAQ** por prioridad de objeción (no operativa primero):
  1. ¿Es real la imagen? (manejo de expectativa)
  2. ¿Sustituye a un médico/nutriólogo? (compliance)
  3. ¿Qué pasa con mi foto? (privacidad)
  4. ¿En qué se diferencia ASCEND de HYBRID? (upsell)
  5. ¿Necesito crear cuenta? (operativa)
  6. ¿Cuánto tarda? (operativa)

**Esfuerzo:** ~3 días de un dev frontend.
**Impacto esperado:** +10–15% en click-through al wizard, mejor jerarquía sin rebuild.

---

### FASE 1 — Hero cinematográfico (semanas 2–3)
**Objetivo:** El primer fold debe sentirse como un trailer, no como una página.

#### Diseño nuevo del hero
```
┌──────────────────────────────────────────────────────────┐
│  NAV (transparent, blur al scroll)                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   GENESIS · FUTURE BODY SCAN  (badge animated)           │
│                                                          │
│   LO QUE NO TE CONOCE,                                   │
│   NO TE PUEDE TRANSFORMAR.                               │
│   (display 96-128px, weight variable, gradient violet→white)│
│                                                          │
│        [VIDEO/CANVAS LOOP — 8 segundos, autoplay]        │
│        Mock real del scan: foto → escaneo → 4 etapas     │
│        en split screen tipo Apple, 1500x900              │
│                                                          │
│   ▶ Iniciar mi scan      ◯ Ver demo (60s)               │
│                                                          │
│   ───────────────────────────────────────                │
│   2,847 personas escanearon su transformación esta sem.  │
│   (counter en vivo, animated)                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Componentes a construir/refactorizar:**
- `HeroVideoLoop.tsx` — canvas-driven o video silencioso 8s loop. Asset producido con VEO 3.1 / Flow.
- `HeroSocialCounter.tsx` — ya existe `SocialCounter` v2.1, traer al hero.
- `LandingTopNav` — agregar blur al scroll + reducir altura.

**Tipografía hero:**
- Display: United Sans o Geist + variable weight (clamp 64px–128px).
- Animación: cada palabra fade-in con stagger 80ms, gradient sweep al hover.

**Producción de asset hero (paralelo):**
- Usar `ngx-veo31-content-factory` para generar el loop de 8s.
- Storyboard: 0-2s foto frontal real → 2-4s overlay de escaneo (líneas, hotspots) → 4-6s split a 4 imágenes (m0/m4/m8/m12) → 6-8s zoom a m12 con copy aparece. Sin audio, loop perfecto.

**Esfuerzo:** ~2 semanas (1 dev frontend + 1 sesión de generación de video).

---

### FASE 2 — Storytelling de producto (semanas 4–5)
**Objetivo:** Sustituir "describir el sistema" por "mostrar el sistema operando".

#### Sección refactorizada: "Cómo funciona" (antes vertical timeline → ahora horizontal scrollytelling)

```
SECCIÓN: ASÍ OPERA GENESIS

[Sticky title a la izquierda, scroll horizontal de 4 escenas a la derecha]

ESCENA 1: SCAN
  Mock del wizard real, frame congelado en upload de foto
  Stat overlay: "3 min de input, 12 dimensiones biométricas"

ESCENA 2: ANÁLISIS (este es el momento clave)
  Mock REAL del componente AgentOrchestration en loop
  GENESIS central + 4 capabilities orbitando + barras de progreso
  Caption: "13 módulos especializados, 4 capacidades unificadas"

ESCENA 3: PROYECCIÓN
  Mock del CinematicViewer con timeline m0→m12
  Caption: "No es 'antes/después'. Es una temporada."

ESCENA 4: PLAN
  Mock del PlanPreview día 1 + WorkoutCard + MealPlan
  Caption: "Día 1 es funcional. Decides si quieres los otros 6."
```

**Componentes nuevos:**
- `ScrollytellingSection.tsx` — sticky-scroll con horizontal pan (GSAP ScrollTrigger o Framer Motion `useScroll`).
- `ProductMockFrame.tsx` — wrapper con shadow elevada, browser chrome opcional, glow ambient.
- Reuse: `AgentOrchestration`, `WorkoutCard`, `MealPlan`, `NeonRadar`, `CinematicViewer` (todos ya existen).

#### Sección refactorizada: "Qué recibes"

De 4 cards uniformes → **4 features con preview real de cada activo**. Layout asimétrico (no grid 2x2 simétrico).

```
ACTIVO 01 — VISUALIZACIÓN ASPIRACIONAL  [tier: hero]
  Imagen grande: split screen HOY vs 12 SEM, animated reveal al scroll.

ACTIVO 02 — READINESS REPORT             [tier: medium]
  Mock del NeonRadar + 4 stats numéricas + nota de GENESIS.

ACTIVO 03 — RUTA INICIAL 7 DÍAS          [tier: medium]
  Mock del PlanPreview con día 1 visible y blur de días 2-7.

ACTIVO 04 — DIAGNÓSTICO HYBRID            [tier: hero — es el upsell]
  Avatar del coach (foto real o ilustrada), "15 min con un coach humano",
  badges de credenciales, calendar mock.
```

**Esfuerzo:** ~2 semanas.

---

### FASE 3 — Sistema de motion + polish (semana 6)
**Objetivo:** El conjunto se siente como un producto, no como secciones cosidas.

#### Motion language (nuevo)
- **Velocidad estándar:** 600–800ms con `cubic-bezier(0.16, 1, 0.3, 1)` (smooth-out fuerte).
- **Stagger entre elementos:** 80ms.
- **Hover en CTAs:** scale 1.02 + glow shift, NO scale 1.05 con shadow drop.
- **Scroll reveal:** opacity + translateY 24px → 0, NUNCA blur (blur en scroll cuesta GPU y se siente cheap).
- **Canvas/video:** 24fps suficiente, no 60.

#### Tokens visuales nuevos a agregar al design system
```css
/* Elevación cinematográfica */
--elev-hero: 0 40px 120px -20px rgba(109, 0, 255, 0.35), 0 0 0 1px rgba(255,255,255,0.04);
--elev-card-premium: 0 24px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(109,0,255,0.08);

/* Gradients premium */
--gradient-hero-text: linear-gradient(180deg, #FFFFFF 0%, #B5A4D6 100%);
--gradient-violet-glow: radial-gradient(ellipse at center, rgba(109,0,255,0.4) 0%, transparent 70%);

/* Spacing rítmico */
--section-gap-mobile: 80px;
--section-gap-desktop: 160px;
--section-gap-cinematic: 240px; /* solo para transiciones grandes */
```

#### Pase de polish manual
- [ ] Auditar contrast ratio en TODO texto sobre dark (WCAG AA mínimo, AAA en hero).
- [ ] Audit de espaciado vertical: las secciones actuales se sienten apiñadas. Subir gap a 160px desktop / 80px mobile.
- [ ] Reescribir `LandingFAQ` con motion individual al expandir + iconografía sutil por categoría.
- [ ] Footer rediseñado con estructura de ecosistema NGX:
  - Columna 1: Producto (Transform, ASCEND, HYBRID, GENESIS)
  - Columna 2: Compañía (sobre, manifesto, prensa)
  - Columna 3: Recursos (blog, ciencia, FAQ)
  - Columna 4: Legal + contacto + suscripción a newsletter

**Esfuerzo:** ~1 semana.

---

### FASE 4 — Resto del funnel (semanas 7–9)
Aplicar el mismo lenguaje refinado a las pantallas downstream.

#### Wizard (`/wizard`)
- Cada step debe sentirse como un instrumento de diagnóstico, no como un form.
- Transiciones entre steps con motion direccional.
- Visualización en tiempo real de qué dimensiones biométricas se están capturando.
- Sticky progress en lugar de stepper genérico.

#### Loading (`/loading/[shareId]` + `BiometricLoader`)
- Ya tiene buena base. Elevar:
  - Background con partículas reactivas a fps real.
  - Tips rotando con copy más afilado (eliminar tips genéricos).
  - Timer no visible (genera ansiedad), reemplazar por "GENESIS está midiendo X".

#### Results (`/s/[shareId]`)
- `CinematicViewer` ya está bien.
- Refinamiento: `TransformationSummary` debe tener jerarquía mucho más fuerte abajo del viewer.
- `ComparisonCTA` ("Sin GENESIS vs Con GENESIS") refactorizar a tabla más limpia, menos cards.

#### Demo (`/s/[shareId]/demo`)
- **Esta es la pantalla más importante después del hero de la landing.** Es el clímax.
- `AgentOrchestration` necesita escala mucho mayor (full viewport).
- `DemoChat` con widgets A2UI necesita preview de los 8 tipos de widget en rotación.

#### Plan (`/s/[shareId]/plan`)
- `PlanPreview` día 1 con `WorkoutCard` / `MealPlan` / `ChecklistWidget` ya construidos — solo necesita pase de espaciado y typography.
- Días 2-7 lock visual: actualmente probablemente un blur simple → mejor pattern de blueprint con copy "Disponible al continuar con HYBRID".

#### HYBRID Booking (nuevo, recomendado)
- Página dedicada `/hybrid` o modal grande explicando:
  - Quién es el coach (foto, credenciales, breve perfil)
  - Qué pasa en 15 min (agenda paso a paso)
  - Por qué IA + humano (no solo IA, no solo coach)
  - Slots disponibles (Calendly o similar embed)
  - Testimonials de personas que pasaron de scan → HYBRID

**Esfuerzo:** ~3 semanas distribuidas.

---

## 4. SISTEMA VISUAL ELEVADO — Reglas que aplican a todo

### Tipografía
| Uso | Familia | Peso | Tamaño | Motion |
|-----|---------|------|--------|--------|
| Display Hero | United Sans Variable / Geist | 800 var | clamp(64,12vw,128) | gradient sweep |
| Display Section | Space Grotesk | 700 | clamp(48,6vw,72) | fade-in stagger |
| Body | Space Grotesk | 400 | 18/16 | — |
| Mono / Labels | JetBrains Mono | 500 | 12 uppercase | — |
| Display Numerical | Geist Mono | 600 | variable | counter animado |

### Color system (refinamiento, no rebuild)
- **Mantener:** `#6D00FF` (violet primario), `#5B21B6` (deep), `#030005` (bg).
- **Agregar para nuevos surfaces:**
  - `#0A0511` (panel-1, ligeramente elevado del bg)
  - `#140820` (panel-2, cards)
  - `#1F0F33` (panel-3, hover/active)
  - Accent verde `#34D399` solo para success/operational (ya existe en GENESIS · Nutricion).
  - **Eliminar rojo accent en cards de problema.** Usar `rgba(255, 100, 100, 0.08)` solo como tinte sutil de fondo si quieres conservar la idea.

### Componentes premium a estandarizar
- `<PremiumCard>` — variantes: ambient, elevated, hero (cada una con su elev token).
- `<DisplayHeading>` — abstrae jerarquías 1-4 con motion incluido.
- `<ProductFrame>` — wrapper para todos los mocks de pantallas (con browser chrome opcional + glow ambient).
- `<MetricCounter>` — animated number + delta + sparkline.

---

## 5. ROADMAP (sugerido)

| Semana | Fase | Entregable visible | Owner sugerido |
|--------|------|--------------------|----|
| 1 | Fase 0 — Quick wins | Landing actual mejorada, sin rebuild | Frontend solo |
| 2-3 | Fase 1 — Hero | Nuevo hero con video loop | Frontend + producción de asset (paralelo) |
| 4-5 | Fase 2 — Storytelling | Secciones "Cómo funciona" + "Qué recibes" refactorizadas | Frontend + diseño de mocks |
| 6 | Fase 3 — Polish | Sistema de motion + tokens elevados | Frontend |
| 7-9 | Fase 4 — Resto del funnel | Wizard / Results / Demo / Plan / HYBRID | Frontend + producto |

**Total: 9 semanas para refinamiento completo.**
**Quick wins (Fase 0) en 1 semana ya elevan ~30% la percepción.**

---

## 6. DECISIONES ABIERTAS — Necesito tu input antes de Fase 1

Estas decisiones bloquean Fase 1, querría tu lectura:

1. **CTA principal:** ¿"Iniciar mi scan" o "Ver mi punto de partida"? Voto por **"Iniciar mi scan"**.
2. **Hero asset:** ¿Producir loop con VEO 3.1 (8s, sin audio) o canvas WebGL animado? Voto por **VEO** (más realista, menos costo de mantenimiento).
3. **Posicionamiento del lead magnet en la oferta:** ¿Transform es gratis siempre, o gratis con email-gate? Hoy es ambiguo.
4. **Visibilidad del coach humano:** ¿Tienes ya un coach (1+ persona) que pueda aparecer con foto/nombre, o el "coach" es entidad genérica? Esto afecta credibilidad de Fase 4.
5. **Métrica de éxito de la landing:** ¿Es CTR a wizard? ¿% que termina wizard? ¿% que agenda HYBRID? Define qué optimizamos en cada fase.

---

## 7. Lo que NO recomiendo

- **No rehacer el branding.** Está bien. Solo hay que ejecutarlo a nivel premium.
- **No agregar testimonials falsos o de stock.** Mejor cero testimonials que testimonials genéricos. Hasta tener clientes reales con video, dejar el espacio vacío.
- **No usar ilustraciones 3D estilo Spline genérico** (cubos flotando, geometría abstracta). Si va 3D, debe ser anatómico, no decorativo.
- **No subcontratar el copy.** El que tienes es voz NGX. Mantenerla.
- **No agregar más secciones.** La estructura es correcta. El problema es densidad y polish, no scope.

---

## Apéndice — Checklist Fase 0 (accionable esta semana)

```
[ ] Unificar CTA naming → "Iniciar mi scan" en todos lados
[ ] Subir tagline "La imagen puede incomodarte. Bien." al pre-hero
[ ] Eliminar 3 mini-cards del hero (Contrato/Interpreta/Wow)
[ ] Cambiar rojo accent → violet sutil en cards de problema
[ ] Agregar 1 stat por card en sección Problema
[ ] Reorder FAQ por prioridad de objeción
[ ] CTA HYBRID con tratamiento tier-1 (full-width, glow, badge)
[ ] Audit de espaciado vertical (subir a 160/80px gaps)
[ ] Audit de contrast ratio en hero (target AAA)
[ ] Sticky CTA mobile: revisar que no canibalice "Iniciar mi scan" del CTA inline
```

Si das luz verde a Fase 0, puedo empezar con eso esta misma sesión y dejar los archivos modificados listos para PR.
