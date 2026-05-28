import type { InsightsResult } from "@/types/ai";

/**
 * Dev-only stub for the Results page (`/s/[shareId]?demo=1`). Mirrors the
 * shape of a "ready" session without hitting Firestore or AI APIs, so we
 * can iterate visually on the Results 2.0 funnel.
 *
 * Mirrors the SessionDoc + AI shapes consumed by `page.tsx`. Image URLs
 * point to Unsplash demo assets so the viewer renders cleanly. Only used
 * when NODE_ENV=development AND ?demo=1 is present.
 */

export const DEMO_AI: InsightsResult = {
  insightsText:
    "Tu lectura inicial muestra una base sólida con margen claro de mejora en composición corporal y consistencia. La visión de temporada es realista si sostienes estructura y recuperación adecuada.",
  timeline: {
    m0: {
      month: 0,
      title: "Hoy",
      description:
        "Tu punto de partida actual. Estructura honesta antes de cualquier intervención.",
      focus: "Calibración base",
      mental:
        "Aceptar el punto de partida es más útil que minimizarlo. Lo que ves aquí no te define — es solo el inicio.",
      stats: { strength: 52, aesthetics: 48, endurance: 55, mental: 60 },
      expectations: [
        "Capacidad de fuerza relativa media",
        "Recuperación entre sesiones aceptable",
      ],
      risks: ["Plateau si no hay progresión semanal estructurada"],
    },
    m4: {
      month: 4,
      title: "Season 1 — Génesis",
      description:
        "Primera adaptación: el sistema empieza a responder. Más densidad muscular, menos fatiga acumulada.",
      focus: "Construcción de base",
      mental:
        "Season 1 es suficiente para crear una señal real de hábito. El cambio empieza a notarse en cómo te sientes, antes que en cómo te ves.",
      stats: { strength: 65, aesthetics: 60, endurance: 68, mental: 70 },
      expectations: [
        "Aumento visible de fuerza en básicos",
        "Mejor calidad de sueño",
        "Más energía sostenida",
      ],
      risks: ["Volver a viejos patrones si no hay seguimiento"],
    },
    m8: {
      month: 8,
      title: "Season 2 — Metamorfosis",
      description:
        "Composición corporal redefinida. La estructura del entrenamiento se vuelve segunda naturaleza.",
      focus: "Refinamiento",
      mental:
        "En Season 2, la disciplina deja de costar. Tu cuerpo y tu mente empiezan a operar como un sistema integrado.",
      stats: { strength: 78, aesthetics: 75, endurance: 80, mental: 80 },
      expectations: [
        "Definición muscular evidente",
        "Capacidad de trabajo duplicada vs mes 0",
        "Estabilidad emocional mejorada",
      ],
      risks: ["Sobreentrenamiento si no respetas semanas de descarga"],
    },
    m12: {
      month: 12,
      title: "Season 3 — Forma",
      description:
        "Un año de consistencia construye una nueva base. Esto no es un punto final — es el nuevo punto de partida.",
      focus: "Forma estable",
      mental:
        "Lo que se construye con estructura se puede sostener después. No buscaste un cambio puntual — construiste un sistema.",
      stats: { strength: 88, aesthetics: 85, endurance: 86, mental: 88 },
      expectations: [
        "Composición corporal orientativa para tu punto de partida",
        "Disciplina como identidad, no como esfuerzo",
        "Capacidad de mantener forma sin obsesión",
      ],
      risks: [
        "Buscar el siguiente reto sin asentar lo logrado",
      ],
    },
  },
  overlays: {},
  diagnostic: {
    bottleneck: "structure",
    leverages: [
      "Subir entrenamiento a 4 sesiones/sem con progresión clara: tu reporte de 4h disponibles permite frecuencia, falta el plan que las ordene.",
      "Bloquear horarios fijos antes del lunes: tu reporte de 4h disponibles pide estructura, no más intención.",
      "Bloquear 7-8h de sueño consistente: tu stressLevel 6/10 indica que la recuperación está siendo el cuello, no el volumen.",
    ],
    dominant_error:
      "Estás entrenando con consistencia pero sin estructura periodizada — el resultado son ganancias erráticas que no se traducen en composición visible.",
    muscle_health_score: 64,
    biological_age_estimate: 36,
    metabolic_risk: "MEDIO",
  },
};

export const DEMO_LETTER = `Si pudieras verte ahora, en Season 3, te darías cuenta de algo más importante que cualquier cambio físico: dejaste de necesitar la motivación. Construiste un sistema. Y eso es lo que cambia todo.

No fue lineal. Hubo semanas donde quisiste rendirte. Pero la diferencia esta vez fue que no te quedaste solo. Tuviste estructura. Tuviste a alguien revisando tu caso cuando aparecía la duda.

Lo que ves en estas imágenes no es magia ni transformación rápida. Es lo que pasa cuando la disciplina se vuelve identidad.`;

export const DEMO_SESSION = {
  shareId: "demo",
  email: "demo@ngx.local",
  ownerUid: "demo-owner",
  input: {
    age: 32,
    sex: "male" as const,
    heightCm: 178,
    weightKg: 82,
    level: "intermedio" as const,
    goal: "mixto" as const,
    weeklyTime: 4,
    focusZone: "full",
    stressLevel: 6,
  },
  photo: { originalStoragePath: "demo/original.jpg" },
  ai: DEMO_AI,
  assets: {
    images: {
      m0: "/demo-photo.svg",
      m4: "/images/backgrounds/goal-hibrido.svg",
      m8: "/images/backgrounds/goal-hipertrofia.svg",
      m12: "/images/backgrounds/goal-definicion.svg",
    },
  },
  status: "ready" as const,
  letter_from_future: DEMO_LETTER,
  shareScope: {
    shareOriginal: true,
    shareInsights: true,
    shareProfile: true,
    shareImages: true,
  },
};

export const DEMO_URLS = {
  originalUrl: DEMO_SESSION.assets.images.m0,
  images: DEMO_SESSION.assets.images,
};
