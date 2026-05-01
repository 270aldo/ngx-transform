/**
 * Schema Estricto de Análisis para NGX Transform v2.0
 *
 * Define la estructura exacta del output de Gemini para:
 * - Validación estricta con Zod
 * - Auto-repair de JSON malformado
 * - Generación de tipos TypeScript
 */

import { z } from "zod";

// ============================================================================
// Sub-Schemas
// ============================================================================

/**
 * Stats de cada milestone (0-100)
 */
export const StatsSchema = z.object({
  strength: z.number().int().min(0).max(100),
  aesthetics: z.number().int().min(0).max(100),
  endurance: z.number().int().min(0).max(100),
  mental: z.number().int().min(0).max(100),
});

/**
 * Punto de overlay para anotaciones en imagen
 */
export const OverlayPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().min(1).max(50),
  detail: z.string().max(200).optional(),
});

/**
 * Entrada de timeline (m0, m4, m8, m12)
 */
export const TimelineEntrySchema = z.object({
  month: z.union([z.literal(0), z.literal(4), z.literal(8), z.literal(12)]),
  title: z.string().min(1).max(30),
  description: z.string().min(10).max(500),
  stats: StatsSchema,
  image_prompt: z.string().min(50).max(2000),
  mental: z.string().min(10).max(300),
  // Solo para m0
  risks: z.array(z.string().max(200)).max(5).optional(),
  expectations: z.array(z.string().max(200)).max(5).optional(),
});

/**
 * Perfil resumido del usuario (extraído del análisis)
 */
export const ProfileSummarySchema = z.object({
  sex: z.enum(["male", "female", "other"]),
  age: z.number().int().min(13).max(100),
  goal: z.enum(["definicion", "masa", "mixto"]),
  bodyType: z.enum(["ectomorph", "mesomorph", "endomorph"]),
  focusZone: z.enum(["upper", "lower", "abs", "full"]),
});

/**
 * Perfil de estilo visual para generación de imágenes
 */
export const StyleProfileSchema = z.object({
  lighting: z.string().min(5).max(100),
  wardrobe: z.string().min(5).max(100),
  background: z.string().min(5).max(100),
  color_grade: z.string().min(5).max(100),
});

// ============================================================================
// Main Analysis Schema (v2.0)
// ============================================================================

/**
 * Schema completo del análisis v2.0
 * Incluye user_visual_anchor para Identity Chain
 */
export const AnalysisOutputSchema = z.object({
  /**
   * Descripción inmutable de los rasgos visuales del usuario
   * Usado para mantener consistencia en Identity Chain
   */
  user_visual_anchor: z
    .string()
    .min(50)
    .max(500)
    .describe("Descripción detallada e inmutable de rasgos faciales y corporales únicos"),

  /**
   * Resumen del perfil extraído
   */
  profile_summary: ProfileSummarySchema,

  /**
   * Resumen principal del análisis (backward compatible con v1)
   */
  insightsText: z.string().min(10).max(2000),

  /**
   * Timeline de transformación (4 etapas)
   */
  timeline: z.object({
    m0: TimelineEntrySchema,
    m4: TimelineEntrySchema,
    m8: TimelineEntrySchema,
    m12: TimelineEntrySchema,
  }),

  /**
   * Overlays/hotspots para cada etapa
   */
  overlays: z
    .object({
      m0: z.array(OverlayPointSchema).max(10).optional(),
      m4: z.array(OverlayPointSchema).max(10).optional(),
      m8: z.array(OverlayPointSchema).max(10).optional(),
      m12: z.array(OverlayPointSchema).max(10).optional(),
    })
    .optional(),

  /**
   * Carta del futuro yo (m12)
   * Máximo 100 palabras, tono estoico pero empático
   */
  letter_from_future: z
    .string()
    .min(50)
    .max(600)
    .describe("Carta motivacional del yo futuro (m12) al yo presente"),

  /**
   * Perfil de estilo visual para consistencia
   */
  style_profile: StyleProfileSchema,
});

// ============================================================================
// Type Exports
// ============================================================================

export type Stats = z.infer<typeof StatsSchema>;
export type OverlayPoint = z.infer<typeof OverlayPointSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type ProfileSummary = z.infer<typeof ProfileSummarySchema>;
export type StyleProfile = z.infer<typeof StyleProfileSchema>;
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

// ============================================================================
// Legacy Schema (backward compatible with current v1)
// ============================================================================

/**
 * Schema v1 (actual) para backward compatibility
 */
export const LegacyAnalysisSchema = z.object({
  insightsText: z.string(),
  timeline: z.object({
    m0: z.object({
      month: z.literal(0),
      title: z.string().optional(),
      description: z.string().optional(),
      focus: z.string().optional(),
      mental: z.string(),
      stats: StatsSchema.optional(),
      image_prompt: z.string().optional(),
      expectations: z.array(z.string()).default([]),
      risks: z.array(z.string()).default([]),
    }),
    m4: z.object({
      month: z.literal(4),
      title: z.string().optional(),
      description: z.string().optional(),
      focus: z.string().optional(),
      mental: z.string(),
      stats: StatsSchema.optional(),
      image_prompt: z.string().optional(),
      expectations: z.array(z.string()).default([]),
      risks: z.array(z.string()).default([]),
    }),
    m8: z.object({
      month: z.literal(8),
      title: z.string().optional(),
      description: z.string().optional(),
      focus: z.string().optional(),
      mental: z.string(),
      stats: StatsSchema.optional(),
      image_prompt: z.string().optional(),
      expectations: z.array(z.string()).default([]),
      risks: z.array(z.string()).default([]),
    }),
    m12: z.object({
      month: z.literal(12),
      title: z.string().optional(),
      description: z.string().optional(),
      focus: z.string().optional(),
      mental: z.string(),
      stats: StatsSchema.optional(),
      image_prompt: z.string().optional(),
      expectations: z.array(z.string()).default([]),
      risks: z.array(z.string()).default([]),
    }),
  }),
  overlays: z
    .object({
      m0: z.array(OverlayPointSchema).optional(),
      m4: z.array(OverlayPointSchema).optional(),
      m8: z.array(OverlayPointSchema).optional(),
      m12: z.array(OverlayPointSchema).optional(),
    })
    .catch({}),
});

export type LegacyAnalysis = z.infer<typeof LegacyAnalysisSchema>;

// ============================================================================
// Auto-Repair Utilities
// ============================================================================

/**
 * Intenta reparar JSON malformado de Gemini
 */
export function attemptJsonRepair(rawText: string): string {
  let text = rawText.trim();

  // Remover code fences si están presentes
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  }

  // Remover prefijos comunes de Gemini
  const prefixes = ["json\n", "JSON\n", "Here is the JSON:\n", "Response:\n"];
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      text = text.slice(prefix.length);
    }
  }

  // Intentar arreglar trailing commas (error común)
  text = text.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

  // Intentar arreglar comillas simples a dobles
  // Solo si no hay comillas dobles (para evitar romper strings válidos)
  if (!text.includes('"') && text.includes("'")) {
    text = text.replace(/'/g, '"');
  }

  return text.trim();
}

/**
 * Valida y opcionalmente repara el output de análisis desde texto JSON
 * Retorna el resultado validado o lanza error con detalles
 */
export function validateAnalysisOutputText(
  rawText: string,
  useV2Schema: boolean = false
): AnalysisOutput | LegacyAnalysis {
  // Paso 1: Intentar reparar JSON
  const repairedText = attemptJsonRepair(rawText);

  // Paso 2: Parsear JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(repairedText);
  } catch (parseError) {
    throw new Error(
      `JSON parse failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}\n` +
        `Raw text (first 500 chars): ${rawText.slice(0, 500)}`
    );
  }

  // Paso 3: Validar con schema apropiado
  const schema = useV2Schema ? AnalysisOutputSchema : LegacyAnalysisSchema;
  const result = schema.safeParse(parsed);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Schema validation failed:\n${errors}`);
  }

  return result.data;
}

/**
 * Valida un objeto ya parseado contra el schema v2
 * Retorna un resultado con success/data/errors
 */
export function validateAnalysisOutput(data: unknown): {
  success: boolean;
  data?: AnalysisOutput;
  errors?: Array<{ path: string; message: string }>;
} {
  const result = AnalysisOutputSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/**
 * Tipo flexible para migración (acepta tanto LegacyAnalysis como InsightsResult)
 */
type MigratableAnalysis = {
  insightsText: string;
  timeline: {
    m0: { title?: string; description?: string; focus?: string; mental: string; image_prompt?: string; stats?: Stats; risks?: string[]; expectations?: string[] };
    m4: { title?: string; description?: string; focus?: string; mental: string; image_prompt?: string; stats?: Stats };
    m8: { title?: string; description?: string; focus?: string; mental: string; image_prompt?: string; stats?: Stats };
    m12: { title?: string; description?: string; focus?: string; mental: string; image_prompt?: string; stats?: Stats };
  };
  overlays?: {
    m0?: Array<{ x: number; y: number; label: string; detail?: string }>;
    m4?: Array<{ x: number; y: number; label: string; detail?: string }>;
    m8?: Array<{ x: number; y: number; label: string; detail?: string }>;
    m12?: Array<{ x: number; y: number; label: string; detail?: string }>;
  };
};

/**
 * Migra un análisis v1 a v2 (para upgrade gradual)
 */
export function migrateV1toV2(
  v1: MigratableAnalysis | LegacyAnalysis,
  profile: {
    sex?: string;
    age?: string | number;
    goal?: string;
    bodyType?: string;
    focusZone?: string;
  }
): AnalysisOutput {
  // Normalizar profile con valores por defecto
  const normalizedProfile = {
    sex: (profile.sex === "male" || profile.sex === "female" ? profile.sex : "other") as "male" | "female" | "other",
    age: typeof profile.age === "number" ? profile.age : parseInt(String(profile.age)) || 25,
    goal: (profile.goal === "definicion" || profile.goal === "masa" ? profile.goal : "mixto") as "definicion" | "masa" | "mixto",
    bodyType: (profile.bodyType === "ectomorph" || profile.bodyType === "endomorph" ? profile.bodyType : "mesomorph") as "ectomorph" | "mesomorph" | "endomorph",
    focusZone: (profile.focusZone === "upper" || profile.focusZone === "lower" || profile.focusZone === "abs" ? profile.focusZone : "full") as "upper" | "lower" | "abs" | "full",
  };
  return {
    user_visual_anchor: v1.insightsText.slice(0, 500), // Usar insights como anchor temporal
    insightsText: v1.insightsText, // Mantener para backward compatibility
    profile_summary: {
      sex: normalizedProfile.sex,
      age: normalizedProfile.age,
      goal: normalizedProfile.goal,
      bodyType: normalizedProfile.bodyType,
      focusZone: normalizedProfile.focusZone,
    },
    timeline: {
      m0: {
        month: 0,
        title: v1.timeline.m0.title || "GENESIS",
        description: v1.timeline.m0.description || v1.timeline.m0.focus || "",
        stats: v1.timeline.m0.stats || { strength: 30, aesthetics: 30, endurance: 30, mental: 30 },
        image_prompt: v1.timeline.m0.image_prompt || "",
        mental: v1.timeline.m0.mental,
        risks: v1.timeline.m0.risks,
        expectations: v1.timeline.m0.expectations,
      },
      m4: {
        month: 4,
        title: v1.timeline.m4.title || "FOUNDATION",
        description: v1.timeline.m4.description || v1.timeline.m4.focus || "",
        stats: v1.timeline.m4.stats || { strength: 45, aesthetics: 45, endurance: 45, mental: 50 },
        image_prompt: v1.timeline.m4.image_prompt || "",
        mental: v1.timeline.m4.mental,
      },
      m8: {
        month: 8,
        title: v1.timeline.m8.title || "TRANSFORMATION",
        description: v1.timeline.m8.description || v1.timeline.m8.focus || "",
        stats: v1.timeline.m8.stats || { strength: 65, aesthetics: 65, endurance: 65, mental: 70 },
        image_prompt: v1.timeline.m8.image_prompt || "",
        mental: v1.timeline.m8.mental,
      },
      m12: {
        month: 12,
        title: v1.timeline.m12.title || "PEAK FORM",
        description: v1.timeline.m12.description || v1.timeline.m12.focus || "",
        stats: v1.timeline.m12.stats || { strength: 85, aesthetics: 85, endurance: 85, mental: 90 },
        image_prompt: v1.timeline.m12.image_prompt || "",
        mental: v1.timeline.m12.mental,
      },
    },
    overlays: v1.overlays,
    letter_from_future:
      "Estás leyendo esto porque lo lograste. Cada gota de sudor, cada momento de duda superado, te trajo aquí. No fue fácil, pero lo que vale la pena nunca lo es.",
    style_profile: {
      lighting: "Cinematic dramatic lighting with volumetric rays",
      wardrobe: "Premium athletic wear or shirtless",
      background: "Professional studio or gritty gym environment",
      color_grade: "High contrast, slightly desaturated with accent highlights",
    },
  };
}
