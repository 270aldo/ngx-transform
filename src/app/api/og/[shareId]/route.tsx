import { ImageResponse } from "next/og";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const revalidate = 3600; // 1 hora de cache ISR para mejor performance

const WIDTH = 1200;
const HEIGHT = 630;

// Feature flag for OG split-screen
const FF_OG_SPLIT_SCREEN = process.env.FF_OG_SPLIT_SCREEN === "true";

interface SessionImages {
  originalUrl?: string;
  m12Url?: string;
  goal?: string;
  level?: string;
}

async function getSessionImages(shareId: string): Promise<SessionImages | null> {
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();
  if (!snap.exists) return null;
  const data = snap.data() as {
    photo?: { originalStoragePath?: string };
    assets?: { images?: Record<string, string> };
    input?: { goal?: string; level?: string };
    shareOriginal?: boolean;
    shareScope?: { shareOriginal?: boolean };
  } | undefined;
  if (!data) return null;

  const allowOriginal = data.shareScope?.shareOriginal ?? !!data.shareOriginal;
  const originalPath = allowOriginal ? data.photo?.originalStoragePath : undefined;
  const m12Path = data.assets?.images?.m12;

  const [originalUrl, m12Url] = await Promise.all([
    originalPath ? getSignedUrl(originalPath, { expiresInSeconds: 604800 }) : Promise.resolve(undefined),
    m12Path ? getSignedUrl(m12Path, { expiresInSeconds: 604800 }) : Promise.resolve(undefined),
  ]);

  return {
    originalUrl,
    m12Url,
    goal: data.input?.goal,
    level: data.input?.level,
  };
}

// Legacy function for backward compatibility
async function getBestImage(shareId: string) {
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();
  if (!snap.exists) return null;
  const data = snap.data() as {
    photo?: { originalStoragePath?: string };
    assets?: { images?: Record<string, string> };
    input?: { goal?: string; level?: string };
    shareOriginal?: boolean;
    shareScope?: { shareOriginal?: boolean };
  } | undefined;
  if (!data) return null;

  const allowOriginal = data.shareScope?.shareOriginal ?? !!data.shareOriginal;
  const targetPath =
    data.assets?.images?.m12 ||
    data.assets?.images?.m8 ||
    data.assets?.images?.m4 ||
    (allowOriginal ? data.photo?.originalStoragePath : undefined);
  if (!targetPath) return null;
  const imageUrl = await getSignedUrl(targetPath, { expiresInSeconds: 604800 }); // 7 días para social media crawlers
  return {
    imageUrl,
    goal: data.input?.goal,
    level: data.input?.level,
  };
}

/**
 * PR-3: Split-Screen OG Image
 * HOY (m0 desaturated) vs 12 MESES (m12 vibrant)
 */
function SplitScreenOG({ images, goalLabel }: { images: SessionImages; goalLabel: string }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        background: "#050505",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left side - HOY (m0) */}
      <div
        style={{
          width: "50%",
          height: "100%",
          position: "relative",
          display: "flex",
        }}
      >
        {images.originalUrl && (
          <img
            src={images.originalUrl}
            alt="Hoy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%) brightness(0.7)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 70%, #050505 100%)",
          }}
        />
        {/* HOY label */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.3em",
              color: "#888",
              fontWeight: 600,
            }}
          >
            TU PUNTO DE PARTIDA
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#fff",
              fontStyle: "italic",
              marginTop: 8,
            }}
          >
            HOY
          </span>
        </div>
      </div>

      {/* Center divider */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, transparent, #6D00FF, transparent)",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />

      {/* Right side - 12 MESES (m12) */}
      <div
        style={{
          width: "50%",
          height: "100%",
          position: "relative",
          display: "flex",
        }}
      >
        {images.m12Url && (
          <img
            src={images.m12Url}
            alt="12 Meses"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #050505 0%, transparent 30%)",
          }}
        />
        {/* 12 MESES label */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.3em",
              color: "#9E7BFF",
              fontWeight: 600,
            }}
          >
            TU MEJOR VERSIÓN
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#fff",
              fontStyle: "italic",
              marginTop: 8,
            }}
          >
            12 MESES
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.95))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 40px 24px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            NGX
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#6D00FF",
              letterSpacing: "-0.02em",
            }}
          >
            TRANSFORM
          </span>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 16, color: "#888" }}>
            Visualiza tu transformación
          </span>
          <div
            style={{
              background: "#6D00FF",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {goalLabel}
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(109,0,255,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(109,0,255,0.6)",
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 32, color: "#fff" }}>→</span>
      </div>
    </div>
  );
}

export async function GET(_: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;

    // Use split-screen OG if feature flag enabled and both images available
    if (FF_OG_SPLIT_SCREEN) {
      const images = await getSessionImages(shareId);
      if (images?.originalUrl && images?.m12Url) {
        const goalLabel = images.goal ? images.goal.toUpperCase() : "TRANSFORM";
        return new ImageResponse(
          <SplitScreenOG images={images} goalLabel={goalLabel} />,
          { width: WIDTH, height: HEIGHT }
        );
      }
    }

    // Fallback to legacy OG
    const data = await getBestImage(shareId);

    const goalLabel = data?.goal ? data.goal.toUpperCase() : "TRANSFORM";
    const levelLabel = data?.level ? data.level.toUpperCase() : "NGX MODE";

    return new ImageResponse(
      (
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            flexDirection: "column",
            background: "radial-gradient(120% 120% at 20% 20%, rgba(109,0,255,0.15), transparent), #050505",
            color: "#E5E5E5",
            fontFamily: "Inter, 'Helvetica Neue', Arial",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background image */}
          {data?.imageUrl && (
            <img
              src={data.imageUrl}
              alt="NGX"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(4%) brightness(0.9)",
                opacity: 0.9,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.92) 100%), linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          <div style={{ padding: "48px", display: "flex", flexDirection: "column", height: "100%", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 20, letterSpacing: "0.35em", color: "#9E7BFF", fontWeight: 700 }}>NGX TRANSFORM</div>
                <div style={{ fontSize: 14, color: "#8C8C8C", marginTop: 6 }}>Visual fitness premium · Gemini + NanoBanana</div>
              </div>
              <div
                style={{
                  border: "1px solid #6D00FF",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  background: "linear-gradient(135deg, rgba(109,0,255,0.4), rgba(109,0,255,0.15))",
                }}
              >
                {goalLabel}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
              <div
                style={{
                  borderLeft: "4px solid #6D00FF",
                  paddingLeft: 20,
                  maxWidth: 720,
                }}
              >
                <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05 }}>Tu futuro físico en 12 meses</div>
                <div style={{ fontSize: 20, color: "#B3B3B3", marginTop: 12 }}>
                  Análisis biométrico, proyección 0/4/8/12m y visuales cinematográficos listos para compartir.
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, color: "#888", letterSpacing: "0.2em" }}>PROTOCOL</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#EDEDED" }}>{levelLabel}</div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  } catch (e) {
    console.error("OG error", e);
    return new ImageResponse(
      (
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0A0A0A",
            color: "#E5E5E5",
            fontFamily: "Inter, 'Helvetica Neue', Arial",
          }}
        >
          NGX Transform
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  }
}
