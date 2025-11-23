import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { LeadSchema } from "@/lib/validators";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, source, consent } = parsed.data;
    const db = getDb();
    const ref = db.collection("leads").doc(email.toLowerCase());
    await ref.set(
      {
        email: email.toLowerCase(),
        source: source ?? null,
        consent: !!consent,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

