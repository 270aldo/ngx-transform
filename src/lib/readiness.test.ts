import { describe, expect, it } from "vitest";
import type { Profile } from "./validators";
import {
  computeHybridFit,
  computeMuscleFoundation,
  computeTransformationReadiness,
  generateReadinessReport,
  recommendTier,
} from "./readiness";

const baseProfile: Profile = {
  age: 30,
  sex: "male",
  heightCm: 175,
  weightKg: 75,
  level: "intermedio",
  goal: "definicion",
  weeklyTime: 5,
  disciplineRating: 7,
  sleepQuality: 7,
  stressLevel: 5,
};

describe("computeTransformationReadiness", () => {
  it("returns Alta for disciplined user with good sleep + low stress", () => {
    const result = computeTransformationReadiness({
      ...baseProfile,
      disciplineRating: 9,
      sleepQuality: 9,
      stressLevel: 3,
      weeklyTime: 7,
    });
    expect(result.label).toBe("Alta");
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("returns Baja for poor sleep + high stress + low discipline", () => {
    const result = computeTransformationReadiness({
      ...baseProfile,
      disciplineRating: 3,
      sleepQuality: 3,
      stressLevel: 9,
      weeklyTime: 2,
      level: "novato",
    });
    expect(result.label).toBe("Baja");
    expect(result.score).toBeLessThan(45);
  });

  it("flags sleep as the limiter when sleep is the worst variable", () => {
    const result = computeTransformationReadiness({
      ...baseProfile,
      disciplineRating: 8,
      sleepQuality: 4,
      stressLevel: 5,
    });
    expect(result.explanation.toLowerCase()).toContain("sue");
  });

  it("score is bounded 0-100", () => {
    const high = computeTransformationReadiness({
      ...baseProfile,
      disciplineRating: 10,
      sleepQuality: 10,
      stressLevel: 1,
      weeklyTime: 14,
      level: "avanzado",
    });
    const low = computeTransformationReadiness({
      ...baseProfile,
      disciplineRating: 1,
      sleepQuality: 1,
      stressLevel: 10,
      weeklyTime: 1,
      level: "novato",
    });
    expect(high.score).toBeLessThanOrEqual(100);
    expect(low.score).toBeGreaterThanOrEqual(0);
  });
});

describe("computeMuscleFoundation", () => {
  it("returns higher score for advanced + history", () => {
    const result = computeMuscleFoundation({
      ...baseProfile,
      level: "avanzado",
      trainingHistoryYears: 5,
      weeklyTime: 6,
    });
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("priority is consistencia for novato", () => {
    const result = computeMuscleFoundation({ ...baseProfile, level: "novato" });
    expect(result.priority).toBe("consistencia");
  });

  it("priority is proteína for masa goal at intermediate+", () => {
    const result = computeMuscleFoundation({ ...baseProfile, goal: "masa" });
    expect(result.priority).toBe("proteína");
  });

  it("priority is recuperación when sleep poor or stress high", () => {
    const result = computeMuscleFoundation({
      ...baseProfile,
      goal: "definicion",
      sleepQuality: 3,
    });
    expect(result.priority).toBe("recuperación");
  });
});

describe("computeHybridFit", () => {
  it("scores 0 for an advanced disciplined user with low stress", () => {
    const result = computeHybridFit({
      ...baseProfile,
      level: "avanzado",
      disciplineRating: 9,
      stressLevel: 3,
      sleepQuality: 8,
    });
    expect(result.score).toBe(0);
  });

  it("scores high for novato with poor habits", () => {
    const result = computeHybridFit({
      ...baseProfile,
      level: "novato",
      disciplineRating: 4,
      stressLevel: 9,
      sleepQuality: 4,
    });
    // 25 + 25 + 20 + 15 = 85
    expect(result.score).toBe(85);
  });

  it("adds +30 when notes mention lesion or dolor", () => {
    const result = computeHybridFit({
      ...baseProfile,
      level: "avanzado",
      disciplineRating: 9,
      notes: "Tengo una lesión vieja en el hombro derecho.",
    });
    expect(result.score).toBe(30);
  });

  it("caps at 100", () => {
    const result = computeHybridFit({
      ...baseProfile,
      level: "novato",
      disciplineRating: 1,
      stressLevel: 10,
      sleepQuality: 1,
      notes: "tengo dolor crónico de espalda",
    });
    expect(result.score).toBe(100);
  });
});

describe("recommendTier", () => {
  it("recommends HYBRID when hybridFit >= 50", () => {
    const result = recommendTier({
      transformationReadiness: { score: 50, label: "Media", explanation: "" },
      muscleFoundation: { score: 50, priority: "consistencia" },
      hybridFit: { score: 60 },
    });
    expect(result.tier).toBe("HYBRID");
    expect(result.cta).toMatch(/coach/i);
  });

  it("recommends ASCEND when hybridFit < 50", () => {
    const result = recommendTier({
      transformationReadiness: { score: 80, label: "Alta", explanation: "" },
      muscleFoundation: { score: 80, priority: "fuerza" },
      hybridFit: { score: 20 },
    });
    expect(result.tier).toBe("ASCEND");
    expect(result.cta).toMatch(/ASCEND/i);
  });
});

describe("generateReadinessReport", () => {
  it("returns full report for a typical user", () => {
    const report = generateReadinessReport(baseProfile);
    expect(report.transformationReadiness.score).toBeGreaterThanOrEqual(0);
    expect(report.muscleFoundation.score).toBeGreaterThanOrEqual(0);
    expect(report.hybridFit.score).toBeGreaterThanOrEqual(0);
    expect(["ASCEND", "HYBRID"]).toContain(report.recommendation.tier);
  });

  it("a stressed novato gets HYBRID", () => {
    const report = generateReadinessReport({
      ...baseProfile,
      level: "novato",
      stressLevel: 9,
      sleepQuality: 4,
      disciplineRating: 4,
    });
    expect(report.recommendation.tier).toBe("HYBRID");
  });

  it("a disciplined advanced user gets ASCEND", () => {
    const report = generateReadinessReport({
      ...baseProfile,
      level: "avanzado",
      disciplineRating: 9,
      stressLevel: 3,
      sleepQuality: 8,
      trainingHistoryYears: 4,
    });
    expect(report.recommendation.tier).toBe("ASCEND");
  });
});
