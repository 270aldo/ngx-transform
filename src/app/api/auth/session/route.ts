/**
 * Session Cookie Endpoint
 *
 * Translates Firebase ID tokens (from client-side Auth) into HTTP session cookies
 * that Server Components can read via `cookies()`.
 *
 * Why: Server Components don't receive Authorization headers. Firebase Anonymous Auth
 * stores tokens in localStorage/IndexedDB on the client; the server can't see them.
 * This endpoint bridges that gap by exchanging the ID token for a long-lived session
 * cookie signed by Firebase Admin.
 *
 * Flow:
 *   1. Client signs in (anonymous or email) → gets ID token
 *   2. Client POSTs ID token to this endpoint
 *   3. Server verifies token + creates session cookie via Admin SDK
 *   4. Server sets HttpOnly Secure SameSite=Lax cookie `__session`
 *   5. Server Components call `cookies().get("__session")` → verify → know who the user is
 *
 * Sign out:
 *   - Client signs out from Firebase + DELETEs this endpoint to clear cookie.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebaseAdmin";

// 14 days — Firebase Admin SDK max. Longer-lived cookie keeps the owner anchored
// across more return visits before ITP/anon-credential purge bites (fix-08 #1009).
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "__session";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    // Verify the ID token (rejects expired/forged tokens — ID tokens live ~1 hour).
    // We don't enforce a "recent auth" window here because anonymous sessions can
    // persist for days; routes that need fresh auth (e.g. account deletion) should
    // call verifySessionCookie with checkRevoked + their own auth_time check.
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);

    const sessionCookie = await getAuth(getAdminApp()).createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ uid: decoded.uid, ok: true });
  } catch (error) {
    console.warn("[Auth Session] Failed to create session cookie:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.warn("[Auth Session] Failed to clear session cookie:", error);
    return NextResponse.json({ ok: true }); // best-effort
  }
}
