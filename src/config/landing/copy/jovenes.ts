/**
 * Landing Page Copy - Jóvenes Variant (18-35)
 *
 * Energetic, fitness-focused copy for younger audience.
 * Tone: Dynamic, challenging, achievement-oriented.
 */

import {
  Brain,
  Shield,
  Camera,
  User,
  Sparkles,
  Zap,
} from "lucide-react";
import type { VariantCopy } from "../types";

export const jovenesCopy: VariantCopy = {
  hero: {
    badge: {
      aiLabel: "Powered by Gemini AI",
      version: "v2.1",
    },
    headline: {
      line1: "Desbloquea tu",
      line2: "mejor versión.",
    },
    subtitle:
      "IA que proyecta tu potencial físico en 12 meses. Tu mejor yo está a una foto de distancia.",
    cta: "Empezar Ahora",
    socialProof: {
      count: "+10,000 atletas",
      label: "Esta semana en NGX",
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
    { value: "99.9", suffix: "%", label: "Precisión IA" },
    { value: "<3", suffix: "min", label: "Análisis" },
    { value: "1M", suffix: "+", label: "Transformaciones" },
    { value: "186", suffix: "+", label: "Países" },
  ],

  features: [
    {
      icon: Brain,
      title: "Análisis Biométrico IA",
      description:
        "Gemini escanea tu estructura muscular, distribución de grasa y potencial genético. Sin excusas, solo datos.",
      size: "large",
    },
    {
      icon: Shield,
      title: "100% Privado",
      description: "Tu foto se procesa y elimina. Cero rastro digital.",
      size: "medium",
      badge: "Encriptación E2E",
    },
    {
      icon: Zap,
      title: "Timeline de 12 Meses",
      description:
        "Visualiza tu progreso real: Hoy → Mes 4 → Mes 8 → Mes 12. Cada fase con métricas exactas de tu evolución.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "Así de Simple",
    subtitle: "De foto a proyección en menos de 3 minutos.",
    steps: [
      {
        step: "01",
        title: "Sube tu Foto",
        description:
          "Cuerpo completo, frontal. Una foto real, sin filtros.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Cuéntanos tu Meta",
        description:
          "Objetivos, nivel de entrenamiento, tiempo disponible. 2 minutos.",
        icon: User,
      },
      {
        step: "03",
        title: "Recibe tu Proyección",
        description:
          "IA genera tu timeline con 4 etapas de transformación realista.",
        icon: Sparkles,
      },
    ],
  },

  testimonials: {
    sectionLabel: "Resultados Reales",
    items: [
      {
        text: "La proyección de mes 12 era exactamente mi objetivo. Después de 8 meses, ya estoy casi ahí. Esta herramienta es brutal.",
        name: "Alejandro S.",
        role: "CrossFit Athlete",
        gradient: "from-orange-400 to-red-400",
      },
      {
        text: "Lo usé como motivación visual. Ver mi potencial me dio la disciplina que me faltaba para romperla en el gym.",
        name: "Sofía M.",
        role: "Fitness Influencer",
        gradient: "from-pink-400 to-purple-400",
      },
      {
        text: "Como coach, mis atletas ven su proyección y se comprometen al 100%. La visualización es power.",
        name: "Marcos T.",
        role: "Strength Coach",
        gradient: "from-blue-400 to-cyan-400",
      },
    ],
  },

  cta: {
    headline: "¿Listo para ver tu potencial?",
    subtitle:
      "Miles ya desbloquearon su proyección. Gratis, sin registro, sin excusas.",
    buttonText: "Ver Mi Potencial",
    footnote: "Análisis en menos de 3 minutos",
  },

  footer: {
    brandName: "NGX Transform",
    status: "Sistemas activos",
    copyright: "© 2024 NGX. Todos los derechos reservados.",
  },

  // Optional: Explainer video section (hidden if no videoUrl)
  explainerVideo: {
    title: "¿Cómo Funciona?",
    subtitle: "Mira cómo la IA escanea y proyecta tu transformación.",
    videoUrl: "", // Empty = section hidden. Add video URL when ready.
    posterUrl: "/images/video-poster.jpg",
    duration: "45s",
  },
};
