/**
 * NGX Transform — Copy central de disclaimers y mensajes HYBRID.
 *
 * Una sola fuente de verdad para landing, wizard, results, plan, PDF y emails.
 */

export const DISCLAIMERS = {
  visual:
    "Esta visualización es aspiracional y generada con IA. No es una promesa, garantía ni predicción médica.",
  plan:
    "Este plan inicial es educativo y orientativo. En HYBRID, un coach humano lo revisa y lo adapta contigo.",
  health:
    "NGX no sustituye evaluación médica. Si tienes dolor, lesiones o condiciones de salud, consulta a un profesional antes de entrenar.",
} as const;

export const HYBRID_COPY = {
  thesis: "La imagen inspira. El sistema transforma. El humano sostiene.",
  map: "GENESIS te muestra la ruta. HYBRID te ayuda a ejecutarla cuando la vida se atraviesa.",
  cta: "Agendar diagnóstico HYBRID",
  ascendCta: "Ver opción autoguiada",
  trustBadges: [
    "Visualización aspiracional",
    "Plan inicial educativo",
    "Coach humano disponible en HYBRID",
  ],
} as const;

export const POSITIONING = {
  tagline: "Lo que no te conoce, no te puede transformar.",
  honestPromise: "Esta imagen no es una promesa. Es un espejo y una dirección posible.",
  closing: "La imagen inspira. El sistema transforma. El humano sostiene.",
} as const;
