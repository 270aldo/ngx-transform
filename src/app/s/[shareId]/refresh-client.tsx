"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RefreshClient({ shareId, active }: { shareId: string; active: boolean }) {
  const router = useRouter();
  const lastStatusRef = useRef<string | null>(null);
  const lastCountRef = useRef<number>(-1);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${shareId}`, { cache: "no-store" });
        const json = await res.json();
        const status = json?.status as string | undefined;
        const images = (json?.assets?.images || {}) as Record<string, string>;
        const count = Object.keys(images).length;

        if (status !== lastStatusRef.current || count !== lastCountRef.current) {
          lastStatusRef.current = status || null;
          lastCountRef.current = count;
          router.refresh();
        }

        if (status === "failed") {
          clearInterval(id);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [active, shareId, router]);
  return null;
}
