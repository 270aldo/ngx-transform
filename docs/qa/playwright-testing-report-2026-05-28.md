# NGX Transform - Lead Magnet Testing Report (Post-Cleanup)

**Fecha:** 2026-05-28  
**Enfoque:** Opciones 2, 3 y 4 solicitadas por el usuario  
**Herramienta:** Playwright (Chromium)  
**Viewports probados:**
- Desktop 1440px
- iPad Portrait (820x1180)
- iPhone 14 Pro (390x844)
- Small Android (360x780)

**Servidor:** Dev server con Turbopack (modo demo `?demo=1`)

---

## 2. Testing en Móvil / Responsive

### Resultado General
La experiencia es **funcional** en móvil, pero **pierde mucho de su impacto premium**.

### Lo que funciona
- No hay crashes ni elementos rotos graves.
- Las tres secciones principales cargan: TransformationViewer2, HybridVoiceAgent y HybridOfferV2.
- Botones y CTAs siguen siendo accionables.

### Problemas detectados en móvil

| Problema | Severidad | Descripción |
|---------|-----------|-----------|
| Pérdida de impacto del Viewer | Alta | El CinematicViewer se ve pequeño y poco inmersivo en iPhone. Pierde el feeling "Nike commercial". |
| Exceso de scroll antes del Voice Agent | Alta | En iPhone 14 Pro el usuario tiene que hacer bastante scroll antes de llegar al agente de voz (el filtro de calidad más importante). |
| Timeline poco táctil | Media-Alta | La navegación entre HOY / MES 4 / MES 8 / MES 12 no está optimizada para dedo. |
| HybridOfferV2 apretado | Media | Los pricing cards y beneficios se ven comprimidos. Falta respiración. |
| Jerarquía visual débil | Media | En pantallas pequeñas todo compite por atención. No está claro qué es lo más importante (el agente de voz). |

**Conclusión móvil:** Actualmente es una experiencia "desktop que funciona en móvil", no una experiencia mobile-first. Esto es riesgoso porque mucho tráfico de leads viene de Instagram/TikTok.

---

## 3. Análisis de Calidad del Lead Magnet (Percepción Premium)

### Fortalezas actuales
- El flujo post-limpieza quedó más limpio y profesional.
- El **HybridVoiceAgent** sigue siendo el elemento más diferenciador y de mayor calidad de lead.
- Tener voz + oferta en la misma página de resultados es estratégicamente correcto.

### Debilidades que afectan percepción de premium

1. **El "wow" es muy corto**
   - El TransformationViewer2 entrega impacto fuerte al inicio.
   - Después de eso, la página cae notablemente en calidad estética (TransformationSummary, SeasonRoadmap y Offer se sienten más funcionales que premium).

2. **Falta de respiración y jerarquía**
   - En móvil especialmente, hay poco espacio negativo.
   - El Voice Agent (el punto más premium) compite visualmente con otros elementos y queda enterrado.

3. **El agente de voz no tiene el peso visual que merece**
   - Es el mecanismo principal para filtrar leads de alta calidad.
   - En móvil está demasiado abajo y no se siente como el "momento estrella" de la experiencia.

4. **HybridOfferV2**
   - Buena estructura comercial.
   - En móvil no genera suficiente confianza ni urgencia. Se ve un poco "genérico" comparado con el nivel del Viewer.

**Diagnóstico de premium:**
El producto ya no parece una herramienta gratis barata, pero todavía no alcanza el nivel de "experiencia premium que justifica pagar por NGX HYBRID". Está en zona intermedia. El Voice Agent es lo único que actualmente empuja fuerte hacia premium.

---

## 4. Issues Documentados + Enfoque en Duplicación de Foto

### Sobre la duplicación de la fotografía en m8 y m12

**Contexto del usuario:** "Se supone que se arregló la duplicación de la foto de las últimas 2 seasons."

**Lo que hice:**
- Capturas específicas de imágenes relacionadas con m8 y m12 en desktop.
- Búsqueda automatizada de srcs duplicados.
- Capturas de milestones (HOY, MES 4, MES 8, MES 12).

**Resultado del chequeo automatizado:**
No se detectó duplicación obvia de atributos `src` entre las imágenes del timeline.

**Recomendación fuerte:**
Revisar manualmente estas capturas (son las más relevantes):

- `playwright-screenshots/desktop/milestone-mes8.png`
- `playwright-screenshots/desktop/milestone-mes12.png`
- `playwright-screenshots/desktop/20-m8-image-*.png` (si existen del segundo script)
- `playwright-screenshots/desktop/21-m12-image-*.png`

**Qué buscar:**
- ¿La cara o silueta de m8 y m12 parece ser básicamente la misma foto original con filtros aplicados?
- ¿Hay evolución real entre m4 → m8 → m12, o m8 y m12 se sienten "planos" comparados con m4?
- Comparar contra HOY/m0 para ver si hay "face drift" o reutilización de la foto base.

Si después de revisar consideras que el bug sigue presente (aunque sea parcial), avísame y hacemos un diagnóstico más quirúrgico.

### Otros issues encontrados

| # | Issue | Ubicación | Severidad | Notas |
|---|-------|-----------|-----------|-------|
| 1 | Viewer pierde impacto en móvil | Todas las páginas de resultados (móvil) | Alta | Principal queja de calidad premium |
| 2 | Exceso de scroll antes del Voice Agent | Móvil | Alta | Riesgo de pérdida de leads de calidad |
| 3 | Timeline poco usable en touch | Móvil | Media-Alta | Navegación entre seasons |
| 4 | HybridOfferV2 comprimido | Móvil | Media | Pricing y beneficios |
| 5 | Falta de jerarquía clara | Móvil + Desktop | Media | Qué es más importante: ¿el agente de voz o la oferta? |
| 6 | SeasonRoadmap sin suficiente contraste/separación | Desktop y móvil | Media | Reduce el impacto de la progresión temporal |
| 7 | Espaciado inconsistente entre secciones | General | Baja-Media | Sensación de "pegado" |

---

## Recomendaciones Priorizadas

### Prioridad Alta (Impacto en calidad de leads)
1. **Rediseñar la jerarquía en móvil** para que el Voice Agent aparezca mucho antes (idealmente dentro de los primeros 2-3 scrolls).
2. Mejorar el **CinematicViewer en mobile** (más grande, mejor interacción táctil, o versión simplificada más impactante).
3. Hacer que el Voice Agent se sienta como el "momento premium" de la página (más peso visual, mejor copy, mejor affordance).

### Prioridad Media
4. Revisar y confirmar el estado real de la duplicación en m8/m12 (ver capturas recomendadas arriba).
5. Mejorar espaciado y respiración en HybridOfferV2 en móvil.
6. Optimizar la navegación del timeline para touch.

### Prioridad Baja (por ahora)
- Pulido menor de espaciados generales.

---

## Archivos de Evidencia

Todas las capturas están en `playwright-screenshots/`:

- `desktop/` → Vista desktop detallada + milestones
- `ipad/`, `iphone/`, `iphone-small/` → Vistas móviles
- Archivos raíz → Pruebas iniciales (landing, wizard, voice agent click, etc.)

**Capturas más útiles para revisar ahora:**
- `playwright-screenshots/desktop/milestone-mes8.png`
- `playwright-screenshots/desktop/milestone-mes12.png`
- `playwright-screenshots/iphone/01-full-page.png` (para ver el scroll real en iPhone)
- `playwright-screenshots/05-hybrid-offer-v2.png`

---

## Próximos Pasos Sugeridos

Dime cómo quieres continuar:

**A.** Revisamos juntos las capturas de m8/m12 y decidimos si el bug de duplicación sigue vivo o no.

**B.** Te preparo un plan de mejoras priorizado con estimación de esfuerzo (enfocado en móvil + Voice Agent).

**C.** Hacemos otra ronda de testing más quirúrgica (por ejemplo: solo el Viewer en diferentes viewports + simulación de interacción con el timeline).

**D.** Otra cosa.

¿Qué prefieres atacar primero?