import { beforeEach, describe, expect, it, vi } from "vitest";

const { sessionGet, sessionSet, sendMock } = vi.hoisted(() => ({
  sessionGet: vi.fn(),
  sessionSet: vi.fn(async () => undefined),
  sendMock: vi.fn(async () => ({ data: { id: "m1" }, error: null })),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function () {
    return { emails: { send: sendMock } };
  }),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 1000,
  })),
  getClientIP: vi.fn(() => "203.0.113.5"),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({ get: sessionGet, set: sessionSet })),
    })),
  })),
}));

import { POST } from "./route";
import { checkRateLimit } from "@/lib/rateLimit";

function request() {
  return new Request("https://ngx.test/api/sessions/s1/request-delete", {
    method: "POST",
  });
}
const ctx = { params: Promise.resolve({ shareId: "s1" }) };

describe("request-delete (fix-09 ARCO)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "NGX <genesis@ngxvision.app>";
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 1000,
    });
  });

  it("emails the delete link to the session email and hides PII from the body", async () => {
    sessionGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ email: "lead@example.com", deleteToken: "tok123" }),
    });
    const res = await POST(request() as never, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const calls = sendMock.mock.calls as unknown as Array<
      [{ to: string; html: string }]
    >;
    const call = calls[0][0];
    expect(call.to).toBe("lead@example.com");
    expect(call.html).toContain("/delete?shareId=s1");
    expect(call.html).toContain("tok123");
    expect(JSON.stringify(body)).not.toContain("lead@example.com");
    expect(JSON.stringify(body)).not.toContain("tok123");
  });

  it("returns 404 when the session does not exist", async () => {
    sessionGet.mockResolvedValueOnce({ exists: false });
    const res = await POST(request() as never, ctx);
    expect(res.status).toBe(404);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("mints + persists a deleteToken for legacy sessions without one", async () => {
    sessionGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ email: "lead@example.com" }),
    });
    const res = await POST(request() as never, ctx);
    expect(res.status).toBe(200);
    expect(sessionSet).toHaveBeenCalledWith(
      expect.objectContaining({ deleteToken: expect.any(String) }),
      { merge: true },
    );
    expect(sendMock).toHaveBeenCalled();
  });

  it("returns 429 when rate-limited (no session read, no email)", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 1000,
    });
    const res = await POST(request() as never, ctx);
    expect(res.status).toBe(429);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the email sender is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    sessionGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ email: "lead@example.com", deleteToken: "tok" }),
    });
    const res = await POST(request() as never, ctx);
    expect(res.status).toBe(503);
  });
});
