/**
 * Landing Page Copy - General Variant
 *
 * Default copy for the main landing page.
 * Premium/aspirational tone targeting broad audience.
 */

import {
  Brain,
  Shield,
  Camera,
  Sparkles,
} from "lucide-react";
import type { VariantCopy } from "../types";

export const generalCopy: VariantCopy = {
  hero: {
    badge: {
      aiLabel: "Potenciado por GENESIS AI",
      version: "HYBRID",
    },
    headline: {
      line1: "Visualiza tu",
      line2: "transformación física.",
    },
    subtitle:
      "Sube una foto. La IA analiza tu composición corporal, identifica tu potencial y genera una proyección visual realista de lo que tu cuerpo puede lograr en 12 semanas.",
    cta: "Descubre Tu Potencial",
    socialProof: {
      count: "Análisis en <3 min",
      label: "Privacidad total de tus datos",
    },
    // Before/After transformation demo
    transformationDemo: {
      beforeImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop&crop=faces",
      afterImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=1000&fit=crop&crop=faces",
      beforeLabel: "ANTES",
      afterLabel: "12 MESES",
    },
  },

  stats: [
    { value: "<3", suffix: " min", label: "De foto a resultados" },
    { value: "12", suffix: " meses", label: "Proyección personalizada" },
    { value: "100", suffix: "%", label: "Privacidad tras entrega" },
    { value: "IA +", suffix: " Coach", label: "Sistema HYBRID" },
  ],

  features: [
    {
      icon: Brain,
      title: "Análisis Biométrico IA",
      description:
        "Gemini analiza tu estructura corporal, composición y potencial genético para crear proyecciones realistas y personalizadas.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Privacidad Total",
      description: "Tu foto se procesa y elimina. Zero almacenamiento.",
      size: "medium",
      badge: "Encriptación E2E",
    },
    {
      icon: Sparkles,
      title: "Timeline de 12 Meses",
      description:
        "No es solo un antes/después. Visualiza tu progreso en 4 etapas: Hoy, Mes 4, Mes 8 y Mes 12 con estadísticas y métricas detalladas.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "3 pasos. 60 segundos. Tu potencial revelado.",
    subtitle: "",
    steps: [
      {
        step: "01",
        title: "Sube tu foto",
        description:
          "Una foto de cuerpo completo. Privada y segura. Se elimina después del análisis. Sin trucos, sin filtros.",
        icon: Camera,
      },
      {
        step: "02",
        title: "GENESIS analiza tu cuerpo",
        description:
          "La IA evalúa tu composición corporal, identifica áreas de oportunidad y calcula tu potencial real basado en ciencia y datos.",
        icon: Brain,
      },
      {
        step: "03",
        title: "Visualiza tu transformación",
        description:
          "Recibe una proyección visual realista de tu potencial a 12 semanas, junto con un análisis detallado y tu plan de acción personalizado.",
        icon: Sparkles,
      },
    ],
  },

  testimonials: {
    sectionLabel: "Lo que dicen",
    items: [
      {
        text: "Increíble la precisión. Mi proyección de mes 12 se parece mucho a mi progreso real después de entrenar 8 meses.",
        name: "Carlos M.",
        role: "Usuario verificado",
        gradient: "from-violet-400 to-fuchsia-300",
      },
      {
        text: "Lo usé para motivarme. Ver mi potencial me dio la disciplina que necesitaba para empezar a entrenar en serio.",
        name: "Ana R.",
        role: "Usuario verificado",
        gradient: "from-emerald-400 to-lime-300",
      },
      {
        text: "Como entrenador, lo uso con mis clientes para mostrarles su potencial. La visualización es poderosísima.",
        name: "Diego L.",
        role: "Personal Trainer",
        gradient: "from-purple-400 to-rose-300",
      },
    ],
  },

  cta: {
    headline: "Tu cuerpo tiene más potencial del que crees.",
    subtitle:
      "Deja de adivinar. Deja de seguir planes genéricos. Descubre lo que es posible para ti con un análisis real de GENESIS.",
    buttonText: "Descubre Tu Potencial",
    footnote: "Gratis · Sin tarjeta · Resultados en 60 segundos",
  },

  footer: {
    brandName: "NGX Transform",
    status: "Todos los sistemas operativos",
    copyright: "© 2024 NGX. Todos los derechos reservados.",
  },

  // Optional: Explainer video section (hidden if no videoUrl)
  explainerVideo: {
    title: "¿Cómo Funciona NGX?",
    subtitle: "Mira cómo la IA analiza y proyecta tu transformación en menos de 3 minutos.",
    videoUrl: "", // Empty = section hidden. Add video URL when ready.
    posterUrl: "/images/video-poster.jpg",
    duration: "45s",
  },
};
