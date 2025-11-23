"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshClient({ shareId, active }: { shareId: string; active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${shareId}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.status === "ready") router.refresh();
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [active, shareId, router]);
  return null;
}
