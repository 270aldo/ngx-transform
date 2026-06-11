"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAnonymousSession } from "@/lib/firebaseClient";

/**
 * When an email link carries a valid `?access=` token and the viewer is not yet
 * the owner, re-anchor ownership to the current (anonymous) user and refresh so
 * the page renders the owner view (fix-08). We set the session cookie BEFORE
 * the claim + refresh so the server-side owner check matches the new ownerUid.
 */
export function AccessClaim({
  shareId,
  access,
}: {
  shareId: string;
  access: string;
}) {
  const router = useRouter();
  const ranRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const user = await ensureAnonymousSession();
        const idToken = await user.getIdToken();

        // Anchor the session cookie to this uid first.
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const res = await fetch(`/api/sessions/${shareId}/claim`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token: access }),
        });

        if (res.ok) {
          router.refresh();
        } else {
          setFailed(true);
        }
      } catch {
        setFailed(true);
      }
    })();
  }, [shareId, access, router]);

  // On failure, fall back silently to the public view.
  if (failed) return null;

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
      Recuperando tu sesión…
    </div>
  );
}
