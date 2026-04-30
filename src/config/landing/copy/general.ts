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
  User,
  Sparkles,
} from "lucide-react";
import type { VariantCopy } from "../types";

export const generalCopy: VariantCopy = {
  hero: {
    badge: {
      aiLabel: "Powered by GENESIS",
      version: "Future Body Scan",
    },
    headline: {
      line1: "Visualiza tu",
      line2: "potencial.",
    },
    subtitle:
      "Visualiza una versión posible de tu transformación en 12 meses. Una simulación aspiracional generada con IA, acompañada de un plan de acción inicial.",
    cta: "Comenzar Gratis",
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
        "GENESIS analiza tu estructura corporal, composición y respuestas para crear una proyección aspiracional personalizada. No es una predicción garantizada.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Privacidad clara",
      description: "Tu foto se procesa con consentimiento explícito. Usamos almacenamiento temporal para generar tu resultado y puedes solicitar eliminación.",
      size: "medium",
      badge: "Datos en tránsito cifrados",
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
    title: "Cómo Funciona",
    subtitle: "De foto a proyección en menos de 3 minutos.",
    steps: [
      {
        step: "01",
        title: "Sube tu Foto",
        description:
          "Una foto actual de cuerpo completo. Frontal, buena iluminación.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Completa tu Perfil",
        description:
          "Datos biométricos, objetivos y estilo de vida. 2 minutos máximo.",
        icon: User,
      },
      {
        step: "03",
        title: "Recibe tu Timeline",
        description:
          "IA genera tu proyección personalizada con 4 etapas de transformación.",
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
        gradient: "from-blue-400 to-cyan-300",
      },
      {
        text: "Lo usé para motivarme. Ver mi potencial me dio la disciplina que necesitaba para empezar a entrenar en serio.",
        name: "Ana R.",
        role: "Usuario verificado",
        gradient: "from-emerald-400 to-green-300",
      },
      {
        text: "Como entrenador, lo uso con mis clientes para mostrarles su potencial. La visualización es poderosísima.",
        name: "Diego L.",
        role: "Personal Trainer",
        gradient: "from-purple-400 to-pink-300",
      },
    ],
  },

  cta: {
    headline: "¿Listo para ver tu potencial?",
    subtitle:
      "Visualiza tu potencial. Construirlo requiere un sistema. Genera tu Future Body Scan gratis y descubre cómo GENESIS puede acompañarte.",
    buttonText: "Comenzar Ahora",
    footnote: "Visualización aspiracional, no garantía de resultado",
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
