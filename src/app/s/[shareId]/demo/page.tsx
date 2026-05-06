/**
 * Legacy /demo page — redirige al destino unificado /s/[shareId]
 * (v12 Comercial Exit Flow: HybridOfferV2 vive en /results, no aquí).
 *
 * Mantenido como server component con `redirect()` para preservar
 * cualquier link compartido viejo (emails D0–D7, social, etc.).
 *
 * Si por alguna razón quieres revivir la página /demo (no recomendado),
 * setea NEXT_PUBLIC_FF_COLLAPSE_FUNNEL=false y restaura desde git.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyDemoRedirect({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  redirect(`/s/${shareId}#hybrid-offer`);
}
