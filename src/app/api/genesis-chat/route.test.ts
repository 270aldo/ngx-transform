import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContentStream = vi.fn();

vi.mock("@google/genai", () => ({
  // Regular function (not arrow) so `new GoogleGenAI()` is constructable;
  // `new` returns this object, exposing the shared generateContentStream spy.
  GoogleGenAI: vi.fn(function () {
    return { models: { generateContentStream } };
  }),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 30,
    remaining: 29,
    reset: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/authServer", () => ({
  requireSessionOwner: vi.fn(),
  isSessionOwnerAuthError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "status" in error,
}));

import { POST } from "./route";
import { requireSessionOwner } from "@/lib/authServer";
import { checkRateLimit } from "@/lib/rateLimit";

function request(body: unknown) {
  return new Request("https://ngx.test/api/genesis-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function streamOf(...chunks: string[]) {
  return (async function* () {
    for (const text of chunks) yield { text };
  })();
}

const validBody = {
  shareId: "demo",
  messages: [{ role: "user", content: "¿Qué es HYBRID?" }],
};

describe("genesis-chat API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT;
    delete process.env.FF_HYBRID_TEXT_CHAT;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GENESIS_CHAT_MODEL;
    generateContentStream.mockReset();
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 60000,
    });
    vi.mocked(requireSessionOwner).mockResolvedValue({
      authUser: { uid: "owner_1", email: "owner@test.com" },
      sessionRef: {} as never,
      session: { ownerUid: "owner_1" },
    });
  });

  it("returns 403 when the flag is explicitly off", async () => {
    process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT = "false";
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(403);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("rejects an invalid body with 400", async () => {
    const res = await POST(request({ shareId: "demo", messages: [] }) as never);
    expect(res.status).toBe(400);
  });

  it("blocks non-owners with 401 before calling Gemini", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(requireSessionOwner).mockRejectedValueOnce({
      code: "UNAUTHORIZED",
      status: 401,
    });
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(401);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("returns 429 when rate-limited", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 60000,
    });
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(429);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("returns 503 when GEMINI_API_KEY is missing", async () => {
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(503);
  });

  it("streams the model reply built from the text-channel system prompt", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    generateContentStream.mockResolvedValueOnce(
      streamOf("Hola, soy GENESIS. ", "listo_para_diagnostico"),
    );

    const res = await POST(request(validBody) as never);
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(text).toContain("GENESIS");
    expect(text).toContain("listo_para_diagnostico");
    expect(checkRateLimit).toHaveBeenCalledWith("api:genesis-chat", "owner_1");
    expect(generateContentStream).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining("listo_para_diagnostico"),
        }),
      }),
    );
  });
});
