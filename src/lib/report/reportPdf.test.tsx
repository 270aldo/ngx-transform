import { describe, expect, it } from "vitest";
import { buildSeasonVisionReport, type SeasonReportAnalysisInput } from "./reportBuilder";
import { renderSeasonReportPDF } from "./reportPdf";

const analysisFixture: SeasonReportAnalysisInput = {
  insightsText: "GENESIS convierte el baseline inicial en una vision por temporadas con ejecucion medible.",
  timeline: {
    m0: {
      month: 0,
      title: "Baseline",
      description: "El punto de partida prioriza estructura y recuperacion antes de volumen adicional.",
      mental: "Ordenar el sistema es el primer avance.",
      stats: { strength: 40, aesthetics: 38, endurance: 39, mental: 44 },
    },
    m4: {
      month: 4,
      title: "Season 1",
      description: "La primera visualizacion muestra mas tono, postura y energia disponible.",
      mental: "La rutina empieza a sentirse sostenible.",
      stats: { strength: 57, aesthetics: 55, endurance: 54, mental: 61 },
    },
    m8: {
      month: 8,
      title: "Season 2",
      description: "El progreso se consolida con mejor composicion y capacidad de entrenamiento.",
      mental: "La consistencia supera a los picos de motivacion.",
      stats: { strength: 72, aesthetics: 69, endurance: 68, mental: 74 },
    },
    m12: {
      month: 12,
      title: "Season 3",
      description: "La vision completa proyecta una version atletica, fuerte y sostenible.",
      mental: "El sistema ya sostiene el resultado.",
      stats: { strength: 86, aesthetics: 82, endurance: 80, mental: 88 },
    },
  },
};

describe("Season Vision Report PDF renderer", () => {
  it("renders valid PDF bytes from the report schema", async () => {
    const report = buildSeasonVisionReport({
      shareId: "pdf_demo",
      ai: analysisFixture,
      assets: {
        originalStoragePath: "uploads/user/original.jpg",
        images: { m4: "m4.png", m8: "m8.png", m12: "m12.png" },
      },
      generatedAt: new Date("2026-05-10T12:00:00.000Z"),
    });

    const pdfBuffer = await renderSeasonReportPDF(report);

    expect(pdfBuffer.subarray(0, 4).toString("utf8")).toBe("%PDF");
    expect(pdfBuffer.length).toBeGreaterThan(5000);
  });
});
