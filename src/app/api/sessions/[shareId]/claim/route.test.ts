import { beforeEach, describe, expect, it, vi } from "vitest";

const { sessionGet, sessionUpdate } = vi.hoisted(() => ({
  sessionGet: vi.fn(),
  sessionUpdate: vi.fn(async () => undefined),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 60,
    remaining: 59,
    reset: Date.now() + 1000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/authServer", () => ({ requireAuth: vi.fn() }));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({ get: sessionGet, update: sessionUpdate })),
    })),
  })),
}));

import { POST } from "./route";
import { requireAuth } from "@/lib/authServer";
import { generateAccessToken } from "@/lib/accessToken";

function request(token?: string) {
  return new Request("https://ngx.test/api/sessions/s1/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(token ? { token } : {}),
  });
}
const ctx = { params: Promise.resolve({ shareId: "s1" }) };

describe("session claim by access token (fix-08)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = "access-secret";
    vi.mocked(requireAuth).mockResolvedValue({ uid: "new_owner", email: "a@b.c" });
  });

  it("returns 401 without auth", async () => {
    vi.mocked(requireAuth).mockRejectedValueOnce(new Error("UNAUTHORIZED"));
    const res = await POST(request(generateAccessToken("s1")) as never, ctx);
    expect(res.status).toBe(401);
    expect(sessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 403 for a token minted for a different session", async () => {
    const res = await POST(request(generateAccessToken("OTHER")) as never, ctx);
    expect(res.status).toBe(403);
    expect(sessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when the session does not exist", async () => {
    sessionGet.mockResolvedValueOnce({ exists: false });
    const res = await POST(request(generateAccessToken("s1")) as never, ctx);
    expect(res.status).toBe(404);
    expect(sessionUpdate).not.toHaveBeenCalled();
  });

  it("reassigns ownerUid with a valid token", async () => {
    sessionGet.mockResolvedValueOnce({ exists: true });
    const res = await POST(request(generateAccessToken("s1")) as never, ctx);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(sessionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ ownerUid: "new_owner" }),
    );
  });
});
