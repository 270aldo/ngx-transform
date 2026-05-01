/**
 * Landing Page Copy - Mayores Variant (50+)
 *
 * Calm, health-focused copy for older audience.
 * Tone: Trustworthy, supportive, wellness-oriented.
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
      aiLabel: "Tecnología Gemini AI",
      version: "v2.1",
    },
    headline: {
      line1: "Recupera tu",
      line2: "vitalidad.",
    },
    subtitle:
      "Visualiza cómo puedes mejorar tu bienestar físico en 12 meses. Análisis personalizado y seguro.",
    cta: "Ver Mi Proyección",
    socialProof: {
      count: "+10,000 usuarios satisfechos",
      label: "Esta semana",
    },
    // Before/After transformation demo - images for wellness/vitality
    transformationDemo: {
      beforeImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop&crop=faces",
      afterImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=1000&fit=crop&crop=faces",
      beforeLabel: "ANTES",
      afterLabel: "12 MESES",
    },
  },

  stats: [
    { value: "99.9", suffix: "%", label: "Precisión" },
    { value: "<3", suffix: "min", label: "Tiempo" },
    { value: "1M", suffix: "+", label: "Usuarios" },
    { value: "186", suffix: "+", label: "Países" },
  ],

  features: [
    {
      icon: Brain,
      title: "Análisis Personalizado",
      description:
        "Nuestra tecnología analiza tu constitución física y crea una proyección realista adaptada a tu edad y objetivos de salud.",
      size: "large",
    },
    {
      icon: Shield,
      title: "Privacidad Garantizada",
      description: "Tu foto se procesa de forma segura y se elimina automáticamente.",
      size: "medium",
      badge: "Datos protegidos",
    },
    {
      icon: Heart,
      title: "Progreso Gradual",
      description:
        "Visualiza tu evolución en 4 etapas: Hoy, 4 meses, 8 meses y 12 meses. Un camino sostenible hacia tu bienestar.",
      size: "full",
    },
  ],

  howItWorks: {
    title: "Proceso Sencillo",
    subtitle: "Tres pasos simples para ver tu proyección.",
    steps: [
      {
        step: "01",
        title: "Comparte tu Foto",
        description:
          "Una foto de cuerpo completo. Frontal y con buena iluminación.",
        icon: Camera,
      },
      {
        step: "02",
        title: "Indica tus Objetivos",
        description:
          "Cuéntanos sobre tu salud, actividad física y metas. Toma solo 2 minutos.",
        icon: User,
      },
      {
        step: "03",
        title: "Recibe tu Proyección",
        description:
          "Obtén una visualización personalizada de tu progreso potencial.",
        icon: Heart,
      },
    ],
  },

  testimonials: {
    sectionLabel: "Testimonios",
    items: [
      {
        text: "A mis 58 años, pensé que era tarde para mejorar. Esta proyección me mostró que aún tengo mucho potencial. Muy motivador.",
        name: "Roberto G.",
        role: "Usuario verificado",
        gradient: "from-teal-400 to-emerald-400",
      },
      {
        text: "Lo más útil fue ver el progreso gradual. No promesas irreales, sino una evolución que puedo lograr con constancia.",
        name: "María Elena P.",
        role: "Usuario verificado",
        gradient: "from-blue-400 to-indigo-400",
      },
      {
        text: "Como médico, aprecio que muestre proyecciones realistas. Mis pacientes lo usan para visualizar sus metas de salud.",
        name: "Dr. Fernando A.",
        role: "Médico Deportivo",
        gradient: "from-violet-400 to-purple-400",
      },
    ],
  },

  cta: {
    headline: "Tu bienestar comienza aquí",
    subtitle:
      "Descubre cómo puedes mejorar tu salud física. Gratuito, confidencial y sin compromisos.",
    buttonText: "Comenzar Ahora",
    footnote: "Proceso simple de 3 minutos",
  },

  footer: {
    brandName: "NGX Transform",
    status: "Sistema funcionando correctamente",
    copyright: "© 2024 NGX. Todos los derechos reservados.",
  },

  // Optional: Explainer video section (hidden if no videoUrl)
  explainerVideo: {
    title: "¿Cómo Funciona?",
    subtitle: "Un proceso sencillo de 3 pasos para visualizar tu progreso.",
    videoUrl: "", // Empty = section hidden. Add video URL when ready.
    posterUrl: "/images/video-poster.jpg",
    duration: "45s",
  },
};
