import { z } from "zod";
import type { ProfileInput } from "@/types/ai";

export const stepKeySchema = z.enum(["m0", "m4", "m8", "m12"]);

export const overlayPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().min(1),
});

export const timelineEntrySchema = z.object({
  month: z.number().int(),
  focus: z.string().optional(),
  expectations: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
});

export const insightsResultSchema = z.object({
  insightsText: z.string().optional(),
  timeline: z.object({
    m0: timelineEntrySchema,
    m4: timelineEntrySchema,
    m8: timelineEntrySchema,
    m12: timelineEntrySchema,
  }),
  overlays: z
    .object({
      m0: z.array(overlayPointSchema).optional(),
      m4: z.array(overlayPointSchema).optional(),
      m8: z.array(overlayPointSchema).optional(),
      m12: z.array(overlayPointSchema).optional(),
    })
    .partial()
    .optional(),
});

export const profileSchema: z.ZodType<ProfileInput> = z.object({
  age: z.number().int().min(13).max(100),
  sex: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  level: z.enum(["novato", "intermedio", "avanzado"]),
  goal: z.enum(["definicion", "masa", "mixto"]),
  weeklyTime: z.number().min(1).max(40),
  notes: z.string().optional(),
});

export const leadSchema = z.object({
  email: z.string().email(),
  consent: z.boolean().optional(),
  source: z.string().optional(),
});

export const createSessionSchema = z.object({
  email: z.string().email(),
  input: profileSchema,
  photoPath: z.string().min(3),
});

export const analyzeRequestSchema = z.object({
  sessionId: z.string().min(6),
});

export const generateImagesSchema = z.object({
  sessionId: z.string().min(6),
});

export const emailRequestSchema = z.object({
  to: z.string().email(),
  shareId: z.string().min(6),
});
