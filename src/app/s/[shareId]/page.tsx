import { getDb } from "@/lib/firebaseAdmin";
import { getAuthUserFromCookie } from "@/lib/authServer";
import type { InsightsResult } from "@/types/ai";
import { BiometricLoader } from "@/components/BiometricLoader";
import { TransformationViewer2 } from "@/components/TransformationViewer2";
import { MuscleHealthScore } from "@/components/results/MuscleHealthScore";
import { TransformationSummary } from "@/components/results/TransformationSummary";
import { HybridOfferV2 } from "@/components/results/HybridOfferV2";
import { HybridVoiceAgent } from "@/components/results/HybridVoiceAgent";
import { GenesisTextChat } from "@/components/results/GenesisTextChat";
import { MobileVoiceAgentTeaser } from "@/components/results/MobileVoiceAgentTeaser";
import { SeasonRoadmap } from "@/components/results/SeasonRoadmap";
import RefreshClient from "./refresh-client";
import ScrollToSection from "./scroll-to-section";
import { Metadata } from "next";
import Link from "next/link";
import { getSignedUrl } from "@/lib/storage";
import { DEMO_SESSION, DEMO_URLS } from "./demoStub";

const FF_EXPOSE_ORIGINAL = process.env.FF_EXPOSE_ORIGINAL !== "false";
const FF_HYBRID_VOICE_AGENT =
  process.env.NEXT_PUBLIC_FF_HYBRID_VOICE_AGENT === "true";
const FF_HYBRID_TEXT_CHAT =
  process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT !== "false";

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
    sleepQuality?: number;
    disciplineRating?: number;
  };
  photo?: { originalStoragePath?: string };
  ai?: InsightsResult;
  assets?: { images?: Record<string, string> };
  status: "pending" | "processing" | "analyzed" | "generating" | "ready" | "failed" | "partial";
  // v2.0 fields
  letter_from_future?: string;
  shareOriginal?: boolean;
  shareScope?: {
    shareOriginal?: boolean;
    shareInsights?: boolean;
    shareProfile?: boolean;
    shareImages?: boolean;
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
    title: "Mi diagnóstico visual NGX Vision",
    description:
      "Diagnóstico visual de salud muscular y dirección de 12 semanas. Visualización aspiracional, no garantía.",
    openGraph: {
      images: [ogUrl],
    },
  };
}

async function getUrlsLocally(data: SessionDoc, allowOriginal: boolean, allowImages: boolean) {
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
  if (allowImages && data.assets?.images) {
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

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { shareId } = await params;
  const { demo } = await searchParams;

  // Dev-only bypass: ?demo=1 returns a stub "ready" session with mocked
  // AI insights + image URLs so we can iterate visually on the Results
  // 2.0 funnel without a real Firestore session. Mirrors the pattern
  // used in /wizard?stage=N and /loading/[shareId]?demo=1.
  const isDemo = process.env.NODE_ENV === "development" && demo === "1";

  let data: SessionDoc | undefined;
  let isOwner = false;

  if (isDemo) {
    data = DEMO_SESSION as SessionDoc;
    isOwner = true; // owner-equivalent in demo mode
  } else {
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();

    if (!snap.exists) {
      return <ErrorFallback title={["Esta sesión", "ya no existe"]} description="Las visualizaciones expiran, se eliminan a petición del propietario, o nunca se generaron. Si tenías el enlace guardado, vuelve a generar tu propia transformación." />;
    }

    data = snap.data() as SessionDoc | undefined;
    if (!data) {
      return <ErrorFallback title={["Datos", "incompletos"]} description="Esta sesión existe pero quedó corrupta o incompleta. Puedes generar una nueva visualización privada en menos de 3 minutos." />;
    }

    // Check if the authenticated user is the owner — owners always see the full experience.
    // Reads the __session HTTP cookie set by /api/auth/session (synced by AuthProvider).
    const authUser = await getAuthUserFromCookie();
    isOwner = !!authUser?.uid && authUser.uid === data.ownerUid;
  }

  const shareScope = {
    shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
    shareInsights: data.shareScope?.shareInsights ?? false,
    shareProfile: data.shareScope?.shareProfile ?? false,
    shareImages: data.shareScope?.shareImages ?? false,
  };

  // Owner always gets full access regardless of shareScope
  const allowOriginal = isOwner || (FF_EXPOSE_ORIGINAL && shareScope.shareOriginal);
  const allowImages = isOwner || shareScope.shareImages;
  const allowInsights = isOwner || shareScope.shareInsights;
  const allowProfile = isOwner || shareScope.shareProfile;

  const ai = allowInsights ? data.ai : undefined;
  const urls = isDemo ? DEMO_URLS : await getUrlsLocally(data, allowOriginal, allowImages);

  if (!allowInsights) {
    const heroImage = urls.images?.m12 || urls.images?.m8 || urls.images?.m4 || urls.originalUrl;
    const explicitShareDecision = data.shareScope !== undefined;
    return (
      <div className="min-h-screen bg-transparent text-white">
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          <div className="space-y-2">
            <span className="ngx-eyebrow-pill">NGX Vision</span>
            <h1 className="ngx-h1 !text-left" style={{ maxWidth: "20ch" }}>Transformación privada</h1>
            <p className="text-sm leading-relaxed text-white/55 max-w-2xl">
              {explicitShareDecision
                ? "El creador decidió qué partes compartir. El análisis y las imágenes permanecen privadas salvo autorización explícita."
                : "Esta visualización es privada por defecto. Solo el creador puede ver el análisis completo."}
              {" "}
              Tus imágenes no son públicas. Puedes compartirlas cuando tú decidas.
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
            <Link
              href="/wizard"
              className="rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white text-center transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                backgroundColor: "var(--ngx-purple)",
                boxShadow: "var(--ngx-glow-primary)",
              }}
            >
              Crear mi transformación
            </Link>
            <Link
              href={`/dashboard/${shareId}`}
              className="ngx-glass-clear rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white text-center transition-all duration-150 active:scale-[0.97]"
            >
              Ver en privado
            </Link>
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

  const stillGenerating = data.status === "processing" || data.status === "generating" || data.status === "analyzed";
  const isReady = data.status === "ready" || data.status === "partial";
  const sharedUserInput = allowProfile
    ? {
        age: data.input?.age,
        sex: data.input?.sex,
        heightCm: data.input?.heightCm,
        weightKg: data.input?.weightKg,
        level: data.input?.level,
        goal: data.input?.goal,
        weeklyTime: data.input?.weeklyTime,
        focusZone: data.input?.focusZone,
        stressLevel: data.input?.stressLevel,
        sleepQuality: data.input?.sleepQuality,
        disciplineRating: data.input?.disciplineRating,
      }
    : undefined;
  const safeFocusZone = ["upper", "lower", "abs", "full"].includes(
    data.input?.focusZone ?? ""
  )
    ? (data.input?.focusZone as "upper" | "lower" | "abs" | "full")
    : undefined;
  const viewerUserProfile = allowProfile
    ? {
        focusZone: safeFocusZone,
        goal: data.input?.goal,
        stressLevel: data.input?.stressLevel,
      }
    : undefined;

  return (
    <>
      {/* Single semantic h1 for the page (a11y/SEO). Milestone titles inside the
          viewer are h2; the page itself had no h1 before. Visually hidden so it
          doesn't disturb the cinematic layout. */}
      <h1 className="sr-only">Tu diagnóstico visual de salud muscular — NGX Vision</h1>
      <ScrollToSection />
      <TransformationViewer2
        ai={ai}
        imageUrls={urls}
        shareId={shareId}
        isReady={isReady}
        surfaceMode="lead-magnet"
        letterFromFuture={data.letter_from_future}
        userProfile={viewerUserProfile}
        sessionId={shareId}
      />

      {/* Mobile-first teaser: brings the Voice Agent much earlier in the flow.
          Only renders when the feature flag is enabled. Hidden on lg+ screens. */}
      {isReady && FF_HYBRID_VOICE_AGENT && (
        <MobileVoiceAgentTeaser shareId={shareId} />
      )}

      <MuscleHealthScore
        shareId={shareId}
        diagnostic={ai.diagnostic}
        userInput={sharedUserInput}
      />
      <TransformationSummary
        ai={ai}
        imageUrls={urls}
        shareId={shareId}
        userInput={sharedUserInput}
      />
      {isReady && (
        <SeasonRoadmap />
      )}
      {isReady && FF_HYBRID_TEXT_CHAT && (
        <GenesisTextChat shareId={shareId} />
      )}
      {isReady && FF_HYBRID_VOICE_AGENT && (
        <HybridVoiceAgent shareId={shareId} />
      )}
      {isReady && (
        <HybridOfferV2 shareId={shareId} />
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
        <span className="ngx-eyebrow-pill mx-auto">NGX Vision</span>
        <h1 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "16ch" }}>
          {title[0]}
          <br />
          {title[1]}
        </h1>
        <p className="text-base leading-relaxed text-white/60 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/wizard"
            className="rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
            style={{
              backgroundColor: "var(--ngx-purple)",
              boxShadow: "var(--ngx-glow-primary)",
            }}
          >
            Crear mi transformación
          </Link>
          <Link
            href="/"
            className="ngx-glass-clear rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-all duration-150 active:scale-[0.97]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
