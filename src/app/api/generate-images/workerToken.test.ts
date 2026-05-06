import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

describe("generate-images worker auth", () => {
  it("does not accept worker tokens from query parameters", () => {
    const source = readFileSync("src/app/api/generate-images/route.ts", "utf8");

    expect(source).not.toContain("workerToken");
    expect(source).toContain('headers.get("x-worker-token")');
  });
});
