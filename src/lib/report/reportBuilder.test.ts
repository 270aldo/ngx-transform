import { describe, expect, it } from "vitest";
import { buildSeasonReportPrompt, buildSeasonVisionReport, type SeasonReportAnalysisInput } from "./reportBuilder";

const analysisFixture: SeasonReportAnalysisInput = {
  insightsText:
    "GENESIS detecta una oportunidad clara: transformar un baseline irregular en una direccion fisica mas fuerte, definida y sostenible.",
  timeline: {
    m0: {
      month: 0,
      title: "Baseline",
      description: "El punto de partida muestra margen de mejora en estructura, recuperacion y consistencia nutricional.",
      mental: "El primer cambio es dejar de improvisar y sostener una rutina medible.",
      stats: { strength: 41, aesthetics: 39, endurance: 37, mental: 44 },
      expectations: ["Progreso visible si la adherencia supera el 80%."],
      risks: ["Dormir poco puede limitar recomposicion."],
    },
    m4: {
      month: 4,
      title: "Primera adaptacion",
      description: "La silueta empieza a ordenar postura, tono muscular y capacidad de trabajo.",
      mental: "La constancia gana mas que la intensidad aislada.",
      stats: { strength: 58, aesthetics: 55, endurance: 53, mental: 61 },
      expectations: [],
      risks: [],
    },
    m8: {
      month: 8,
      title: "Consolidacion",
      description: "La composicion corporal se vuelve mas estable y el entrenamiento deja marcas visibles.",
      mental: "La identidad se construye con ejecucion repetida.",
      stats: { strength: 73, aesthetics: 69, endurance: 67, mental: 74 },
      expectations: [],
      risks: [],
    },
    m12: {
      month: 12,
      title: "Vision completa",
      description: "El fisico proyecta una version mas fuerte, atletica y sostenible.",
      mental: "El resultado se mantiene porque el sistema ya no depende de motivacion.",
      stats: { strength: 86, aesthetics: 83, endurance: 81, mental: 88 },
      expectations: [],
      risks: [],
    },
  },
  diagnostic: {
    bottleneck: "recovery",
    muscle_health_score: 74,
    dominant_error: "El cuello de botella principal es recuperar mejor para sostener intensidad sin acumular fatiga.",
    leverages: ["Subir proteina diaria.", "Bloquear horarios de sueno.", "Medir cargas semanales."],
  },
};

describe("Season Vision Report builder", () => {
  it("keeps legacy milestone keys while exposing Season labels", () => {
    const report = buildSeasonVisionReport({
      shareId: "share_123",
      ai: analysisFixture,
      input: {
        age: 31,
        sex: "male",
        heightCm: 178,
        weightKg: 82,
        level: "intermedio",
        goal: "definicion",
        weeklyTime: 5,
        focusZone: "full",
      },
      assets: {
        originalStoragePath: "uploads/user/original.jpg",
        images: {
          m4: "sessions/share_123/m4.png",
          m8: "sessions/share_123/m8.png",
          m12: "sessions/share_123/m12.png",
        },
      },
      generatedAt: new Date("2026-05-10T12:00:00.000Z"),
    });

    expect(report.schemaVersion).toBe("season_vision_report.v1");
    expect(report.timeline.map((milestone) => milestone.key)).toEqual(["m0", "m4", "m8", "m12"]);
    expect(report.timeline.map((milestone) => milestone.label)).toEqual([
      "Punto de partida",
      "Season 1",
      "Season 2",
      "Season 3",
    ]);
    expect(report.visualizations.map((milestone) => milestone.key)).toEqual(["m4", "m8", "m12"]);
    expect(report.assets.images.m12).toBe("sessions/share_123/m12.png");
    expect(report.baseline.bottleneck?.label).toBe("Recuperacion y sueno");
  });

  it("builds a strict prompt for a future AI report generator", () => {
    const prompt = buildSeasonReportPrompt({
      shareId: "share_123",
      ai: analysisFixture,
      assets: { images: { m4: "m4.png", m8: "m8.png", m12: "m12.png" } },
    });

    expect(prompt).toContain("season_vision_report.v1");
    expect(prompt).toContain("Season 1");
    expect(prompt).toContain("Season 2");
    expect(prompt).toContain("Season 3");
    expect(prompt).not.toMatch(/Mes 4|Mes 8|Mes 12/);
  });
});
