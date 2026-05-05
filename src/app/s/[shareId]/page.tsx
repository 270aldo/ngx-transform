import { getDb } from "@/lib/firebaseAdmin";
import { getAuthUserFromCookie } from "@/lib/authServer";
import type { InsightsResult } from "@/types/ai";
import { TransformationViewer } from "@/components/TransformationViewer";
import { TransformationViewer2 } from "@/components/TransformationViewer2";
import { BiometricLoader } from "@/components/BiometricLoader";
import { TransformationSummary } from "@/components/results/TransformationSummary";
import { MuscleHealthScore } from "@/components/results/MuscleHealthScore";
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
  ownerUid?: string;
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

  if (!snap.exists) {
    return <ErrorFallback title={["Esta sesión", "ya no existe"]} description="Las visualizaciones expiran, se eliminan a petición del propietario, o nunca se generaron. Si tenías el enlace guardado, vuelve a generar tu propia transformación." />;
  }

  const data = snap.data() as SessionDoc | undefined;
  if (!data) {
    return <ErrorFallback title={["Datos", "incompletos"]} description="Esta sesión existe pero quedó corrupta o incompleta. Puedes generar una nueva visualización privada en menos de 3 minutos." />;
  }

  // Check if the authenticated user is the owner — owners always see the full experience.
  // Reads the __session HTTP cookie set by /api/auth/session (synced by AuthProvider).
  const authUser = await getAuthUserFromCookie();
  const isOwner = !!authUser?.uid && authUser.uid === data.ownerUid;

  const shareScope = {
    shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
    shareInsights: data.shareScope?.shareInsights ?? false,
    shareProfile: data.shareScope?.shareProfile ?? false,
  };

  // Owner always gets full access regardless of shareScope
  const allowOriginal = isOwner || (FF_EXPOSE_ORIGINAL && shareScope.shareOriginal);
  const allowInsights = isOwner || shareScope.shareInsights;
  const allowProfile = isOwner || shareScope.shareProfile;

  const ai = allowInsights ? data.ai : undefined;
  const urls = await getUrlsLocally(data, allowOriginal);

  if (!allowInsights) {
    const heroImage = urls.images?.m12 || urls.images?.m8 || urls.images?.m4 || urls.originalUrl;
    const explicitShareDecision = data.shareScope !== undefined;
    return (
      <div className="min-h-screen bg-transparent text-white">
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          <div className="space-y-2">
            <span className="ngx-eyebrow-pill">NGX Transform</span>
            <h1 className="ngx-h1 !text-left" style={{ maxWidth: "20ch" }}>Transformación privada</h1>
            <p className="text-sm leading-relaxed text-white/55 max-w-2xl">
              {explicitShareDecision
                ? "El creador decidió compartir solo las imágenes. El análisis permanece privado."
                : "Esta visualización es privada por defecto. Solo el creador puede ver el análisis completo."}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImage}
                alt="Transformación NGX"
                className="w-full h-[70vh] object-cover object-center"
              />
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-white/40">
                Imágenes en proceso...
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/wizard"
              className="rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white text-center transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                backgroundColor: "var(--ngx-purple)",
                boxShadow: "var(--ngx-glow-primary)",
              }}
            >
              Crear mi transformación
            </a>
            <a
              href={`/dashboard/${shareId}`}
              className="ngx-glass-clear rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white text-center transition-all duration-150 active:scale-[0.97]"
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
            <MuscleHealthScore shareId={shareId} />
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
          <MuscleHealthScore shareId={shareId} />
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

/**
 * Branded fallback for unrecoverable session states (not found / corrupted).
 * Uses NEOGEN-X DS tokens.
 */
function ErrorFallback({
  title,
  description,
}: {
  title: [string, string];
  description: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white px-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <span className="ngx-eyebrow-pill mx-auto">NGX Transform</span>
        <h1 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "16ch" }}>
          {title[0]}
          <br />
          {title[1]}
        </h1>
        <p className="text-base leading-relaxed text-white/60 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <a
            href="/wizard"
            className="rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
            style={{
              backgroundColor: "var(--ngx-purple)",
              boxShadow: "var(--ngx-glow-primary)",
            }}
          >
            Crear mi transformación
          </a>
          <a
            href="/"
            className="ngx-glass-clear rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-all duration-150 active:scale-[0.97]"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
