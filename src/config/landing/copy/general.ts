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
  FileText,
  Users,
  Lock,
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
    primaryCta: {
      label: "Descubre Tu Potencial",
      intent: "scan_start",
    },
    secondaryCta: "Cómo funciona",
    supportingPoints: [
      "Resultado claro en menos de 3 minutos.",
      "GENESIS interpreta tus datos con honestidad.",
      "Tú decides el siguiente paso, sin presión.",
    ],
    socialProof: {
      count: "Procesamiento en minutos",
      label: "Procesamiento seguro y controlado",
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
    { value: "4", suffix: " etapas", label: "De análisis a resultados" },
    { value: "12", suffix: " meses", label: "Proyección personalizada" },
    { value: "Acceso", suffix: "", label: "Privado con cuenta" },
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
      title: "Privacidad Segura",
      description:
        "Tu foto se procesa de forma segura y se conserva solo mientras es necesaria para operar el servicio y mostrar tus resultados.",
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
    title: "3 pasos. Acceso privado. Tu potencial revelado.",
    subtitle: "",
    steps: [
      {
        step: "01",
        title: "Sube tu foto",
        description:
          "Una foto de cuerpo completo. Privada y segura. Requiere acceso para generar y resguardar tus resultados.",
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
          "Recibe una proyección visual realista de tu potencial, junto con un análisis detallado y tu plan de acción personalizado.",
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

  valueStack: {
    sectionLabel: "Qué Recibes",
    title: "Una lectura honesta",
    highlight: "y un mapa de acción",
    subtitle:
      "No es otra app que promete. Es un escaneo aspiracional + un plan inicial que puedes ejecutar tú mismo o validar con un coach humano.",
    items: [
      {
        icon: Sparkles,
        title: "Future Body Scan visual",
        description:
          "4 etapas — hoy, mes 4, mes 8 y mes 12 — generadas con identidad consistente para que la imagen se vea como tú, no como un avatar genérico.",
      },
      {
        icon: FileText,
        title: "Plan de 7 días",
        description:
          "Entrenamiento, nutrición y hábitos para tu primera semana. Educativo y orientativo — diseñado para que ejecutes con claridad.",
      },
      {
        icon: Brain,
        title: "Readiness Report",
        description:
          "GENESIS evalúa tu adherencia probable, tu base muscular y si te conviene un proceso autoguiado o con coach humano.",
      },
      {
        icon: Users,
        title: "Ruta a HYBRID",
        description:
          "Si tu contexto sugiere acompañamiento humano, te conectamos con un coach NGX. Si no, sigues con ASCEND autoguiado.",
      },
    ],
  },

  bridge: {
    sectionLabel: "El Puente",
    title: "La imagen inspira.",
    highlight: "El sistema transforma.",
    subtitle:
      "GENESIS te muestra el mapa. Un coach humano te ayuda a ejecutarlo. La IA no reemplaza al coach — lo amplifica.",
    footnote: "Sin costo · Coach disponible en HYBRID",
    buttonText: "Validar mi ruta con un coach",
    buttonIntent: "hybrid_offer",
    cards: [
      {
        icon: Brain,
        title: "GENESIS analiza",
        description:
          "Lee tu perfil, mide adherencia, organiza el plan y detecta ajustes. Sin sesgos, sin promesas.",
      },
      {
        icon: Users,
        title: "El coach valida",
        description:
          "Un coach humano revisa la estrategia contigo, ajusta a tu contexto real y te acompaña en la ejecución.",
      },
      {
        icon: Sparkles,
        title: "Tú ejecutas",
        description:
          "Con un mapa claro y validado, lo que falta es consistencia. Esa parte sigue siendo tuya.",
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
    headline: "Tu cuerpo tiene más potencial del que crees.",
    subtitle:
      "Deja de adivinar. Deja de seguir planes genéricos. Descubre lo que es posible para ti con un análisis real de GENESIS.",
    buttonText: "Descubre Tu Potencial",
    footnote: "Sin costo · Requiere cuenta · Proceso guiado",
  },

  footer: {
    brandName: "NGX Transform",
    status: "Todos los sistemas operativos",
    copyright: "© 2024 NGX. Todos los derechos reservados.",
  },

  // Optional: Explainer video section (hidden if no videoUrl)
  explainerVideo: {
    title: "¿Cómo Funciona NGX?",
    subtitle: "Mira cómo la IA analiza y proyecta tu transformación paso a paso.",
    videoUrl: "", // Empty = section hidden. Add video URL when ready.
    posterUrl: "/images/video-poster.jpg",
    duration: "45s",
  },
};
