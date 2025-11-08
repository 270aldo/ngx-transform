import { NextResponse } from "next/server";
import { getDb, FieldValue } from "@/lib/firebaseAdmin";
import { deletePrefix } from "@/lib/storage";

interface Params {
  shareId: string;
}

export async function GET(_: Request, context: { params: Promise<Params> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const data = snap.data() as { status?: string; ai?: unknown };
    return NextResponse.json({ status: data.status, hasAi: Boolean(data.ai) });
  } catch (err) {
    console.error(`GET /api/sessions/[shareId]`, err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<Params> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const data = snap.data() as { photo?: { originalStoragePath?: string } } | undefined;
    await ref.delete();
    await db.collection("sessions_trash").doc(shareId).set({
      shareId,
      deletedAt: FieldValue.serverTimestamp(),
    });
    if (data?.photo?.originalStoragePath) {
      const prefix = data.photo.originalStoragePath.split("/").slice(0, -1).join("/");
      if (prefix) await deletePrefix(prefix);
    }
    await deletePrefix(`generated/${shareId}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/sessions/[shareId]`, err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
