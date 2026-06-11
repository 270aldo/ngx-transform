import { getAuth } from "firebase-admin/auth";
import type { DocumentData, DocumentReference } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { getAdminApp } from "@/lib/firebaseAdmin";
import { getDb } from "@/lib/firebaseAdmin";

export interface AuthUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
}

export interface SessionOwnerResult<T extends { ownerUid?: string } = { ownerUid?: string }> {
  authUser: AuthUser;
  sessionRef: DocumentReference<DocumentData>;
  session: T;
}

export class SessionOwnerAuthError extends Error {
  constructor(
    readonly code: "UNAUTHORIZED" | "SESSION_NOT_FOUND" | "FORBIDDEN" | "SESSION_DATA_MISSING",
    readonly status: 401 | 403 | 404 | 500
  ) {
    super(code);
  }
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
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
    };
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
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
    };
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

export function isSessionOwnerAuthError(error: unknown): error is SessionOwnerAuthError {
  return error instanceof SessionOwnerAuthError;
}

export async function requireSessionOwner<
  T extends { ownerUid?: string } = { ownerUid?: string },
>(req: Request, shareId: string): Promise<SessionOwnerResult<T>> {
  let authUser: AuthUser;
  try {
    authUser = await requireAuth(req);
  } catch {
    throw new SessionOwnerAuthError("UNAUTHORIZED", 401);
  }

  const db = getDb();
  const sessionRef = db.collection("sessions").doc(shareId);
  const snap = await sessionRef.get();
  if (!snap.exists) {
    throw new SessionOwnerAuthError("SESSION_NOT_FOUND", 404);
  }

  const session = snap.data() as T | undefined;
  if (!session) {
    throw new SessionOwnerAuthError("SESSION_DATA_MISSING", 500);
  }

  if (!session.ownerUid || session.ownerUid !== authUser.uid) {
    throw new SessionOwnerAuthError("FORBIDDEN", 403);
  }

  return { authUser, sessionRef, session };
}
