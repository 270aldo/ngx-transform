import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";
import { getAuthUser } from "@/lib/authServer";

const FF_EXPOSE_ORIGINAL = process.env.FF_EXPOSE_ORIGINAL !== "false";

export async function GET(req: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as {
      ownerUid?: string;
      shareOriginal?: boolean;
      shareScope?: {
        shareOriginal?: boolean;
      };
      photo?: { originalStoragePath?: string };
      assets?: { images?: Record<string, string> };
    } | undefined;
    const photoPath: string | undefined = data?.photo?.originalStoragePath;
    const images: Record<string, string> | undefined = data?.assets?.images;

    const result: { originalUrl?: string; images?: Record<string, string> } = {};

    const authUser = await getAuthUser(req);
    const isOwner = authUser?.uid && data?.ownerUid && authUser.uid === data.ownerUid;
    const shareScope = {
      shareOriginal: data?.shareScope?.shareOriginal ?? !!data?.shareOriginal,
    };
    const allowPublicOriginal = FF_EXPOSE_ORIGINAL && shareScope.shareOriginal;

    if (photoPath && (isOwner || allowPublicOriginal)) {
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
