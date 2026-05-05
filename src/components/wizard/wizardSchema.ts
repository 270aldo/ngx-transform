import { z } from "zod";

export const OptionalEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email("Ingresa un correo valido").optional());

export const WizardFormSchema = z.object({
  email: OptionalEmailSchema,
  // Stage 2: Biometrics
  age: z.coerce.number().int().min(18).max(100),
  sex: z.enum(["male", "female", "other"]),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  bodyType: z.enum(["ectomorph", "mesomorph", "endomorph"]).default("mesomorph"),
  bodyFatLevel: z.enum(["bajo", "medio", "alto"]).default("medio"),

  // Stage 3: Strategy
  level: z.enum(["novato", "intermedio", "avanzado"]),
  goal: z.enum(["definicion", "masa", "mixto"]),
  focusZone: z.enum(["upper", "lower", "abs", "full"]).default("full"),
  weeklyTime: z.coerce.number().min(1).max(14),

  // Stage 4: Mental
  disciplineRating: z.coerce.number().min(1).max(10).default(5),
  stressLevel: z.coerce.number().min(1).max(10).default(5),
  sleepQuality: z.coerce.number().min(1).max(10).default(5),

  // Extras (Hidden/Defaults)
  trainingDaysPerWeek: z.coerce.number().min(1).max(7).default(3),
  trainingHistoryYears: z.coerce.number().min(0).max(30).default(0),
  nutritionQuality: z.coerce.number().min(1).max(10).default(6),
  trainingStyle: z.enum(["fuerza", "hipertrofia", "funcional", "hiit", "mixto"]).default("mixto"),
  aestheticPreference: z.enum(["cinematic", "editorial", "street", "minimal"]).default("cinematic"),
  specificGoals: z.array(z.string()).default([]),
  focusAreas: z.array(z.string()).default([]),
  notes: z.string().optional(),
  photo: z.custom<FileList>().optional(),
});

export type WizardFormValues = z.infer<typeof WizardFormSchema>;
