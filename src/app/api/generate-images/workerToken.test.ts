import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

describe("generate-images worker auth", () => {
  it("does not accept worker tokens from query parameters", () => {
    const source = readFileSync("src/app/api/generate-images/route.ts", "utf8");
    const authSource = readFileSync("src/lib/internalApiAuth.ts", "utf8");

    expect(source).not.toContain("workerToken");
    expect(authSource).not.toContain("searchParams");
    expect(authSource).toContain('headers.get("x-worker-token")');
  });

  it("expands requested steps to preserve Identity Chain dependencies", () => {
    const source = readFileSync("src/app/api/generate-images/route.ts", "utf8");

    expect(source).toContain("expandIdentityChainSteps");
    expect(source).toContain('required.add("m4")');
    expect(source).toContain('required.add("m8")');
    expect(source).toContain('required.add("m12")');
  });

  it("only completes the image job after every milestone exists", () => {
    const source = readFileSync("src/app/api/generate-images/route.ts", "utf8");

    expect(source).toContain("const allMilestonesComplete = STEP_ORDER.every");
    expect(source).toContain("markJobPartial");
  });
});
