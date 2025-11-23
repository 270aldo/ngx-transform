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

