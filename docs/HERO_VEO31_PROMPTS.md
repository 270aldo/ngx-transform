# NGX Transform Hero — VEO 3.1 / Flow Prompts
**Strategy:** Segments (3 clips × 8s) — máximo control de transición
**Reference frames:** K0, K1, K2, K3 (aprobados)
**Output esperado:** 3 mp4 de 8s cada uno → concatenados a 1 mp4 de ~24s
**Aspect ratio:** 16:9 · Resolution: 1920×1080 · Sin audio

---

## Pre-flight checklist (antes de subir a Flow)

- [ ] **Alinear verticalmente los 4 keyframes**: recortar al mismo crop, centro de cara/cabeza en el mismo punto Y (~35% desde arriba) en los 4. Tool: Photoshop / Pixelmator / `Magick mogrify -crop`.
- [ ] **Mismo aspect ratio exacto**: 1920×1080 en los 4. Si alguno está a 1916×1080 o similar, igualar.
- [ ] **Mismo nombre de archivo legible**: `K0_m0.png`, `K1_m4.png`, `K2_m8.png`, `K3_m12.png`.

---

## Configuración general (aplica a los 3 clips)

| Parámetro | Valor |
|-----------|-------|
| **Camera** | ABSOLUTELY STATIC — locked tripod, zero pan/tilt/dolly/zoom |
| **Duration** | 8s por clip |
| **Aspect ratio** | 16:9 |
| **Color palette** | NGX violet (`#6D00FF`, `#B39AFF`) + black (`#030005`). NO cyan, blue, green, red, orange. |
| **Subject anchoring** | Subject's head at same vertical position throughout (~35% from top). Subject centered horizontally. |
| **Motion type** | Body morph + environment morph + lighting morph. NO camera movement. NO subject pose change. |
| **Audio** | None (silent — agregamos audio en post si decidimos) |
| **Style** | Photorealistic, cinematic, 8K, no CGI/cartoon |

---

## CLIP 1 — K0 → K1 (m0 → m4)
**Duration:** 8s · **Start image:** K0 · **End image (if Flow supports):** K1

```
PROMPT FOR VEO 3.1 / FLOW:

ABSOLUTELY STATIC CAMERA. Locked tripod, bolted to floor. Zero pan, tilt, dolly, zoom or any camera movement whatsoever. Surveillance-style fixed perspective.

Subject's head and torso remain at the EXACT same vertical position throughout the entire 8 seconds. Subject is anchored centrally in frame.

The subject is the same Latin male with curly dark hair, olive skin, athletic-lean build. His face, hair, skin tone, and identity remain IDENTICAL throughout — no face drift, no identity change. Only his body and surroundings transform.

Over 8 seconds, the following changes happen GRADUALLY and CONTINUOUSLY:

Body transformation (subtle, weeks 1-4 of training):
- Slight increase in shoulder breadth and deltoid definition
- Trapezius beginning to develop
- Forearms and biceps showing early definition
- Waist tightening slightly
- Posture shifts from relaxed-friendly to confident-engaged
- Facial expression transitions from soft warm smile to focused, determined neutral (lips closing, intensity emerging in the eyes)

Environment transformation:
- Common urban gym (cool natural window light, dumbbells, rack) gradually transforms into a gritty underground gym (concrete walls, industrial pipes, exposed tungsten bulbs, chains visible)
- Window light fades, tungsten warm light becomes dominant
- Subtle violet rim light (color #6D00FF) emerges from back-left, growing from 0% to 25% intensity over the 8 seconds
- Atmospheric haze with light particle motes appearing in the air

Wardrobe: black t-shirt remains identical, slight perspiration sheen developing on shoulders.

CRITICAL CONSTRAINTS:
- Camera must NOT move. Zero camera motion of any kind.
- Background stays in dark/cinematic palette throughout. Pure black areas remain near #030005.
- Color palette: only violet (#6D00FF, #B39AFF), warm tungsten (subtle), and dark blacks. NO blue, cyan, green, red, orange, yellow.
- Subject's facial identity remains IDENTICAL — same person, same face, same hair throughout.
- Transitions are smooth and continuous, never abrupt. No cuts, no jumps.
- Subject position and scale remain constant.

Style: Photorealistic, cinematic 35mm, 8K quality, Nike commercial documentary aesthetic.
Duration: 8 seconds. Aspect ratio: 16:9.
```

---

## CLIP 2 — K1 → K2 (m4 → m8)
**Duration:** 8s · **Start image:** K1 (or last frame of Clip 1) · **End image (if Flow supports):** K2

```
PROMPT FOR VEO 3.1 / FLOW:

ABSOLUTELY STATIC CAMERA. Locked tripod, bolted to floor. Zero pan, tilt, dolly, zoom or any camera movement whatsoever. Continuing from Clip 1's final state.

Subject's head and torso remain at the EXACT same vertical position throughout the entire 8 seconds. Subject is anchored centrally in frame.

Same Latin male, same face, same hair, same skin tone. Identity IDENTICAL throughout. Only body and environment evolve.

Over 8 seconds, the following changes happen GRADUALLY and CONTINUOUSLY:

Body transformation (weeks 4-8 of training, mid-journey):
- Pronounced V-taper emerging — shoulders broaden, waist tightens
- Visible chest development
- Arms become noticeably more defined — biceps, triceps, deltoids all evolving
- Athletic silhouette becoming clear
- Posture fully confident — chest forward, shoulders back, neutral spine
- Facial expression remains focused-determined throughout

Environment transformation (gritty gym → urban rooftop golden hour):
- Concrete gym walls gradually open up to reveal urban skyline
- Industrial pipes and exposed bulbs fade into modern city architecture
- Tungsten warm light blends with golden hour sunlight from camera-right
- Concrete column with violet ambient light appears on camera-left
- City skyline (modern skyscrapers) materializes in soft background blur
- Sky becomes visible — pre-sunset golden tones blending into violet ambient

Lighting transformation:
- Violet rim light intensifies from 25% to 50% (color #6D00FF and #B39AFF mix)
- Golden hour key light from camera-right warms the subject
- Violet ambient bleeds onto concrete surfaces

Wardrobe: black t-shirt remains, fitted athletic cut becoming more visible as the build develops.

CRITICAL CONSTRAINTS:
- Camera must NOT move. Zero camera motion of any kind.
- Color palette: only violet (#6D00FF, #B39AFF), warm golden hour, and dark cinematic tones. NO blue, cyan, green, red, orange.
- Subject's face IDENTICAL throughout. Same person, same identity.
- Transitions smooth and continuous. The environment morphs naturally, not abruptly.
- Subject position and scale remain constant — head at same Y position throughout.

Style: Photorealistic, cinematic, 8K, Nike commercial mid-campaign aesthetic, lifestyle athletic photography.
Duration: 8 seconds. Aspect ratio: 16:9.
```

---

## CLIP 3 — K2 → K3 (m8 → m12)
**Duration:** 8s · **Start image:** K2 (or last frame of Clip 2) · **End image (if Flow supports):** K3

```
PROMPT FOR VEO 3.1 / FLOW:

ABSOLUTELY STATIC CAMERA. Locked tripod, bolted to floor. Zero pan, tilt, dolly, zoom or any camera movement whatsoever. Continuing from Clip 2's final state.

Subject's head and torso remain at the EXACT same vertical position throughout the entire 8 seconds. Subject is anchored centrally in frame.

Same Latin male, same face, same hair, same skin tone. Identity ABSOLUTELY identical throughout. Only body and environment reach peak.

Over 8 seconds, the following changes happen GRADUALLY and CONTINUOUSLY:

Body transformation (weeks 8-12, peak conditioning):
- Heroic athletic peak: dramatic V-taper, broad chest and shoulders, tight defined waist
- Arms reach peak definition — visible bicep peak, tricep development, defined deltoids (front, side, rear separation)
- Forearms, traps, lats fully visible
- Slight visible vascularity on arms and shoulders (subtle, realistic)
- Athletic peak conditioning — competition-ready but believable, not stage-shredded
- Posture: full hero stance, chest forward, slight contrapposto

Wardrobe transformation:
- Black t-shirt gradually transitions to black athletic tank top
- Reveals shoulders and arms in their peak development by the end

Environment transformation (urban rooftop → editorial studio black void):
- City skyline and concrete columns gradually fade to deep black void (#030005 NGX dark)
- Golden hour sunlight fades out
- All real-world environment elements dissolve into pure dramatic studio darkness
- Volumetric violet light rays (color #6D00FF) emerge radiating from behind the subject — the iconic NGX hero shot framing
- Rim light intensifies from 50% to 100%
- Cinematic three-point lighting setup fully establishes by the end

Lighting transformation:
- Violet key light from front-left at full intensity
- Soft violet fill from right (#B39AFF at 40%)
- Strong rim light from behind creates separation from black background
- Volumetric god rays emerge from upper-back over the final 3 seconds

Subject's expression intensifies subtly — eyes lock forward, jaw slight tension, full presence. The peak shot.

CRITICAL CONSTRAINTS:
- Camera must NOT move. Zero camera motion of any kind.
- Color palette: only violet (#6D00FF, #B39AFF), pure black (#030005), and white highlights on muscle definition. NO blue, cyan, green, red, orange.
- Subject's face IDENTICAL throughout. Same person, same identity from start to finish.
- Transitions smooth and continuous. Environment morphs from urban to studio gracefully.
- Subject position and scale remain constant.
- Final frame should match K3 reference exactly — peak hero shot in editorial studio.

Style: Photorealistic, cinematic, 8K, ESPN Body Issue meets Nike hero campaign aesthetic. The most cinematic of the three clips.
Duration: 8 seconds. Aspect ratio: 16:9.
```

---

## Audio descriptors (opcional — solo si decides agregar audio)

Si Flow soporta audio o agregamos en post:

```
Audio direction (24s total):

0-8s   (Clip 1): Near silence. Deep sub-bass drone (30-40Hz) at threshold of hearing.
                 Subtle metallic gym sounds (very distant). Building tension.

8-16s  (Clip 2): Synthetic warm pad emerges. Soft pulse rhythm.
                 Distant urban ambience (very subtle).
                 Sense of forward momentum without being obvious.

16-24s (Clip 3): Cinematic swell. Deep synth pad with violet energy texture.
                 Sustained "power tone" by the end — restrained but commanding.
                 Final 2s: subtle resolve / sustained note (not a drop).

Style reference: Blade Runner 2049 score meets Nike "Find Your Greatness".
Electronic, synthetic, restrained, cinematic.
NO dialogue. NO melody-driven music. Pure texture and atmosphere.
```

**Recomendación:** Producir el video SIN AUDIO primero. La landing va a tener el video silencioso (autoplay funciona sin audio en navegadores). Si después decidimos agregar audio para versiones de ads/social/podcast, lo hacemos en post con SFX y score.

---

## Post-producción: Concatenar 3 clips → 1 mp4

Una vez tengas los 3 mp4 (clip1.mp4, clip2.mp4, clip3.mp4):

```bash
# Crear lista de concatenación
cat > clips.txt <<EOF
file 'clip1.mp4'
file 'clip2.mp4'
file 'clip3.mp4'
EOF

# Concatenar sin re-encoding (rápido, mantiene calidad)
ffmpeg -f concat -safe 0 -i clips.txt -c copy ngx_transform_reveal.mp4

# Verificar
ffprobe -v error -show_entries stream=width,height,duration -of csv=p=0 ngx_transform_reveal.mp4
```

**Si los clips tienen codecs distintos** (Flow puede exportar variando):
```bash
# Re-encode unificado (más lento pero garantiza compatibilidad)
ffmpeg -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 \
  -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1[outv]" \
  -map "[outv]" -c:v libx264 -preset slow -crf 18 \
  ngx_transform_reveal.mp4
```

---

## Validation checklist del video final

Antes de pasarme el `.mp4` para extracción de frames:

- [ ] Duración total: 22-24 segundos
- [ ] Resolución: 1920×1080 en todo el video (sin saltos)
- [ ] Camera lock: NO hay pan/tilt/dolly/zoom en ningún momento
- [ ] Identity: la cara es claramente la misma persona en los 24s
- [ ] Vertical anchoring: la cabeza permanece a misma altura en frame
- [ ] Color palette: solo violet + dark + skin tones naturales (sin cyans/blues/greens accidentales)
- [ ] Transiciones: smooth, sin cortes abruptos visibles
- [ ] Sin watermarks/logos de Flow/VEO
- [ ] Background final: editorial studio dark, NO urban/gym

Si algún criterio falla, regenerar el clip afectado antes de concatenar.

---

## Cuando me pases el .mp4

Yo ejecuto la skill `cinematic-reveal-studio:extract-frames` así:

```bash
VIDEO="ngx_transform_reveal.mp4"
PREFIX="ngx"
mkdir -p public/sequence

# Extraer 120 frames evenly distributed
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
for i in $(seq 0 119); do
  TS=$(python3 -c "print(f'{($i/119)*$DURATION:.4f}')")
  ffmpeg -y -ss "$TS" -i "$VIDEO" -vframes 1 -c:v libwebp -quality 82 \
    "public/sequence/${PREFIX}_$(printf '%03d' $i).webp" 2>/dev/null
done

# Validar
ls public/sequence/ | wc -l   # debe decir 120
du -sh public/sequence/        # debe ser ~12-18MB
```

Output: `public/sequence/ngx_000.webp` … `ngx_119.webp` listos para el canvas scroll engine.

De ahí, implementación del `HeroCinematicReveal.tsx` en `LandingHero`. ~3 días dev.

---

## Troubleshooting frecuente con VEO 3.1

| Problema | Solución |
|----------|----------|
| **Cámara se mueve** pese a "static camera" | Agregar al inicio: "ABSOLUTELY STATIC CAMERA. The camera is bolted to concrete. Zero movement of any kind. Surveillance perspective." Si persiste: re-generar usando K0 como referencia dual (start + reference). |
| **Transición abrupta** entre clips | Usar el último frame del clip anterior como start del siguiente (no el keyframe original). Esto se llama "Extend Strategy" en Flow. |
| **Identity drift** (la cara cambia) | Aumentar peso de reference image. Re-prompting con: "The subject's face must remain ABSOLUTELY IDENTICAL to the reference image throughout. Any face change is failure." |
| **Colors drift** (azules/verdes accidentales) | Lista explícita de prohibición: "NO blue, NO cyan, NO teal, NO green, NO red, NO orange, NO yellow, NO warm sunset orange. ONLY violet (#6D00FF, #B39AFF), dark blacks, and natural skin tones." |
| **Subject changes pose** entre clips | Constraint: "Subject's body pose remains stable — the only change is the body composition itself. Arms remain relaxed at sides throughout." |
