import { z } from "zod";

// Re-export new v2.0 schemas for convenience
export {
  AnalysisOutputSchema,
  LegacyAnalysisSchema,
  StatsSchema,
  OverlayPointSchema,
  TimelineEntrySchema,
  ProfileSummarySchema,
  StyleProfileSchema,
  type AnalysisOutput,
  type LegacyAnalysis,
  type Stats,
  type ProfileSummary,
  type StyleProfile,
  validateAnalysisOutput,
  validateAnalysisOutputText,
  attemptJsonRepair,
  migrateV1toV2,
} from "@/lib/schemas/analysis";

// ============================================================================
// Legacy Types (v1) - Kept for backward compatibility
// ============================================================================

export const OverlayPointZ = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().max(120),
});
export type OverlayPoint = z.infer<typeof OverlayPointZ>;

export const TimelineEntryZ = z.object({
  month: z.union([z.literal(0), z.literal(4), z.literal(8), z.literal(12)]),
  title: z.string().optional(),
  description: z.string().optional(),
  focus: z.string().optional(),
  mental: z.string(),
  stats: z.object({
    strength: z.number().min(0).max(100),
    aesthetics: z.number().min(0).max(100),
    endurance: z.number().min(0).max(100),
    mental: z.number().min(0).max(100),
  }).optional(),
  image_prompt: z.string().optional(),
  expectations: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
});
export type TimelineEntry = z.infer<typeof TimelineEntryZ>;

export const InsightsResultZ = z.object({
  insightsText: z.string(),
  timeline: z.object({
    m0: TimelineEntryZ,
    m4: TimelineEntryZ,
    m8: TimelineEntryZ,
    m12: TimelineEntryZ,
  }),
  overlays: z.object({
    m0: z.array(OverlayPointZ).optional(),
    m4: z.array(OverlayPointZ).optional(),
    m8: z.array(OverlayPointZ).optional(),
    m12: z.array(OverlayPointZ).optional(),
  }).catch({}),
});
export type InsightsResult = z.infer<typeof InsightsResultZ>;

// ============================================================================
// Session Status Types
// ============================================================================

export type SessionStatus =
  | "pending"
  | "processing"
  | "analyzed"
  | "generating"
  | "ready"
  | "failed"
  | "partial";

export interface SessionDocument {
  shareId: string;
  email?: string | null;
  input: {
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    level: "novato" | "intermedio" | "avanzado";
    goal: "definicion" | "masa" | "mixto";
    weeklyTime: number;
    stressLevel?: number;
    sleepQuality?: number;
    disciplineRating?: number;
    bodyType?: "ectomorph" | "mesomorph" | "endomorph";
    focusZone?: "upper" | "lower" | "abs" | "full";
    notes?: string;
  };
  photo: {
    originalStoragePath: string;
  };
  ai?: InsightsResult | null;
  assets?: {
    images?: Record<string, string>;
  };
  status: SessionStatus;
  deleteToken?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  analyzedAt?: FirebaseFirestore.Timestamp;
  generatedAt?: FirebaseFirestore.Timestamp;
}

