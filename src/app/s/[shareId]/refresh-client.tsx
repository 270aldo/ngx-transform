"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshClient({ shareId, active, intervalMs = 4000 }: { shareId: string; active?: boolean; intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/sessions/${shareId}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { status?: string; hasAi?: boolean };
        if (!cancelled && json.status === "ready" && json.hasAi) {
          router.refresh();
        }
      } catch (err) {
        console.warn("refresh-client", err);
      }
    };

    const id = setInterval(tick, intervalMs);
    tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [active, intervalMs, router, shareId]);

  return null;
}
