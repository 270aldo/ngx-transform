import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { generateGenesisIntro, buildGenesisIntroScript } from "@/lib/elevenlabs-voice";

// Rate limit: 1 audio generation per shareId
const audioCache = new Map<string, { audioBase64: string; generatedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const requestSchema = z.object({
  shareId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareId } = requestSchema.parse(body);

    // Check cache first
    const cached = audioCache.get(shareId);
    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        audioBase64: cached.audioBase64,
        transcript: await getTranscript(shareId),
        cached: true,
      });
    }

    // Fetch session data
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    const data = snap.data() as {
      email?: string;
      input: {
        level: string;
        goal: string;
      };
    };

    const userName = data.email?.split("@")[0] || "Usuario";
    const userLevel = data.input?.level || "intermedio";
    const userGoal = data.input?.goal || "mixto";

    // Check if ElevenLabs API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      // Return transcript without audio if no API key
      const transcript = buildGenesisIntroScript(userName, userLevel, userGoal);
      return NextResponse.json({
        success: true,
        audioBase64: null,
        transcript,
        fallback: true,
        message: "Audio generation not configured. Using text fallback.",
      });
    }

    // Generate audio with ElevenLabs
    const { audioBuffer } = await generateGenesisIntro(userName, userLevel, userGoal);
    const audioBase64 = audioBuffer.toString("base64");

    // Cache the result
    audioCache.set(shareId, {
      audioBase64,
      generatedAt: Date.now(),
    });

    // Build transcript
    const transcript = buildGenesisIntroScript(userName, userLevel, userGoal);

    return NextResponse.json({
      success: true,
      audioBase64,
      transcript,
      cached: false,
    });
  } catch (error) {
    console.error("[genesis-voice] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    // Return fallback with transcript if audio fails
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate audio",
        fallback: true,
        transcript: "Hola. Soy GENESIS, tu coach de inteligencia artificial. Responde las preguntas para crear tu plan personalizado.",
      },
      { status: 500 }
    );
  }
}

async function getTranscript(shareId: string): Promise<string> {
  try {
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();
    if (!snap.exists) return "";

    const data = snap.data() as {
      email?: string;
      input: { level: string; goal: string };
    };

    const userName = data.email?.split("@")[0] || "Usuario";
    return buildGenesisIntroScript(
      userName,
      data.input?.level || "intermedio",
      data.input?.goal || "mixto"
    );
  } catch (err) {
    console.error("[GenesisVoice] getTranscript failed:", err instanceof Error ? err.message : err);
    return "";
  }
}

// GET endpoint to check if audio is cached
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get("shareId");

  if (!shareId) {
    return NextResponse.json(
      { success: false, error: "shareId required" },
      { status: 400 }
    );
  }

  const cached = audioCache.get(shareId);
  const isCached = cached && Date.now() - cached.generatedAt < CACHE_TTL_MS;

  return NextResponse.json({
    success: true,
    cached: isCached,
    hasApiKey: !!process.env.ELEVENLABS_API_KEY,
  });
}
