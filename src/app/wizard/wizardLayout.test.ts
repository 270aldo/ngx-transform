import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Wizard mobile layout", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/wizard/page.tsx"),
    "utf8"
  );

  it("does not use a fixed bottom navigation that can cover form controls", () => {
    expect(source).not.toContain("fixed bottom-0");
  });

  it("does not read window.location during initial render", () => {
    expect(source).not.toContain("new URLSearchParams(window.location.search)");
  });
});
