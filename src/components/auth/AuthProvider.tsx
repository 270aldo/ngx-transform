"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebaseClient";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Exchange a Firebase ID token for an HTTP session cookie that Server Components
 * can read. Best-effort: silently swallows failures so a network blip doesn't
 * break the client-side auth flow (the user can still call API routes with the
 * Authorization header as fallback).
 */
async function syncSessionCookie(idToken: string): Promise<void> {
  try {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Auth] Failed to sync session cookie", err);
    }
  }
}

async function clearSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    /* best-effort */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastSyncedUidRef = useRef<string | null>(null);

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      // Sync HTTP session cookie so Server Components can identify the owner.
      // Only sync once per uid change to avoid spamming the endpoint on token refresh.
      if (u && lastSyncedUidRef.current !== u.uid) {
        lastSyncedUidRef.current = u.uid;
        const idToken = await u.getIdToken().catch(() => null);
        if (idToken) {
          void syncSessionCookie(idToken);
        }
      } else if (!u && lastSyncedUidRef.current) {
        lastSyncedUidRef.current = null;
        void clearSessionCookie();
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      getIdToken: async () => (user ? user.getIdToken() : null),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
