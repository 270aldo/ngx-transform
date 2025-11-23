import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { CreateSessionSchema } from "@/lib/validators";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, input, photoPath } = parsed.data;

    const db = getDb();
    const shareId = randomUUID().replace(/-/g, "").slice(0, 12);
    const ref = db.collection("sessions").doc(shareId);

    await ref.set({
      shareId,
      email: email ?? null,
      input,
      photo: { originalStoragePath: photoPath },
      ai: null,
      assets: {},
      status: "processing",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ sessionId: shareId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

