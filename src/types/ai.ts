import { z } from "zod";

export const OverlayPointZ = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().max(120),
});
export type OverlayPoint = z.infer<typeof OverlayPointZ>;

export const TimelineEntryZ = z.object({
  month: z.union([z.literal(0), z.literal(4), z.literal(8), z.literal(12)]),
  title: z.string().optional(), // New
  description: z.string().optional(), // New
  focus: z.string().optional(), // Made optional as we might use description/title instead
  mental: z.string(),
  stats: z.object({
    strength: z.number().min(0).max(100),
    aesthetics: z.number().min(0).max(100),
    endurance: z.number().min(0).max(100),
    mental: z.number().min(0).max(100),
  }).optional(), // New
  image_prompt: z.string().optional(), // New
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

