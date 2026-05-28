import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("TransformationViewer2 delivery layout", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/TransformationViewer2.tsx"),
    "utf8"
  );

  it("does not auto-open share unlock immediately after reveal", () => {
    expect(source).not.toContain("setShowShareModal(true)");
  });

  it("does not keep milestone arrows fixed over conversion sections", () => {
    expect(source).not.toContain("fixed bottom-6");
  });

  it("supports a lead magnet surface mode that suppresses duplicate conversion UI", () => {
    expect(source).toContain('surfaceMode?: "default" | "lead-magnet"');
    expect(source).toContain('surfaceMode === "lead-magnet"');
    expect(source).toContain("!isLeadMagnet && <BookingHeaderButton />");
    expect(source).toContain("!isLeadMagnet && (");
    expect(source).toContain("surfaceMode={surfaceMode}");
  });

  it("uses baseline mode for the starting milestone stats", () => {
    const chapterSource = readFileSync(
      join(process.cwd(), "src/components/results/ChapterView.tsx"),
      "utf8"
    );
    const statsSource = readFileSync(
      join(process.cwd(), "src/components/results/StatsDelta.tsx"),
      "utf8"
    );

    expect(chapterSource).toContain("baselineMode={isM0}");
    expect(chapterSource).toContain("animate={!isM0}");
    expect(statsSource).toContain('baselineMode ? "BASE"');
    expect(statsSource).toContain("Punto inicial");
  });
});
