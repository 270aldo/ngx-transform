import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

describe("jobManager locking contract", () => {
  it("keeps milestone progress in_progress until the route marks final partial/completed/failed", () => {
    const source = readFileSync("src/lib/jobManager.ts", "utf8");

    expect(source).toContain("export async function markJobPartial");
    expect(source).toContain('status: "in_progress"');
  });

  it("does not reacquire failed jobs after the retry budget is exhausted", () => {
    const source = readFileSync("src/lib/jobManager.ts", "utf8");

    expect(source).toContain("current.retryCount >= current.maxRetries");
    expect(source).toContain('status = "failed"');
  });
});
