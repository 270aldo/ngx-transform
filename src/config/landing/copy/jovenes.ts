/**
 * Landing Page Copy - Jóvenes Variant
 *
 * NOTA: La ruta conserva el nombre técnico /j, pero el copy se ajusta al ICP real: 30-45 activos.
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
      aiLabel: "GENESIS",
      version: "Diagnóstico visual",
    },
    headline: {
      line1: "Tu físico no está estancado.",
      line2: "Tu sistema sí.",
    },
    subtitle:
      "Sube una foto. GENESIS analiza tu punto de partida y te muestra una proyección aspiracional de lo que podrías construir por Seasons si dejas de improvisar y empiezas a entrenar con sistema.",
    cta: "Iniciar diagnóstico",
    primaryCta: {
      label: "Iniciar diagnóstico",
      intent: "diagnostic_start",
    },
    secondaryCta: "Cómo funciona",
    supportingPoints: [
      "Una referencia visual clara.",
      "Una versión aspiracional, sin exagerar.",
      "Una ruta inicial para decidir.",
    ],
    socialProof: {
      count: "",
      label: "Visualización aspiracional · lectura inicial · ruta de acción",
    },
    transformationDemo: {
      beforeImage: "https://images.unsplash.com/photo-1675026482188-8102367ecc16?w=800&h=1000&fit=crop&crop=faces",
      afterImage: "https://images.unsplash.com/photo-1645810809381-97f6fd2f7d10?w=800&h=1000&fit=crop&crop=faces",
      beforeLabel: "Punto de partida",
      afterLabel: "Season 3",
    },
  },

  stats: [
    { value: "12", suffix: " sem", label: "enfoque real" },
    { value: "0", suffix: "", label: "hacks milagro" },
    { value: "1", suffix: "", label: "sistema GENESIS" },
    { value: "IA+", suffix: "coach", label: "para ejecutar" },
  ],

  features: [
    {
      icon: Brain,
      title: "No necesitas más rutinas sueltas",
      description:
        "Necesitas una ruta que conecte entrenamiento, nutrición, recuperación y adherencia. GENESIS empieza con tu punto de partida, no con una plantilla reciclada.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Tu foto no es contenido",
      description:
        "Es un dato privado para generar tu diagnóstico visual. No se vende, no se publica y no se convierte en testimonio sin tu autorización.",
      size: "medium",
      badge: "Consentimiento explícito",
    },
    {
      icon: Zap,
      title: "El espejo motiva. El sistema sostiene.",
      description:
        "La proyección te da dirección. HYBRID te da estructura: GENESIS analiza, un coach valida y tú ejecutas una temporada con ajustes reales.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "Así empieza una transformación seria",
    subtitle:
      "No con motivación. Con claridad, estructura y una decisión concreta.",
    steps: [
      {
        step: "01",
        title: "Sube una foto sin filtros",
        description:
          "Cuerpo completo, frontal, buena luz. El punto de partida no se maquilla.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Define objetivo y realidad",
        description:
          "Músculo, grasa, energía, tiempo, nivel y obstáculos. El sistema necesita contexto para servirte.",
        icon: User,
      },
      {
        step: "03",
        title: "Recibe tu diagnóstico y siguiente paso",
        description:
          "Visualización aspiracional, lectura inicial y opción de revisar tu ruta HYBRID con un coach.",
        icon: Sparkles,
      },
    ],
  },

  testimonials: {
    sectionLabel: "Verdad Directa",
    items: [
      {
        text: "Si cada lunes empiezas de cero, no tienes problema de motivación. Tienes problema de sistema.",
        name: "Adherencia",
        role: "El punto débil real",
        gradient: "from-orange-400 to-red-400",
      },
      {
        text: "Perder grasa sin construir músculo es una estrategia incompleta. El objetivo es recomposición, energía y función.",
        name: "Recomposición",
        role: "No solo peso",
        gradient: "from-pink-400 to-purple-400",
      },
      {
        text: "HYBRID no existe para hacerte dependiente. Existe para que no abandones justo cuando el plan empieza a funcionar.",
        name: "Coach Humano",
        role: "Accountability real",
        gradient: "from-blue-400 to-cyan-400",
      },
    ],
  },

  cta: {
    headline: "Deja de coleccionar intentos.",
    subtitle:
      "Haz el diagnóstico, mira tu punto de partida y decide si vas a seguir improvisando o vas a construir una temporada con sistema.",
    buttonText: "Iniciar diagnóstico",
    footnote: "Visualización aspiracional. El resultado depende de ejecución real.",
  },

  footer: {
    brandName: "NGX Transform",
    status: "GENESIS operativo",
    copyright: "© 2026 NGX. Todos los derechos reservados.",
  },

  explainerVideo: {
    title: "La imagen no transforma. El sistema sí.",
    subtitle:
      "GENESIS te muestra una dirección. HYBRID te ayuda a ejecutarla.",
    videoUrl: "",
    posterUrl: "/images/video-poster.jpg",
    duration: "Demo",
  },
};
