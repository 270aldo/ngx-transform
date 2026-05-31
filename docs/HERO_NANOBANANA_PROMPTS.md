# NGX Transform Hero — Nano Banana Pro Prompts (Aldo)
**Fecha:** Mayo 2026
**Source pattern:** `src/lib/promptBuilder.ts` (sistema de producción NGX)
**Reference image:** Foto de Aldo en bosque (la que ya probaste)
**Output esperado:** 4 keyframes 1920×1080, identity-locked, secuencia coherente

---

## Configuración base (alineada al promptBuilder de producción)

```
sex:                  male
goal:                 mixto         → "athletic superhero physique, balanced muscle mass with definition, wide shoulders, V-taper, functional strength appearance"
focusZone:            full          → balanced full-body development
aestheticPreference:  cinematic     → Nike commercial / Under Armour campaign aesthetic
bodyFatLevel:         medio
level:                intermedio
adherenceScore:       ~0.75 (alto)  → intensity "aggressive yet realistic", changes "pronounced"
```

**Identity anchor (auto-detectado de tu foto):**
> Adult Latin male, mid-to-late 30s, dark brown curly hair (medium length, natural texture), olive/medium skin tone, strong jawline, athletic-lean current build, clean-shaven or light stubble.

Nano Banana Pro extrae los rasgos exactos de tu foto de referencia. No los describas en el prompt — solo declara que deben preservarse.

---

## Estrategia de Chaining (CRÍTICO para identity consistency)

Cada keyframe usa el anterior como reference adicional, NO solo la foto original. Esto es lo que hace `nanobanana.ts` en producción (`m4 refs: [original, styleRef]`, `m8 refs: [original, styleRef, m4]`, etc).

| Keyframe | Reference images (uploadear en Nano Banana Pro) |
|----------|--------------------------------------------------|
| **K0** (m0) | Foto bosque (original) |
| **K1** (m4) | Foto bosque + K0 generado |
| **K2** (m8) | Foto bosque + K1 generado |
| **K3** (m12) | Foto bosque + K2 generado |

Si Nano Banana Pro permite múltiples reference images: usar 2-3 references por generación. Si solo permite 1: usar el keyframe inmediato anterior.

---

## K0 — m0 (HOY) · Frame 000 · Scroll 0%

**State:** Punto de partida real. Honesto. Sin filtros. El antes que vamos a transformar.

**Reference upload:** Foto del bosque.

```
Ultra-cinematic photography, 16:9 aspect ratio (1920x1080).

[IDENTITY LOCK - CRITICAL]
Subject: same exact person as the reference photo. Latin male, dark curly hair, olive skin, current athletic-lean build. PRESERVE EXACTLY: facial features, bone structure, nose shape, lip shape, eye shape and color, skin tone, hair color/texture/length, any distinguishing marks. NO sunglasses (remove if present in reference). The output MUST be recognizable as the SAME person.

[TRANSFORMATION: M0 - 0% PROGRESS — BASELINE]
Subject is at his current physical baseline. NO transformation yet. This is the honest starting point.
- Current body composition exactly as in reference
- No exaggerated muscle, no exaggerated leanness
- Natural posture, neither slouched nor heroic
- Wearing simple black athletic t-shirt (form-fitting cotton, no logos), neutral grey or black shorts

Environment: Common urban gym, late afternoon natural light filtering through industrial windows. Concrete walls, basic functional equipment in soft background blur (rack, dumbbells, mat). Not glamorous. Not luxury. A real gym.

Setting: Authentic, lived-in fitness space. Slightly dim, warm overhead lighting balanced with cool natural light from windows. NO violet ambient yet (too early in the journey).

Mood: Contemplative. Honest. The moment before commitment. The "maybe today" feeling.

[PHOTOGRAPHY STYLE]
Camera: 50mm prime lens, f/2.8, locked tripod, eye-level frontal medium-shot framing (waist up to head, centered). Subject occupies central 40% of frame.
Lighting: Natural window light from camera-left as main, soft fill from right. Honest, not flattering. No fashion lighting.
Color Grade: Neutral cinematic with slight warm undertones from gym lights. Slightly desaturated. Real-world look, not Instagram filtered.
Aesthetic: Documentary-style fitness photography. Think "before photo from a real client", not editorial.

[REALISTIC DETAILS]
- Natural skin texture with visible pores
- Neutral expression — slight intensity in the eyes, lips closed, looking directly at camera
- Hair natural (slightly tousled, real-life curl pattern)
- Posture relaxed but engaged, arms naturally at sides

[NEGATIVE - ABSOLUTELY AVOID]
- CGI, 3D render, plastic skin, waxy skin
- Cartoon, anime, illustration
- Sunglasses, hats, accessories
- Smiling, laughing, posed
- Studio lighting, glamour, beauty filter
- Bright neon colors, oversaturation
- Multiple subjects, crowd
- Watermarks, logos, text
- Identity drift, different person
- Outdoor setting, nature, forest, sunset
- Bodybuilder physique (he is at baseline, not peak)

Quality: 8K photorealistic, ultra-detailed, cinematic.
```

**Validation checklist for K0:**
- [ ] Es claramente Aldo (sin lentes de sol, sin sonrisa)
- [ ] El setting es gym, no bosque/exterior
- [ ] La complexión es realista a la actual (no exagerada)
- [ ] Iluminación honesta, no glamorosa
- [ ] Expresión neutral-determinada
- [ ] Framing waist-up frontal

---

## K1 — m4 (GÉNESIS) · Frame 040 · Scroll 33%

**State:** 4 semanas. Primeras señales de cambio. Foundation phase. La disciplina empezando a compounding.

**Reference upload:** Foto bosque + K0.

```
Ultra-cinematic photography, 16:9 aspect ratio (1920x1080).

[IDENTITY LOCK - CRITICAL]
Subject: SAME EXACT PERSON as reference photos (original + K0). Identical face, identical hair, identical skin tone, identical proportions of facial features. ONLY the body transforms — the face stays the same. Any face drift = FAILURE.

[TRANSFORMATION: M4 - 35% PROGRESS]
Target: athletic superhero physique progression. Subject is 4 weeks into structured training. Foundation phase.

[VISUAL DELTA - MUST BE VISIBLE COMPARED TO K0]
- Pronounced recomposition: tighter waist, slightly broader shoulders, improved posture
- Early visible muscle definition in deltoids and arms
- Trapezius beginning to develop
- Forearms slightly more defined
- Skin tone slightly improved (better hydration, training-induced microcirculation)
- Posture: shoulders back, chest slightly out, more confident stance
- Body fat slightly reduced (early shred)
- The CHANGES must be NOTICEABLE, not extreme. This is week 4, not week 12.

[ENVIRONMENT — PROGRESSION]
Setting: Gritty underground gym. Concrete walls, industrial pipes visible, exposed lightbulbs, chalk dust in the air. Chains, plates, weight racks in background. Warmer than K0 — this space has been EARNED through showing up.

Camera: SAME EXACT angle, distance, and framing as K0. Locked tripod, no movement, frontal medium shot.

Lighting: Single violet rim light at 25% intensity from back-left (color #6D00FF — NGX brand). Warm key light from front. Mix of industrial fluorescent and warm tungsten. Cinematic 35mm look.

Wardrobe: SAME black athletic t-shirt as K0 (consistency). Maybe slightly damp from training.

Mood: Awakening. Discipline starting to compound. The first signs that something is shifting.

[PHOTOGRAPHY STYLE]
Camera: 50mm prime lens, f/2.8, locked tripod
Aesthetic: Nike commercial pre-campaign, gritty gym aesthetic, training documentary style
Color Grade: Cinematic with deep blacks and vibrant highlights, hint of violet ambient

[REALISTIC DETAILS]
- Natural skin texture with pores
- Slight perspiration sheen on shoulders/forehead
- Determined, focused expression — eyes intense, lips closed
- Authentic muscle striations beginning to show, NOT exaggerated
- Hair natural (slightly damp from training)

[NEGATIVE - ABSOLUTELY AVOID]
- CGI, 3D render, plastic skin, video game look
- Cartoon, anime, illustration, painting
- Face drift, different person — face MUST be identical to reference
- Bodybuilder physique (too early, this is m4 not m12)
- Smiling, laughing, posed glamour
- Studio backdrop, fashion lighting
- Multiple subjects
- Watermarks, logos, text
- Sunglasses, hats, accessories
- Outdoor setting, nature

Quality: 8K photorealistic, ultra-detailed, cinematic.
```

**Validation checklist for K1:**
- [ ] Es la MISMA cara que K0 (identity preserved)
- [ ] Hay cambio físico VISIBLE pero realista (no físico-culturista)
- [ ] Setting cambió a gritty gym
- [ ] Violet rim light empieza a aparecer (sutil)
- [ ] Misma ropa que K0 (continuidad)
- [ ] Mismo framing y ángulo de cámara

---

## K2 — m8 (METAMORFOSIS) · Frame 080 · Scroll 66%

**State:** 8 semanas. Transformación clara. Athletic build emerging strongly. Punto medio del journey.

**Reference upload:** Foto bosque + K1.

```
Ultra-cinematic photography, 16:9 aspect ratio (1920x1080).

[IDENTITY LOCK - CRITICAL]
Subject: SAME EXACT PERSON as reference photos. Same face, same hair, same skin tone. Only body and setting evolve. Identity drift = FAILURE.

[TRANSFORMATION: M8 - 70% PROGRESS]
Target: athletic superhero physique, 8 weeks into structured training. Significant transformation in progress.

[VISUAL DELTA - MUST BE VISIBLE COMPARED TO K1]
- Pronounced athletic silhouette with clearly visible abs
- Broader shoulders, tighter waist, improved V-taper emerging
- Defined deltoids and chest, arms visibly thicker than K1
- Visible obliques and serratus
- Posture fully confident — chest forward, shoulders back, neutral spine
- Skin tone healthier (consistent training/nutrition compounding)
- Body fat clearly reduced from K1
- Symmetry improving — left and right sides balanced
- Changes are PRONOUNCED and ATHLETIC but still believable for 2 months of work

[ENVIRONMENT — PROGRESSION]
Setting: Lifestyle environment — urban rooftop or industrial loft at golden hour. NOT gym anymore. The training has expanded into lifestyle. Modern urban backdrop, concrete and steel, but with sky visible (open, not enclosed).

Camera: SAME EXACT angle, distance, and framing as K0/K1. Locked tripod, no movement.

Lighting: Strong violet ambient at 50% intensity (color #6D00FF and #B39AFF mix). Warm golden hour key light from camera-right. Dramatic but cinematic. Volumetric haze from urban environment.

Wardrobe: Upgraded slightly — black athletic technical shirt (premium athletic fabric, fitted, performance-cut, still simple, no big logos). Same black/grey shorts.

Mood: Transformation visible. The system is working. Confidence emerging. The midpoint of the season.

[PHOTOGRAPHY STYLE]
Camera: 50mm prime lens, f/2.8, locked tripod
Aesthetic: Nike commercial mid-campaign, lifestyle athletic photography, golden-hour cinematic
Color Grade: Deep cinematic blacks, vibrant violet highlights, warm golden ambient mix

[REALISTIC DETAILS]
- Natural skin texture with visible pores and definition
- Light perspiration sheen
- Focused intense expression
- Authentic muscle striations with cinematic shadow play
- Hair natural, slightly windswept from urban environment

[NEGATIVE - ABSOLUTELY AVOID]
- CGI, 3D render, plastic skin, video game graphics
- Cartoon, anime, illustration
- Face drift, different person — face MUST be identical to references
- Extreme bodybuilder mass (still 4 weeks from peak, save for K3)
- Smiling, posed glamour, fashion editorial pose
- Indoor gym (already moved past that — this is lifestyle)
- Multiple subjects, crowd
- Watermarks, logos, text
- Sunglasses, hats

Quality: 8K photorealistic, ultra-detailed, cinematic.
```

**Validation checklist for K2:**
- [ ] Misma cara que K0 y K1
- [ ] Cambio físico SIGNIFICATIVO comparado con K1 (no incremental sutil)
- [ ] Setting cambió a urban lifestyle (no gym)
- [ ] Violet ambient más presente
- [ ] Wardrobe ligeramente upgrade pero coherente con K0/K1

---

## K3 — m12 (PEAK) · Frame 119 · Scroll 100%

**State:** 12 meses. Peak transformation. Hero shot. La temporada completa visible. El "después" final.

**Reference upload:** Foto bosque + K2.

```
Ultra-cinematic photography, 16:9 aspect ratio (1920x1080).

[IDENTITY LOCK - CRITICAL]
Subject: SAME EXACT PERSON as all reference photos. Same face, same hair, same skin tone, same essential identity. Only body has fully transformed and setting is editorial. Face MUST be unmistakably the same person from K0.

[TRANSFORMATION: M12 - 100% PROGRESS — PEAK]
Target: COMPLETE METAMORPHOSIS. Athletic superhero physique at peak conditioning. 12 months of compound discipline visible in every fiber.

[VISUAL DELTA - MUST BE VISIBLE COMPARED TO K2]
- Heroic athletic build at peak conditioning
- Dramatic V-taper: broad chest and shoulders, tight waist, defined obliques
- Crisp definition throughout: visible abs (not extreme), defined chest, sculpted arms with clear bicep peak and tricep development
- Deltoids fully developed with visible heads (front, side, rear separation)
- Forearms, traps, lats all visible
- Body fat at competition-ready but realistic level (not stage-shredded, but lean and defined)
- Posture: fully confident, neutral spine, chest forward, slight contrapposto, hero stance
- Skin in peak condition (training/nutrition/sleep all compounding)
- 12 months of dedication visible — but realistic, not CGI superhero exaggeration

[ENVIRONMENT — PROGRESSION]
Setting: Editorial studio. Black void background (#030005 — NGX dark). Single subject, isolated, hero-framed. Every surface, texture, and material readable. Volumetric violet light rays from behind subject.

Camera: SAME EXACT angle, distance, and framing as K0/K1/K2. Locked tripod, no movement.

Lighting: Three-point cinematic setup. Violet key light from front-left (#6D00FF at full intensity). Soft violet fill from right (#B39AFF at 40%). Strong rim light from behind (creates separation from black background). Plus volumetric god rays from upper-back. This is the hero moment.

Wardrobe: Black premium athletic shirt (same family as K0/K1/K2 for continuity, but tighter fit revealing the transformation). Or shirtless if Nano Banana Pro supports it well — otherwise tight black tank top showing shoulders/arms/chest.

Mood: Transcendence. The temporada complete. Peak earned. The "after" that justified the discipline.

[PHOTOGRAPHY STYLE]
Camera: 50mm prime lens (consistency with prior frames), f/2.8, locked tripod
Aesthetic: ESPN Body Issue meets Nike hero campaign meets editorial fashion. Premium, cinematic, iconic.
Color Grade: Maximum cinematic depth — deep blacks, intense violet, crisp white highlights on muscle definition. The most dramatic of the four.

[REALISTIC DETAILS]
- Natural skin texture with pores and definition
- Light perspiration sheen on shoulders, chest, arms
- Intense focused expression — eyes locked forward, lips closed, slight tension in jaw
- Authentic muscle striations with full cinematic shadow play
- Visible vascularity on arms and shoulders (subtle, not extreme)
- Hair natural, the same curl pattern as reference

[NEGATIVE - ABSOLUTELY AVOID]
- CGI, 3D render, video game graphics, plastic skin
- Cartoon, anime, illustration, comic book style
- Face drift, different person — IDENTITY must match all references
- Stage-shredded competition bodybuilder look (too extreme, not believable)
- Smiling, posed glamour
- Outdoor setting, gym setting (this is editorial studio)
- Multiple subjects, mirrors, reflections
- Watermarks, logos, text other than subtle clothing brand
- Sunglasses, hats, accessories
- Oversaturated neon, RGB gaming lights (only NGX violets)

Quality: 8K photorealistic, ultra-detailed, cinematic. The hero shot of the entire scrollytelling sequence.
```

**Validation checklist for K3:**
- [ ] Sigue siendo claramente Aldo (identity preserved a 100%)
- [ ] Transformación física es DRAMÁTICA pero believable
- [ ] Setting editorial studio con violet volumetric light
- [ ] Es el frame más cinematográfico de los 4
- [ ] Mismo framing y ángulo de cámara que K0-K2

---

## Coherencia con el producto NGX Transform actual

Estos prompts usan **el mismo framework** que `src/lib/promptBuilder.ts` produce para usuarios reales:

| Componente del promptBuilder | Aplicado al hero |
|------------------------------|------------------|
| `buildIdentityLock()` | ✅ Sección [IDENTITY LOCK - CRITICAL] en cada keyframe |
| `buildTransformation()` con goal=mixto, sex=male, focusZone=full | ✅ Visual Delta + Target physique en cada step |
| `buildVisualDelta()` con score "pronounced" | ✅ Cambios pronunciados en cada delta |
| `ENVIRONMENT_BY_STEP` (gym → lifestyle → editorial) | ✅ Progresión de setting respetada |
| `buildStyle()` con aesthetic=cinematic | ✅ Nike commercial style, 50mm lens, color grade cinematográfico |
| `buildNegativePrompt()` | ✅ Anti-CGI, anti-face-drift, anti-cartoon, etc |
| `buildDetails()` | ✅ Pores, sweat, focused expression, muscle striations |

**Diferencias intencionales del hero vs producto:**
1. **Hero agrega K0 generado** (el producto usa la foto real del usuario como m0).
2. **Hero usa NGX violet rim light** progresivo (#6D00FF → #B39AFF) — el producto usa lighting según `styleProfile`.
3. **Hero mantiene framing IDÉNTICO** entre los 4 (locked tripod) — para que VEO 3.1 pueda interpolar suave. El producto puede variar framing.
4. **Wardrobe consistente** entre los 4 keyframes — para que la transformación se lea como evolución del MISMO momento, no fotos distintas.

---

## Próximo paso — VEO 3.1

Cuando tengas los 4 keyframes aprobados (validation checklists completos):

1. **Subir a Flow** los 4 keyframes en orden (K0, K1, K2, K3).
2. **Strategy:** Segments (3 clips × 8s) — más control que single 22s.
3. **Prompts VEO 3.1:** te los entrego en cuanto valides los keyframes (los hago específicos a tu output, no genéricos).
4. **Constraint crítico:** "ABSOLUTELY STATIC CAMERA. Camera bolted to floor. Zero pan, tilt, dolly, zoom." Si VEO mete movimiento, regenerar.
5. **Concatenar 3 clips** con ffmpeg → 1 mp4 de ~24s.
6. **Pasarme el .mp4** → yo extraigo 120 WebP con la skill.

---

## Copy overlay sincronizado al scroll (preview)

Cuando esté el video y los 120 frames, el componente `HeroCinematicReveal` muestra esto sincronizado:

| Scroll % | Frame | Copy overlay (NGX brand) |
|----------|-------|--------------------------|
| 0-25% | 000-029 | **Display:** "LO QUE NO TE CONOCE" · **Mono label:** "GENESIS · FUTURE BODY SCAN" |
| 25-50% | 030-059 | **Display:** "GENESIS empieza a escanear" · **Stats:** "Semana 4 · +2.1kg masa magra · -1.4% grasa" |
| 50-75% | 060-089 | **Display (left):** "12 SEMANAS NO ES UN PROGRAMA" · **Stats:** "Semana 8 · resistencia +18% · sueño +22min/noche" |
| 75-100% | 090-119 | **Display (right):** "ES UNA TEMPORADA." + **Mega CTA:** "Iniciar mi scan →" · **Stats:** "Mes 12 · +6.8kg masa magra · resting HR -8 bpm" |

(Todo customizable — esto es el draft inicial.)
