import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "./firebaseAdmin";
import { trackEvent } from "./telemetry";

vi.mock("./firebaseAdmin", () => ({
  getDb: vi.fn(),
}));

describe("telemetry trust boundary", () => {
  const telemetryAdd = vi.fn(async () => undefined);
  const metricsSet = vi.fn(async () => undefined);
  const metricsDoc = vi.fn(() => ({ set: metricsSet }));

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    process.env.FF_TELEMETRY_ENABLED = "true";
    vi.mocked(getDb).mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === "telemetry_events") {
          return { add: telemetryAdd };
        }
        if (name === "session_metrics") {
          return { doc: metricsDoc };
        }
        throw new Error(`Unexpected collection ${name}`);
      }),
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.FF_TELEMETRY_ENABLED;
  });

  it("stores untrusted public events without updating canonical session metrics", async () => {
    await trackEvent({
      sessionId: "share_1",
      event: "voice_agent_classified",
      trusted: false,
      metadata: {
        publicApi: true,
        note: "Contact owner@test.com after the call.",
      },
    });

    expect(telemetryAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "share_1",
        event: "voice_agent_classified",
        trusted: false,
        metadata: expect.objectContaining({
          publicApi: true,
          note: "Contact [REDACTED_EMAIL] after the call.",
        }),
      })
    );
    expect(metricsDoc).not.toHaveBeenCalled();
    expect(metricsSet).not.toHaveBeenCalled();
  });

  it("updates canonical session metrics only for trusted server-side events", async () => {
    await trackEvent({
      sessionId: "share_1",
      event: "mp_checkout_completed",
      metadata: { paymentId: "pay_1" },
    });

    expect(telemetryAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "share_1",
        event: "mp_checkout_completed",
        trusted: true,
      })
    );
    expect(metricsDoc).toHaveBeenCalledWith("share_1");
    expect(metricsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        lastEvent: "mp_checkout_completed",
      }),
      { merge: true }
    );
  });
});
