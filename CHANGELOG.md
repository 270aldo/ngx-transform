# Changelog

## 2025-09-22

### UI/Theme
- Integrado shadcn/ui v4 (button, input, textarea, card, progress, separator, tabs, select, tooltip, dialog).
- Tokens Tailwind v4 y mapa @theme inline (background/foreground/primary/secondary/accent/etc.).
- Tipografía Inter para títulos y texto (estilo minimal tech); pill buttons por defecto, Cards rounded-2xl.

### Resultados (rediseño Fase 1)
- Nuevo layout 3 columnas (sticky izquierda/derecha) y componentes modulares:
  - ImageViewer (tabs M0/M4/M8/M12, overlay on/off, guía on/off, minimap, miniaturas, descargar).
  - InsightsCard (insightsText en Card).
  - ActionsCard (email, copiar enlace, reservar, borrar con Dialog shadcn).
  - ProfileSummaryCard (perfil compacto).
- TimelineViewer migrado a Tabs shadcn y secciones en Cards.
- Demo Result usa el mismo layout para visualización inmediata.

### Wizard (polish)
- Dropzone rounded-2xl con glow y tokens; Inputs/Select/Progress con shadcn.
- Select migrado a Radix shadcn; botones estandarizados (pills, ring).

### Accesibilidad y UX
- Focus ring consistente (violeta), estados hover/active sutiles.
- Preparado para sincronización de tabs y deep-link en Fase 2.

---

## 2025-09-21
- Setup inicial (Next.js 15, Tailwind v4, Firebase, Gemini, estructura base, endpoints, validaciones).
