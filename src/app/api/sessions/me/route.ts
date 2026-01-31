import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/authServer";
import type { Timestamp } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const authUser = await requireAuth(req);
    const db = getDb();

    const snapshot = await db
      .collection("sessions")
      .where("ownerUid", "==", authUser.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const sessions = snapshot.docs.map((doc) => {
      const data = doc.data() as {
        shareId: string;
        status?: string;
        shareOriginal?: boolean;
        shareScope?: {
          shareOriginal?: boolean;
          shareInsights?: boolean;
          shareProfile?: boolean;
        };
        input?: { goal?: string; level?: string };
        createdAt?: Timestamp;
      };
      const shareScope = {
        shareOriginal: data.shareScope?.shareOriginal ?? !!data.shareOriginal,
        shareInsights: data.shareScope?.shareInsights ?? false,
        shareProfile: data.shareScope?.shareProfile ?? false,
      };
      return {
        shareId: data.shareId,
        status: data.status,
        shareOriginal: shareScope.shareOriginal,
        shareScope,
        goal: data.input?.goal,
        level: data.input?.level,
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    });

    return NextResponse.json({ success: true, sessions });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SESSIONS_ME]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
