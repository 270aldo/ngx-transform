import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("lead magnet result copy policy", () => {
  const muscleSource = readFileSync(
    join(process.cwd(), "src/components/results/MuscleHealthScore.tsx"),
    "utf8"
  );
  const summarySource = readFileSync(
    join(process.cwd(), "src/components/results/TransformationSummary.tsx"),
    "utf8"
  );
  const chapterSource = readFileSync(
    join(process.cwd(), "src/components/results/ChapterView.tsx"),
    "utf8"
  );

  it("does not personalize nutrition claims when nutrition was not explicitly captured", () => {
    expect(muscleSource).not.toContain("1.6–2g");
    expect(muscleSource).not.toContain("calorías");
    expect(summarySource).not.toContain("Inconsistencia nutricional");
    expect(summarySource).not.toContain("Tu nutrición varía");
  });

  it("does not present unmeasured body composition deltas as facts", () => {
    expect(summarySource).not.toContain("Peso orientativo");
    expect(summarySource).not.toContain("Grasa estimada");
    expect(summarySource).not.toContain("Músculo estimado");
    expect(summarySource).toContain("Fuerza visual");
    expect(summarySource).toContain("Composición visual");
    expect(summarySource).toContain("No son kilos, grasa ni masa medidos");
  });

  it("explains the muscle score source without nutrition inference", () => {
    expect(muscleSource).toContain("foto, biometría, objetivo");
    expect(muscleSource).toContain("No usa laboratorio");
    expect(muscleSource).toContain("ni datos nutricionales");
    expect(muscleSource).toContain("3 hipótesis accionables");
  });

  it("explains stats as orientative estimates, not clinical measurements", () => {
    expect(chapterSource).toContain('surfaceMode?: "default" | "lead-magnet"');
    expect(chapterSource).toContain("Aspiracional · no clínico");
    expect(chapterSource).toContain("Scores orientativos");
    expect(chapterSource).toContain("Visualización aspiracional");
    expect(chapterSource).toContain("Dirección de 12 semanas");
    expect(chapterSource).toContain("object-contain");
  });

  it("guards duplicate timeline URLs in the summary sequence", () => {
    expect(summarySource).toContain("seenUrls");
    expect(summarySource).toContain("seenUrls.has(item.url)");
  });
});
