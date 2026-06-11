import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { deletePath, deletePrefix, getSignedUrl } from "@/lib/storage";
import { validateDeleteToken } from "@/lib/jobManager";
import {
  isSessionOwnerAuthError,
  requireSessionOwner,
  type SessionOwnerResult,
} from "@/lib/authServer";
import { purgeSessionLinkedData, purgeLeadRecords } from "@/lib/sessionPurge";

interface DeleteSessionDocument {
  ownerUid?: string;
  email?: string;
  photo?: { originalStoragePath?: string };
  assets?: { images?: Record<string, string> };
}

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
        shareImages?: boolean;
      };
      ai?: unknown;
      confirmationEmailSent?: boolean;
      createdAt?: unknown;
    };

    const shareScope = {
      shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
      shareInsights: data.shareScope?.shareInsights ?? false,
      shareProfile: data.shareScope?.shareProfile ?? false,
      shareImages: data.shareScope?.shareImages ?? false,
    };

    const images = data.assets?.images || {};
    const assetKeys = Object.keys(images);
    const signedImages: Record<string, string> = {};
    if (shareScope.shareImages) {
      await Promise.all(
        Object.entries(images).map(async ([key, path]) => {
          try {
            signedImages[key] = await getSignedUrl(path, { expiresInSeconds: 3600 });
          } catch (err) {
            console.error(`[Sessions/Public] Failed to sign ${key}:`, err);
          }
        })
      );
    }

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
      assetKeys,
      hasImages: assetKeys.length > 0,
      hasAi: data.ai != null,
      confirmationEmailSent: Boolean(data.confirmationEmailSent),
      originalUrl,
      profile: publicProfile,
      shareScope,
      hasPhoto: !!data.photo?.originalStoragePath,
      createdAt: data.createdAt,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;

    // Legacy deleteToken path is preserved, but owner auth is the primary path.
    const token = req.headers.get("X-Delete-Token") || "";
    const tokenValid = token ? await validateDeleteToken(shareId, token) : false;

    let ownerContext: SessionOwnerResult<DeleteSessionDocument> | null = null;

    if (!tokenValid) {
      try {
        ownerContext = await requireSessionOwner<DeleteSessionDocument>(req, shareId);
      } catch (error) {
        if (isSessionOwnerAuthError(error)) {
          return NextResponse.json(
            { error: token ? "Invalid delete token or owner credentials" : error.code },
            { status: token ? 403 : error.status }
          );
        }
        throw error;
      }
    }

    const db = getDb();
    const ref = ownerContext?.sessionRef ?? db.collection("sessions").doc(shareId);
    const snap = ownerContext ? null : await ref.get();
    if (!ownerContext && !snap?.exists) return NextResponse.json({ ok: true });

    const data = ownerContext
      ? ownerContext.session
      : (snap?.data() as DeleteSessionDocument | undefined);
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

    // Purge derived artifacts (report doc + PDF, email sequence, jobs, metrics)
    // and — this is a user cancellation — the lead/marketing records (fix-10).
    await purgeSessionLinkedData(db, [shareId]);
    await purgeLeadRecords(db, data?.email);

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
