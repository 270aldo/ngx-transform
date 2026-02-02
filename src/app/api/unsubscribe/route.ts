import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { suppressEmail } from "@/lib/emailSuppression";
import { unsubscribeSequence } from "@/lib/emailScheduler";

const UnsubscribeSchema = z.object({
  email: z.string().email().optional(),
  shareId: z.string().min(1).optional(),
  reason: z.string().max(200).optional(),
});

async function handleUnsubscribe(email: string, shareId?: string, reason?: string) {
  await suppressEmail(email, reason || "user_unsubscribe", { shareId: shareId || null });
  if (shareId) {
    try {
      await unsubscribeSequence(shareId);
    } catch (error) {
      console.warn("[Unsubscribe] Sequence update failed:", error);
    }
    const db = getDb();
    await db.collection("sessions").doc(shareId).set(
      {
        emailOptOut: true,
        emailOptOutReason: reason || "user_unsubscribe",
      },
      { merge: true }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UnsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email, shareId, reason } = parsed.data;

    if (!email && !shareId) {
      return NextResponse.json({ error: "email or shareId required" }, { status: 400 });
    }

    let targetEmail = email || "";
    if (!targetEmail && shareId) {
      const db = getDb();
      const snap = await db.collection("sessions").doc(shareId).get();
      if (snap.exists) {
        const data = snap.data() as { email?: string };
        targetEmail = data.email || "";
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    await handleUnsubscribe(targetEmail, shareId, reason);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Unsubscribe] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || undefined;
  const shareId = searchParams.get("shareId") || undefined;
  const reason = searchParams.get("reason") || undefined;

  if (!email && !shareId) {
    return NextResponse.json({ error: "email or shareId required" }, { status: 400 });
  }

  try {
    let targetEmail = email || "";
    if (!targetEmail && shareId) {
      const db = getDb();
      const snap = await db.collection("sessions").doc(shareId).get();
      if (snap.exists) {
        const data = snap.data() as { email?: string };
        targetEmail = data.email || "";
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    await handleUnsubscribe(targetEmail, shareId, reason);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Unsubscribe] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
