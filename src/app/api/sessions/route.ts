import { NextResponse } from "next/server";
import { createSessionSchema } from "@/lib/validators";
import { getDb, FieldValue } from "@/lib/firebaseAdmin";

function createShareId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = createSessionSchema.parse(payload);
    const db = getDb();
    const shareId = createShareId();

    await db.collection("sessions").doc(shareId).set({
      shareId,
      email: data.email,
      input: data.input,
      photo: { originalStoragePath: data.photoPath },
      status: "processing",
      assets: {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ sessionId: shareId });
  } catch (err) {
    console.error("POST /api/sessions", err);
    const status = err instanceof Error && "issues" in err ? 400 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error inesperado" }, { status });
  }
}
