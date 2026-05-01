"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ScrollToSection() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  useEffect(() => {
    if (!section) return;
    const target = document.getElementById(section === "offer" ? "hybrid-offer" : section);
    if (!target) return;
    const id = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => window.clearTimeout(id);
  }, [section]);

  return null;
}

