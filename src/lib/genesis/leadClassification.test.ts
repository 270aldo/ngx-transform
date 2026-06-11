import { describe, it, expect } from "vitest";
import {
  parseClassification,
  CTA_BY_CLASSIFICATION,
  CLASSIFICATION_LABELS,
} from "./leadClassification";

describe("parseClassification", () => {
  it("detects each fit label inside surrounding text", () => {
    expect(parseClassification("Mi veredicto: listo_para_diagnostico.")).toBe(
      "listo_para_diagnostico",
    );
    expect(parseClassification("creo que necesita_claridad todavía")).toBe(
      "necesita_claridad",
    );
    expect(parseClassification("no_fit_ahora")).toBe("no_fit_ahora");
  });

  it("returns null when no label is present", () => {
    expect(parseClassification("hola, ¿cómo estás?")).toBeNull();
    expect(parseClassification("")).toBeNull();
  });

  it("prioritizes 'listo' when multiple labels appear", () => {
    expect(
      parseClassification("listo_para_diagnostico y necesita_claridad"),
    ).toBe("listo_para_diagnostico");
  });

  it("maps every classification to a non-empty CTA and label", () => {
    (
      Object.keys(CTA_BY_CLASSIFICATION) as Array<
        keyof typeof CTA_BY_CLASSIFICATION
      >
    ).forEach((k) => {
      expect(CTA_BY_CLASSIFICATION[k].label.length).toBeGreaterThan(0);
      expect(CLASSIFICATION_LABELS[k].length).toBeGreaterThan(0);
    });
  });
});
