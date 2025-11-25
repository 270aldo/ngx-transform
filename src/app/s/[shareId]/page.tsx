import { getDb } from "@/lib/firebaseAdmin";
import type { InsightsResult } from "@/types/ai";
import { CinematicViewer } from "@/components/CinematicViewer"; // Reverted
import { BiometricLoader } from "@/components/BiometricLoader";
import RefreshClient from "./refresh-client";
import { Metadata } from "next";
import { getSignedUrl } from "@/lib/storage";

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
  status: "processing" | "ready" | "failed";
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();
  const data = snap.data() as SessionDoc | undefined;

  if (!data || !data.assets?.images?.m12) {
    return {
      title: "NGX Transformation",
      description: "Esculpiendo tu futuro...",
    };
  }

  // Get signed URL for the transformed image (m12)
  const imageUrl = await getSignedUrl(data.assets.images.m12, { expiresInSeconds: 3600 });

  return {
    title: "Mi Transformación de 12 Meses - NGX",
    description: "He descubierto mi máximo potencial con NGX. Mira mi proyección física y mental.",
    openGraph: {
      images: [imageUrl],
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
  if (data.status !== "ready" || !ai) {
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

  // REVERT TO CINEMATIC VIEWER (User Request: "Lo que funcionó al principio")
  return (
    <div className="min-h-screen bg-black">
      <CinematicViewer ai={ai} imageUrls={urls} />
    </div>
  );
}
