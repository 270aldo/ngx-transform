import { NextResponse } from "next/server";
import { generateImagesSchema } from "@/lib/validators";
import { getDb, FieldValue } from "@/lib/firebaseAdmin";
import { generateTransformationImages } from "@/lib/nanobanana";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { sessionId } = generateImagesSchema.parse(payload);
    const db = getDb();
    const ref = db.collection("sessions").doc(sessionId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    const data = snap.data() as { photo?: { originalStoragePath?: string } };
    const sourcePath = data.photo?.originalStoragePath;
    if (!sourcePath) {
      return NextResponse.json({ error: "Sesión sin fotografía" }, { status: 400 });
    }

    const images = await generateTransformationImages({ sessionId, sourcePath });
    await ref.set(
      {
        assets: { images },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, images });
  } catch (err) {
    console.error("POST /api/generate-images", err);
    const status = err instanceof Error && "issues" in err ? 400 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error interno" }, { status });
  }
}
