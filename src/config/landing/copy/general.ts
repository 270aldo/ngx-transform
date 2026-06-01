/**
 * Landing Page Copy — General Variant (Diagnostic Lead Magnet v2)
 *
 * Tesis: NGX Vision no vende una imagen. Vende claridad.
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
      version: "Diagnóstico visual",
    },
    headline: {
      line1: "Lo que no te conoce,",
      line2: "no te puede transformar.",
    },
    subtitle:
      "Sube una foto real. Recibe una visualización aspiracional, una lectura inicial de tu punto de partida y una ruta clara para empezar con más criterio.",
    cta: "Iniciar diagnóstico",
    primaryCta: {
      label: "Iniciar diagnóstico",
      intent: "diagnostic_start",
    },
    secondaryCta: "Ver ejemplo real",
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
    { value: "12", suffix: " sem", label: "para construir una temporada seria" },
    { value: "1", suffix: "", label: "sistema que conecta foto, contexto y ruta" },
    { value: "IA+", suffix: "coach", label: "solo cuando necesitas más soporte" },
    { value: "0", suffix: "", label: "promesas vacías" },
  ],

  problem: {
    sectionLabel: "El problema real",
    title: "El problema no es tu disciplina.",
    highlight: "Es que sigues usando planes que no te conocen.",
    subtitle:
      "Has probado rutinas, apps, dietas y consejos sueltos. Algunos funcionan unos días. Luego llega tu vida real: estrés, horarios, sueño, cansancio, lesiones o falta de estructura. Ahí se rompe el plan.",
    cards: [
      {
        title: "Tu plan no conoce tu contexto",
        description:
          "No sabe cómo duermes, cuánto tiempo tienes, qué equipo usas, qué lesiones arrastras ni qué tan constante has sido antes.",
      },
      {
        title: "Empiezas fuerte, pero el sistema no se adapta",
        description:
          "Cuando baja la motivación o se complica la semana, una rutina genérica no ajusta nada. Solo te deja con culpa.",
      },
      {
        title: "Después de los 30, improvisar sale caro",
        description:
          "Músculo, energía, recuperación y metabolismo necesitan estrategia. No más planes hechos para alguien que no eres tú.",
      },
    ],
  },

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
        "El diagnóstico visual te muestra una dirección posible. HYBRID convierte esa dirección en ejecución: una temporada de 12 semanas, GENESIS ajustando y un coach humano validando la ruta.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "Así pasas de curiosidad a claridad",
    subtitle:
      "No vienes a jugar con una imagen. Vienes a entender qué punto de partida tienes y qué ruta tendría sentido para ti.",
    steps: [
      {
        step: "01",
        title: "Sube una foto real",
        description:
          "Una imagen simple, frontal y con buena iluminación. No buscamos perfección. Buscamos un punto de partida honesto.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Agrega contexto",
        description:
          "Objetivo, edad, nivel, disponibilidad y obstáculos. Sin contexto, cualquier recomendación es una apuesta.",
        icon: Brain,
      },
      {
        step: "03",
        title: "Recibe tu lectura inicial",
        description:
          "Ves una visualización aspiracional y una lectura clara de qué podría hacer falta para avanzar con más criterio.",
        icon: Sparkles,
      },
      {
        step: "04",
        title: "Decide tu siguiente paso",
        description:
          "Sales con una ruta inicial y una recomendación honesta: avanzar solo o revisar HYBRID con un coach.",
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
    title: "No recibes una imagen.",
    highlight: "Recibes dirección.",
    subtitle:
      "La visualización llama tu atención. La lectura inicial te da claridad. La ruta te ayuda a saber qué hacer después.",
    items: [
      {
        icon: Sparkles,
        title: "Una visualización aspiracional",
        description:
          "Una imagen para ver una dirección posible. No es promesa, predicción ni resultado garantizado.",
      },
      {
        icon: Brain,
        title: "Una lectura de tu punto de partida",
        description:
          "GENESIS interpreta tu contexto inicial para mostrar qué factores podrían necesitar más estructura.",
      },
      {
        icon: FileText,
        title: "Una ruta inicial de acción",
        description:
          "Un primer mapa con entrenamiento, nutrición y hábitos para empezar con más orden y menos improvisación.",
      },
      {
        icon: Users,
        title: "Una recomendación honesta",
        description:
          "Si tu caso necesita más estructura, te mostramos cuándo tiene sentido revisar HYBRID con un coach humano.",
      },
    ],
  },

  reportPreview: {
    sectionLabel: "Ejemplo de resultado",
    headline: "Así debería sentirse tu resultado.",
    subtitle:
    "No como una imagen suelta. Como una primera lectura: dónde estás, qué podría hacer falta y qué paso conviene tomar.",
    scoreLabel: "Score de preparación",
    scoreValue: 72,
    scoreMax: 100,
    scoreDescription:
      "Buen punto para empezar, pero con riesgo de abandono si no hay estructura semanal.",
    dimensions: [
      { label: "Entrenamiento", value: 78 },
      { label: "Nutrición", value: 64 },
      { label: "Recuperación", value: 58 },
      { label: "Constancia", value: 71 },
    ],
    insights: [
      {
        label: "Qué podría hacer falta",
        text: "Tu avance depende demasiado de motivación y poco de estructura.",
      },
      {
        label: "Primera palanca",
        text: "Fuerza bien programada 2-3 veces por semana para crear base.",
      },
      {
        label: "Ajuste clave",
        text: "Mejorar sueño, agenda y progresión antes de subir intensidad.",
      },
      {
        label: "Siguiente paso",
        text: "Empezar con una ruta inicial o revisar HYBRID si necesitas soporte.",
      },
    ],
    ctaLabel: "Iniciar diagnóstico",
    ctaHref: "/wizard",
    microcopy: "Ejemplo ilustrativo. Tu resultado se genera con tus datos.",
  },

  bridge: {
    sectionLabel: "Cuando hacerlo solo no basta",
    title: "GENESIS te da dirección.",
    highlight: "Un coach te ayuda a sostenerla.",
    subtitle:
      "La mayoría no falla porque no sepa qué hacer. Falla porque no logra sostenerlo cuando aparece la vida real. HYBRID existe para esos casos: más estructura, más seguimiento y una revisión humana cuando la necesitas.",
    footnote: "Sin presión · Sin compromiso · Con criterio humano",
    buttonText: "Revisar si HYBRID es para mí",
    buttonIntent: "hybrid_review",
    cards: [
      {
        icon: Brain,
        title: "Primero entiendes tu punto de partida",
        description:
          "GENESIS organiza tu foto y contexto para mostrarte qué puede estar limitando tu avance.",
      },
      {
        icon: Users,
        title: "Luego un humano revisa tu caso",
        description:
          "Un coach puede ayudarte a detectar riesgos, ajustar expectativas y definir si necesitas acompañamiento.",
      },
      {
        icon: Sparkles,
        title: "Después ejecutas con estructura",
        description:
          "Menos improvisación. Más claridad semanal. Un sistema que te ayuda a sostener el proceso.",
      },
    ],
  },

  trustStrip: {
    title: "Tu foto, tus datos, tu control.",
    subtitle:
      "Esta experiencia usa información sensible. Por eso la explicamos claro antes de pedirte avanzar.",
    cards: [
      {
        title: "Procesamiento privado",
        description: "Tu foto se usa solo para operar esta sesión y generar tu resultado.",
      },
      {
        title: "Sin promesa de resultado",
        description: "La visualización es aspiracional. No confirma cómo vas a verte.",
      },
      {
        title: "No es evaluación médica",
        description: "La lectura es educativa y no sustituye atención profesional.",
      },
      {
        title: "Control de datos",
        description: "Puedes solicitar eliminación de tu información cuando lo necesites.",
      },
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
        question: "¿Sustituye a un médico, nutriólogo o entrenador?",
        answer:
          "No. NGX Vision es una experiencia educativa y orientativa. Si tienes dolor, lesiones, condiciones médicas o dudas clínicas, consulta a un profesional antes de iniciar cambios intensos de entrenamiento o alimentación.",
      },
      {
        question: "¿Qué pasa con mi foto?",
        answer:
          "Se procesa con tu consentimiento explícito para generar tu sesión privada. No la vendemos, no la publicamos y no la usamos como testimonio sin permiso. Puedes solicitar eliminación cuando quieras desde tu sesión o por el canal de privacidad.",
      },
      {
        question: "¿Qué es HYBRID y cuándo aparece?",
        answer:
          "HYBRID es el acompañamiento de 12 semanas que combina GENESIS con revisión humana. Aparece después del reporte, cuando ya entiendes tu punto de partida y quieres ejecutar la ruta con más estructura.",
      },
      {
        question: "¿Necesito crear cuenta para empezar?",
        answer:
          "No necesitas una cuenta completa para iniciar el diagnóstico. El flujo puede crear una sesión privada para guardar tu resultado y permitirte volver a consultarlo. Si después quieres seguimiento, historial o HYBRID, se te pedirá completar el acceso.",
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
    headline: "Empieza con una foto. Sal con más claridad.",
    subtitle:
      "No necesitas prometerte otra transformación perfecta. Necesitas ver una posibilidad, entender tu punto de partida y tomar el siguiente paso con más criterio.",
    buttonText: "Iniciar diagnóstico",
    intent: "final_cta_diagnostic",
    footnote: "Visualización aspiracional. No garantía de resultado.",
  },

  footer: {
    brandName: "NGX Vision",
    status: "GENESIS operativo",
    copyright: "© 2026 NGX. Todos los derechos reservados.",
  },

  explainerVideo: {
    title: "Por qué construí esto",
    subtitle:
      "El sistema detrás de NGX Vision, contado por quien lo creó. Sin script ni promesas — solo el porqué.",
    videoUrl: "",
    posterUrl: "/images/founder-poster.jpg",
    duration: "Demo",
  },
};
