/**
 * Legacy /plan page — redirige al destino unificado /s/[shareId]
 * (v12 Comercial Exit Flow: la conversión vive en HybridOfferV2 dentro de /results).
 *
 * El plan AI real (planGenerator) se entrega ahora por email post-compra,
 * no como gate previo a la conversión.
 *
 * Si por alguna razón quieres revivir la página /plan, setea
 * NEXT_PUBLIC_FF_COLLAPSE_FUNNEL=false y restaura desde git.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyPlanRedirect({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  redirect(`/s/${shareId}#hybrid-offer`);
}
