import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Wizard lead capture copy", () => {
  const consentSource = readFileSync(
    join(process.cwd(), "src/components/wizard/WizardConsentPanel.tsx"),
    "utf8"
  );
  const closingSource = readFileSync(
    join(process.cwd(), "src/components/wizard/WizardClosingStep.tsx"),
    "utf8"
  );
  const profileSource = readFileSync(
    join(process.cwd(), "src/components/wizard/WizardProfileStep.tsx"),
    "utf8"
  );

  it("makes marketing optional and separate from result delivery", () => {
    expect(consentSource).toContain("opcional; no afecta tu resultado");
    expect(closingSource).toContain("opcional; no afecta la entrega del resultado");
  });

  it("states email is used to send and recover the private result", () => {
    expect(closingSource).toContain("enlace privado");
    expect(closingSource).toContain("recuperarlo con este correo");
  });

  it("frames profile and mental inputs as calibration, not diagnosis", () => {
    expect(profileSource).toContain("parámetro de calibración visual");
    expect(profileSource).toContain("No define identidad, diagnóstico ni resultado");
    expect(closingSource).toContain("no diagnostican salud mental ni rendimiento");
  });
});
