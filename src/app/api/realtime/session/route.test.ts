import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 30,
    remaining: 29,
    reset: Date.now() + 60000,
  })),
  getClientIP: vi.fn(() => "203.0.113.24"),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

function request(body: unknown) {
  return new Request("https://ngx.test/api/realtime/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("realtime session API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_REALTIME_MODEL;
  });

  it("returns a controlled error when OPENAI_API_KEY is missing", async () => {
    const res = await POST(request({ shareId: "demo" }) as never);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toBe("OPENAI_API_KEY not configured");
  });

  it("creates an ephemeral OpenAI Realtime client secret", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_REALTIME_MODEL = "gpt-realtime";
    const fetchMock = vi.fn(async () =>
      Response.json({
        client_secret: { value: "ek_test_secret", expires_at: 1893456000 },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      request({ shareId: "demo", saveTranscript: true }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.client_secret).toBe("ek_test_secret");
    expect(body.model).toBe("gpt-realtime");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/realtime/client_secrets",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test",
          "Content-Type": "application/json",
        }),
      })
    );
    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init.body as string);
    expect(payload.session.type).toBe("realtime");
    expect(payload.session.model).toBe("gpt-realtime");
    expect(payload.session.instructions).toContain("listo_para_diagnostico");
  });
});
