import {
  getSeasonMilestoneCopy,
  SEASON_TIMELINE_STEPS,
  type TransformMilestone,
} from "@/lib/seasonMilestones";
import {
  SEASON_REPORT_SCHEMA_VERSION,
  SeasonVisionReportSchema,
  type ReportProfile,
  type ReportStats,
  type SeasonVisionReport,
  type TransformReportAssetMap,
} from "@/lib/report/reportSchema";
import type { Bottleneck, Diagnostic, TimelineEntry } from "@/types/ai";

type TimelineMap = Partial<Record<TransformMilestone, TimelineEntry>>;

export interface SeasonReportAnalysisInput {
  insightsText?: string;
  timeline?: TimelineMap;
  diagnostic?: Diagnostic;
}

export interface BuildSeasonVisionReportParams {
  shareId: string;
  ai: SeasonReportAnalysisInput;
  input?: ReportProfile;
  assets?: {
    originalStoragePath?: string | null;
    images?: TransformReportAssetMap;
  };
  generatedAt?: Date;
}

const BOTTLENECK_LABELS: Record<Bottleneck, string> = {
  training_progression: "Progresion de entrenamiento",
  nutrition_consistency: "Consistencia nutricional",
  recovery: "Recuperacion y sueno",
  structure: "Estructura semanal",
  expectations: "Expectativas y paciencia",
  accountability: "Accountability",
};

const DEFAULT_STATS_BY_STEP: Record<TransformMilestone, ReportStats> = {
  m0: { strength: 42, aesthetics: 40, endurance: 38, mental: 45 },
  m4: { strength: 56, aesthetics: 54, endurance: 52, mental: 58 },
  m8: { strength: 70, aesthetics: 68, endurance: 66, mental: 72 },
  m12: { strength: 84, aesthetics: 82, endurance: 80, mental: 86 },
};

const STAT_LABELS: Record<keyof ReportStats, string> = {
  strength: "fuerza",
  aesthetics: "composicion",
  endurance: "resistencia",
  mental: "consistencia mental",
};

const DEFAULT_DISCLAIMER =
  "Este reporte es una visualizacion aspiracional basada en la informacion compartida y en modelos predictivos. No sustituye evaluacion medica, diagnostico clinico ni supervision profesional individual.";

function normalizeText(value: unknown, fallback: string, maxLength = 900): string {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (!text) return fallback;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}.`;
}

function clampStat(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeStats(step: TransformMilestone, stats?: TimelineEntry["stats"]): ReportStats {
  const fallback = DEFAULT_STATS_BY_STEP[step];
  return {
    strength: clampStat(stats?.strength, fallback.strength),
    aesthetics: clampStat(stats?.aesthetics, fallback.aesthetics),
    endurance: clampStat(stats?.endurance, fallback.endurance),
    mental: clampStat(stats?.mental, fallback.mental),
  };
}

function strongestStat(stats: ReportStats): keyof ReportStats {
  return (Object.keys(stats) as Array<keyof ReportStats>).reduce((best, key) =>
    stats[key] > stats[best] ? key : best
  );
}

function buildMilestone(
  step: TransformMilestone,
  entry: TimelineEntry,
  imageStoragePath: string | null
) {
  const copy = getSeasonMilestoneCopy(step);
  const stats = normalizeStats(step, entry.stats);
  const leadingStat = strongestStat(stats);
  const fallbackTitle = step === "m0" ? "Baseline inicial" : copy.label;
  const narrative = normalizeText(
    entry.description ?? entry.focus,
    `${copy.label} describe el estado esperado de tu direccion fisica dentro del Season Vision Report.`
  );
  const mentalShift = normalizeText(
    entry.mental,
    "GENESIS prioriza consistencia, recuperacion y progresion medible antes que cambios extremos."
  );

  return {
    key: step,
    label: copy.label,
    subtitle: copy.subtitle,
    title: normalizeText(entry.title, fallbackTitle, 80),
    narrative,
    observation: normalizeText(
      `${copy.label}: GENESIS observa mayor peso relativo en ${STAT_LABELS[leadingStat]} (${stats[leadingStat]}/100). ${mentalShift}`,
      `${copy.label}: GENESIS observa una progresion medible y dependiente de adherencia.`,
      700
    ),
    mentalShift,
    stats,
    imageStoragePath,
  };
}

function requireTimeline(ai: SeasonReportAnalysisInput): Required<TimelineMap> {
  const timeline = ai.timeline;
  if (!timeline?.m0 || !timeline.m4 || !timeline.m8 || !timeline.m12) {
    throw new Error("REPORT_AI_INCOMPLETE");
  }
  return timeline as Required<TimelineMap>;
}

function normalizeProfile(input?: ReportProfile): ReportProfile | undefined {
  if (!input) return undefined;
  const parsed = {
    age: input.age,
    sex: input.sex,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    level: input.level,
    goal: input.goal,
    weeklyTime: input.weeklyTime,
    focusZone: input.focusZone,
    stressLevel: input.stressLevel,
    sleepQuality: input.sleepQuality,
    disciplineRating: input.disciplineRating,
  };
  const clean = Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => value !== undefined && value !== null)
  ) as ReportProfile;
  return Object.keys(clean).length ? clean : undefined;
}

function buildTrainingLevers(diagnostic?: Diagnostic): string[] {
  const leverages = diagnostic?.leverages?.map((item) => normalizeText(item, "", 240)).filter(Boolean) ?? [];
  const defaults = [
    "Entrenar con progresion semanal verificable.",
    "Proteger recuperacion y sueno antes de subir intensidad.",
    "Alinear nutricion diaria con el objetivo visual.",
  ];
  return [...leverages, ...defaults].slice(0, 5);
}

export function buildSeasonReportPrompt(params: BuildSeasonVisionReportParams): string {
  const labels = SEASON_TIMELINE_STEPS.map((step) => `${step}: ${getSeasonMilestoneCopy(step).label}`).join(", ");
  return [
    "Actua como GENESIS, la unica entidad visible para el usuario.",
    `Genera un JSON estricto compatible con ${SEASON_REPORT_SCHEMA_VERSION}.`,
    `Usa estos labels publicos para los milestones legacy: ${labels}.`,
    "No uses labels legacy de meses ni nombres de modulos internos.",
    "El reporte debe incluir baseline, tres visualizaciones de Season, observaciones por imagen, disclaimer y CTA operativo.",
    `Contexto disponible: ${JSON.stringify({
      shareId: params.shareId,
      input: params.input ?? null,
      hasOriginal: !!params.assets?.originalStoragePath,
      imageKeys: Object.keys(params.assets?.images ?? {}),
      diagnostic: params.ai.diagnostic ?? null,
      insightsText: params.ai.insightsText ?? null,
    })}`,
  ].join("\n");
}

export function buildSeasonVisionReport(params: BuildSeasonVisionReportParams): SeasonVisionReport {
  const timeline = requireTimeline(params.ai);
  const generatedAt = (params.generatedAt ?? new Date()).toISOString();
  const images = params.assets?.images ?? {};
  const milestones = SEASON_TIMELINE_STEPS.map((step) =>
    buildMilestone(
      step,
      timeline[step],
      step === "m0" ? params.assets?.originalStoragePath ?? null : images[step] ?? null
    )
  ) as SeasonVisionReport["timeline"];
  const baselineEntry = timeline.m0;
  const diagnostic = params.ai.diagnostic;
  const bottleneck = diagnostic?.bottleneck
    ? {
        key: diagnostic.bottleneck,
        label: BOTTLENECK_LABELS[diagnostic.bottleneck] ?? diagnostic.bottleneck,
      }
    : null;

  const report = {
    schemaVersion: SEASON_REPORT_SCHEMA_VERSION,
    shareId: params.shareId,
    generatedAt,
    title: "Season Vision Report",
    subject: "GENESIS",
    summary: normalizeText(
      params.ai.insightsText,
      "GENESIS proyecto una direccion fisica por temporadas a partir del baseline, el contexto de entrenamiento y los factores de recuperacion.",
      2000
    ),
    disclaimer: DEFAULT_DISCLAIMER,
    baseline: {
      label: "Punto de partida",
      summary: normalizeText(
        baselineEntry.description ?? baselineEntry.focus,
        "El punto de partida resume el estado inicial desde el cual GENESIS calcula la direccion fisica."
      ),
      muscleHealthScore:
        typeof diagnostic?.muscle_health_score === "number"
          ? clampStat(diagnostic.muscle_health_score, diagnostic.muscle_health_score)
          : null,
      bottleneck,
      dominantObservation: normalizeText(
        diagnostic?.dominant_error,
        "El principal riesgo es confundir intensidad con estructura. GENESIS prioriza adherencia, recuperacion y progresion sostenible.",
        700
      ),
      profile: normalizeProfile(params.input),
      risks: (baselineEntry.risks ?? []).map((risk) => normalizeText(risk, "", 240)).filter(Boolean).slice(0, 5),
      expectations: (baselineEntry.expectations ?? [])
        .map((expectation) => normalizeText(expectation, "", 240))
        .filter(Boolean)
        .slice(0, 5),
    },
    timeline: milestones,
    visualizations: [milestones[1], milestones[2], milestones[3]],
    assets: {
      originalStoragePath: params.assets?.originalStoragePath ?? null,
      images,
    },
    actionPlan: {
      primaryRecommendation: normalizeText(
        diagnostic?.dominant_error,
        "Convertir esta vision en un plan semanal con progresion, nutricion y recuperacion medibles.",
        700
      ),
      trainingLevers: buildTrainingLevers(diagnostic),
      nextStep: "Agendar una revision NGX o desbloquear el plan completo para convertir la vision en ejecucion.",
    },
  };

  return SeasonVisionReportSchema.parse(report);
}
