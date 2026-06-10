import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("loading recovery wiring (fix-20)", () => {
  const loadingSource = readFileSync(
    join(process.cwd(), "src/app/loading/[shareId]/LoadingExperience.tsx"),
    "utf8",
  );
  const wizardSource = readFileSync(
    join(process.cwd(), "src/app/wizard/page.tsx"),
    "utf8",
  );

  it("routes terminal states through the shared decision helper (incl. partial)", () => {
    expect(loadingSource).toContain("nextLoadingAction");
    expect(loadingSource).toContain('"partial"');
  });

  it("surfaces generation/timeout failures with telemetry", () => {
    expect(loadingSource).toContain("generation_trigger_failed");
    expect(loadingSource).toContain("loading_stuck_partial");
    expect(loadingSource).toContain("loading_timeout");
  });

  it("offers a recovery exit (retry + direct results link) on timeout", () => {
    expect(loadingSource).toContain("timedOut");
    expect(loadingSource).toContain("Ver mi resultado");
  });

  it("reads the analyzeFailed signal the wizard sends on bootstrap failure", () => {
    expect(loadingSource).toContain("analyzeFailed");
    expect(wizardSource).toContain("analyzeFailed=1");
  });
});
