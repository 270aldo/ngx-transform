import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validators";
import { getDb, FieldValue } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = leadSchema.parse(payload);
    const db = getDb();
    await db.collection("leads").add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/leads", err);
    const status = err instanceof Error && "issues" in err ? 400 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error inesperado" }, { status });
  }
}
