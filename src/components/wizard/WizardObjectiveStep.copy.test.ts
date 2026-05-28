import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("WizardObjectiveStep level copy", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/wizard/WizardObjectiveStep.tsx"),
    "utf8"
  );

  it("uses understandable public labels while preserving internal level ids", () => {
    expect(source).toContain('id: "novato"');
    expect(source).toContain('id: "intermedio"');
    expect(source).toContain('id: "avanzado"');
    expect(source).toContain('l: "Principiante"');
    expect(source).toContain('l: "Intermedio"');
    expect(source).toContain('l: "Avanzado"');
    expect(source).not.toContain('l: "Pro"');
    expect(source).not.toContain('l: "Elite"');
  });

  it("explains what each level means", () => {
    expect(source).toContain("menos de 6 meses consistentes");
    expect(source).toContain("6-24 meses");
    expect(source).toContain("2+ años");
  });

  it("keeps the selected direction aspirational instead of guaranteed", () => {
    expect(source).toContain("visualización aspiracional");
    expect(source).toContain("no una garantía");
    expect(source).toContain("Composición visual");
    expect(source).not.toContain("Precisión metabólica");
  });
});
