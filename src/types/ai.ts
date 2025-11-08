export type StepKey = "m0" | "m4" | "m8" | "m12";

export interface OverlayPoint {
  x: number;
  y: number;
  label: string;
}

export interface TimelineEntry {
  month: number;
  focus?: string;
  expectations?: string[];
  risks?: string[];
}

export interface InsightsResult {
  insightsText?: string;
  timeline: Record<StepKey, TimelineEntry>;
  overlays?: Partial<Record<StepKey, OverlayPoint[]>>;
}

export interface ProfileInput {
  age: number;
  sex: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  level: "novato" | "intermedio" | "avanzado";
  goal: "definicion" | "masa" | "mixto";
  weeklyTime: number;
  notes?: string;
}
