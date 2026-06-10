import { afterEach, describe, expect, it, vi } from "vitest";
import { withTimeout } from "./utils";

describe("withTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the value when the promise settles before the timeout", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 1000, "x")).resolves.toBe("ok");
  });

  it("rejects with the original error if the promise rejects before the timeout", async () => {
    await expect(
      withTimeout(Promise.reject(new Error("boom")), 1000, "x")
    ).rejects.toThrow("boom");
  });

  it("rejects with `<label>_timeout` when the promise exceeds the timeout", async () => {
    vi.useFakeTimers();
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve("late"), 5000));
    const raced = withTimeout(slow, 1000, "gemini_analysis");
    const assertion = expect(raced).rejects.toThrow("gemini_analysis_timeout");
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});
