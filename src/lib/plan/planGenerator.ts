/**
 * PR-4: Plan Generator
 *
 * Generates personalized 7-day fitness plans using AI (Gemini)
 * Falls back to template-based generation if AI fails
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type {
  SevenDayPlan,
  DayPlan,
  ProfileSummary,
  PlanGenerationResult,
} from "./planTypes";
import {
  EXERCISES_BY_ZONE,
  BASE_HABITS,
  NUTRITION_BY_GOAL,
  MINDSET_NOTES,
  INTENSITY_BY_LEVEL,
  getWorkoutDuration,
} from "./planTemplates";

// ============================================================================
// Zod Schema for AI Output Validation
// ============================================================================

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string(),
  rest: z.string(),
  notes: z.string().optional(),
});

const DayPlanSchema = z.object({
  day: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
  ]),
  workout: z.object({
    focus: z.string(),
    exercises: z.array(ExerciseSchema).min(3).max(10),
    duration: z.number().min(20).max(120),
    intensity: z.enum(["low", "medium", "high"]),
  }),
  habits: z.object({
    morning: z.array(z.string()).min(2).max(6),
    evening: z.array(z.string()).min(2).max(6),
  }),
  nutrition: z.object({
    calories: z.number().min(1200).max(5000),
    protein: z.number().min(50).max(400),
    meals: z.array(z.string()).min(3).max(6),
  }),
  mindset: z.string().min(20).max(300),
});

const SevenDayPlanSchema = z.object({
  days: z.array(DayPlanSchema).length(7),
});

// ============================================================================
// AI Prompt
// ============================================================================

function buildPlanPrompt(profile: ProfileSummary, insightsText?: string): string {
  const goalDescriptions = {
    definicion: "perder grasa y definir músculos manteniendo masa magra",
    masa: "ganar masa muscular y fuerza de forma progresiva",
    mixto: "mejorar composición corporal (recomposición)",
  };

  const focusDescriptions = {
    upper: "tren superior (pecho, espalda, hombros, brazos)",
    lower: "tren inferior (cuádriceps, isquiotibiales, glúteos, gemelos)",
    abs: "core y abdominales",
    full: "cuerpo completo equilibrado",
  };

  return `Eres un Elite Performance Coach creando un plan de 7 días personalizado.

PERFIL DEL USUARIO:
- Sexo: ${profile.sex}
- Edad: ${profile.age} años
- Objetivo: ${goalDescriptions[profile.goal]}
- Tipo de cuerpo: ${profile.bodyType}
- Zona de enfoque: ${focusDescriptions[profile.focusZone]}
- Nivel: ${profile.level}
- Tiempo semanal disponible: ${profile.weeklyTime} horas
${profile.stressLevel ? `- Nivel de estrés: ${profile.stressLevel}/10` : ""}
${profile.sleepQuality ? `- Calidad de sueño: ${profile.sleepQuality}/10` : ""}
${profile.disciplineRating ? `- Disciplina: ${profile.disciplineRating}/10` : ""}

${insightsText ? `ANÁLISIS PREVIO:\n${insightsText.slice(0, 500)}` : ""}

GENERA un plan de 7 días en JSON con esta estructura EXACTA:
{
  "days": [
    {
      "day": 1,
      "workout": {
        "focus": "Nombre del enfoque del día",
        "exercises": [
          {"name": "Nombre ejercicio", "sets": 4, "reps": "8-12", "rest": "90s", "notes": "opcional"}
        ],
        "duration": 60,
        "intensity": "medium"
      },
      "habits": {
        "morning": ["hábito 1", "hábito 2", "hábito 3"],
        "evening": ["hábito 1", "hábito 2"]
      },
      "nutrition": {
        "calories": 2500,
        "protein": 150,
        "meals": ["Desayuno: ...", "Almuerzo: ...", "Cena: ...", "Snack: ..."]
      },
      "mindset": "Frase estoica motivacional del día (30-100 palabras)"
    }
    // ... días 2-7
  ]
}

REGLAS:
1. Días 1,3,5: entrenamientos principales
2. Días 2,4: entrenamientos complementarios o activos de recuperación
3. Días 6-7: uno puede ser descanso activo, otro entrenamiento moderado
4. Adapta intensidad al nivel (${profile.level})
5. Considera estrés/sueño si están disponibles
6. Progresión lógica durante la semana
7. Mindset: tono estoico pero empático, enfocado en disciplina y proceso
8. NO incluyas markdown, solo JSON válido

Responde SOLO con el JSON, sin texto adicional.`;
}

// ============================================================================
// Template-based Fallback
// ============================================================================

function generateTemplatePlan(
  profile: ProfileSummary,
  shareId: string
): SevenDayPlan {
  const exercises = EXERCISES_BY_ZONE[profile.focusZone] || EXERCISES_BY_ZONE.full;
  const duration = getWorkoutDuration(profile.weeklyTime);
  const intensity = INTENSITY_BY_LEVEL[profile.level];
  const nutrition = NUTRITION_BY_GOAL[profile.goal](70); // Default 70kg

  const days: DayPlan[] = [];

  for (let i = 1; i <= 7; i++) {
    const dayNum = i as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    const isRestDay = i === 7;
    const isLightDay = i === 4 || i === 6;

    // Select subset of exercises for variety
    const dayExercises = exercises
      .slice((i - 1) % exercises.length, ((i - 1) % exercises.length) + 5)
      .map((e) => ({
        ...e,
        sets: isLightDay ? Math.max(2, e.sets - 1) : e.sets,
      }));

    days.push({
      day: dayNum,
      workout: {
        focus: isRestDay
          ? "Recuperación activa"
          : isLightDay
            ? "Entrenamiento ligero"
            : `${profile.focusZone.toUpperCase()} - Día ${Math.ceil(i / 2)}`,
        exercises: isRestDay
          ? [
              { name: "Caminata", sets: 1, reps: "30 min", rest: "-" },
              { name: "Stretching", sets: 1, reps: "15 min", rest: "-" },
            ]
          : dayExercises,
        duration: isRestDay ? 45 : duration,
        intensity: isRestDay ? "low" : isLightDay ? "low" : intensity,
      },
      habits: BASE_HABITS,
      nutrition: {
        ...nutrition,
        calories: isRestDay ? Math.round(nutrition.calories * 0.85) : nutrition.calories,
      },
      mindset: MINDSET_NOTES[(i - 1) % MINDSET_NOTES.length],
    });
  }

  return {
    sessionId: shareId,
    profile,
    days,
    generatedAt: new Date(),
  };
}

// ============================================================================
// Main Generator Function
// ============================================================================

export async function generatePlan(
  shareId: string,
  profile: ProfileSummary,
  insightsText?: string
): Promise<PlanGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.PLAN_GENERATION_MODEL || "gemini-2.0-flash-lite";

  // If no API key, use template
  if (!apiKey) {
    console.warn("[PlanGenerator] No API key, using template");
    return {
      success: true,
      plan: generateTemplatePlan(profile, shareId),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const gemini = genAI.getGenerativeModel({ model });

    const prompt = buildPlanPrompt(profile, insightsText);

    const result = await gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const responseText = result.response.text();

    // Clean up response (remove markdown if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
    }

    // Parse and validate
    const parsed = JSON.parse(jsonText);
    const validation = SevenDayPlanSchema.safeParse(parsed);

    if (!validation.success) {
      console.warn("[PlanGenerator] AI output validation failed:", validation.error);
      return {
        success: true,
        plan: generateTemplatePlan(profile, shareId),
      };
    }

    return {
      success: true,
      plan: {
        sessionId: shareId,
        profile,
        days: validation.data.days,
        generatedAt: new Date(),
        insightsUsed: insightsText?.slice(0, 200),
      },
    };
  } catch (error) {
    console.error("[PlanGenerator] AI generation failed:", error);

    // Fallback to template
    return {
      success: true,
      plan: generateTemplatePlan(profile, shareId),
    };
  }
}
