import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, getDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/authServer";
import { claimSessionsForUser } from "@/lib/sessionClaim";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Claim every session matching the caller's VERIFIED email (fix-07). No body,
 * no shareId — possession of a verified email is the sole criterion, which
 * closes the account-takeover vector (knowing a foreign shareId buys nothing).
 * Idempotent: a second call returns claimed: 0.
 */
export async function POST(req: Request) {
  try {
    const authUser = await requireAuth(req);

    if (!authUser.email || !authUser.emailVerified) {
      return NextResponse.json(
        {
          error: "EMAIL_NOT_VERIFIED",
          message: "Verifica tu correo para recuperar tus sesiones.",
        },
        { status: 403 },
      );
    }

    const rl = await checkRateLimit("api:claim", authUser.uid);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: getRateLimitHeaders(rl) },
      );
    }

    const result = await claimSessionsForUser(getDb(), getAuth(getAdminApp()), {
      uid: authUser.uid,
      email: authUser.email,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SESSIONS_CLAIM]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
