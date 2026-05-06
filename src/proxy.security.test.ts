import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

describe("API origin validation", () => {
  it("compares normalized origins exactly instead of using prefix matching", () => {
    const source = readFileSync("src/proxy.ts", "utf8");

    expect(source).toContain("new URL(origin).origin");
    expect(source).not.toContain("origin.startsWith");
  });
});
