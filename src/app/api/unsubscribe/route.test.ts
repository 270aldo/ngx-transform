import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { createUnsubscribeToken } from "@/lib/unsubscribeToken";
import { suppressEmail } from "@/lib/emailSuppression";
import { unsubscribeSequence } from "@/lib/emailScheduler";

const mocks = vi.hoisted(() => ({
  sessionSet: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 60,
    remaining: 59,
    reset: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
  getClientIP: vi.fn(() => "203.0.113.10"),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn((name: string) => ({
      doc: vi.fn((id: string) => ({
        get: vi.fn(async () => ({
          exists: name === "sessions" && id === "share_1",
          data: () => ({ email: "lead@example.com" }),
        })),
        set: mocks.sessionSet,
      })),
    })),
  })),
}));

vi.mock("@/lib/emailSuppression", () => ({
  suppressEmail: vi.fn(async () => undefined),
}));

vi.mock("@/lib/emailScheduler", () => ({
  unsubscribeSequence: vi.fn(async () => undefined),
}));

function request(body: unknown) {
  return new Request("https://ngx.test/api/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("unsubscribe API security policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UNSUBSCRIBE_SECRET = "unsubscribe-secret";
  });

  it("rejects an unsubscribe request without a signed token", async () => {
    const res = await POST(
      request({
        shareId: "share_1",
      }) as never
    );

    expect(res.status).toBe(401);
    expect(suppressEmail).not.toHaveBeenCalled();
    expect(unsubscribeSequence).not.toHaveBeenCalled();
  });

  it("suppresses email for a valid signed unsubscribe token", async () => {
    const token = createUnsubscribeToken("share_1");
    const res = await POST(
      request({
        shareId: "share_1",
        token,
      }) as never
    );

    expect(res.status).toBe(200);
    expect(suppressEmail).toHaveBeenCalledWith("lead@example.com", "user_unsubscribe", {
      shareId: "share_1",
    });
    expect(unsubscribeSequence).toHaveBeenCalledWith("share_1");
    expect(mocks.sessionSet).toHaveBeenCalled();
  });
});
