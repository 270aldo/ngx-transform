/**
 * Landing Page Copy - Mayores Variant (45-60)
 *
 * Tono: respetuoso, claro, preventivo. Salud muscular, función y longevidad.
 */

import {
  Brain,
  Shield,
  Camera,
  User,
  Heart,
} from "lucide-react";
import type { VariantCopy } from "../types";

export const mayoresCopy: VariantCopy = {
  hero: {
    badge: {
      aiLabel: "GENESIS",
      version: "Transform Scan",
    },
    headline: {
      line1: "Su cuerpo no necesita castigo.",
      line2: "Necesita estrategia.",
    },
    subtitle:
      "Suba una foto. GENESIS analiza su punto de partida y le muestra una proyección aspiracional de cómo podría mejorar fuerza, composición y vitalidad en una temporada de 12 semanas con un sistema serio.",
    cta: "Ver mi punto de partida",
    primaryCta: {
      label: "Ver mi punto de partida",
      intent: "scan_start",
    },
    secondaryCta: "Cómo funciona",
    supportingPoints: [
      "Su punto de partida visible.",
      "Lo que le frena, explicado.",
      "Una ruta clara para empezar.",
    ],
    socialProof: {
      count: "Privado por diseño",
      label: "Visualización aspiracional · lectura inicial · ruta de acción",
    },
    transformationDemo: {
      beforeImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop&crop=faces",
      afterImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=1000&fit=crop&crop=faces",
      beforeLabel: "HOY",
      afterLabel: "12 SEMANAS",
    },
  },

  stats: [
    { value: "12", suffix: " sem", label: "proceso estructurado" },
    { value: "3", suffix: "min", label: "scan inicial" },
    { value: "1", suffix: "", label: "sistema integrado" },
    { value: "0", suffix: "", label: "presión artificial" },
  ],

  features: [
    {
      icon: Brain,
      title: "Fuerza para vivir mejor",
      description:
        "El objetivo no es perseguir juventud. Es construir músculo, movilidad, energía y capacidad física para que su cuerpo responda mejor en la vida real.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Privacidad y claridad",
      description:
        "Su foto se procesa con consentimiento explícito. La visualización es aspiracional y no promete un resultado médico o físico garantizado.",
      size: "medium",
      badge: "Sin promesas falsas",
    },
    {
      icon: Heart,
      title: "HYBRID cuando se necesita criterio humano",
      description:
        "GENESIS estructura la ruta. Un coach humano puede revisarla, ajustar el proceso y acompañarle cuando hay lesiones, dudas, falta de adherencia o necesidad de mayor seguridad.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "Un proceso simple, con intención",
    subtitle:
      "Tres pasos para dejar de adivinar y empezar a ver qué ruta tendría sentido para usted.",
    steps: [
      {
        step: "01",
        title: "Suba una foto actual",
        description:
          "Frontal, cuerpo completo y buena iluminación. Es una referencia visual, no una evaluación médica.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Comparta su contexto",
        description:
          "Edad, objetivo, nivel, disponibilidad y limitaciones. La seguridad empieza por entender la realidad.",
        icon: User,
      },
      {
        step: "03",
        title: "Vea su ruta inicial",
        description:
          "Reciba una proyección aspiracional y una lectura clara de si HYBRID puede ser el siguiente paso correcto.",
        icon: Heart,
      },
    ],
  },

  testimonials: {
    sectionLabel: "Verdad Directa",
    items: [
      {
        text: "No se trata de verse joven. Se trata de mantener fuerza, movilidad y autonomía durante más años.",
        name: "Función Primero",
        role: "Performance & Longevity",
        gradient: "from-teal-400 to-emerald-400",
      },
      {
        text: "El músculo no es vanidad. Es infraestructura metabólica, física y funcional. Cuando se pierde, todo cuesta más.",
        name: "Salud Muscular",
        role: "Base del sistema NGX",
        gradient: "from-blue-400 to-indigo-400",
      },
      {
        text: "Si hay dolor, lesiones o años de sedentarismo, no conviene improvisar. Ahí HYBRID tiene sentido.",
        name: "Criterio Humano",
        role: "Coach + GENESIS",
        gradient: "from-violet-400 to-purple-400",
      },
    ],
  },

  cta: {
    headline: "No es tarde. Pero sí conviene dejar de improvisar.",
    subtitle:
      "Vea su punto de partida y, si tiene sentido, revise su ruta con un coach humano dentro de HYBRID.",
    buttonText: "Comenzar mi scan",
    footnote: "Visualización aspiracional. No sustituye evaluación médica.",
  },

  footer: {
    brandName: "NGX Transform Scan",
    status: "GENESIS operativo",
    copyright: "© 2026 NGX. Todos los derechos reservados.",
  },

  explainerVideo: {
    title: "Cómo funciona NGX Transform Scan",
    subtitle:
      "Una forma sencilla de visualizar dirección, entender contexto y decidir si necesita acompañamiento HYBRID.",
    videoUrl: "",
    posterUrl: "/images/video-poster.jpg",
    duration: "Demo",
  },
};
