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
      aiLabel: "Powered by GENESIS",
      version: "Future Body Scan",
    },
    headline: {
      line1: "Desbloquea tu",
      line2: "mejor versión.",
    },
    subtitle:
      "Visualiza una versión posible de tu transformación en 12 meses. Una simulación aspiracional generada con IA, acompañada de un plan de acción inicial.",
    cta: "Empezar Ahora",
    socialProof: {
      count: "NGX Future Body Scan",
      label: "Lead magnet oficial de NGX GENESIS",
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
    { value: "3", suffix: "min", label: "Escaneo inicial" },
    { value: "4", suffix: "", label: "Etapas visuales" },
    { value: "7", suffix: "días", label: "Plan inicial" },
    { value: "1", suffix: "", label: "Sistema: GENESIS" },
  ],

  features: [
    {
      icon: Brain,
      title: "Análisis Biométrico GENESIS",
      description:
        "GENESIS escanea tu estructura muscular, distribución de grasa y respuestas para crear una proyección aspiracional. Sin excusas, solo datos.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Privacidad clara",
      description: "Tu foto se procesa con consentimiento explícito. Almacenamiento temporal mientras generamos tu resultado y puedes solicitar eliminación.",
      size: "medium",
      badge: "Datos en tránsito cifrados",
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
      "Genera tu Future Body Scan gratis. La imagen inspira, el sistema transforma.",
    buttonText: "Ver Mi Potencial",
    footnote: "Visualización aspiracional, no garantía de resultado",
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
