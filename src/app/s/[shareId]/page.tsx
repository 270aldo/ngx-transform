import { getDb } from "@/lib/firebaseAdmin";
import type { InsightsResult } from "@/types/ai";
import { TransformationViewer } from "@/components/TransformationViewer";
import { TransformationViewer2 } from "@/components/TransformationViewer2";
import { BiometricLoader } from "@/components/BiometricLoader";
import { TransformationSummary } from "@/components/results/TransformationSummary";
import RefreshClient from "./refresh-client";
import { Metadata } from "next";
import { getSignedUrl } from "@/lib/storage";

// Feature flag for Results 2.0 experience
const FF_RESULTS_2 = process.env.NEXT_PUBLIC_FF_RESULTS_2 === "true";
const FF_EXPOSE_ORIGINAL = process.env.FF_EXPOSE_ORIGINAL !== "false";

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
  // v2.0 fields
  letter_from_future?: string;
  shareOriginal?: boolean;
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

async function getUrlsLocally(data: SessionDoc) {
  const result: { originalUrl?: string; images?: Record<string, string> } = {};

  // 1. Original Photo (Always sign for the visualization page if allowed)
  const photoPath = data.photo?.originalStoragePath;
  const allowOriginal = FF_EXPOSE_ORIGINAL || data.shareOriginal;

  if (photoPath && allowOriginal) {
    try {
      result.originalUrl = await getSignedUrl(photoPath, { expiresInSeconds: 3600 });
    } catch (e) {
      console.error("Error signing original:", e);
    }
  }

  // 2. Generated Images
  if (data.assets?.images) {
    result.images = {};
    await Promise.all(
      Object.entries(data.assets.images).map(async ([key, path]) => {
        try {
          const url = await getSignedUrl(path, { expiresInSeconds: 3600 });
          result.images![key] = url;
        } catch (e) {
          console.error(`Error signing ${key}:`, e);
        }
      })
    );
  }

  return result;
}

export default async function Page({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();

  if (!snap.exists) return <div className="text-white p-10">Sesión no encontrada</div>;

  const data = snap.data() as SessionDoc | undefined;
  if (!data) return <div className="text-white p-10">Datos inválidos</div>;

  const ai = data.ai;
  const urls = await getUrlsLocally(data);

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
  const isReady = data.status === "ready";

  // Use Results 2.0 experience if feature flag is enabled
  if (FF_RESULTS_2) {
    return (
      <>
        <TransformationViewer2
          ai={ai}
          imageUrls={urls}
          shareId={shareId}
          isReady={isReady}
          letterFromFuture={data.letter_from_future}
        />
        {/* Genesis Demo CTA - appears after transformation viewer */}
        {isReady && (
          <TransformationSummary
            ai={ai}
            imageUrls={urls}
            shareId={shareId}
          />
        )}
        <RefreshClient shareId={shareId} active={stillGenerating} />
      </>
    );
  }

  // Legacy experience
  return (
    <>
      <TransformationViewer ai={ai} imageUrls={urls} shareId={shareId} isReady={isReady} />
      {/* Genesis Demo CTA - appears after transformation viewer */}
      {isReady && (
        <TransformationSummary
          ai={ai}
          imageUrls={urls}
          shareId={shareId}
        />
      )}
      <RefreshClient shareId={shareId} active={stillGenerating} />
    </>
  );
}
