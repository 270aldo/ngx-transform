import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendN8NWebhook } from "@/lib/n8nWebhook";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";

const EventSchema = z.object({
  shareId: z.string().min(1),
  event: z.enum([
    "hybrid_offer_calendly_click",
    "hybrid_offer_whatsapp_click",
    "hybrid_offer_chat_click",
  ]),
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

    const parsed = EventSchema.parse(await req.json());
    const db = getDb();
    const ref = db.collection("sessions").doc(parsed.shareId);
    const snap = await ref.get();
    const email = snap.data()?.email || null;

    await ref.set(
      {
        lastActivityAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await sendN8NWebhook(parsed.event, {
      shareId: parsed.shareId,
      email,
      source: "hybrid_offer",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[HYBRID_OFFER_EVENT]", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

