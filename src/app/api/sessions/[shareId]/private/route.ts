import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";
import { requireAuth } from "@/lib/authServer";

export async function GET(req: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const authUser = await requireAuth(req);
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = snap.data() as {
      shareId?: string;
      ownerUid?: string;
      shareOriginal?: boolean;
      status?: string;
      input?: unknown;
      ai?: unknown;
      assets?: { images?: Record<string, string> };
      photo?: { originalStoragePath?: string };
    };

    if (!data.ownerUid || data.ownerUid !== authUser.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const photoPath = data.photo?.originalStoragePath;
    const images = data.assets?.images || {};

    const result: {
      originalUrl?: string;
      images?: Record<string, string>;
    } = {};

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

    return NextResponse.json({
      shareId: data.shareId || shareId,
      status: data.status,
      input: data.input,
      ai: data.ai,
      assets: data.assets,
      photo: data.photo,
      shareOriginal: data.shareOriginal || false,
      urls: result,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SESSIONS_PRIVATE]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
