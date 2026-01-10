import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebaseAdmin";

export interface AuthUser {
  uid: string;
  email?: string;
}

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

export async function requireAuth(req: Request): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
