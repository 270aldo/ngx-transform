/**
 * GENESIS Readiness Report — Sprint 2 (Funnel HYBRID).
 *
 * Calcula 3 scores 0-100 a partir del perfil del usuario:
 *  - transformationReadiness: probabilidad de adherencia (disciplina, sueño, estrés, tiempo).
 *  - muscleFoundation: base muscular y experiencia (edad, nivel, historial, tipo).
 *  - hybridFit: cuánto se beneficiaría el usuario de soporte humano (HYBRID) vs autoguiado (ASCEND).
 *
 * Y deriva la recomendación de tier (ASCEND vs HYBRID) con motivo y CTA copy.
 *
 * Las funciones son puras y deterministas — testeables sin mocks.
 */

import type { Profile } from "./validators";

export type ReadinessLabel = "Alta" | "Media" | "Baja";
export type RecommendedTier = "ASCEND" | "HYBRID";
export type FoundationPriority = "fuerza" | "proteína" | "consistencia" | "recuperación";

export interface ReadinessReport {
  transformationReadiness: {
    score: number;
    label: ReadinessLabel;
    explanation: string;
  };
  muscleFoundation: {
    score: number;
    priority: FoundationPriority;
  };
  hybridFit: {
    score: number;
  };
  recommendation: {
    tier: RecommendedTier;
    reason: string;
    cta: string;
  };
}

/**
 * Score 0-100 que predice adherencia. Pondera disciplina, sueño, estrés (invertido),
 * tiempo semanal disponible y nivel de entrenamiento.
 */
export function computeTransformationReadiness(p: Profile): {
  score: number;
  label: ReadinessLabel;
  explanation: string;
} {
  const discipline = p.disciplineRating ?? 5; // 1-10
  const sleep = p.sleepQuality ?? 5; // 1-10
  const stress = p.stressLevel ?? 5; // 1-10 (alto = malo)
  const weeklyTime = p.weeklyTime; // 1-14 hrs
  const levelBonus = p.level === "avanzado" ? 10 : p.level === "intermedio" ? 5 : 0;

  // Cada subscore en 0-100
  const disciplineScore = (discipline / 10) * 100;
  const sleepScore = (sleep / 10) * 100;
  const stressScore = ((10 - stress) / 10) * 100; // invertido
  const timeScore = Math.min((weeklyTime / 7) * 100, 100); // 7+ hrs = ideal

  const raw =
    disciplineScore * 0.35 +
    sleepScore * 0.2 +
    stressScore * 0.2 +
    timeScore * 0.15 +
    levelBonus;

  const score = Math.round(Math.min(100, Math.max(0, raw)));
  const label: ReadinessLabel = score >= 70 ? "Alta" : score >= 45 ? "Media" : "Baja";

  const limiter = pickReadinessLimiter({ discipline, sleep, stress, weeklyTime });
  const explanation =
    label === "Alta"
      ? "Tu base de hábitos sostiene un proceso exigente. La variable crítica será mantener consistencia."
      : label === "Media"
        ? `${limiter} es tu variable a corregir antes de subir intensidad.`
        : `Antes de entrenar más, conviene resolver ${limiter.toLowerCase()}.`;

  return { score, label, explanation };
}

function pickReadinessLimiter(v: {
  discipline: number;
  sleep: number;
  stress: number;
  weeklyTime: number;
}): string {
  if (v.sleep <= 5) return "El sueño";
  if (v.stress >= 7) return "El estrés";
  if (v.discipline <= 5) return "La disciplina";
  if (v.weeklyTime < 3) return "El tiempo disponible";
  return "La consistencia";
}

/**
 * Score 0-100 que estima base muscular y deriva una prioridad de trabajo inicial.
 */
export function computeMuscleFoundation(p: Profile): {
  score: number;
  priority: FoundationPriority;
} {
  const levelScore = p.level === "avanzado" ? 80 : p.level === "intermedio" ? 55 : 25;
  const historyScore = Math.min((p.trainingHistoryYears ?? 0) * 8, 40);
  const timeScore = Math.min(p.weeklyTime * 4, 25);
  const ageDecay = Math.max(0, (p.age - 30) * 0.4); // pérdida progresiva post-30

  const raw = levelScore + historyScore + timeScore - ageDecay;
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  const priority: FoundationPriority = (() => {
    if (p.level === "novato") return "consistencia";
    if (p.goal === "masa") return "proteína";
    if ((p.sleepQuality ?? 5) <= 5 || (p.stressLevel ?? 5) >= 7) return "recuperación";
    return "fuerza";
  })();

  return { score, priority };
}

/**
 * Score 0-100 que indica cuánto se beneficiaría el usuario de soporte humano (HYBRID).
 * Reglas aditivas según Codex §6.3.
 */
export function computeHybridFit(p: Profile): { score: number } {
  let score = 0;
  if (p.level === "novato") score += 25;
  if ((p.disciplineRating ?? 5) <= 5) score += 25;
  if ((p.stressLevel ?? 5) >= 8) score += 20;
  if ((p.sleepQuality ?? 5) <= 5) score += 15;
  if ((p.notes ?? "").match(/lesi[óo]n|dolor|cirug[íi]a|rehab/i)) score += 30;

  return { score: Math.min(100, score) };
}

/**
 * Combina los 3 scores en una recomendación de tier con motivo y CTA copy.
 * Threshold: hybridFit >= 50 → HYBRID; sino ASCEND.
 */
export function recommendTier(report: Omit<ReadinessReport, "recommendation">): {
  tier: RecommendedTier;
  reason: string;
  cta: string;
} {
  const wantsHybrid = report.hybridFit.score >= 50;

  if (wantsHybrid) {
    return {
      tier: "HYBRID",
      reason:
        "Tu contexto sugiere que el acompañamiento humano de un coach acelera resultados y reduce riesgo de lesión.",
      cta: "Validar mi ruta con un coach",
    };
  }

  return {
    tier: "ASCEND",
    reason:
      "Tu base de adherencia y experiencia permite un proceso autoguiado con GENESIS sin necesidad de coach humano.",
    cta: "Empezar con ASCEND",
  };
}

/**
 * Orquestador: dado un Profile, calcula el report completo.
 */
export function generateReadinessReport(profile: Profile): ReadinessReport {
  const transformationReadiness = computeTransformationReadiness(profile);
  const muscleFoundation = computeMuscleFoundation(profile);
  const hybridFit = computeHybridFit(profile);
  const recommendation = recommendTier({
    transformationReadiness,
    muscleFoundation,
    hybridFit,
  });

  return { transformationReadiness, muscleFoundation, hybridFit, recommendation };
}
