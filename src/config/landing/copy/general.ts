/**
 * Landing Page Copy — General Variant (Diagnostic Lead Magnet v2)
 *
 * Tesis: NGX Transform no vende una imagen. Vende claridad.
 * La imagen es el gancho. El diagnóstico es el valor. HYBRID es el camino para ejecutar.
 */

import {
  Brain,
  Shield,
  Camera,
  Sparkles,
  FileText,
  Users,
  Compass,
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
      "Sube una foto real. Recibe una visualización aspiracional, una lectura inicial de tu punto de partida y una ruta clara para empezar con más criterio.",
    cta: "Ver mi punto de partida",
    primaryCta: {
      label: "Ver mi punto de partida",
      intent: "scan_start",
    },
    secondaryCta: "Ver ejemplo real",
    supportingPoints: [
      "Tu punto de partida visible.",
      "Lo que te frena, explicado.",
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
        "El scan te muestra una dirección posible. HYBRID convierte esa dirección en ejecución: una temporada de 12 semanas, GENESIS ajustando y un coach humano validando la ruta.",
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
        title: "Recibe tu visualización",
        description:
          "Una proyección aspiracional para ver una dirección posible. No es una promesa ni una predicción médica.",
        icon: Sparkles,
      },
      {
        step: "04",
        title: "Obtén tu ruta inicial",
        description:
          "GENESIS te entrega una lectura de readiness, una ruta de 7 días y el siguiente paso si necesitas acompañamiento humano.",
        icon: Compass,
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
    sectionLabel: "Qué recibes",
    title: "Claridad, no promesas.",
    highlight: "Un punto de partida real.",
    subtitle:
      "El producto gratuito no es la imagen. Es la claridad: qué potencial puedes construir, qué te está frenando y si necesitas acompañamiento humano para ejecutar.",
    items: [
      {
        icon: Sparkles,
        title: "Visualización aspiracional",
        description:
          "Una proyección visual de tu potencial basada en tus datos iniciales. No es una promesa: es una dirección posible.",
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
          "Entrenamiento, nutrición y hábitos para tu primera semana. Educativo y orientativo: un primer paso concreto.",
      },
      {
        icon: Users,
        title: "Diagnóstico HYBRID",
        description:
          "Si tu perfil lo indica, puedes agendar una revisión con un coach humano para definir si una temporada de 12 semanas tiene sentido para ti.",
      },
    ],
  },

  reportPreview: {
    sectionLabel: "Ejemplo de reporte",
    headline: "Mira lo que recibes antes de subir tu foto.",
    subtitle:
      "El resultado no debe sentirse como una imagen suelta. Debe sentirse como una lectura inicial: dónde estás, qué te frena y qué paso tiene más sentido.",
    scoreLabel: "Readiness Score",
    scoreValue: 72,
    scoreMax: 100,
    scoreDescription:
      "Listo para empezar, pero con riesgo de abandono si no hay estructura.",
    dimensions: [
      { label: "Entrenamiento", value: 78 },
      { label: "Nutrición", value: 64 },
      { label: "Recuperación", value: 58 },
      { label: "Adherencia", value: 71 },
    ],
    insights: [
      {
        label: "Obstáculo principal",
        text: "Tu plan actual depende demasiado de motivación y muy poco de estructura semanal.",
      },
      {
        label: "Palanca #1",
        text: "2-3 sesiones de fuerza bien diseñadas por semana pueden crear el estímulo mínimo para avanzar.",
      },
      {
        label: "Palanca #2",
        text: "Proteína suficiente, sueño más consistente y ajustes de carga reducen el riesgo de abandonar.",
      },
      {
        label: "Siguiente paso",
        text: "Ruta inicial de 7 días. HYBRID solo si necesitas accountability humana para sostenerla.",
      },
    ],
    ctaLabel: "Ver mi punto de partida",
    ctaHref: "/wizard",
    microcopy: "Demo ilustrativo. Tu reporte se genera con tus datos.",
  },

  bridge: {
    sectionLabel: "El puente",
    title: "La IA traza el mapa.",
    highlight: "El coach te ayuda a sostenerlo.",
    subtitle:
      "GENESIS puede darte claridad. Pero si tu historial muestra baja adherencia, estrés alto, lesiones, poca experiencia o falta de estructura, el siguiente paso no debería ser hacerlo solo.",
    footnote: "Sin compromiso · Sin presión · Con criterio humano",
    buttonText: "Agendar diagnóstico HYBRID",
    buttonIntent: "hybrid_diagnosis",
    cards: [
      {
        icon: Brain,
        title: "GENESIS diagnostica",
        description:
          "Analiza tu punto de partida, mide tu readiness y diseña una ruta basada en tu contexto real. Sin plantillas.",
      },
      {
        icon: Users,
        title: "El coach valida",
        description:
          "Un coach humano revisa tu caso, detecta riesgos, ajusta a tu realidad y define si HYBRID tiene sentido para ti.",
      },
      {
        icon: Sparkles,
        title: "Tú ejecutas con sistema",
        description:
          "IA para precisión. Coach para accountability. Sistema para sostenerlo cuando la semana se complica.",
      },
    ],
  },

  trustStrip: {
    title: "Privado por diseño. Honesto por principio.",
    bullets: [
      "Tu foto se procesa con consentimiento explícito.",
      "La visualización es aspiracional, no una promesa.",
      "Tu resultado no sustituye evaluación médica.",
      "Puedes solicitar eliminación de tus datos.",
    ],
  },

  faq: {
    sectionLabel: "Preguntas frecuentes",
    title: "Lo que necesitas saber antes de empezar",
    items: [
      {
        question: "¿Es real la imagen que genera?",
        answer:
          "Es una visualización aspiracional generada con IA. No es una predicción garantizada, no es una promesa médica y no confirma resultados futuros. Sirve para visualizar una posibilidad y abrir una conversación más honesta sobre tu punto de partida.",
      },
      {
        question: "¿Qué pasa con mi foto?",
        answer:
          "Se procesa con tu consentimiento explícito para generar tu sesión privada. No la vendemos, no la publicamos y no la usamos como testimonio sin permiso. Puedes solicitar eliminación cuando quieras desde tu sesión o por el canal de privacidad.",
      },
      {
        question: "¿Necesito crear cuenta para empezar?",
        answer:
          "No necesitas una cuenta completa para iniciar el scan. El flujo puede crear una sesión privada para guardar tu resultado y permitirte volver a consultarlo. Si después quieres seguimiento, historial o HYBRID, se te pedirá completar el acceso.",
      },
      {
        question: "¿En qué se diferencia ASCEND de HYBRID?",
        answer:
          "ASCEND es autoguiado con GENESIS para personas con buena adherencia y experiencia. HYBRID suma un coach humano que valida estrategia, adapta el proceso y te da accountability cuando necesitas más soporte.",
      },
      {
        question: "¿El plan de 7 días sustituye a un médico o nutriólogo?",
        answer:
          "No. Es una guía educativa y orientativa. Si tienes dolor, lesiones, condiciones médicas o dudas clínicas, consulta a un profesional antes de iniciar cambios intensos de entrenamiento o alimentación.",
      },
      {
        question: "¿Qué necesito para empezar?",
        answer:
          "Solo necesitas una foto real y responder unas preguntas de contexto. Con eso, GENESIS puede generar una visualización aspiracional, una lectura inicial y una ruta orientativa para tu siguiente paso.",
      },
      {
        question: "¿Por qué aparece HYBRID?",
        answer:
          "Porque muchas personas no fallan por falta de información. Fallan por falta de estructura, seguimiento y ajustes humanos. HYBRID aparece solo cuando tiene sentido: si tu contexto indica que necesitas más que una ruta autoguiada.",
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
    brandName: "NGX Transform",
    status: "GENESIS operativo",
    copyright: "© 2026 NGX. Todos los derechos reservados.",
  },

  explainerVideo: {
    title: "Por qué construí esto",
    subtitle:
      "El sistema detrás de NGX Transform, contado por quien lo creó. Sin script ni promesas — solo el porqué.",
    videoUrl: "",
    posterUrl: "/images/founder-poster.jpg",
    duration: "Demo",
  },
};

