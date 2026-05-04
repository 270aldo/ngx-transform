import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { getAdminApp } from "@/lib/firebaseAdmin";

export interface AuthUser {
  uid: string;
  email?: string;
}

const SESSION_COOKIE_NAME = "__session";

/**
 * Authenticate via `Authorization: Bearer <idToken>` header.
 * Use this in API routes where the client explicitly forwards the ID token.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch (error) {
    console.warn("[Auth] Invalid token", error);
    return null;
  }
}

/**
 * Authenticate via the `__session` HTTP cookie set by `/api/auth/session`.
 * Use this in Server Components / Server Actions that don't receive
 * Authorization headers from the browser.
 *
 * Returns null when no cookie, expired, or invalid signature — caller
 * should treat that as "anonymous public visitor".
 *
 * Optional `checkRevoked` (default false): set true on highly sensitive
 * operations to verify against Firebase Auth's revocation list (extra round trip).
 */
export async function getAuthUserFromCookie(
  options: { checkRevoked?: boolean } = {}
): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!session) return null;

    const decoded = await getAuth(getAdminApp()).verifySessionCookie(
      session,
      options.checkRevoked ?? false
    );
    return { uid: decoded.uid, email: decoded.email };
  } catch (error) {
    // Expired / revoked / invalid signature — silent fallback to anonymous
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Auth] Invalid session cookie", error);
    }
    return null;
  }
}

/**
 * Convenience: try cookie first, fall back to Authorization header.
 * Use this in routes that may be hit by either Server Components (cookie)
 * or client-side fetches (header).
 */
export async function getAuthUserAny(req: Request): Promise<AuthUser | null> {
  return (await getAuthUserFromCookie()) ?? (await getAuthUser(req));
}

export async function requireAuth(req: Request): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
