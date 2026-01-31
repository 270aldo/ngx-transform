import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/authServer";
import { FieldValue } from "firebase-admin/firestore";

const ShareSettingsSchema = z
  .object({
    shareOriginal: z.boolean().optional(),
    shareInsights: z.boolean().optional(),
    shareProfile: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one setting is required",
  });

export async function POST(req: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const authUser = await requireAuth(req);
    const { shareId } = await context.params;
    const body = await req.json();
    const parsed = ShareSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const data = snap.data() as {
      ownerUid?: string;
      shareOriginal?: boolean;
      shareScope?: {
        shareOriginal?: boolean;
        shareInsights?: boolean;
        shareProfile?: boolean;
      };
    } | undefined;
    if (!data?.ownerUid || data.ownerUid !== authUser.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentScope = {
      shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
      shareInsights: data.shareScope?.shareInsights ?? false,
      shareProfile: data.shareScope?.shareProfile ?? false,
    };

    const nextScope = {
      ...currentScope,
      ...parsed.data,
    };

    await ref.set(
      {
        shareOriginal: nextScope.shareOriginal,
        shareScope: nextScope,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, shareScope: nextScope });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SHARE_SETTINGS]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
