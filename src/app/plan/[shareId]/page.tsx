import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Legacy /plan/[shareId] → ahora redirige directo a /s/[shareId]#hybrid-offer
 * (v12: salida comercial unificada en /results).
 */
export default async function LegacyPlanPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  redirect(`/s/${shareId}#hybrid-offer`);
}
