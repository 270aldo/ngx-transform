import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";

const FeedbackSchema = z.object({
  shareId: z.string().min(1),
  score: z.number().int().min(1).max(10),
  reason: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  category: z.enum(["promoter", "needs_clarity"]),
});

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const limit = await checkRateLimit("api:general", clientIP);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const payload = FeedbackSchema.parse(await req.json());
    const db = getDb();
    await db.collection("feedback").add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ip: clientIP,
    });

    await db
      .collection("sessions")
      .doc(payload.shareId)
      .set(
        {
          lastActivityAt: FieldValue.serverTimestamp(),
          npsScore: payload.score,
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[FEEDBACK_ROUTE]", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

