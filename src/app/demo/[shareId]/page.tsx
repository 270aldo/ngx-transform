import { redirect } from "next/navigation";

export default async function LegacyDemoPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  redirect(`/s/${shareId}/demo`);
}
