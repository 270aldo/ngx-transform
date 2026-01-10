import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/authServer";

const ShareSettingsSchema = z.object({
  shareOriginal: z.boolean(),
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

    const data = snap.data() as { ownerUid?: string } | undefined;
    if (!data?.ownerUid || data.ownerUid !== authUser.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ref.set(
      {
        shareOriginal: parsed.data.shareOriginal,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, shareOriginal: parsed.data.shareOriginal });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SHARE_SETTINGS]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
