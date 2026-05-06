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
});
