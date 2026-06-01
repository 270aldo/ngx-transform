import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { sendN8NWebhook } from "@/lib/n8nWebhook";
import { trackEvent } from "@/lib/telemetry";
import { isSessionOwnerAuthError, requireSessionOwner } from "@/lib/authServer";

export const runtime = "nodejs";

/**
 * Persists the GENESIS voice-agent fit classification and routes the lead into
 * the funnel. Called by HybridVoiceAgent when the realtime classifier emits a
 * label. Public (anonymous visitors talk to the agent), so it is rate-limited
 * and only writes to an existing session — never creates one.
 */
const ClassifySchema = z.object({
  classification: z.enum([
    "listo_para_diagnostico",
    "necesita_claridad",
    "no_fit_ahora",
  ]),
  // Optional short, consented summary of the conversation. Capped to avoid abuse.
  summary: z.string().max(2000).optional(),
  consentSummary: z.boolean().optional().default(false),
});

/** Maps each fit label to the funnel track it should enter. */
const TRACK_BY_CLASSIFICATION: Record<
  z.infer<typeof ClassifySchema>["classification"],
  "hybrid" | "ascend" | "nurture"
> = {
  listo_para_diagnostico: "hybrid",
  necesita_claridad: "ascend",
  no_fit_ahora: "nurture",
};

export async function POST(
  req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await context.params;
    if (!shareId) {
      return NextResponse.json({ error: "Missing shareId" }, { status: 400 });
    }

    const parsed = ClassifySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { classification, summary, consentSummary } = parsed.data;
    const track = TRACK_BY_CLASSIFICATION[classification];

    const { authUser, sessionRef: ref, session } = await requireSessionOwner<{
      ownerUid?: string;
      email?: string | null;
    }>(req, shareId);

    const rl = await checkRateLimit("api:realtime-session", authUser.uid);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    await ref.set(
      {
        funnel: {
          fitClassification: classification,
          track,
          // Only store the transcript summary when the user opted in.
          ...(consentSummary && summary
            ? { conversationSummary: summary, summaryConsentAt: FieldValue.serverTimestamp() }
            : {}),
          classifiedAt: FieldValue.serverTimestamp(),
        },
        lastActivityAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Telemetry (PII-scrubbed downstream) + CRM/funnel routing webhook.
    await trackEvent({
      sessionId: shareId,
      event: "voice_agent_classified",
      metadata: { classification, track },
    });

    void sendN8NWebhook("lead_classified", {
      shareId,
      classification,
      track,
      email: session.email ?? null,
      hasSummary: !!(consentSummary && summary),
    });

    return NextResponse.json({ ok: true, classification, track });
  } catch (e: unknown) {
    if (isSessionOwnerAuthError(e)) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("[Classify]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
