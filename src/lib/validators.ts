import { z } from "zod";

export const LeadSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  consent: z.boolean().default(true),
});

export const ProfileSchema = z.object({
  age: z.number().int().min(13).max(100),
  sex: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  level: z.enum(["novato", "intermedio", "avanzado"]),
  goal: z.enum(["definicion", "masa", "mixto"]),
  weeklyTime: z.number().min(1).max(14),
  // Mental Logs
  stressLevel: z.number().min(1).max(10).default(5).optional(),
  sleepQuality: z.number().min(1).max(10).default(5).optional(),
  disciplineRating: z.number().min(1).max(10).default(5).optional(),
  // Visual Selectors
  bodyType: z.enum(["ectomorph", "mesomorph", "endomorph"]).default("mesomorph").optional(),
  specificGoals: z.array(z.string()).default([]).optional(),
  visualTimeline: z.string().optional(), // Deprecated, keeping for compatibility or removing? User said remove.
  focusZone: z.enum(["upper", "lower", "abs", "full"]).default("full").optional(), // New replacement
  notes: z.string().optional(),
});

export const CreateSessionSchema = z.object({
  email: z.string().email().optional(),
  input: ProfileSchema,
  photoPath: z.string(),
});

export const AnalyzeSchema = z.object({
  sessionId: z.string(),
});

export const GenerateImagesSchema = z.object({
  sessionId: z.string(),
  steps: z.array(z.enum(["m4", "m8", "m12"]))
    .default(["m4", "m8", "m12"]).optional(),
});

