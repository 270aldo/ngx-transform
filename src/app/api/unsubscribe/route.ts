import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { suppressEmail } from "@/lib/emailSuppression";
import { unsubscribeSequence } from "@/lib/emailScheduler";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";
import { verifyUnsubscribeToken } from "@/lib/unsubscribeToken";

export const runtime = "nodejs";

const UnsubscribeSchema = z.object({
  // Signed token (preferred). When present, email/shareId in the body
  // are ignored — the token is the source of truth.
  u: z.string().min(10).optional(),
  // Legacy fallback (only valid for emails sent before AUDIT-006).
  email: z.string().email().optional(),
  shareId: z.string().min(1).optional(),
  reason: z.string().max(200).optional(),
});

async function handleUnsubscribe(email: string, shareId?: string | null, reason?: string) {
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

interface ResolveResult {
  email: string;
  shareId: string | null;
  via: "token" | "legacy";
}

/**
 * Resolve the target email from either a signed token or legacy params.
 * Returns null on any auth/lookup failure (caller maps to error response).
 */
async function resolveTarget(input: {
  u?: string;
  email?: string;
  shareId?: string;
}): Promise<{ ok: true; data: ResolveResult } | { ok: false; status: number; error: string }> {
  // Path A — signed token (preferred)
  if (input.u) {
    const verified = verifyUnsubscribeToken(input.u);
    if (!verified.ok) {
      Sentry.captureMessage("unsubscribe.token.invalid", {
        level: "warning",
        tags: { component: "unsubscribe", reason: verified.reason },
      });
      return { ok: false, status: 400, error: "Invalid or expired unsubscribe link" };
    }
    return {
      ok: true,
      data: { email: verified.email, shareId: verified.shareId, via: "token" },
    };
  }

  // Path B — legacy. Will be removed once oldest in-flight emails
  // exceed UNSUBSCRIBE_TOKEN_TTL_DAYS (~60 days).
  if (!input.email && !input.shareId) {
    return { ok: false, status: 400, error: "Token required (use the link from your email)" };
  }

  Sentry.captureMessage("unsubscribe.legacy_path_used", {
    level: "info",
    tags: { component: "unsubscribe", path: "legacy" },
  });

  let targetEmail = input.email || "";
  let targetShareId = input.shareId || null;
  if (!targetEmail && input.shareId) {
    const db = getDb();
    const snap = await db.collection("sessions").doc(input.shareId).get();
    if (snap.exists) {
      const data = snap.data() as { email?: string };
      targetEmail = data.email || "";
    }
  }
  if (!targetEmail) {
    return { ok: false, status: 404, error: "Email not found" };
  }
  return { ok: true, data: { email: targetEmail, shareId: targetShareId, via: "legacy" } };
}

async function rateLimitOrFail(req: Request) {
  const clientIP = getClientIP(req);
  const rl = await checkRateLimit("api:general", clientIP);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: getRateLimitHeaders(rl) }
    );
  }
  return null;
}

export async function POST(req: NextRequest) {
  const rlBlock = await rateLimitOrFail(req);
  if (rlBlock) return rlBlock;
  try {
    const body = await req.json();
    const parsed = UnsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const resolved = await resolveTarget(parsed.data);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }
    await handleUnsubscribe(resolved.data.email, resolved.data.shareId, parsed.data.reason);
    return NextResponse.json({ success: true, via: resolved.data.via });
  } catch (error) {
    console.error("[Unsubscribe POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const rlBlock = await rateLimitOrFail(req);
  if (rlBlock) return rlBlock;
  const { searchParams } = new URL(req.url);
  const u = searchParams.get("u") || undefined;
  const email = searchParams.get("email") || undefined;
  const shareId = searchParams.get("shareId") || undefined;
  const reason = searchParams.get("reason") || undefined;

  try {
    const resolved = await resolveTarget({ u, email, shareId });
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }
    await handleUnsubscribe(resolved.data.email, resolved.data.shareId, reason);
    return NextResponse.json({ success: true, via: resolved.data.via });
  } catch (error) {
    console.error("[Unsubscribe GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
