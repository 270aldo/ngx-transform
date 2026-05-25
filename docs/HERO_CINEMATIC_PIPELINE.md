# NGX Transform — Hero Cinematic Reveal Pipeline
**Sub-plan de:** REFINAMIENTO_VISUAL_PLAN.md (Fase 1)
**Tech stack:** VEO 3.1 + Nano Banana Pro + ffmpeg + Canvas Scroll Engine
**Skill base:** `cinematic-reveal-studio` (ya instalada)
**Owner:** Aldo / NGX
**Fecha:** Mayo 2026

---

## 1. La idea en una línea

**El usuario llega a la landing y, al hacer scroll, el cuerpo de Aldo (o talent NGX) se transforma frame-a-frame de m0 → m4 → m8 → m12. La transformación está sincronizada al scroll vertical: tú controlas el tiempo, tú vives la metamorfosis.**

No es un video que se reproduce. Es **una temporada de 12 semanas comprimida en un scroll**.

Nadie en fitness está haciendo esto. Apple lo hace con producto (Vision Pro). Tesla lo hace con producto. Nosotros lo hacemos con **persona**. Eso solo, ya es diferenciador.

---

## 2. Por qué esto es estratégicamente correcto, no solo bonito

| Argumento | Por qué importa |
|-----------|-----------------|
| **Demuestra el producto, no lo describe** | El lead magnet vende una proyección de 12 semanas. Si no la enseñas en el primer fold, estás escribiendo un ensayo, no vendiendo. |
| **Engagement metric directo** | Scroll-depth = engagement medible. No es CTR teatral, es atención sostenida. |
| **Compatible con tu stack actual** | Next.js 16 + Canvas + Framer Motion. No agrega libs nuevas. La skill empaqueta el patrón. |
| **Bajo costo marginal de iteración** | Una vez producido el video con VEO 3.1, cambiar copy/timing/CTAs es cosmético. El asset pesado ya existe. |
| **Asset reutilizable** | Los 120 frames + el video sirven para ads (TikTok/IG/YouTube), email D0, OG image, podcast intro, presentaciones a inversionistas. ROI multi-canal. |
| **Establece el tono del resto del producto** | Cuando llegues al wizard, results, demo — todo se siente parte del mismo universo cinematográfico. |

---

## 3. La skill `cinematic-reveal-studio` — qué entrega

```
PIPELINE OFICIAL
─────────────────────────────────────────────────
[1] generate-keyframes    → 4 prompts (Nano Banana Pro)
[2] generate-video        → 1 video 22s o 3 clips 8s (VEO 3.1)
[3] extract-frames        → 120 WebP @ 1920x1080
[4] scaffold-reveal       → Next.js 14 project boilerplate
[5] customize-narrative   → tokens.ts (Hook/Thesis/Science/Pillars/Vehicle/CTA)
[6] build-reveal          → Componente React con canvas scroll engine
[7] deploy-reveal         → Vercel one-click
```

**Adaptaciones para NGX** (no usar la skill al 100%):
- ❌ NO usar `scaffold-reveal` ni `deploy-reveal` — ya tenemos Next.js 16 corriendo. **Portamos el patrón al `LandingHero` existente.**
- ✅ SÍ usar `generate-keyframes` + `generate-video` + `extract-frames` (son la receta de producción).
- ✅ SÍ adaptar `build-reveal` como referencia — pero implementación dentro de `src/components/landing/LandingHero.tsx`.
- ✅ SÍ tomar `customize-narrative` como inspiración para estructura del copy overlay.

---

## 4. El ajuste narrativo crítico

La skill genérica usa estados de "android activation" (dormant → ignition → analysis → full power). Eso NO sirve para NGX. **Hay que reescribir los 4 keyframes para nuestro caso.**

### Mapeo NGX

| Frame | Skill original | NGX Transform |
|-------|---------------|---------------|
| K0 — Frame 000 | Dormant (oscuro) | **m0 — HOY**: foto real del talent, gym común, ropa neutra, iluminación honesta, sin filtros. La promesa: "este es el punto de partida real". |
| K1 — Frame 040 | Ignition (glow inicial) | **m4 — GÉNESIS**: gritty underground gym, definición inicial, postura más confiada, violet rim light al 25%. Overlay de escaneo biométrico empieza a aparecer. |
| K2 — Frame 080 | Analysis (UI holográfica) | **m8 — METAMORFOSIS**: lifestyle setting (calle/parque/urbano), desarrollo muscular medio, piel/postura saludables, violet ambient al 50%. Holograms de NeonRadar visibles a los lados. |
| K3 — Frame 119 | Full Power (peak) | **m12 — PEAK**: editorial studio, hero pose, peak athletic form (realista, no bodybuilder a menos que el target lo pida), violet volumetric light al 100%. CTA "Iniciar mi scan" aparece en sync. |

### Sincronización scroll → frame → copy

```
0% scroll   ───► Frame 000 ───► Copy: "LO QUE NO TE CONOCE"
                                    (display 96-128px, fade-in)

25% scroll  ───► Frame 030 ───► Copy: "GENESIS empieza a escanear"
                                    (label mono + overlay de hotspots biométricos en canvas)

50% scroll  ───► Frame 060 ───► Copy: "12 SEMANAS NO ES UN PROGRAMA."
                                    (display 64-96px, glass card a la izquierda)
                                    Stats animados: "Semana 4 · +2.1kg masa magra · -1.4% grasa"

75% scroll  ───► Frame 090 ───► Copy: "ES UNA TEMPORADA."
                                    (display 64-96px, glass card a la derecha)
                                    Stats: "Semana 8 · resistencia +18% · sueño +22min/noche"

100% scroll ───► Frame 119 ───► Copy final + CTA
                                    "NO TE PUEDE TRANSFORMAR."
                                    [Iniciar mi scan →]  [Ver demo 60s]
                                    Stats peak: "Mes 12 · +6.8kg masa magra · resting HR -8 bpm"
```

**Regla de oro de los overlays (de la skill, aplicable):**
> El texto NUNCA cubre la cara/torso del talent. Posicionamiento `left/right/center-bottom` para cada sección.

---

## 5. Decisión bloqueante #1 — ¿Quién es el talent?

| Opción | Pros | Contras | Costo |
|--------|------|---------|-------|
| **A. Aldo (founder)** | Autenticidad máxima. Founder-led como Hormozi/Naval/Altman. Refuerza marca personal de NGX. Story coherente. | Tu cara aparece en cada visita. No escala a usuarias mujeres. | 1 sesión foto + producción. |
| **B. Talent profesional contratado** | Más inclusivo (1 hombre + 1 mujer = 2 secuencias). Sin baggage personal. | Pierde autenticidad founder. Costo 2-3x. | 2 sesiones + casting. |
| **C. Híbrido (Aldo hero + grid abajo)** | Lo mejor de ambos. Hero personal + testimonios diversos abajo. | Doble producción. | 3-4 sesiones. |

**Mi recomendación:** **A (Aldo)** para la primera versión. Es lo que hace que esta landing sea ÚNICA. Cualquier talent contratado se siente stock. Tu cara como CEO es el moat. En v2 agregamos secuencias diversas debajo (grid de "otras transformaciones reales").

---

## 6. Pipeline de producción — 11 días

### Día 1 — Sesión fotográfica base (K0)
**Objetivo:** Tener la foto real de Aldo en estado m0 que sea ANCLA visual de los 4 keyframes.

- **Setting:** Gym común, no de lujo. Iluminación honesta (no glamorosa). Mensaje: "este es el punto de partida real, sin filtros".
- **Wardrobe:** Negro o gris neutro, ajustado pero no apretado. Sin logos. Pantaloneta athletic + camiseta lisa.
- **Tomas requeridas:**
  - Frontal cuerpo completo (será K0)
  - Frontal medio (backup)
  - Perfil (referencia para identity chain)
- **Tech:** Cámara mirrorless full-frame, 50mm, RAW, ISO bajo, key + fill + rim violet (#6D00FF) a baja intensidad.
- **Output:** 3 fotos editadas a 4K, fondo gym real (no recortado).

**Quién:** Aldo + fotógrafo (1 día).

---

### Día 2-3 — Generar K1, K2, K3 con Nano Banana Pro
**Skill:** `cinematic-reveal-studio:generate-keyframes` adaptada.

**Anchors de consistencia (NO cambian entre frames):**
- Cara/identidad de Aldo (chaining estricto: cada frame referencia el anterior)
- Tono de piel
- Color y peinado
- Marcas distintivas (tatuajes, lunares)
- Composición frontal, framing medium shot

**Lo que SÍ cambia:**
- Composición corporal (% grasa, masa muscular) — gradual, realista
- Postura (gradualmente más confiada)
- Setting (gym → urbano → studio)
- Iluminación (rim violet 25% → 50% → 100%)
- Wardrobe (idéntico K0-K1, levemente más definido K2-K3)

**Prompt template (K1, ejemplo):**
```
Reference: K0 (Aldo en gym común, m0).

Same exact subject, identical face, identical proportions, identical hair.

State: 4 weeks of structured training (m4 — GÉNESIS phase).

Visual changes:
- Subtle muscle definition emerging (trapezius, deltoids, forearms)
- Slightly leaner facial contour (not dramatic)
- Posture more confident, shoulders back
- Skin tone slightly improved (better hydration)

Setting: Gritty underground gym, concrete walls, industrial lighting,
chains and weights visible in background. Warmer than K0.

Lighting: Single violet rim light (#6D00FF) at 25% intensity from back-left.
Soft key fill from front. Cinematic 35mm look.

Camera: IDENTICAL to K0 — same angle, same distance, same framing.

Style: Photorealistic, 8K, cinematic color grade.
Mood: Awakening. Discipline starting to compound.
```

K2 y K3 siguen el mismo patrón con escalado progresivo.

**Output esperado:** 4 keyframes de 1920x1080, identity-locked, secuencia visual coherente.

**Quién:** Yo (Claude) genera prompts, Aldo ejecuta en Nano Banana Pro / Whisk.

---

### Día 4-5 — Generar video con VEO 3.1
**Skill:** `cinematic-reveal-studio:generate-video` con strategy "segments".

**Estrategia:** 3 clips de 8s cada uno (porque VEO tiene límite de duración).

- **Clip 1 (K0 → K1):** transición sutil. Cámara LOCKED. Cuerpo cambia gradualmente. Background gym fade-in de elementos urbanos.
- **Clip 2 (K1 → K2):** transición intermedia. Setting transition gym → urban. Lighting más violet.
- **Clip 3 (K2 → K3):** transición final. Reveal editorial. Hero moment al final.

**Constraint crítico (de la skill):** "ABSOLUTELY STATIC CAMERA. Camera bolted to the floor. Zero movement of any kind." Si VEO mete movimiento de cámara, ROMPE el effect.

**Concatenación:**
```bash
ffmpeg -f concat -safe 0 -i clips.txt -c copy ngx_transform_reveal.mp4
```

**Output:** 1 video de 24s, 1920x1080, 24fps, sin audio.

**Quién:** Aldo en Flow (interface de VEO 3.1).

---

### Día 6 — Extraer 120 frames WebP
**Skill:** `cinematic-reveal-studio:extract-frames`.

```bash
# Comando one-liner (ya documentado en la skill)
VIDEO="ngx_transform_reveal.mp4" PREFIX="ngx" \
  && mkdir -p public/sequence \
  && DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO") \
  && for i in $(seq 0 119); do \
       TS=$(python3 -c "print(f'{($i/119)*$DURATION:.4f}')"); \
       ffmpeg -y -ss "$TS" -i "$VIDEO" -vframes 1 -c:v libwebp -quality 82 \
         "public/sequence/ngx_$(printf '%03d' $i).webp" 2>/dev/null; \
     done
```

**Output:**
- 120 archivos `public/sequence/ngx_000.webp` … `ngx_119.webp`
- Tamaño total esperado: 12-18 MB
- Background sample: debe ser cercano a `#030005` (NGX bg) o ajustamos token

**Quién:** Yo (Claude) ejecuto en bash + valido secuencia + reporto.

---

### Día 7-9 — Implementación en `LandingHero.tsx`
**Refactor:** El `LandingHero` actual se reemplaza por componente con canvas scroll engine.

**Estructura:**
```
src/components/landing/
  LandingHero.tsx            (refactorizado)
  hero/
    HeroCinematicReveal.tsx  (nuevo — el canvas engine)
    HeroOverlayHook.tsx      (frame 0-30)
    HeroOverlayThesis.tsx    (frame 30-60)
    HeroOverlayScience.tsx   (frame 60-90)
    HeroOverlayCTA.tsx       (frame 90-119)
    HeroPreloader.tsx        (loading state)
```

**Key technical points:**
- `useScroll` + `useMotionValueEvent` (Framer Motion) para mapping scroll → frame
- Canvas absoluto, sticky 100vh, scroll container = `300vh` o `400vh` (cuanto más scroll, más control fino)
- Preload de 120 imágenes con `Promise.all` antes de revelar contenido
- `requestAnimationFrame` para drawImage (cancel previous antes de programar nueva)
- Reduced-motion fallback: si `prefers-reduced-motion: reduce` → mostrar K0 + K3 split + skip animation

**Tokens NGX a aplicar (NO usar tokens de la skill):**
- bg: `#030005` (NGX existente)
- accent primary: `#6D00FF`
- accent deep: `#5B21B6`
- typography: Space Grotesk + United Sans + JetBrains Mono (ya en proyecto)
- panel surfaces: `#0A0511` / `#140820` (nuevos del plan general)

**Mobile fallback:**
- En viewports `< 768px`: NO scroll-driven canvas (lag en mid-tier devices).
- Mostrar video silencioso `<video autoplay loop muted playsinline>` con poster K0.
- Copy overlays adaptados a layout vertical.
- 1 CTA único centrado.

**Quién:** 1 frontend dev (yo o tu team), 3 días.

---

### Día 10 — QA y polish
- [ ] Performance: LCP < 2.5s (lazy load de frames excepto K0)
- [ ] CLS = 0 (canvas tiene dimensiones fijas)
- [ ] Total page weight: cumple < 5MB en first viewport (frames se preloadean en background)
- [ ] Accessibility: respeta `prefers-reduced-motion`
- [ ] Cross-browser: Chrome / Safari / Firefox / Edge
- [ ] Mobile: iPhone 13+ / Android mid-tier (Pixel 6 / Samsung A5x)
- [ ] Scroll feel: smooth en trackpad, smooth en mouse wheel, no jank en mobile

**Quién:** Tester + Aldo (review final).

---

### Día 11 — Deploy + asset reuso
- [ ] PR a `main`, deploy a staging
- [ ] Lighthouse audit (target: Performance > 85, A11y > 95)
- [ ] Si pasa → deploy producción
- [ ] **Reusar el video original (24s) para:**
  - Ad creative IG/TikTok (cortar a 15s/30s)
  - YouTube intro (10s teaser)
  - Email D0 hero image (animated GIF de 3-5 frames clave)
  - OG image (split K0 vs K3)
  - Podcast intro asset

---

## 7. Cómo se ancla con el resto del refinamiento

```
┌─────────────────────────────────────────────────────────────┐
│ HERO CINEMATIC (este pipeline)                              │
│ scroll 0–100% del primer viewport                           │
│ resultado: usuario ve la transformación m0→m12              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ SCROLLYTELLING DE PRODUCTO (Fase 2 del plan general)         │
│ "ASÍ OPERA GENESIS"                                          │
│ 4 escenas horizontales:                                      │
│   1. Scan (mock wizard)                                      │
│   2. Análisis (mock AgentOrchestration)                      │
│   3. Proyección (mock CinematicViewer)                       │
│   4. Plan (mock PlanPreview día 1)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ "QUÉ RECIBES" REFACTORIZADO                                  │
│ 4 activos con previews reales (Readiness, Plan, etc)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ "EL PUENTE IA + COACH"                                       │
│ CTA HYBRID con tratamiento tier-1                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                       FAQ + CTA final
```

**El arco narrativo completo:**
1. **Promesa visual** (hero cinematic) — esto es lo que podrías construir
2. **Mecánica del sistema** (scrollytelling) — así lo construyes
3. **Activos del lead magnet** (qué recibes) — esto te llevas hoy gratis
4. **Bridge IA + coach** (HYBRID) — y si quieres ejecutarlo, hay un humano
5. **CTA final** + objection-handling FAQ

Cada sección **sostiene** la promesa de la anterior. Sin el hero cinemático, las secciones siguientes son texto. CON el hero, son evidencia.

---

## 8. Riesgos & mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| **Identity drift entre frames AI** (Aldo se ve "diferente" entre K1 y K2) | Media | Alto | Chaining estricto en Nano Banana Pro. Cada keyframe usa el anterior como reference. Aprobación manual antes de pasar al siguiente. |
| **VEO 3.1 mete movimiento de cámara** | Media | Alto | Prompt explícito "ABSOLUTELY STATIC CAMERA". Si pasa: regenerar con K0 como reference image dual (start + reference). |
| **120 frames = 18MB → mobile 3G/4G mediocre** | Media | Medio | Preload progresivo (no Promise.all bloqueante). Mobile fallback con video corto 5MB. |
| **Talent (Aldo) no quiere que su cara sea "la cara" del lead magnet** | Baja (tú dijiste sí) | Alto | Decisión #1 abajo. Plan B: talent contratado. |
| **Resultado AI se ve "fake" / uncanny valley** | Media | Alto | K0 es foto REAL no AI. Solo K1-K3 son AI. La continuidad cinematográfica funciona porque empieza de algo verdadero. Si K3 se ve fake → regenerar con prompt menos extremo (atletic, not bodybuilder). |
| **VEO 3.1 cuotas/tiempos de generación** | Media | Medio | Generar de día 4, dejar processing overnight. Backup: Runway Gen-3. |
| **Performance scroll en mobile lag** | Alta | Medio | Mobile fallback NO scroll-driven. Video loop simple. |

---

## 9. 3 Decisiones que necesito de ti antes de arrancar

### Decisión 1 — Talent
**¿Aldo o talent contratado?**

Recomendación: **Aldo**. Es el moat. Lo cambiamos en v2 si los datos dicen otra cosa.

### Decisión 2 — Setting/wardrobe del K0
**¿Qué gym? ¿Qué ropa? ¿Cuándo podemos hacer la foto?**

Necesito saber:
- ¿Tu gym actual o uno locado?
- ¿Próximas 2 semanas tienes 1 día disponible para producción?
- ¿Producción interna o con fotógrafo externo?

### Decisión 3 — Tono del peak (K3)
**¿Hasta dónde llevamos el peak físico?**

- **Conservador:** atleta sano y definido (Brad Pitt en Fight Club, no Cristiano Ronaldo)
- **Aspiracional:** atleta competitivo (CR7, Hugh Jackman en Wolverine)
- **Extremo:** físico-culturista (NO recomiendo, rompe credibilidad y target demo 30-60)

Recomendación: **Aspiracional**. Suficientemente impresionante para mover, suficientemente realista para creer.

---

## 10. Próximo paso ejecutable HOY

Si me das luz verde a las 3 decisiones, lo siguiente que hago en esta misma sesión:

1. **Generar los 4 prompts finales de Nano Banana Pro adaptados a NGX** (no genéricos), con anchors de consistencia exactos.
2. **Generar los 3 prompts de VEO 3.1 (segments strategy)** con copy específico para tu setting y wardrobe.
3. **Producir un storyboard visual** de cómo se ve cada frame + copy overlay sincronizado, para que apruebes la dirección antes de gastar tokens en Nano Banana / VEO.
4. **Crear el archivo `lib/heroTokens.ts`** con la estructura de SECTIONS / COPY / TOKENS adaptada a NGX.

Eso te deja con todo listo para ejecutar producción (sesión foto + AI generation) en cuanto agendes el día.
