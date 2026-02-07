/**
 * GENESIS Orchestrator
 * Coordina la comunicación entre GENESIS y los agentes especializados
 * GENESIS es la ÚNICA interfaz con el usuario - los agentes son internos
 */

import { DemoUserResponses } from "@/types/demo";

// ============================================================================
// GENESIS Messages - Centralized message templates
// ============================================================================

// v11.0: GENESIS habla en primera persona - NO menciona agentes internos
export const GENESIS_MESSAGES = {
  // Intro messages
  greeting: "Hola {name}. Soy GENESIS, tu coach de inteligencia artificial.",
  analyzing: "Estoy analizando tu perfil para diseñar tu plan personalizado...",

  // v11.0: GENESIS habla en primera persona sobre sus capacidades
  consulting_agents: "Déjame analizar todos los aspectos de tu transformación.",
  blaze_consulting: "Estoy analizando la mejor estructura de entrenamiento para ti...",
  sage_consulting: "Estoy calculando el volumen y progresión ideal...",
  tempo_consulting: "Estoy calibrando los tiempos de descanso y ejecución...",

  // v11.0: GENESIS reporta en primera persona (módulos son internos)
  blaze_report: "He determinado tu estructura de entrenamiento: {message}",
  sage_report: "He calculado tu progresión óptima: {message}",
  tempo_report: "He calibrado tus tiempos de recuperación: {message}",

  // Plan ready
  plan_ready: "Tu plan de la Semana 1 está listo. He diseñado {days} días de entrenamiento optimizados para {goal}.",
  plan_summary: "El plan incluye ejercicios específicos, tiempos de descanso calibrados, y progresión inteligente.",

  // Encouragement
  motivation: "Recuerda: la consistencia supera a la perfección. Un día a la vez.",
  closing: "Estoy aquí para guiarte. Descarga tu plan y comencemos este viaje juntos.",
};

// ============================================================================
// Agent Configurations
// ============================================================================

export interface AgentConfig {
  id: "blaze" | "sage" | "tempo";
  name: string;
  role: string;
  color: string;
  specialty: string;
}

// v11.0: Módulos internos de GENESIS (no expuestos al usuario)
export const AGENTS: Record<string, AgentConfig> = {
  blaze: {
    id: "blaze",
    name: "Entrenamiento", // v11.0: Capacidad, no agente
    role: "Módulo de Estructura",
    color: "orange",
    specialty: "Estructura óptima de entrenamiento (splits, frecuencia, ejercicios)",
  },
  sage: {
    id: "sage",
    name: "Nutrición", // v11.0: Capacidad, no agente
    role: "Módulo de Progresión",
    color: "emerald",
    specialty: "Volumen, intensidad y progresión para resultados óptimos",
  },
  tempo: {
    id: "tempo",
    name: "Recuperación", // v11.0: Capacidad, no agente
    role: "Módulo de Tiempos",
    color: "violet",
    specialty: "Tiempos de descanso, tempo de ejecución y recuperación",
  },
};

// ============================================================================
// Agent Response Generation
// ============================================================================

export interface AgentAnalysis {
  agent: "blaze" | "sage" | "tempo";
  message: string;
  details: Record<string, string | number>;
}

/**
 * Generate BLAZE analysis based on user responses
 */
export function generateBlazeAnalysis(responses: DemoUserResponses): AgentAnalysis {
  const { trainingDays, goal, equipment } = responses;

  // Determine split based on training days
  let structure: string;
  let frequency: string;

  if (trainingDays === "2-3") {
    structure = "Full Body";
    frequency = "cada sesión trabaja todo el cuerpo";
  } else if (trainingDays === "4") {
    structure = "Upper/Lower";
    frequency = "alternando tren superior e inferior";
  } else {
    structure = "Push/Pull/Legs";
    frequency = "maximizando frecuencia por grupo muscular";
  }

  // Adjust for equipment
  let equipmentNote = "";
  if (equipment === "bodyweight") {
    equipmentNote = " Adaptado para calistenia y ejercicios con peso corporal.";
  } else if (equipment === "home") {
    equipmentNote = " Optimizado para equipo básico de casa.";
  }

  const message = `Estructura ${structure} recomendada, ${frequency}.${equipmentNote}`;

  return {
    agent: "blaze",
    message,
    details: {
      split: structure,
      daysPerWeek: trainingDays === "2-3" ? 3 : trainingDays === "4" ? 4 : 5,
      equipment: equipment || "gym",
    },
  };
}

/**
 * Generate SAGE analysis based on user responses
 */
export function generateSageAnalysis(responses: DemoUserResponses): AgentAnalysis {
  const { goal, trainingDays } = responses;

  let volume: string;
  let intensity: string;
  let progression: string;

  if (goal === "muscle") {
    volume = "alto (12-20 series por grupo muscular/semana)";
    intensity = "moderada-alta (RPE 7-9)";
    progression = "sobrecarga progresiva semanal";
  } else if (goal === "fat") {
    volume = "moderado con énfasis en densidad";
    intensity = "alta con descansos cortos";
    progression = "aumento de densidad de trabajo";
  } else {
    volume = "balanceado para recomposición";
    intensity = "variable (periodización ondulante)";
    progression = "dual: fuerza y resistencia metabólica";
  }

  const daysText = trainingDays === "2-3" ? "2-3 días" : trainingDays === "4" ? "4 días" : "5+ días";
  const message = `Volumen ${volume}. Intensidad ${intensity}. Progresión mediante ${progression}. Optimizado para ${daysText} semanales.`;

  return {
    agent: "sage",
    message,
    details: {
      volumeLevel: goal === "muscle" ? "high" : goal === "fat" ? "moderate" : "balanced",
      intensityRange: goal === "muscle" ? "7-9" : goal === "fat" ? "8-10" : "6-9",
      progressionType: goal === "muscle" ? "linear" : goal === "fat" ? "density" : "undulating",
    },
  };
}

/**
 * Generate TEMPO analysis based on user responses
 */
export function generateTempoAnalysis(responses: DemoUserResponses): AgentAnalysis {
  const { goal } = responses;

  let tempo: string;
  let restPeriods: string;
  let recoveryNote: string;

  if (goal === "muscle") {
    tempo = "2-0-2 (controlado en excéntrica)";
    restPeriods = "90-120 segundos entre series";
    recoveryNote = "48-72 horas entre sesiones del mismo grupo";
  } else if (goal === "fat") {
    tempo = "1-0-1 (explosivo y eficiente)";
    restPeriods = "30-60 segundos para mantener frecuencia cardíaca";
    recoveryNote = "24-48 horas, priorizando densidad de entrenamiento";
  } else {
    tempo = "2-1-2 (control total del movimiento)";
    restPeriods = "60-90 segundos (balance óptimo)";
    recoveryNote = "48 horas estándar con autoregulación";
  }

  const message = `Tempo de ejecución ${tempo}. Descansos de ${restPeriods}. Recuperación: ${recoveryNote}.`;

  return {
    agent: "tempo",
    message,
    details: {
      tempoPattern: tempo.split(" ")[0],
      restSeconds: goal === "muscle" ? 105 : goal === "fat" ? 45 : 75,
      recoveryHours: goal === "muscle" ? 60 : goal === "fat" ? 36 : 48,
    },
  };
}

// ============================================================================
// Chat Message Generation
// ============================================================================

export interface ChatStreamEvent {
  type: "genesis_message" | "agent_status" | "agent_report" | "plan_ready" | "error";
  content: string;
  agent?: "blaze" | "sage" | "tempo";
  status?: "pending" | "loading" | "complete";
  details?: Record<string, unknown>;
}

/**
 * Generate the full chat sequence as stream events
 */
export function* generateChatSequence(
  userName: string,
  responses: DemoUserResponses
): Generator<ChatStreamEvent> {
  // Initial GENESIS message
  yield {
    type: "genesis_message",
    content: GENESIS_MESSAGES.consulting_agents.replace("{name}", userName),
  };

  // BLAZE analysis
  yield { type: "agent_status", agent: "blaze", status: "loading", content: "" };

  const blazeAnalysis = generateBlazeAnalysis(responses);
  yield {
    type: "agent_report",
    agent: "blaze",
    content: blazeAnalysis.message,
    details: blazeAnalysis.details,
  };
  yield { type: "agent_status", agent: "blaze", status: "complete", content: "" };

  // SAGE analysis
  yield { type: "agent_status", agent: "sage", status: "loading", content: "" };

  const sageAnalysis = generateSageAnalysis(responses);
  yield {
    type: "agent_report",
    agent: "sage",
    content: sageAnalysis.message,
    details: sageAnalysis.details,
  };
  yield { type: "agent_status", agent: "sage", status: "complete", content: "" };

  // TEMPO analysis
  yield { type: "agent_status", agent: "tempo", status: "loading", content: "" };

  const tempoAnalysis = generateTempoAnalysis(responses);
  yield {
    type: "agent_report",
    agent: "tempo",
    content: tempoAnalysis.message,
    details: tempoAnalysis.details,
  };
  yield { type: "agent_status", agent: "tempo", status: "complete", content: "" };

  // Plan ready
  const daysText = responses.trainingDays === "2-3" ? "3" : responses.trainingDays === "4" ? "4" : "5";
  const goalText = responses.goal === "muscle" ? "ganar músculo" :
                   responses.goal === "fat" ? "perder grasa" : "transformación completa";

  yield {
    type: "genesis_message",
    content: GENESIS_MESSAGES.plan_ready
      .replace("{days}", daysText)
      .replace("{goal}", goalText),
  };

  yield {
    type: "plan_ready",
    content: GENESIS_MESSAGES.closing,
    details: {
      blazeAnalysis: blazeAnalysis.details,
      sageAnalysis: sageAnalysis.details,
      tempoAnalysis: tempoAnalysis.details,
    },
  };
}

// ============================================================================
// Gemini Prompt Builder for Enhanced Chat
// ============================================================================

// v11.0: GENESIS es la ÚNICA voz - no menciona agentes/módulos
export function buildGenesisSystemPrompt(): string {
  return `Eres GENESIS, el coach de inteligencia artificial de NGX. Tu personalidad es:

- Stoico pero motivador
- Directo y sin rodeos
- Científico en tu enfoque
- Empático pero exigente

REGLAS v11.0 - MUY IMPORTANTES:
1. Tú eres la ÚNICA voz que el usuario escucha
2. NUNCA menciones "agentes", "módulos" o nombres como BLAZE, SAGE, TEMPO
3. Habla siempre en PRIMERA PERSONA: "He analizado...", "Estoy calculando...", "Determino que..."
4. Usa español latinoamericano neutro
5. Sé conciso - máximo 2-3 oraciones por mensaje
6. Enfócate en acción, no en teoría

Tus 4 capacidades (internas, no las menciones):
- Entrenamiento de Precisión
- Estrategia Nutricional
- Biohacking y Recuperación
- Arquitectura de Hábitos

Tu objetivo es guiar al usuario a crear y ejecutar su plan de transformación.`;
}

export function buildChatPrompt(
  userMessage: string,
  responses: DemoUserResponses,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const context = `
CONTEXTO DEL USUARIO:
- Días de entrenamiento: ${responses.trainingDays}
- Objetivo: ${responses.goal === "muscle" ? "ganar músculo" : responses.goal === "fat" ? "perder grasa" : "ambos"}
- Equipo: ${responses.equipment === "gym" ? "gimnasio completo" : responses.equipment === "home" ? "equipo en casa" : "peso corporal"}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n")}

MENSAJE DEL USUARIO:
${userMessage}

Responde como GENESIS, siendo conciso y actionable.`;

  return context;
}
