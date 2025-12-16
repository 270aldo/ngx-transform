/**
 * PR-4: Plan Types
 *
 * Type definitions for the 7-day AI-generated fitness plan
 */

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g., "8-12" or "30 seg"
  rest: string; // e.g., "60s"
  notes?: string;
}

export interface DayWorkout {
  focus: string;
  exercises: Exercise[];
  duration: number; // minutes
  intensity: "low" | "medium" | "high";
}

export interface DayHabits {
  morning: string[];
  evening: string[];
}

export interface DayNutrition {
  calories: number;
  protein: number; // grams
  meals: string[];
}

export interface DayPlan {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  workout: DayWorkout;
  habits: DayHabits;
  nutrition: DayNutrition;
  mindset: string; // Stoic note of the day
}

export interface ProfileSummary {
  sex: "male" | "female" | "other";
  age: number;
  goal: "definicion" | "masa" | "mixto";
  bodyType: "ectomorph" | "mesomorph" | "endomorph";
  focusZone: "upper" | "lower" | "abs" | "full";
  level: "novato" | "intermedio" | "avanzado";
  weeklyTime: number; // hours
  stressLevel?: number;
  sleepQuality?: number;
  disciplineRating?: number;
}

export interface SevenDayPlan {
  sessionId: string;
  profile: ProfileSummary;
  days: DayPlan[];
  generatedAt: Date;
  insightsUsed?: string; // Reference to the analysis used
}

export interface PlanGenerationRequest {
  shareId: string;
  profile: ProfileSummary;
  insightsText?: string;
}

export interface PlanGenerationResult {
  success: boolean;
  plan?: SevenDayPlan;
  error?: string;
}
