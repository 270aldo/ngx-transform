import { z } from "zod";
import type { TransformMilestone } from "@/lib/seasonMilestones";

export const SEASON_REPORT_SCHEMA_VERSION = "season_vision_report.v1" as const;

export const ReportStatsSchema = z.object({
  strength: z.number().int().min(0).max(100),
  aesthetics: z.number().int().min(0).max(100),
  endurance: z.number().int().min(0).max(100),
  mental: z.number().int().min(0).max(100),
});

export const ReportProfileSchema = z
  .object({
    age: z.number().int().min(18).max(100).optional(),
    sex: z.enum(["male", "female", "other"]).optional(),
    heightCm: z.number().int().min(120).max(230).optional(),
    weightKg: z.number().min(35).max(250).optional(),
    level: z.enum(["novato", "intermedio", "avanzado"]).optional(),
    goal: z.enum(["definicion", "masa", "mixto"]).optional(),
    weeklyTime: z.number().min(1).max(20).optional(),
    focusZone: z.enum(["upper", "lower", "abs", "full"]).optional(),
    stressLevel: z.number().int().min(1).max(10).optional(),
    sleepQuality: z.number().int().min(1).max(10).optional(),
    disciplineRating: z.number().int().min(1).max(10).optional(),
  })
  .strict();

export const ReportMilestoneKeySchema = z.enum(["m0", "m4", "m8", "m12"]);
export type ReportMilestoneKey = z.infer<typeof ReportMilestoneKeySchema>;

export const ReportMilestoneSchema = z.object({
  key: ReportMilestoneKeySchema,
  label: z.string().min(1).max(40),
  subtitle: z.string().min(1).max(80),
  title: z.string().min(1).max(80),
  narrative: z.string().min(10).max(900),
  observation: z.string().min(10).max(700),
  mentalShift: z.string().min(10).max(500),
  stats: ReportStatsSchema,
  imageStoragePath: z.string().min(1).nullable(),
});

export const SeasonVisionReportSchema = z.object({
  schemaVersion: z.literal(SEASON_REPORT_SCHEMA_VERSION),
  shareId: z.string().min(1).max(140),
  generatedAt: z.string().datetime(),
  title: z.literal("Season Vision Report"),
  subject: z.literal("GENESIS"),
  summary: z.string().min(20).max(2000),
  disclaimer: z.string().min(20).max(800),
  baseline: z.object({
    label: z.literal("Punto de partida"),
    summary: z.string().min(10).max(900),
    muscleHealthScore: z.number().int().min(0).max(100).nullable(),
    bottleneck: z
      .object({
        key: z.string().min(1).max(80),
        label: z.string().min(1).max(120),
      })
      .nullable(),
    dominantObservation: z.string().min(10).max(700),
    profile: ReportProfileSchema.optional(),
    risks: z.array(z.string().min(1).max(240)).max(5),
    expectations: z.array(z.string().min(1).max(240)).max(5),
  }),
  timeline: z.tuple([
    ReportMilestoneSchema.extend({ key: z.literal("m0") }),
    ReportMilestoneSchema.extend({ key: z.literal("m4") }),
    ReportMilestoneSchema.extend({ key: z.literal("m8") }),
    ReportMilestoneSchema.extend({ key: z.literal("m12") }),
  ]),
  visualizations: z.tuple([
    ReportMilestoneSchema.extend({ key: z.literal("m4") }),
    ReportMilestoneSchema.extend({ key: z.literal("m8") }),
    ReportMilestoneSchema.extend({ key: z.literal("m12") }),
  ]),
  assets: z.object({
    originalStoragePath: z.string().min(1).nullable(),
    images: z.partialRecord(ReportMilestoneKeySchema, z.string().min(1)),
  }),
  actionPlan: z.object({
    primaryRecommendation: z.string().min(10).max(700),
    trainingLevers: z.array(z.string().min(4).max(240)).min(1).max(5),
    nextStep: z.string().min(10).max(240),
  }),
});

export type ReportStats = z.infer<typeof ReportStatsSchema>;
export type ReportProfile = z.infer<typeof ReportProfileSchema>;
export type ReportMilestone = z.infer<typeof ReportMilestoneSchema>;
export type SeasonVisionReport = z.infer<typeof SeasonVisionReportSchema>;
export type TransformReportAssetMap = Partial<Record<TransformMilestone, string>>;
