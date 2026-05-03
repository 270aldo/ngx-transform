/**
 * Landing Page Copy - General Variant
 *
 * NGX Transform Scan — lead magnet principal para HYBRID.
 * Tono: Verdad Directa + Performance & Longevity + salud muscular.
 */

import {
  Brain,
  Shield,
  Camera,
  Sparkles,
  FileText,
  Users,
  Lock,
} from "lucide-react";
import type { VariantCopy } from "../types";

export const generalCopy: VariantCopy = {
  hero: {
    badge: {
      aiLabel: "GENESIS",
      version: "Future Body Scan",
    },
    headline: {
      line1: "Lo que no te conoce,",
      line2: "no te puede transformar.",
    },
    subtitle:
      "Sube una foto. GENESIS analiza tu punto de partida y te muestra una proyección aspiracional de lo que podrías construir en una temporada de 12 semanas con entrenamiento, nutrición, recuperación y acompañamiento humano.",
    cta: "Ver mi punto de partida",
    primaryCta: {
      label: "Ver mi punto de partida",
      intent: "scan_start",
    },
    secondaryCta: "Cómo funciona",
    supportingPoints: [
      "Gratis · Privado · 3 min.",
      "GENESIS interpreta tus datos con honestidad.",
      "Tú decides el siguiente paso, sin presión.",
    ],
    socialProof: {
      count: "Gratis · Privado · 3 min",
      label: "Visualización aspiracional + ruta inicial HYBRID",
    },
    transformationDemo: {
      beforeImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop&crop=faces",
      afterImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=1000&fit=crop&crop=faces",
      beforeLabel: "HOY",
      afterLabel: "12 SEMANAS",
    },
  },

  stats: [
    { value: "12", suffix: " sem", label: "temporada seria" },
    { value: "1", suffix: "", label: "sistema unificado" },
    { value: "IA+", suffix: "coach", label: "cuando toca ejecutar" },
    { value: "0", suffix: "", label: "promesas mágicas" },
  ],

  features: [
    {
      icon: Brain,
      title: "Tu cuerpo no es una plantilla",
      description:
        "GENESIS cruza tu foto, edad, objetivo y contexto inicial para darte una lectura más útil que una rutina genérica. No intenta adivinar tu vida: empieza a entenderla.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Privacidad sin letra pequeña",
      description:
        "Tu foto se procesa con consentimiento explícito. No la vendemos, no la publicamos y no la usamos como testimonio sin permiso.",
      size: "medium",
      badge: "Consentimiento explícito",
    },
    {
      icon: Sparkles,
      title: "La imagen inspira. El sistema transforma.",
      description:
        "El scan te muestra una dirección posible. HYBRID convierte esa dirección en ejecución: temporada de 12 semanas, GENESIS ajustando y un coach humano validando la ruta.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "De curiosidad a claridad",
    subtitle:
      "No vienes a jugar con una imagen. Vienes a descubrir qué sistema necesitarías para cambiar de verdad.",
    steps: [
      {
        step: "01",
        title: "Sube una foto real",
        description:
          "Cuerpo completo, frontal y con buena iluminación. Sin filtros. El punto de partida importa.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Dale contexto a GENESIS",
        description:
          "Objetivo, edad, nivel, disponibilidad y obstáculos. Sin eso, cualquier plan es una apuesta.",
        icon: Brain,
      },
      {
        step: "03",
        title: "Recibe tu proyección y ruta",
        description:
          "Visualización aspiracional, lectura inicial y siguiente paso hacia HYBRID si necesitas acompañamiento humano.",
        icon: Sparkles,
      },
    ],
  },

  testimonials: {
    sectionLabel: "Verdad Directa",
    items: [
      {
        text: "La imagen no es el producto. Es el espejo. El producto real es el sistema que te ayuda a convertir intención en ejecución.",
        name: "Principio NGX",
        role: "Sin humo",
        gradient: "from-violet-400 to-purple-300",
      },
      {
        text: "Después de los 30, improvisar sale caro. Músculo, energía, movilidad y metabolismo no se protegen con motivación: se protegen con estructura.",
        name: "Salud Muscular",
        role: "Base de longevidad",
        gradient: "from-blue-400 to-cyan-300",
      },
      {
        text: "HYBRID existe porque la IA puede diseñar el sistema, pero un humano puede ayudarte a sostenerlo cuando la semana se complica.",
        name: "GENESIS + Coach",
        role: "Humano amplificado por IA",
        gradient: "from-emerald-400 to-green-300",
      },
    ],
  },

  valueStack: {
    sectionLabel: "Qué Recibes",
    title: "Claridad, no promesas.",
    highlight: "Un diagnóstico real.",
    subtitle:
      "El producto gratuito no es la imagen. Es la claridad: qué potencial tienes, qué te está frenando y si necesitas acompañamiento humano para ejecutar.",
    items: [
      {
        icon: Sparkles,
        title: "Visualización aspiracional",
        description:
          "Una proyección visual de tu potencial basada en tus datos reales. No es una promesa — es una dirección posible.",
      },
      {
        icon: Brain,
        title: "Readiness Report",
        description:
          "GENESIS evalúa qué tan preparado estás para ejecutar: disponibilidad, sueño, estrés, historial de adherencia y necesidad de accountability.",
      },
      {
        icon: FileText,
        title: "Ruta inicial de 7 días",
        description:
          "Entrenamiento, nutrición y hábitos para tu primera semana. Educativo y orientativo — un primer paso concreto.",
      },
      {
        icon: Users,
        title: "Diagnóstico HYBRID",
        description:
          "Si tu perfil lo indica, accedes a una sesión de 15 minutos con un coach humano para definir si una temporada de 12 semanas tiene sentido para ti.",
      },
    ],
  },

  bridge: {
    sectionLabel: "El Puente",
    title: "La IA traza el mapa.",
    highlight: "El coach te ayuda a sostenerlo.",
    subtitle:
      "GENESIS diseña, analiza y ajusta. Tu coach revisa, contextualiza y te mantiene honesto cuando la motivación baja.",
    footnote: "15 min · Sin compromiso · Sin presión",
    buttonText: "Agendar diagnóstico HYBRID",
    buttonIntent: "hybrid_diagnosis",
    cards: [
      {
        icon: Brain,
        title: "GENESIS diagnostica",
        description:
          "Analiza tu punto de partida, mide tu readiness y diseña una ruta basada en tu contexto real. Sin sesgos.",
      },
      {
        icon: Users,
        title: "El coach adapta",
        description:
          "Un coach humano revisa tu diagnóstico contigo, ajusta a tu realidad y define si una temporada de 12 semanas tiene sentido.",
      },
      {
        icon: Sparkles,
        title: "Tú ejecutas con sistema",
        description:
          "IA para precisión. Coach para accountability. Sistema para sostenerlo cuando la semana se complica.",
      },
    ],
  },

  faq: {
    sectionLabel: "Preguntas Frecuentes",
    title: "Lo que necesitas saber antes de empezar",
    items: [
      {
        question: "¿Es real la imagen que genera?",
        answer:
          "Es una simulación aspiracional generada con IA. No es una predicción garantizada ni una promesa médica. Sirve para visualizar una posibilidad, no para confirmar resultados.",
      },
      {
        question: "¿Qué pasa con mi foto?",
        answer:
          "Se procesa con tu consentimiento explícito y se almacena de forma temporal mientras se genera tu resultado. Puedes solicitar eliminación cuando quieras desde tu sesión.",
      },
      {
        question: "¿Necesito crear cuenta para empezar?",
        answer:
          "No. Puedes generar tu Future Body Scan y plan inicial sin login. Si después quieres guardar tu historial, descargar el PDF completo o conectar con un coach, se crea una cuenta en ese momento.",
      },
      {
        question: "¿En qué se diferencia ASCEND de HYBRID?",
        answer:
          "ASCEND es un proceso autoguiado con GENESIS para personas con base de adherencia y experiencia. HYBRID añade un coach humano que valida estrategia, adapta a tu contexto y te da accountability.",
      },
      {
        question: "¿El plan de 7 días sustituye a un médico o nutriólogo?",
        answer:
          "No. Es una guía educativa. Si tienes lesiones, dolor crónico o condiciones médicas, consulta a un profesional antes de iniciar.",
      },
      {
        question: "¿Cuánto tarda el proceso?",
        answer:
          "Menos de 3 minutos para llenar el wizard y procesar el escaneo. El resultado completo (timeline + plan + reporte) está listo de forma inmediata.",
      },
    ],
  },

  cta: {
    headline: "La imagen puede incomodarte. Bien.",
    subtitle:
      "Úsala como punto de partida. Si quieres convertir esa dirección en una temporada real, agenda un diagnóstico HYBRID y revisamos tu caso con honestidad.",
    buttonText: "Iniciar mi scan",
    intent: "final_cta_hybrid",
    footnote: "Visualización aspiracional. No garantía de resultado.",
  },

  footer: {
    brandName: "NGX Transform Scan",
    status: "GENESIS operativo",
    copyright: "© 2026 NGX. Todos los derechos reservados.",
  },

  explainerVideo: {
    title: "No es otra app de fitness",
    subtitle:
      "Es el primer paso para entender tu cuerpo, tu contexto y la ruta que tendría sentido para ti.",
    videoUrl: "",
    posterUrl: "/images/video-poster.jpg",
    duration: "45s",
  },
};
