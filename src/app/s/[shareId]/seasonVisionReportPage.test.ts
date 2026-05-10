import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("share results page Season Vision Report wiring", () => {
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/s/[shareId]/page.tsx"),
    "utf8"
  );
  const reportSource = readFileSync(
    join(process.cwd(), "src/components/results/SeasonVisionReport.tsx"),
    "utf8"
  );

  it("uses the Season Vision Report as the primary results experience", () => {
    expect(pageSource).toContain("SeasonVisionReport");
    expect(pageSource).not.toContain("TransformationViewer");
    expect(pageSource).not.toContain("TransformationViewer2");
    expect(pageSource).not.toContain("TransformationSummary");
    expect(pageSource).not.toContain("MuscleHealthScore");
  });

  it("keeps legacy asset keys behind Season-facing visual cards", () => {
    expect(reportSource).toContain('["m4", "m8", "m12"]');
    expect(reportSource).toContain('getSeasonMilestoneLabel(step)');
    expect(reportSource).toContain('imageUrls.images?.[step]');
  });
});

