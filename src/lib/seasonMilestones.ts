export type TransformMilestone = "m0" | "m4" | "m8" | "m12";

export interface SeasonMilestoneCopy {
  label: string;
  subtitle: string;
  shareLabel: string;
}

export const SEASON_MILESTONE_COPY: Record<TransformMilestone, SeasonMilestoneCopy> = {
  m0: {
    label: "Punto de partida",
    subtitle: "Tu baseline inicial",
    shareLabel: "Punto de partida",
  },
  m4: {
    label: "Season 1",
    subtitle: "Primera visualización",
    shareLabel: "Season 1",
  },
  m8: {
    label: "Season 2",
    subtitle: "Progreso consolidado",
    shareLabel: "Season 2",
  },
  m12: {
    label: "Season 3",
    subtitle: "Visión completa",
    shareLabel: "Season 3",
  },
};

export const SEASON_TIMELINE_STEPS = ["m0", "m4", "m8", "m12"] as const;

export function getSeasonMilestoneCopy(step: TransformMilestone): SeasonMilestoneCopy {
  return SEASON_MILESTONE_COPY[step];
}

export function getSeasonMilestoneLabel(step: TransformMilestone): string {
  return getSeasonMilestoneCopy(step).label;
}

