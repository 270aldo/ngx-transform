import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { GenerateImagesSchema } from "@/lib/validators";
import { getSignedUrl, uploadBuffer } from "@/lib/storage";
import { generateTransformedImage, type NanoStep } from "@/lib/nanobanana";
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
    const parsed = GenerateImagesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    const steps = (parsed.data.steps ?? ["m4", "m8", "m12"]) as NanoStep[];

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY no está configurada" }, { status: 400 });
    }

    const db = getDb();
    const ref = db.collection("sessions").doc(sessionId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    const data = snap.data() as SessionDoc | undefined;
    if (!data) return NextResponse.json({ error: "Session data missing" }, { status: 500 });

    const photoPath = data.photo?.originalStoragePath;
    if (!photoPath) return NextResponse.json({ error: "Missing photo" }, { status: 400 });

    const imageUrl = await getSignedUrl(photoPath, { expiresInSeconds: 3600 });

    const images: Record<string, string> = {};

    for (const step of steps) {
      const { buffer, contentType } = await generateTransformedImage({
        imageUrl,
        profile: data.input,
        step,
      });
      const ext = contentType.includes("png") ? "png" : "jpg";
      const storagePath = `sessions/${sessionId}/generated/${step}.${ext}`;
      await uploadBuffer(storagePath, buffer, contentType);
      images[step] = storagePath;
    }

    await ref.set(
      { assets: { ...(data.assets || {}), images }, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return NextResponse.json({ ok: true, images });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

