import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { deletePath, deletePrefix } from "@/lib/storage";

export async function GET(_: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = snap.data()!;
    return NextResponse.json({
      shareId: data.shareId,
      status: data.status,
      input: data.input,
      ai: data.ai,
      assets: data.assets,
      photo: { originalStoragePath: data.photo?.originalStoragePath },
      createdAt: data.createdAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: true });

    const data = snap.data() as {
      photo?: { originalStoragePath?: string };
      assets?: { images?: Record<string, string> };
    } | undefined;
    const photoPath: string | undefined = data?.photo?.originalStoragePath;
    const images: Record<string, string> | undefined = data?.assets?.images;

    // Delete generated images
    if (images) {
      await Promise.all(Object.values(images).map((p) => deletePath(p)));
    }
    // Delete original upload (if in uploads/ prefix)
    if (photoPath) await deletePath(photoPath);

    // Optionally cleanup session folder
    await deletePrefix(`sessions/${shareId}/`);

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

