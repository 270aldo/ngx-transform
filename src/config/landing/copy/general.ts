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
      aiLabel: "Powered by Gemini AI",
      version: "v2.1",
    },
    headline: {
      line1: "Visualiza tu",
      line2: "transformación.",
    },
    subtitle:
      "IA que proyecta tu evolución física en 12 meses. Sube tu foto, recibe tu timeline personalizado. Gratis.",
    cta: "Comenzar Gratis",
    socialProof: {
      count: "+10,000 transformaciones",
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
      "Únete a miles de personas que ya visualizaron su transformación. Gratis, sin registro, sin compromisos.",
    buttonText: "Comenzar Ahora",
    footnote: "Análisis en menos de 3 minutos",
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
