import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock, getSequenceStatus, markEmailSent, advanceSequence } =
  vi.hoisted(() => ({
    sendMock: vi.fn(async () => ({ data: { id: "msg_1" }, error: null })),
    getSequenceStatus: vi.fn(),
    markEmailSent: vi.fn(async () => undefined),
    advanceSequence: vi.fn(async () => null),
  }));

vi.mock("resend", () => ({
  // Regular function so `new Resend()` is constructable.
  Resend: vi.fn(function () {
    return { emails: { send: sendMock } };
  }),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
  getClientIP: vi.fn(() => "203.0.113.7"),
}));

vi.mock("@/lib/emailSuppression", () => ({
  isEmailSuppressed: vi.fn(async () => false),
  suppressEmail: vi.fn(async () => undefined),
}));

vi.mock("@/lib/telemetry", () => ({ trackEvent: vi.fn(async () => undefined) }));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        // sessions doc: not converted to HYBRID
        get: vi.fn(async () => ({ data: () => ({}) })),
      })),
    })),
  })),
}));

// Keep the real pure helpers (hasSentStage / getEmailSubject); only mock the
// Firestore-backed reads/writes (defined via vi.hoisted above).
vi.mock("@/lib/emailScheduler", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/emailScheduler")>();
  return { ...actual, getSequenceStatus, markEmailSent, advanceSequence };
});

import { POST } from "./route";

function request(body: unknown) {
  return new Request("https://ngx.test/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": "cron-key" },
    body: JSON.stringify(body),
  });
}

const baseSequence = {
  id: "share_1",
  email: "lead@example.com",
  shareId: "share_1",
  status: "active" as const,
  stage: "D0" as const,
  sentEmails: [] as string[],
  nextSend: null,
  createdAt: null,
  updatedAt: null,
};

describe("email/send idempotency guard (fix-19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_API_KEY = "cron-key";
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "NGX <genesis@ngxvision.app>";
  });

  it("sends when the stage has not been sent yet", async () => {
    getSequenceStatus.mockResolvedValueOnce({ ...baseSequence, sentEmails: [] });
    const res = await POST(request({ shareId: "share_1", template: "D0" }) as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("skips (no resend, no advance) when the stage was already sent", async () => {
    getSequenceStatus.mockResolvedValueOnce({
      ...baseSequence,
      stage: "D1",
      sentEmails: ["D0"],
    });
    const res = await POST(request({ shareId: "share_1", template: "D0" }) as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.skipped).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
    expect(advanceSequence).not.toHaveBeenCalled();
  });
});
