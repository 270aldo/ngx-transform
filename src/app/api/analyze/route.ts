import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { AnalyzeSchema } from "@/lib/validators";
import { getSignedUrl } from "@/lib/storage";
import { generateInsightsFromImage } from "@/lib/gemini";
import { FieldValue } from "firebase-admin/firestore";

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
  };
  photo?: { originalStoragePath?: string };
  ai?: unknown;
  assets?: { images?: Record<string, string> };
  status: "processing" | "ready" | "failed";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId } = parsed.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY no está configurado" }, { status: 400 });
    }

    const db = getDb();
    const ref = db.collection("sessions").doc(sessionId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const data = snap.data() as SessionDoc | undefined;
    if (!data) return NextResponse.json({ error: "Session data missing" }, { status: 500 });

    const photoPath = data.photo?.originalStoragePath;
    if (!photoPath) return NextResponse.json({ error: "Missing photo" }, { status: 400 });

    const imageUrl = await getSignedUrl(photoPath, { expiresInSeconds: 3600 });

    const ai = await generateInsightsFromImage({
      imageUrl,
      profile: data.input,
    });

    await ref.set(
      {
        ai,
        status: "ready",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, ai });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

