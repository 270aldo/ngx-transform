import { ImageResponse } from "next/og";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const revalidate = 3600; // 1 hora de cache ISR para mejor performance

const WIDTH = 1200;
const HEIGHT = 630;

async function getBestImage(shareId: string) {
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();
  if (!snap.exists) return null;
  const data = snap.data() as {
    photo?: { originalStoragePath?: string };
    assets?: { images?: Record<string, string> };
    input?: { goal?: string; level?: string };
  } | undefined;
  if (!data) return null;

  const targetPath = data.assets?.images?.m12 || data.assets?.images?.m8 || data.assets?.images?.m4 || data.photo?.originalStoragePath;
  if (!targetPath) return null;
  const imageUrl = await getSignedUrl(targetPath, { expiresInSeconds: 604800 }); // 7 días para social media crawlers
  return {
    imageUrl,
    goal: data.input?.goal,
    level: data.input?.level,
  };
}

export async function GET(_: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
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
