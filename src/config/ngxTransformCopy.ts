/**
 * NGX Transform — Copy central de disclaimers y mensajes HYBRID.
 *
 * Único source of truth para frases compartidas entre landing, wizard,
 * results, plan, PDF y emails. Evita inconsistencias y reescritura.
 */

export const DISCLAIMERS = {
  visual:
    "Esta visualización es una simulación aspiracional generada con IA. No representa una garantía de resultado.",
  plan:
    "Este plan es educativo y orientativo. En HYBRID, un coach humano lo revisa y adapta contigo.",
  health:
    "NGX no sustituye evaluación médica. Si tienes lesiones, dolor o condiciones de salud, consulta a un profesional.",
} as const;

export const HYBRID_COPY = {
  thesis: "La IA no reemplaza al coach. Lo amplifica.",
  map: "GENESIS puede mostrarte el mapa. Un coach humano te ayuda a ejecutarlo.",
  cta: "Validar mi ruta con un coach",
  ascendCta: "Ver ASCEND autoguiado",
  trustBadges: [
    "Visualización no garantizada",
    "Plan inicial educativo",
    "Coach humano disponible en HYBRID",
  ],
} as const;

export const POSITIONING = {
  tagline: "Visualiza tu potencial. Construirlo requiere un sistema.",
  honestPromise: "Esta imagen no es una promesa. Es una dirección posible.",
  closing: "La imagen inspira. El sistema transforma. El humano lidera.",
} as const;
