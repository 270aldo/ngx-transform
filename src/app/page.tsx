import { LandingPage } from "@/components/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NGX Transform — Tu salud muscular revelada por IA",
  description:
    "Sube una foto. GENESIS analiza tu punto de partida y te entrega una proyección aspiracional de lo que podrías construir en 12 semanas con entrenamiento, nutrición, recuperación y acompañamiento humano. Privado, sin login, en menos de 3 minutos.",
};

export default function Page() {
  return <LandingPage variant="general" />;
}
