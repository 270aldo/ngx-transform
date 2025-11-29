import { getDb } from "@/lib/firebaseAdmin";
import type { InsightsResult } from "@/types/ai";
import { TransformationViewer } from "@/components/TransformationViewer";
import { BiometricLoader } from "@/components/BiometricLoader";
import RefreshClient from "./refresh-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SessionDoc {
  shareId: string;
  email?: string | null;
  input: {
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    level: "novato" | "intermedio" | "avanzado";
    goal: "definicion" | "masa" | "mixto";
    weeklyTime: number;
    notes?: string;
    focusZone?: string;
  };
  photo?: { originalStoragePath?: string };
  ai?: InsightsResult;
  assets?: { images?: Record<string, string> };
  status: "processing" | "analyzed" | "generating" | "ready" | "failed";
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const absoluteBase = String(baseUrl).startsWith("http") ? baseUrl : `https://${baseUrl}`;
  const ogUrl = `${absoluteBase}/api/og/${shareId}`;

  return {
    title: "Mi Transformación de 12 Meses - NGX",
    description: "He descubierto mi máximo potencial con NGX. Mira mi proyección física y mental.",
    openGraph: {
      images: [ogUrl],
    },
  };
}

async function getUrls(shareId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  // Fix spacing in URL construction
  const res = await fetch(`${baseUrl}/api/sessions/${shareId}/urls`, { cache: "no-store" });
  if (!res.ok) return {} as { originalUrl?: string; images?: Record<string, string> };
  return (await res.json()) as { originalUrl?: string; images?: Record<string, string> };
}

export default async function Page({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();

  if (!snap.exists) return <div className="text-white p-10">Sesión no encontrada</div>;

  const data = snap.data() as SessionDoc | undefined;
  if (!data) return <div className="text-white p-10">Datos inválidos</div>;

  const ai = data.ai;
  const urls = await getUrls(shareId);

  // If processing or no AI, show simple loading
  // If no AI yet, keep loading
  if (!ai) {
    return (
      <>
        <BiometricLoader />
        <RefreshClient shareId={shareId} active={true} />
      </>
    );
  }

  // Inject signed URLs into the data object for the viewer
  const viewerData = {
    ...data,
    assets: {
      ...data.assets,
      images: urls.images || data.assets?.images // Prefer signed URLs if available
    }
  };

  // Sanitize for Client Component (remove Firestore Timestamps)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (viewerData as any).updatedAt;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (viewerData as any).createdAt;

  const stillGenerating = data.status !== "ready";

  return (
    <>
      <TransformationViewer ai={ai} imageUrls={urls} shareId={shareId} isReady={data.status === "ready"} />
      <RefreshClient shareId={shareId} active={stillGenerating} />
    </>
  );
}
