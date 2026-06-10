/**
 * Single source of truth for GENESIS lead-fit classification and the funnel CTA
 * it routes to. Shared by both conversational channels — the voice agent
 * (`HybridVoiceAgent`) and the text chat (`GenesisTextChat`) — and aligned with
 * the labels in `src/config/genesis/knowledge/prompt.ts` and the persistence in
 * `src/app/api/sessions/[shareId]/classify/route.ts`.
 */
export type FitClassification =
  | "listo_para_diagnostico"
  | "necesita_claridad"
  | "no_fit_ahora";

export type RouteIntent = "hybrid" | "ascend" | "nurture";

export const CLASSIFICATION_LABELS: Record<FitClassification, string> = {
  listo_para_diagnostico: "Listo para diagnóstico",
  necesita_claridad: "Necesita claridad",
  no_fit_ahora: "No fit por ahora",
};

/**
 * The segmented next step per fit classification. This is the funnel routing:
 * - listo    → NGX HYBRID (book a human diagnosis call)
 * - claridad → NGX ASCEND / the offer section (self-serve path)
 * - no fit   → soft exit (the email nurture already has them)
 */
export const CTA_BY_CLASSIFICATION: Record<
  FitClassification,
  { intent: RouteIntent; label: string }
> = {
  listo_para_diagnostico: {
    intent: "hybrid",
    label: "Agendar diagnóstico HYBRID",
  },
  necesita_claridad: { intent: "ascend", label: "Ver opciones y siguiente paso" },
  no_fit_ahora: { intent: "nurture", label: "Recibir mi brief por correo" },
};

/** Detects the first fit label GENESIS emits in free text (priority: listo > claridad > no_fit). */
export function parseClassification(text: string): FitClassification | null {
  if (text.includes("listo_para_diagnostico")) return "listo_para_diagnostico";
  if (text.includes("necesita_claridad")) return "necesita_claridad";
  if (text.includes("no_fit_ahora")) return "no_fit_ahora";
  return null;
}
