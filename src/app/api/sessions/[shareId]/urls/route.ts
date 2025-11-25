import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";

export async function GET(_: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as {
      photo?: { originalStoragePath?: string };
      assets?: { images?: Record<string, string> };
    } | undefined;
    const photoPath: string | undefined = data?.photo?.originalStoragePath;
    const images: Record<string, string> | undefined = data?.assets?.images;

    const result: { originalUrl?: string; images?: Record<string, string> } = {};

    if (photoPath) {
      result.originalUrl = await getSignedUrl(photoPath, { expiresInSeconds: 3600 });
    }

    if (images) {
      const out: Record<string, string> = {};
      const timestamp = Date.now();
      await Promise.all(
        Object.entries(images).map(async ([k, p]) => {
          const url = await getSignedUrl(p, { expiresInSeconds: 3600 });
          out[k] = `${url}&t=${timestamp}`;
        })
      );
      result.images = out;
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
