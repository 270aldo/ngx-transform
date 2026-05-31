# NGX Transform — Video Prompts para Flow (Veo 3.1)

**Cómo usar:** copia cada bloque "PROMPT" en Google Flow (Veo 3.1). Genera, descarga MP4 (H.264, 1080p+), súbelo a Firebase Storage (o tu CDN) y pega la URL pública en la variable indicada. La CSP del proyecto ya permite `storage.googleapis.com`, `firebasestorage`, YouTube y Vimeo en `media-src`.

**Marca (respétala en todos):** Electric Violet `#6D00FF` sobre near‑black `#030005`. Estética "Nike commercial": atlético, cinemático, premium, grano sutil. **Nada** de gym genérico, stock, ni logos de terceros. **Sin texto quemado** (el texto va en HTML encima). Sujetos diversos, ropa neutra oscura.

**Regla de oro para loops:** primer y último frame casi idénticos (loop invisible) y cámara lenta y continua.

---

## 1) Hero loop — fondo de la landing

- **Dónde se usa:** `config.copy.explainerVideo.videoUrl` (modal fundador en `LandingJourney`) y/o como fondo del hero. Para fondo de hero: 8–10s, mudo, loop.
- **Formato:** 16:9, 1080p, 8s, sin audio, loopable. **Reels/IG:** repetir en 9:16.

**PROMPT A — "Ascensión atlética" (recomendado)**
```
A lean athletic figure training in a dark cinematic studio, seen as a dramatic
silhouette. Single-source rim lighting in electric violet (#6D00FF) wrapping the
body edges, deep near-black background (#030005). Slow push-in dolly, shallow
depth of field, fine film grain, volumetric haze. The subject performs one
controlled, powerful movement (a slow rise from a crouch). Premium sports
commercial aesthetic, Nike-style. Cinematic color grade, high contrast, moody.
No text, no logos, no on-screen graphics. Seamless loop: first and last frame
nearly identical.
Negative: cartoon, CGI plastic skin, distorted anatomy, extra limbs, watermark,
text, brand logos, cluttered gym, stock-footage look.
```

**PROMPT B — "Partículas de energía" (abstracto, más fácil de loopear)**
```
Abstract cinematic background: slow-moving streaks and particles of electric
violet light (#6D00FF) drifting through a deep near-black void (#030005), like
energy forming around an unseen body. Subtle volumetric fog, soft bokeh, gentle
parallax, fine grain. Extremely slow continuous motion. Premium, futuristic,
calm but powerful. Perfect seamless loop.
Negative: text, logos, faces, fast motion, rainbow colors, lens flare overload.
```

---

## 2) Transformation reveal — refuerzo del DramaticReveal

- **Dónde se usa:** clip corto opcional junto al `DramaticReveal` en resultados. Mantiene el "wow" aunque las imágenes IA tarden.
- **Formato:** 16:9 y 9:16, 1080p, 4–6s, sin audio.
- **Nota:** NO muestres un rostro reconocible (el reveal real usa la foto del usuario). Usa silueta/abstracto.

**PROMPT — "Metamorfosis de silueta"**
```
A human silhouette dissolving and reforming from particles of electric violet
light (#6D00FF) against a near-black background (#030005), suggesting physical
transformation over time. The form subtly strengthens and sharpens as it
reforms. Slow, elegant, weightless motion. Cinematic, premium, fine grain,
volumetric light. No recognizable face. No text, no UI, no logos.
Negative: readable face, text, watermark, glitchy artifacts, horror vibe,
multiple subjects.
```

---

## 3) Video del fundador — pieza de confianza

- **Dónde se usa:** `NEXT_PUBLIC_HYBRID_VIDEO_URL` (modal `VideoFounderModal` en resultados) + póster en `NEXT_PUBLIC_HYBRID_VIDEO_POSTER`.
- **Realidad:** el video del fundador idealmente es **grabación real** del fundador hablando (más confianza que IA). Si quieres una **intro/outro cinemática** generada con Flow para envolver la grabación, usa lo siguiente. La parte hablada: grábala tú.
- **Formato intro/outro:** 16:9, 1080p, 3–4s cada una, sin audio (la voz va en la grabación).

**PROMPT — "Intro cinemática NGX"**
```
A short premium title-card intro: slow camera drift through a dark volumetric
space filled with soft electric violet light (#6D00FF) and fine particles over a
near-black background (#030005). A subtle pulse of energy builds toward the
center, leaving clean negative space in the middle for a logo to be composited
later. Calm, confident, high-end brand intro. 4 seconds. No text, no logo baked
in, no people.
Negative: busy motion, rainbow colors, text, stock-intro cliché, lens dirt.
```

**Póster (frame estático):** exporta un frame del segundo ~2, o genera con tu pipeline de imagen (NanoBanana) un still 1280×720 con la misma paleta.

---

## Checklist de entrega por pieza

1. Generar en Flow (Veo 3.1) → descargar MP4 H.264 1080p.
2. Comprimir (objetivo < 3–5 MB para loops; HandBrake/ffmpeg `-crf 24`).
3. Subir a Storage/CDN → URL pública HTTPS.
4. Pegar en la variable:
   - Hero/explainer → `config.copy.explainerVideo.videoUrl`
   - Fundador → `NEXT_PUBLIC_HYBRID_VIDEO_URL` (+ `NEXT_PUBLIC_HYBRID_VIDEO_POSTER`)
5. Verificar que carga con póster y que respeta `prefers-reduced-motion` (ya implementado globalmente).

> Nota: hoy estos slots aceptan URL por configuración. Si quieres que el **hero de la landing** tenga un `<video>` de fondo nativo (con póster + fallback reduce-motion), se puede añadir en una pieza aparte — dímelo y lo cableo.
