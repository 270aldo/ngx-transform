import { z } from "zod";

export const OverlayPointZ = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().max(120),
});
export type OverlayPoint = z.infer<typeof OverlayPointZ>;

export const TimelineEntryZ = z.object({
  month: z.union([z.literal(0), z.literal(4), z.literal(8), z.literal(12)]),
  focus: z.string(),
  expectations: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
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
  }),
});
export type InsightsResult = z.infer<typeof InsightsResultZ>;

