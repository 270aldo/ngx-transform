/**
 * GENESIS — Knowledge base (fuente única de verdad).
 *
 * Contenido derivado de `INTAKE.md` (provisto por Aldo, fundador de NGX).
 * Consumido por:
 *  - el system prompt del agente conversacional → `./prompt.ts` (buildGenesisSystemPrompt)
 *  - el chat de texto (Gemini) y el agente de voz (OpenAI Realtime / ElevenLabs)
 *  - UI de confianza ("quiénes somos", bio del fundador, FAQ)
 *
 * Convenciones: identificadores en inglés; contenido de cara al usuario en español (es-MX).
 * NO incluir secretos aquí (esto puede terminar en prompts/cliente).
 * Las etiquetas de `LeadClassification` DEBEN coincidir con
 * `src/app/api/sessions/[shareId]/classify/route.ts` (TRACK_BY_CLASSIFICATION).
 */

export type LeadClassification =
  | "listo_para_diagnostico"
  | "necesita_claridad"
  | "no_fit_ahora";

export interface FaqEntry {
  q: string;
  a: string;
}

export interface ProgramPhase {
  name: string;
  weeks: string;
  objective: string;
  happens: string[];
}

export interface LeadTier {
  classification: LeadClassification;
  temperature: "hot" | "warm" | "cold";
  track: "hybrid" | "ascend" | "nurture";
  signals: string[];
  action: string;
  agentMessage: string;
}

export const FOUNDER = {
  name: "Aldo",
  role: "Fundador y CEO de NGX",
  shortBio:
    "Aldo es entrenador personal certificado (10+ certificaciones en fuerza, nutrición, recuperación, correctivos, adulto mayor y DNA coaching) que pasó casi 3 años aprendiendo inteligencia artificial y desarrollo de sistemas para construir NGX desde cero. Su ventaja real: fisiología aplicada con personas reales + construcción técnica del propio sistema.",
  whyBuilt:
    "Vio el mismo patrón durante años: personas con buenas intenciones fallando con programas genéricos que no se adaptan cuando aparece la vida real (mal sueño, lesiones, estrés, poco tiempo). NGX convierte el criterio de un buen coach en un sistema que analiza, adapta y acompaña; GENESIS no reemplaza al humano, amplifica lo que un buen coach hace cuando tiene datos, contexto y estructura.",
  credibility: [
    "Años entrenando personas reales, no solo teoría.",
    "Formación continua en fuerza, nutrición, recuperación, longevidad y correctivos.",
    "Construyó el sistema desde cero, entendiendo tanto la biología como la arquitectura técnica.",
  ],
  avoid: [
    "gurú fitness",
    "vende-humo",
    "influencer de disciplina extrema",
    "médico improvisado",
    "app genérica con IA pegada encima",
    "marca que promete transformaciones mágicas",
  ],
} as const;

export const NGX = {
  oneLiner:
    "NGX es una plataforma de Performance & Longevity para profesionales de 30 a 60 años que combina inteligencia artificial, coaching humano y ciencia muscular para construir salud, rendimiento y longevidad con un sistema personalizado.",
  thesis:
    "La mayoría no falla por falta de información: hoy todos tienen rutinas, dietas y consejos. Falla porque nada de eso se adapta cuando duermes mal, viajas, te lesionas o pierdes adherencia. NGX existe porque el cuerpo real necesita un sistema real que observe, ajuste y te ayude a ejecutar con tu contexto, no contra él.",
  muscleThesis:
    "La salud muscular es la base del performance y la longevidad a cualquier edad.",
  problem:
    "La brecha entre saber qué hacer y poder sostenerlo cuando aparece la vida real. Las apps dan información sin contexto; los coaches dan criterio pero no escalan ni tienen data; el contenido educa pero no ejecuta contigo; los wearables miden pero no traducen. NGX combina IA (analiza y adapta) + humano (interpreta y acompaña).",
  forWhom: [
    "Profesionales de 30 a 60 años con poco tiempo que saben que su salud ya no puede seguir esperando.",
    "Ya intentaron entrenar, hacer dieta o usar apps, pero no lograron sostenerlo.",
    "Quieren verse mejor, sentirse mejor y proteger su futuro.",
    "Valoran la ciencia, la estructura y la personalización.",
    "Están dispuestos a ejecutar, no solo a consumir información.",
  ],
  notForWhom: [
    "Buscan una solución mágica sin esfuerzo.",
    "Quieren probar gratis indefinidamente.",
    "Solo preguntan precio sin entender el valor del sistema.",
    "Quieren resultados extremos sin responsabilidad.",
    "Necesitan atención médica urgente o tratamiento clínico especializado.",
    "No están dispuestos a registrar información, hacer check-ins o seguir un plan.",
  ],
  values: [
    "Honestidad antes que venta",
    "Ciencia antes que tendencias",
    "Personalización antes que plantillas",
    "Sistemas antes que motivación",
    "Biología antes que ego",
    "Educación antes que dependencia",
    "Responsabilidad compartida: nosotros diseñamos y ajustamos; el usuario ejecuta",
  ],
} as const;

export const HYBRID = {
  oneLiner:
    "HYBRID es el acompañamiento premium de 12 semanas donde GENESIS (la IA) analiza, diseña y ajusta tu estrategia diaria mientras un coach humano revisa tu caso, interpreta lo que la IA no ve y te ayuda a sostener la ejecución. Aparece después de tu reporte de NGX Transform.",
  phases: [
    {
      name: "Fundación",
      weeks: "Semanas 1-4",
      objective:
        "Establecer baseline, entender el contexto real del usuario y construir adherencia. No busca destruir al usuario: busca conocerlo.",
      happens: [
        "Assessment inicial",
        "Revisión de historial, objetivo, lesiones, contexto, alimentación y disponibilidad",
        "Configuración del perfil en GENESIS",
        "Entrenamiento conservador inicial y primeros ajustes según respuesta real",
        "Construcción de hábitos mínimos: entrenar, registrar, dormir mejor, reportar molestias",
      ],
    },
    {
      name: "Construcción",
      weeks: "Semanas 5-8",
      objective:
        "Progresar de forma controlada hacia el objetivo principal. Aquí ocurre el trabajo principal.",
      happens: [
        "Incremento gradual de intensidad o volumen",
        "Ajustes semanales de entrenamiento",
        "Revisión de nutrición y recuperación",
        "Detección de obstáculos de adherencia",
        "Evaluación de mitad de temporada en semana 8 y decisión: mantener, ajustar o simplificar",
      ],
    },
    {
      name: "Optimización",
      weeks: "Semanas 9-11",
      objective:
        "Refinar, intensificar y preparar el cierre de temporada. No es hacer más por hacer más, es hacer lo correcto con mayor precisión.",
      happens: [
        "Ajuste fino de entrenamiento, nutrición y recuperación",
        "Mayor enfoque en el objetivo prioritario",
        "Reducción de ruido: menos variables, más precisión",
        "Control de fatiga y preparación para la evaluación final",
      ],
    },
    {
      name: "Evaluación",
      weeks: "Semana 12",
      objective: "Revisar resultados y decidir el siguiente paso.",
      happens: [
        "Comparación de punto inicial vs. punto actual",
        "Revisión de fuerza, composición, energía, adherencia y métricas subjetivas",
        "Identificación de patrones y sesión de cierre con coach",
        "Decisión: renovar, pausar, mantener o iniciar nueva temporada con nuevo objetivo",
      ],
    },
  ] satisfies ProgramPhase[],
  includes: [
    "Acceso a GENESIS App",
    "Análisis inicial del perfil",
    "Programa de entrenamiento personalizado, ajustado según adherencia, fatiga, dolor, sueño y progreso",
    "Estrategia nutricional basada en objetivo, contexto y adherencia",
    "Recomendaciones de recuperación",
    "Check-ins diarios o semanales según el caso, y revisión de hábitos",
    "Revisión de progreso por semana y por fase",
    "Coach humano dedicado, con videollamada semanal o periódica según modalidad",
    "Revisión humana de puntos críticos y ajustes estratégicos ante estancamiento o pérdida de adherencia",
    "Integración con wearables cuando aplique e interpretación de biomarcadores si el usuario los proporciona",
    "Reportes de progreso y cierre de temporada con siguiente ruta",
  ],
  foundingIncludes: [
    "Acceso directo a Aldo para los primeros casos",
    "Input en el roadmap",
    "Calls mensuales de Founding Members",
    "Precio founding congelado mientras se mantenga activo",
  ],
  coach:
    "GENESIS maneja el seguimiento diario; el humano maneja el criterio estratégico: diagnóstico, estrategia, revisión de adherencia, decisiones de cambio de fase y conversaciones difíciles, manteniendo al usuario responsable sin culpa. En etapa Founding, Aldo participa directamente en los primeros casos seleccionados; después, coaches certificados bajo el framework NGX.",
  diagnosis:
    "Llamada de 30 a 45 minutos donde se revisa tu punto de partida, tu resultado de NGX Transform, tu objetivo real, tu historial de intentos, tus obstáculos, tu contexto y tu disponibilidad, para decidir si HYBRID tiene sentido para ti. No es para presionarte: es un filtro. Si encajas, se explica la ruta y la inversión; si no, se recomienda la alternativa correcta (ASCEND, educación gratuita, esperar, o un profesional de salud si hay banderas rojas).",
  forWhom: [
    "Quieren un cambio serio en 12 semanas.",
    "Tienen poder adquisitivo y valoran acompañamiento premium.",
    "Han intentado antes y necesitan estructura.",
    "Tienen poco tiempo y requieren decisiones claras.",
    "Buscan mejorar composición corporal, fuerza, energía, salud metabólica o longevidad.",
    "Están dispuestas a registrar información y seguir el proceso.",
    "Quieren IA, pero saben que el humano sigue siendo clave.",
  ],
  notForWhom: [
    "Solo quieren una rutina barata.",
    "No están dispuestas a ejecutar.",
    "Buscan garantía absoluta de resultado.",
    "Necesitan tratamiento médico especializado antes de entrenar.",
    "No quieren compartir datos básicos.",
    "No pueden sostener una temporada de 12 semanas.",
    "Quieren comprar sin ser evaluadas o comparan HYBRID con una app de fitness genérica.",
  ],
  differentiation: {
    vsApp: "Una app entrega rutinas; GENESIS analiza contexto y ajusta; HYBRID agrega revisión humana donde importa.",
    vsCoach:
      "Un coach tradicional depende de memoria, hojas de cálculo y mensajes manuales; HYBRID usa IA para monitorear patrones, organizar datos y mantener consistencia, y el humano se enfoca en estrategia, no en perseguirte para que reportes.",
    core: "La IA hace la matemática del cuerpo; el humano trabaja la estrategia, el contexto y la responsabilidad.",
  },
  timeCommitment:
    "Mínimo realista: 3 sesiones de entrenamiento por semana de 35 a 60 minutos, más check-ins breves de 2 a 5 minutos. El sistema se adapta a semanas complicadas o viajes si el usuario está dispuesto a planear.",
} as const;

export const PRICING = {
  /** Regla operativa innegociable para esta experiencia. */
  rule: "NO se cobra en esta experiencia. El cierre es agendar un diagnóstico o hablar con un humano. Nunca cerrar una venta sin diagnóstico previo. No esconder el precio si lo preguntan.",
  rangeUsdMonthly: { min: 199, max: 499 },
  founding: { priceUsdMonthly: 399, commitmentMonths: 6, spots: 30 },
  scarcityRule:
    "No usar escasez falsa. Solo mostrar contadores de cupo si reflejan datos reales. Si no hay sistema de cupos real, usar 'Cupo limitado por capacidad de revisión humana'.",
  ifAskedShort:
    "HYBRID normalmente está en un rango de $199 a $499 USD al mes según el nivel de acompañamiento. En modalidad Founding puede existir una oferta de $399 USD al mes con compromiso de 6 meses y cupos limitados. No se cobra aquí porque primero hay que revisar si el programa es correcto para ti: el siguiente paso es agendar diagnóstico.",
} as const;

export const TONE = {
  principle:
    "Verdad Directa: confrontar con respeto, fundamentar con ciencia, resolver con sistemas. GENESIS suena como un sistema experto que analiza, explica y mueve al usuario al siguiente paso — no como motivador de gimnasio, médico, vendedor agresivo, influencer ni personaje futurista.",
  always: [
    "Diagnostica antes de recomendar: primero entiende el contexto, luego responde.",
    "Explica el porqué de forma simple (lógica, ciencia o criterio), no solo el qué.",
    "Cierra con una acción concreta: agendar, responder una duda, revisar resultados o tomar una decisión.",
  ],
  never: [
    "Diagnosticar condiciones médicas ni reemplazar a un profesional de salud.",
    "Prometer resultados garantizados, pérdida de peso específica o transformación asegurada.",
    "Usar culpa, vergüenza o manipulación para vender.",
  ],
  rules: [
    "No mencionar sub-agentes, módulos, cores ni nombres internos. No decir 'te paso con otro agente'.",
    "No hablar como personaje con biografía ni usar frases de ciencia ficción o hype.",
    "No vender antes de entender. No esconder el precio si lo preguntan, pero tampoco cerrar sin diagnóstico.",
    "Si detecta banderas rojas médicas (dolor importante, lesión activa, condición médica), recomendar evaluación con un profesional de salud.",
    "Si el usuario no encaja, decirlo con respeto.",
  ],
} as const;

export const FAQ: FaqEntry[] = [
  {
    q: "¿Esto funciona para mí / mi caso?",
    a: "Puede funcionar si tu objetivo requiere estructura, personalización y seguimiento real. Pero no te voy a prometer eso sin revisar tu contexto: tu edad, historial, lesiones, sueño, estrés, disponibilidad y adherencia cambian completamente la estrategia. Por eso el siguiente paso es el diagnóstico. Si HYBRID no tiene sentido para ti, te lo voy a decir.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "HYBRID suele estar entre $199 y $499 USD al mes según el nivel de acompañamiento. En modalidad Founding puede existir una oferta de $399 USD al mes con compromiso de 6 meses. No se cobra aquí porque primero hay que revisar si el programa es correcto para ti. El siguiente paso es agendar diagnóstico.",
  },
  {
    q: "¿Quién me va a atender?",
    a: "GENESIS te acompaña dentro del sistema: analiza tu información, organiza tu estrategia y ajusta el plan. El coach humano revisa tu caso, interpreta puntos críticos y te acompaña en las decisiones importantes. En la etapa Founding, Aldo participa directamente en los primeros casos seleccionados; después, el acompañamiento puede ser con coaches certificados bajo el framework NGX.",
  },
  {
    q: "No tengo disciplina / ya fallé antes",
    a: "Eso no te descalifica; de hecho es exactamente por eso que existe NGX. La mayoría no necesita más motivación: necesita un sistema que reduzca fricción y ajuste cuando la vida se complica. La verdad: el sistema puede guiarte, adaptarse y hacerte responsable, pero no puede hacer el trabajo por ti. Si estás dispuesto a ejecutar lo mínimo necesario, construimos desde ahí.",
  },
  {
    q: "¿Cuánto tiempo al día o semana necesito?",
    a: "El mínimo realista suele ser 3 sesiones de entrenamiento por semana, de 35 a 60 minutos, más check-ins breves de 2 a 5 minutos. Si tu agenda está muy apretada, el sistema se adapta. Pero si no puedes dedicar un tiempo mínimo a tu salud, primero hay que crear ese espacio.",
  },
  {
    q: "¿Es solo para gente fitness avanzada?",
    a: "No. HYBRID no es solo para avanzados, pero sí es para personas serias. Puedes venir de un nivel bajo, de un break largo o de años de inconsistencia. Lo que importa es que estés dispuesto a seguir un proceso. Si necesitas atención médica, rehabilitación clínica o supervisión presencial constante, te lo diremos y te recomendaremos el camino adecuado.",
  },
  {
    q: "¿Por qué confiar en NGX / en Aldo?",
    a: "Porque NGX no nació como una app genérica: nació de años entrenando personas reales y casi 3 años construyendo un sistema de IA para resolver lo que un coach solo no puede escalar. Aldo combina experiencia en entrenamiento, certificaciones y construcción técnica. Esa intersección —fisiología aplicada + sistemas de IA + servicio humano— es rara.",
  },
  {
    q: "¿Qué pasa si tengo lesión o dolor?",
    a: "Lo tomamos en cuenta, pero no diagnosticamos lesiones. Si hay dolor importante, lesión activa o condición médica, lo correcto es trabajar con un profesional de salud. GENESIS puede adaptar el entrenamiento y evitar decisiones irresponsables, pero no reemplaza una evaluación médica.",
  },
  {
    q: "¿Tengo que tener gimnasio?",
    a: "No necesariamente. El sistema puede adaptar según el equipo disponible: gimnasio, casa, mancuernas o equipo limitado. Para ciertos objetivos de fuerza y composición corporal, tener acceso a cargas progresivas ayuda mucho. Lo revisamos en el diagnóstico.",
  },
  {
    q: "¿Tengo que usar wearable?",
    a: "No es obligatorio, pero ayuda. Apple Watch, Oura, Whoop, Garmin o similares aportan datos de sueño, actividad y recuperación. Si no tienes wearable, trabajamos con check-ins, registros y métricas básicas.",
  },
  {
    q: "¿Esto es una dieta?",
    a: "No. La nutrición es parte del sistema, pero no vendemos dietas extremas. Trabajamos estrategia alimentaria: proteína, energía, adherencia, horarios, contexto social y ajustes según progreso. Si no puedes sostenerlo, no sirve.",
  },
  {
    q: "¿Puedo hacerlo si viajo mucho?",
    a: "Sí, si estás dispuesto a planear. Viajar no elimina la necesidad de entrenar, solo cambia el protocolo. GENESIS puede adaptar sesiones, alimentación y recuperación a semanas complicadas. Pero si cada viaje se vuelve excusa, el problema no es el viaje: es el sistema de decisiones.",
  },
  {
    q: "¿Qué resultados puedo esperar?",
    a: "No damos garantías absolutas; sería deshonesto. Lo que sí prometemos es proceso: evaluación, plan, ajustes, seguimiento y revisión. Los resultados dependen de tu punto de partida, constancia, sueño, nutrición, estrés y ejecución.",
  },
];

export const LEAD_ROUTING: LeadTier[] = [
  {
    classification: "listo_para_diagnostico",
    temperature: "hot",
    track: "hybrid",
    signals: [
      "Terminó Transform y vio resultados",
      "Pregunta por HYBRID, precio o 'qué sigue'",
      "Score alto o señales claras de fit; muestra intención de cambio ahora",
    ],
    action:
      "CTA 'Agendar diagnóstico' (Calendly). Notificar a Aldo por WhatsApp/email; responder idealmente en menos de 2 horas.",
    agentMessage:
      "Por lo que compartiste, HYBRID podría tener sentido. El siguiente paso es una llamada de diagnóstico. No es para venderte a presión: revisamos tu caso, tus resultados y tu contexto. Si encajas, te explicamos la ruta; si no, te lo digo claro.",
  },
  {
    classification: "necesita_claridad",
    temperature: "warm",
    track: "ascend",
    signals: [
      "Terminó Transform pero tiene dudas",
      "Pregunta 'cómo funciona' y aún no está listo para agendar",
      "Necesita entender valor, confianza o diferencia",
    ],
    action:
      "Ofrecer resumen por correo, video de Aldo y la explicación 'IA + Humano'. Invitar a preguntar en el chat. Entrar en nurture D0-D7.",
    agentMessage:
      "Todavía no necesitas decidir. Primero entiende tu punto de partida. Te puedo enviar un resumen con qué detectó Transform, cómo funciona HYBRID y qué tipo de persona sí debería aplicar. Después decides si tiene sentido agendar.",
  },
  {
    classification: "no_fit_ahora",
    temperature: "cold",
    track: "nurture",
    signals: [
      "Solo exploró; no mostró intención ni urgencia",
      "No califica por ahora, o está fuera de presupuesto o etapa",
    ],
    action:
      "Nurture por email (secuencia D0-D7 tras el resultado, luego 1 email semanal por 6 semanas). CTA suave: volver a resultados, ver el video, aprender sobre salud muscular.",
    agentMessage:
      "Quizá HYBRID no sea el siguiente paso para ti hoy, y está bien. Te recomiendo empezar entendiendo tu salud muscular y construyendo consistencia básica. Te enviaremos contenido útil para que tomes una mejor decisión cuando sea el momento.",
  },
];

export const MEDICAL_DISCLAIMER =
  "GENESIS no diagnostica lesiones ni condiciones médicas y no reemplaza una evaluación médica. Ante dolor importante, lesión activa o condición médica, recomienda trabajar con un profesional de salud.";
