import { LandingPage } from "@/components/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NGX Vision — Diagnóstico visual de salud muscular",
  description:
    "Sube una foto. GENESIS genera una visualización aspiracional, lectura muscular inicial y dirección de 12 semanas hacia HYBRID. Privado y sin promesas de resultado.",
};

export default function Page() {
  return <LandingPage variant="general" />;
}
