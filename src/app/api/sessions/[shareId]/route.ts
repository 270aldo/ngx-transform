import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { deletePath, deletePrefix, getSignedUrl } from "@/lib/storage";
import { validateDeleteToken } from "@/lib/jobManager";

export async function GET(_: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = snap.data() as {
      shareId?: string;
      status?: string;
      assets?: { images?: Record<string, string> };
      photo?: { originalStoragePath?: string };
      input?: {
        level?: string;
        goal?: string;
        focusZone?: string;
        weeklyTime?: number;
      };
      shareOriginal?: boolean;
      shareScope?: {
        shareOriginal?: boolean;
        shareInsights?: boolean;
        shareProfile?: boolean;
      };
      createdAt?: unknown;
    };

    const shareScope = {
      shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
      shareInsights: data.shareScope?.shareInsights ?? false,
      shareProfile: data.shareScope?.shareProfile ?? false,
    };

    const images = data.assets?.images || {};
    const signedImages: Record<string, string> = {};
    await Promise.all(
      Object.entries(images).map(async ([key, path]) => {
        try {
          signedImages[key] = await getSignedUrl(path, { expiresInSeconds: 3600 });
        } catch (err) {
          console.error(`[Sessions/Public] Failed to sign ${key}:`, err);
        }
      })
    );

    let originalUrl: string | undefined;
    if (shareScope.shareOriginal && data.photo?.originalStoragePath) {
      try {
        originalUrl = await getSignedUrl(data.photo.originalStoragePath, { expiresInSeconds: 3600 });
      } catch (err) {
        console.error("[Sessions/Public] Failed to sign original:", err);
      }
    }

    const publicProfile = shareScope.shareProfile && data.input
      ? {
          level: data.input.level,
          goal: data.input.goal,
          focusZone: data.input.focusZone,
          weeklyTime: data.input.weeklyTime,
        }
      : undefined;

    return NextResponse.json({
      shareId: data.shareId || shareId,
      status: data.status,
      assets: { images: signedImages },
      originalUrl,
      profile: publicProfile,
      shareScope,
      hasPhoto: !!data.photo?.originalStoragePath,
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

    // Extract deleteToken from header only (no query params)
    const token = req.headers.get("X-Delete-Token") || "";

    // Validate token (controlled by FF_DELETE_TOKEN_REQUIRED env var)
    const isValid = await validateDeleteToken(shareId, token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or missing delete token" },
        { status: 403 }
      );
    }

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
