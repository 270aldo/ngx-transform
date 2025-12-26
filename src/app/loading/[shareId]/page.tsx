import { LoadingExperience } from "./LoadingExperience";

export const dynamic = "force-dynamic";

export default async function LoadingPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  return <LoadingExperience shareId={shareId} />;
}
