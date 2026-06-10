import { describe, it, expect } from "vitest";
import { nextLoadingAction } from "./loadingState";

const TIMEOUT = 240_000; // 4 min

describe("nextLoadingAction", () => {
  it("redirects when status is ready", () => {
    expect(
      nextLoadingAction({
        status: "ready",
        imageCount: 3,
        elapsedMs: 1000,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("redirect");
  });

  it("redirects when status is partial (the bug fix-20 targets)", () => {
    expect(
      nextLoadingAction({
        status: "partial",
        imageCount: 2,
        elapsedMs: 1000,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("redirect");
  });

  it("redirects when all 3 images are present regardless of status", () => {
    expect(
      nextLoadingAction({
        status: "processing",
        imageCount: 3,
        elapsedMs: 1000,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("redirect");
  });

  it("reports failed when status is failed", () => {
    expect(
      nextLoadingAction({
        status: "failed",
        imageCount: 1,
        elapsedMs: 1000,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("failed");
  });

  it("waits while still processing under the timeout", () => {
    expect(
      nextLoadingAction({
        status: "processing",
        imageCount: 1,
        elapsedMs: 1000,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("wait");
  });

  it("recovers when the timeout elapses without a terminal state", () => {
    expect(
      nextLoadingAction({
        status: "processing",
        imageCount: 1,
        elapsedMs: TIMEOUT,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("recover");
  });

  it("still redirects on partial even after the timeout elapsed", () => {
    expect(
      nextLoadingAction({
        status: "partial",
        imageCount: 2,
        elapsedMs: TIMEOUT + 1,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("redirect");
  });

  it("shows failed (not recover) even after the timeout elapsed", () => {
    expect(
      nextLoadingAction({
        status: "failed",
        imageCount: 0,
        elapsedMs: TIMEOUT + 1,
        timeoutMs: TIMEOUT,
      }),
    ).toBe("failed");
  });
});
