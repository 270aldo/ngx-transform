import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/authServer";
import { verifyAccessToken } from "@/lib/accessToken";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Re-anchor ownership of a single session via an HMAC `access` token from an
 * email link (fix-08). The authenticated caller (anonymous or not) becomes the
 * new owner, so a returning lead on a new device can view + pay. Possession of
 * the signed token (delivered only to the session's email) is the authorization.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await context.params;
    const authUser = await requireAuth(req);

    const rl = await checkRateLimit("api:general", authUser.uid);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { token?: unknown };
    const token = typeof body.token === "string" ? body.token : null;
    if (!verifyAccessToken(shareId, token)) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 403 }
      );
    }

    const ref = getDb().collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await ref.update({
      ownerUid: authUser.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SESSION_CLAIM_TOKEN]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
