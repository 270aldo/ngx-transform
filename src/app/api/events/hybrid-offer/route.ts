import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { sendN8NWebhook } from "@/lib/n8nWebhook";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { isSessionOwnerAuthError, requireSessionOwner } from "@/lib/authServer";

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
    const parsed = EventSchema.parse(await req.json());
    const { authUser, sessionRef: ref, session } = await requireSessionOwner<{
      ownerUid?: string;
      email?: string | null;
    }>(req, parsed.shareId);

    const limit = await checkRateLimit("api:telemetry", authUser.uid);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    await ref.set(
      {
        lastActivityAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await sendN8NWebhook(parsed.event, {
      shareId: parsed.shareId,
      email: session.email ?? null,
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
    if (isSessionOwnerAuthError(error)) {
      return NextResponse.json({ ok: false, error: error.code }, { status: error.status });
    }
    console.error("[HYBRID_OFFER_EVENT]", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
