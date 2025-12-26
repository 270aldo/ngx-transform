import { z } from "zod";

// ============================================================================
// Lead Capture
// ============================================================================

export const LeadSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  consent: z.boolean().default(true),
});

// ============================================================================
// Profile Schema
// ============================================================================

export const ProfileSchema = z.object({
  age: z.number().int().min(13).max(100),
  sex: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  level: z.enum(["novato", "intermedio", "avanzado"]),
  goal: z.enum(["definicion", "masa", "mixto"]),
  weeklyTime: z.number().min(1).max(14),
  trainingDaysPerWeek: z.number().min(1).max(7).default(3).optional(),
  trainingHistoryYears: z.number().min(0).max(30).default(0).optional(),
  nutritionQuality: z.number().min(1).max(10).default(6).optional(),
  bodyFatLevel: z.enum(["bajo", "medio", "alto"]).default("medio").optional(),
  trainingStyle: z.enum(["fuerza", "hipertrofia", "funcional", "hiit", "mixto"]).default("mixto").optional(),
  aestheticPreference: z.enum(["cinematic", "editorial", "street", "minimal"]).default("cinematic").optional(),
  // Mental Logs
  stressLevel: z.number().min(1).max(10).default(5).optional(),
  sleepQuality: z.number().min(1).max(10).default(5).optional(),
  disciplineRating: z.number().min(1).max(10).default(5).optional(),
  // Visual Selectors
  bodyType: z.enum(["ectomorph", "mesomorph", "endomorph"]).default("mesomorph").optional(),
  specificGoals: z.array(z.string()).default([]).optional(),
  focusZone: z.enum(["upper", "lower", "abs", "full"]).default("full").optional(),
  focusAreas: z.array(
    z.enum(["pecho", "espalda", "hombros", "brazos", "gluteos", "piernas", "core"])
  ).default([]).optional(),
  notes: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ============================================================================
// Session Management
// ============================================================================

export const CreateSessionSchema = z.object({
  email: z.string().email().optional(),
  input: ProfileSchema,
  photoPath: z.string(),
});

export const AnalyzeSchema = z.object({
  sessionId: z.string().min(1),
});

export const GenerateImagesSchema = z.object({
  sessionId: z.string().min(1),
  steps: z.array(z.enum(["m4", "m8", "m12"]))
    .default(["m4", "m8", "m12"]).optional(),
});

// ============================================================================
// Delete Token (PR-0: Security)
// ============================================================================

export const DeleteSessionSchema = z.object({
  sessionId: z.string().min(1),
  deleteToken: z.string().min(20).max(64),
});

export const DeleteRequestSchema = z.object({
  shareId: z.string().min(1),
  deleteToken: z.string().min(20).max(64),
  reason: z.string().max(500).optional(),
});

// ============================================================================
// Telemetry Events
// ============================================================================

export const TelemetryEventSchema = z.object({
  sessionId: z.string().min(1),
  event: z.enum([
    "wizard_start",
    "photo_uploaded",
    "session_created",
    "analysis_started",
    "analysis_completed",
    "analysis_failed",
    "analysis_retry",
    "image_generation_started",
    "image_m4_ready",
    "image_m8_ready",
    "image_m12_ready",
    "image_generation_failed",
    "image_generation_retry",
    "results_viewed",
    "share_clicked",
    "share_completed",
    "cta_clicked",
    "cta_completed",
    "plan_generated",
    "email_sent",
    // Viral Optimization Sprint v2.1
    "reveal_start",
    "reveal_complete",
    "reveal_skip",
    "share_modal_open",
    "share_intent_whatsapp",
    "share_intent_instagram",
    "share_intent_twitter",
    "share_intent_facebook",
    "share_intent_copy",
    "content_unlocked",
    "counter_viewed",
    "email_sequence_start",
    "email_D0_sent",
    "email_D1_sent",
    "email_D3_sent",
    "email_D7_sent",
    "agent_cta_viewed",
    "agent_cta_clicked",
    "referral_code_copied",
  ]),
  stage: z.string().optional(),
  model_id: z.string().optional(),
  latency_ms: z.number().optional(),
  retry_count: z.number().optional(),
  cost_estimate: z.number().optional(),
  error_message: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// Rate Limiting
// ============================================================================

export const RateLimitConfigSchema = z.object({
  maxSessionsPerIpPerDay: z.number().int().min(1).max(100).default(3),
  maxSessionsPerEmailPerDay: z.number().int().min(1).max(50).default(2),
  maxAnalysisRetries: z.number().int().min(1).max(10).default(3),
  maxImageGenerationRetries: z.number().int().min(1).max(5).default(2),
});

// ============================================================================
// Feature Flags Schema
// ============================================================================

export const FeatureFlagsSchema = z.object({
  FF_TELEMETRY_ENABLED: z.boolean().default(true),
  FF_DELETE_TOKEN_REQUIRED: z.boolean().default(true),
  FF_NB_PRO: z.boolean().default(false),
  FF_IDENTITY_CHAIN: z.boolean().default(true),
  FF_QUALITY_GATES: z.boolean().default(true),
  FF_CINEMATIC_AUTOPLAY: z.boolean().default(true),
  FF_COMPARE_SLIDER: z.boolean().default(true),
  FF_LETTER_FROM_FUTURE: z.boolean().default(true),
  FF_OG_SPLIT_SCREEN: z.boolean().default(true),
  FF_SHARE_TO_UNLOCK: z.boolean().default(true),
  FF_REFERRAL_TRACKING: z.boolean().default(true),
  FF_PLAN_7_DIAS: z.boolean().default(true),
  FF_EMAIL_SEQUENCE: z.boolean().default(true),
  // Viral Optimization Sprint v2.1
  FF_DRAMATIC_REVEAL: z.boolean().default(true),
  FF_SOCIAL_COUNTER: z.boolean().default(true),
  FF_AGENT_BRIDGE_CTA: z.boolean().default(true),
});

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

// ============================================================================
// Utility: Parse feature flags from env
// ============================================================================

export function getFeatureFlags(): FeatureFlags {
  return FeatureFlagsSchema.parse({
    FF_TELEMETRY_ENABLED: process.env.FF_TELEMETRY_ENABLED !== "false",
    FF_DELETE_TOKEN_REQUIRED: process.env.FF_DELETE_TOKEN_REQUIRED !== "false",
    FF_NB_PRO: process.env.FF_NB_PRO === "true",
    FF_IDENTITY_CHAIN: process.env.FF_IDENTITY_CHAIN !== "false",
    FF_QUALITY_GATES: process.env.FF_QUALITY_GATES !== "false",
    FF_CINEMATIC_AUTOPLAY: process.env.FF_CINEMATIC_AUTOPLAY !== "false",
    FF_COMPARE_SLIDER: process.env.FF_COMPARE_SLIDER !== "false",
    FF_LETTER_FROM_FUTURE: process.env.FF_LETTER_FROM_FUTURE !== "false",
    FF_OG_SPLIT_SCREEN: process.env.FF_OG_SPLIT_SCREEN !== "false",
    FF_SHARE_TO_UNLOCK: process.env.FF_SHARE_TO_UNLOCK !== "false",
    FF_REFERRAL_TRACKING: process.env.FF_REFERRAL_TRACKING !== "false",
    FF_PLAN_7_DIAS: process.env.FF_PLAN_7_DIAS !== "false",
    FF_EMAIL_SEQUENCE: process.env.FF_EMAIL_SEQUENCE !== "false",
    // Viral Optimization Sprint v2.1
    FF_DRAMATIC_REVEAL: process.env.FF_DRAMATIC_REVEAL !== "false",
    FF_SOCIAL_COUNTER: process.env.FF_SOCIAL_COUNTER !== "false",
    FF_AGENT_BRIDGE_CTA: process.env.FF_AGENT_BRIDGE_CTA !== "false",
  });
}
