/**
 * PR-4: Plan Templates
 *
 * Base templates for workout plans based on goal and focus zone
 */

import type { Exercise, DayWorkout, DayHabits, DayNutrition } from "./planTypes";

// ============================================================================
// Exercise Templates by Focus Zone
// ============================================================================

export const EXERCISES_BY_ZONE: Record<string, Exercise[]> = {
  upper: [
    { name: "Press de banca", sets: 4, reps: "8-12", rest: "90s" },
    { name: "Remo con barra", sets: 4, reps: "8-12", rest: "90s" },
    { name: "Press militar", sets: 3, reps: "10-12", rest: "60s" },
    { name: "Dominadas", sets: 3, reps: "Al fallo", rest: "90s" },
    { name: "Curl de bíceps", sets: 3, reps: "10-15", rest: "45s" },
    { name: "Extensión de tríceps", sets: 3, reps: "10-15", rest: "45s" },
    { name: "Elevaciones laterales", sets: 3, reps: "12-15", rest: "45s" },
    { name: "Face pulls", sets: 3, reps: "15-20", rest: "45s" },
  ],
  lower: [
    { name: "Sentadilla", sets: 4, reps: "8-12", rest: "120s" },
    { name: "Peso muerto rumano", sets: 4, reps: "8-12", rest: "90s" },
    { name: "Prensa de piernas", sets: 3, reps: "10-15", rest: "90s" },
    { name: "Zancadas", sets: 3, reps: "10 por pierna", rest: "60s" },
    { name: "Curl femoral", sets: 3, reps: "10-15", rest: "60s" },
    { name: "Extensión de cuádriceps", sets: 3, reps: "10-15", rest: "60s" },
    { name: "Elevación de gemelos", sets: 4, reps: "15-20", rest: "45s" },
    { name: "Hip thrust", sets: 3, reps: "10-15", rest: "90s" },
  ],
  abs: [
    { name: "Plancha", sets: 3, reps: "45-60 seg", rest: "45s" },
    { name: "Crunch en polea", sets: 3, reps: "15-20", rest: "45s" },
    { name: "Elevación de piernas", sets: 3, reps: "12-15", rest: "45s" },
    { name: "Russian twist", sets: 3, reps: "20 total", rest: "45s" },
    { name: "Ab wheel rollout", sets: 3, reps: "10-12", rest: "60s" },
    { name: "Mountain climbers", sets: 3, reps: "30 seg", rest: "30s" },
    { name: "Dead bug", sets: 3, reps: "10 por lado", rest: "45s" },
    { name: "Plancha lateral", sets: 3, reps: "30 seg por lado", rest: "45s" },
  ],
  full: [
    { name: "Sentadilla", sets: 4, reps: "8-12", rest: "90s" },
    { name: "Press de banca", sets: 4, reps: "8-12", rest: "90s" },
    { name: "Peso muerto", sets: 4, reps: "6-8", rest: "120s" },
    { name: "Remo con barra", sets: 3, reps: "8-12", rest: "90s" },
    { name: "Press militar", sets: 3, reps: "10-12", rest: "60s" },
    { name: "Plancha", sets: 3, reps: "45 seg", rest: "45s" },
    { name: "Curl de bíceps", sets: 3, reps: "10-15", rest: "45s" },
    { name: "Extensión de tríceps", sets: 3, reps: "10-15", rest: "45s" },
  ],
};

// ============================================================================
// Habit Templates
// ============================================================================

export const BASE_HABITS: DayHabits = {
  morning: [
    "Despertar a la misma hora",
    "Hidratación: 500ml de agua al despertar",
    "5 minutos de movilidad articular",
    "Revisar objetivos del día",
  ],
  evening: [
    "Preparar ropa y comida para mañana",
    "Desconectar pantallas 1 hora antes de dormir",
    "10 minutos de stretching suave",
    "Reflexión: 3 cosas bien hechas hoy",
  ],
};

// ============================================================================
// Nutrition Templates by Goal
// ============================================================================

export const NUTRITION_BY_GOAL: Record<string, (weight: number) => DayNutrition> = {
  definicion: (weight: number) => ({
    calories: Math.round(weight * 26), // Déficit
    protein: Math.round(weight * 2.2),
    meals: [
      "Desayuno: Huevos + avena + fruta",
      "Almuerzo: Pollo + arroz integral + verduras",
      "Cena: Pescado + ensalada grande",
      "Snack: Yogur griego + frutos secos",
    ],
  }),
  masa: (weight: number) => ({
    calories: Math.round(weight * 35), // Superávit
    protein: Math.round(weight * 2.0),
    meals: [
      "Desayuno: Tortilla 4 huevos + avena + plátano",
      "Almuerzo: Carne + pasta + verduras + aceite oliva",
      "Cena: Salmón + patata + ensalada",
      "Snack AM: Batido proteína + mantequilla cacahuete",
      "Snack PM: Arroz + pollo (meal prep)",
    ],
  }),
  mixto: (weight: number) => ({
    calories: Math.round(weight * 30), // Mantenimiento
    protein: Math.round(weight * 2.0),
    meals: [
      "Desayuno: Huevos + tostadas integrales + aguacate",
      "Almuerzo: Proteína + carbohidrato complejo + verduras",
      "Cena: Proteína magra + ensalada + grasas saludables",
      "Snack: Yogur + fruta o frutos secos",
    ],
  }),
};

// ============================================================================
// Mindset Templates (Stoic Notes)
// ============================================================================

export const MINDSET_NOTES: string[] = [
  "El dolor de la disciplina es temporal. El dolor del arrepentimiento es permanente. Elige tu dificultad.",
  "No controlas los resultados, pero controlas el esfuerzo. Enfócate en el proceso.",
  "El cuerpo logra lo que la mente cree. Fortalece tu mente primero.",
  "Cada repetición es un voto por la persona que quieres ser. Haz que cada voto cuente.",
  "El obstáculo es el camino. Las dificultades que enfrentas hoy te fortalecen para mañana.",
  "No esperes motivación. Actúa primero; la motivación seguirá.",
  "La consistencia supera a la intensidad. Pequeñas mejoras diarias crean transformaciones épicas.",
];

// ============================================================================
// Intensity by Level
// ============================================================================

export const INTENSITY_BY_LEVEL: Record<string, "low" | "medium" | "high"> = {
  novato: "low",
  intermedio: "medium",
  avanzado: "high",
};

// ============================================================================
// Duration by Weekly Time
// ============================================================================

export function getWorkoutDuration(weeklyHours: number): number {
  // 4-6 workouts per week, so divide weekly hours
  const workoutsPerWeek = Math.min(6, Math.max(4, Math.round(weeklyHours / 1.5)));
  return Math.round((weeklyHours * 60) / workoutsPerWeek);
}
