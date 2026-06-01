import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfiguredFromEmail } from "./emailConfig";

describe("getConfiguredFromEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects resend.dev senders in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RESEND_FROM_EMAIL", "NGX <onboarding@resend.dev>");
    vi.stubEnv("EMAIL_FROM", "");

    expect(getConfiguredFromEmail("test")).toBeNull();
  });

  it("requires an explicit sender in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    vi.stubEnv("EMAIL_FROM", "");

    expect(getConfiguredFromEmail("test")).toBeNull();
  });

  it("uses a local fallback outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    vi.stubEnv("EMAIL_FROM", "");

    expect(getConfiguredFromEmail("test")).toContain("NGX Vision");
  });
});
