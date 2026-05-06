import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { suppressEmail } from "@/lib/emailSuppression";
import { unsubscribeSequence } from "@/lib/emailScheduler";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";
import { verifyUnsubscribeToken } from "@/lib/unsubscribeToken";

const UnsubscribeSchema = z.object({
  shareId: z.string().min(1),
  token: z.string().min(20).optional(),
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
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit("api:general", clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await req.json();
    const parsed = UnsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { shareId, token, reason } = parsed.data;
    if (!verifyUnsubscribeToken(shareId, token)) {
      return NextResponse.json({ error: "Invalid or missing unsubscribe token" }, { status: 401 });
    }

    let targetEmail = "";
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();
    if (snap.exists) {
      const data = snap.data() as { email?: string };
      targetEmail = data.email || "";
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

export async function GET() {
  return NextResponse.json({ error: "Use POST to confirm unsubscribe" }, { status: 405 });
}
