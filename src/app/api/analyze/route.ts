import { NextResponse } from "next/server";
import { analyzeRequestSchema, profileSchema } from "@/lib/validators";
import { getDb, FieldValue } from "@/lib/firebaseAdmin";
import { analyzeProfileWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { sessionId } = analyzeRequestSchema.parse(payload);
    const db = getDb();
    const ref = db.collection("sessions").doc(sessionId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    const data = snap.data() as { input?: unknown; photo?: { originalStoragePath?: string } };

    const profile = profileSchema.parse(data.input);

    const ai = await analyzeProfileWithGemini({
      profile,
      sessionId,
    });

    await ref.set(
      {
        ai,
        status: "ready",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ status: "ready", ai });
  } catch (err) {
    console.error("POST /api/analyze", err);
    const status = err instanceof Error && "issues" in err ? 400 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error interno" }, { status });
  }
}
