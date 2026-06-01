import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { trackEvent } from "@/lib/telemetry";
import { checkRateLimit } from "@/lib/rateLimit";

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 120,
    remaining: 119,
    reset: Date.now() + 60000,
  })),
  getClientIP: vi.fn(() => "203.0.113.88"),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/telemetry", () => ({
  trackEvent: vi.fn(async () => undefined),
}));

function request(body: unknown) {
  return new Request("https://ngx.test/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("public telemetry API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records public events as untrusted and strips email-keyed metadata", async () => {
    const res = await POST(
      request({
        sessionId: "share_1",
        shareId: "share_1",
        event: "voice_agent_classified",
        metadata: {
          email: "owner@test.com",
          ownerEmail: "owner@test.com",
          classification: "listo_para_diagnostico",
          score: 9,
          optedIn: true,
        },
      }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(checkRateLimit).toHaveBeenCalledWith("api:telemetry", "203.0.113.88");
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "share_1",
        event: "voice_agent_classified",
        trusted: false,
        metadata: {
          classification: "listo_para_diagnostico",
          score: 9,
          optedIn: true,
          publicApi: true,
        },
      })
    );
  });
});
