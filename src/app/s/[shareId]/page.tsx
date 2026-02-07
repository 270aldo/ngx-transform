import { getDb } from "@/lib/firebaseAdmin";
import type { InsightsResult } from "@/types/ai";
import { TransformationViewer } from "@/components/TransformationViewer";
import { TransformationViewer2 } from "@/components/TransformationViewer2";
import { BiometricLoader } from "@/components/BiometricLoader";
import { TransformationSummary } from "@/components/results/TransformationSummary";
import { HybridOfferSection } from "@/components/results/HybridOfferSection";
import { NPSQuick } from "@/components/results/NPSQuick";
import RefreshClient from "./refresh-client";
import ScrollToSection from "./scroll-to-section";
import { Metadata } from "next";
import { getSignedUrl } from "@/lib/storage";

// Feature flag for Results 2.0 experience
const FF_RESULTS_2 = process.env.NEXT_PUBLIC_FF_RESULTS_2 === "true";
const FF_EXPOSE_ORIGINAL = process.env.FF_EXPOSE_ORIGINAL !== "false";
const FF_DRAMATIC_REVEAL = process.env.FF_DRAMATIC_REVEAL !== "false";
const FF_SOCIAL_COUNTER = process.env.FF_SOCIAL_COUNTER !== "false";
const FF_SHARE_UNLOCK =
  process.env.FF_SHARE_UNLOCK === "true" || process.env.FF_SHARE_TO_UNLOCK !== "false";

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
    stressLevel?: number;
  };
  photo?: { originalStoragePath?: string };
  ai?: InsightsResult;
  assets?: { images?: Record<string, string> };
  status: "processing" | "analyzed" | "generating" | "ready" | "failed";
  // v2.0 fields
  letter_from_future?: string;
  shareOriginal?: boolean;
  shareScope?: {
    shareOriginal?: boolean;
    shareInsights?: boolean;
    shareProfile?: boolean;
  };
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    vercelUrl ||
    "http://localhost:3000";
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

async function getUrlsLocally(data: SessionDoc, allowOriginal: boolean) {
  const result: { originalUrl?: string; images?: Record<string, string> } = {};

  // 1. Original Photo (Always sign for the visualization page if allowed)
  const photoPath = data.photo?.originalStoragePath;
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

  const shareScope = {
    shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
    shareInsights: data.shareScope?.shareInsights ?? false,
    shareProfile: data.shareScope?.shareProfile ?? false,
  };

  const allowOriginal = FF_EXPOSE_ORIGINAL && shareScope.shareOriginal;
  const allowInsights = shareScope.shareInsights;
  const allowProfile = shareScope.shareProfile;

  const ai = allowInsights ? data.ai : undefined;
  const urls = await getUrlsLocally(data, allowOriginal);

  if (!allowInsights) {
    const heroImage = urls.images?.m12 || urls.images?.m8 || urls.images?.m4 || urls.originalUrl;
    return (
      <div className="min-h-screen bg-transparent text-white">
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">NGX Transform</p>
            <h1 className="text-3xl font-semibold">Transformación compartida</h1>
            <p className="text-sm text-neutral-400">
              Este usuario decidió compartir solo las imágenes. El análisis permanece privado.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
            {heroImage ? (
              <img
                src={heroImage}
                alt="Transformación NGX"
                className="w-full h-[70vh] object-cover object-center"
              />
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-neutral-500">
                Imágenes en proceso...
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/wizard"
              className="px-5 py-3 rounded-full bg-[#6D00FF] text-white text-sm font-semibold text-center"
            >
              Crear mi transformación
            </a>
            <a
              href={`/dashboard/${shareId}`}
              className="px-5 py-3 rounded-full border border-white/10 text-sm font-semibold text-center text-neutral-200"
            >
              Ver en privado
            </a>
          </div>
        </div>
      </div>
    );
  }

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
    },
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
        <ScrollToSection />
        <TransformationViewer2
          ai={ai}
          imageUrls={urls}
          shareId={shareId}
          isReady={isReady}
          letterFromFuture={data.letter_from_future}
          userProfile={
            allowProfile
              ? {
                  focusZone: data.input?.focusZone as "upper" | "lower" | "abs" | "full" | undefined,
                  goal: data.input?.goal as "definicion" | "masa" | "mixto" | undefined,
                  stressLevel: data.input?.stressLevel,
                }
              : undefined
          }
          featureFlags={{
            FF_DRAMATIC_REVEAL,
            FF_SOCIAL_COUNTER,
            FF_SHARE_TO_UNLOCK: FF_SHARE_UNLOCK,
            FF_AGENT_BRIDGE_CTA: false,
          }}
        />
        {/* Genesis Demo CTA - appears after transformation viewer */}
        {isReady && (
          <>
            <TransformationSummary
              ai={ai}
              imageUrls={urls}
              shareId={shareId}
            />
            <HybridOfferSection shareId={shareId} />
            <NPSQuick shareId={shareId} />
          </>
        )}
        <RefreshClient shareId={shareId} active={stillGenerating} />
      </>
    );
  }

  // Legacy experience
  return (
    <>
      <ScrollToSection />
      <TransformationViewer ai={ai} imageUrls={urls} shareId={shareId} isReady={isReady} />
      {/* Genesis Demo CTA - appears after transformation viewer */}
      {isReady && (
        <>
          <TransformationSummary
            ai={ai}
            imageUrls={urls}
            shareId={shareId}
          />
          <HybridOfferSection shareId={shareId} />
          <NPSQuick shareId={shareId} />
        </>
      )}
      <RefreshClient shareId={shareId} active={stillGenerating} />
    </>
  );
}
