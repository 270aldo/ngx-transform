import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { generateGenesisIntro, buildGenesisIntroScript } from "@/lib/elevenlabs-voice";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";
import { getAuthUser } from "@/lib/authServer";

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

    // Rate limiting by IP
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit("api:genesis-voice", clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
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
      ownerUid?: string;
      shareScope?: { shareProfile?: boolean };
      input: {
        level: string;
        goal: string;
      };
    };

    const authUser = await getAuthUser(req);
    const isOwner = !!(authUser?.uid && data.ownerUid && authUser.uid === data.ownerUid);
    const emailMatch = !!(authUser?.email && data.email && authUser.email.toLowerCase() === data.email.toLowerCase());
    const allowProfile = isOwner || emailMatch || !!data.shareScope?.shareProfile;

    const userName = (isOwner || emailMatch) ? (data.email?.split("@")[0] || "Usuario") : "Usuario";
    const userLevel = allowProfile ? (data.input?.level || "intermedio") : "intermedio";
    const userGoal = allowProfile ? (data.input?.goal || "mixto") : "mixto";

    const transcript = buildGenesisIntroScript(userName, userLevel, userGoal);

    // Check cache after access evaluation to avoid poisoning
    const cacheKey = allowProfile ? shareId : `${shareId}:public`;
    const cached = audioCache.get(cacheKey);
    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        audioBase64: cached.audioBase64,
        transcript,
        cached: true,
      });
    }

    // Check if ElevenLabs API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      // Return transcript without audio if no API key
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
    audioCache.set(cacheKey, {
      audioBase64,
      generatedAt: Date.now(),
    });

    // Build transcript
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
  const publicCached = audioCache.get(`${shareId}:public`);
  const isCached = !!((cached && Date.now() - cached.generatedAt < CACHE_TTL_MS)
    || (publicCached && Date.now() - publicCached.generatedAt < CACHE_TTL_MS));

  return NextResponse.json({
    success: true,
    cached: isCached,
    hasApiKey: !!process.env.ELEVENLABS_API_KEY,
  });
}
