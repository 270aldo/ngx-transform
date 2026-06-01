import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { requireSessionOwner } from "@/lib/authServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { createMpPreference, getHybridSkuConfig } from "@/lib/mercadoPago";
import { trackEvent } from "@/lib/telemetry";

vi.mock("@/lib/authServer", () => ({
  requireSessionOwner: vi.fn(),
  isSessionOwnerAuthError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "status" in error,
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/mercadoPago", () => ({
  createMpPreference: vi.fn(),
  getHybridSkuConfig: vi.fn(),
}));

vi.mock("@/lib/telemetry", () => ({
  trackEvent: vi.fn(async () => undefined),
}));

function request(body: unknown, headers?: Record<string, string>) {
  return new Request("https://ngx.test/api/checkout/create-preference", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("Mercado Pago create-preference API", () => {
  const sessionRef = {
    set: vi.fn(async () => undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MP_ACCESS_TOKEN = "mp-test-token";
    process.env.NEXT_PUBLIC_APP_URL = "https://ngx.test";

    vi.mocked(requireSessionOwner).mockResolvedValue({
      authUser: { uid: "owner_1", email: "owner@test.com" },
      sessionRef: sessionRef as never,
      session: { ownerUid: "owner_1", email: "owner@test.com" },
    } as never);
    vi.mocked(getHybridSkuConfig).mockReturnValue({
      sku: "monthly",
      internalId: "hybrid_monthly_v1",
      price: 199,
      currency: "MXN",
      label: "Acceso mensual",
      description: "NGX HYBRID mensual",
    });
    vi.mocked(createMpPreference).mockResolvedValue({
      preferenceId: "pref_123",
      initPoint: "https://mercadopago.test/checkout/prod",
      sandboxInitPoint: "https://mercadopago.test/checkout/sandbox",
    });
  });

  it("creates a preference only for the session owner and persists the redirected checkout intent", async () => {
    const res = await POST(
      request(
        { shareId: "share_1", sku: "monthly" },
        { Authorization: "Bearer owner-token" }
      ) as never
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        ok: true,
        preferenceId: "pref_123",
        initPoint: "https://mercadopago.test/checkout/sandbox",
        sku: "monthly",
        amount: 199,
        currency: "MXN",
      })
    );
    expect(requireSessionOwner).toHaveBeenCalledWith(expect.any(Request), "share_1");
    expect(checkRateLimit).toHaveBeenCalledWith("api:checkout", "owner_1");
    expect(createMpPreference).toHaveBeenCalledWith({
      sku: "monthly",
      shareId: "share_1",
      email: "owner@test.com",
      baseUrl: "https://ngx.test",
    });
    expect(sessionRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        checkout: expect.objectContaining({
          provider: "mercadopago",
          sku: "monthly",
          internalId: "hybrid_monthly_v1",
          preferenceId: "pref_123",
          status: "redirected",
          amount: 199,
          currency: "MXN",
        }),
      }),
      { merge: true }
    );
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "share_1",
        event: "mp_checkout_redirected",
        metadata: expect.objectContaining({
          sku: "monthly",
          preferenceId: "pref_123",
          amount: 199,
          currency: "MXN",
        }),
      })
    );
  });

  it("blocks anonymous callers before creating a preference", async () => {
    vi.mocked(requireSessionOwner).mockRejectedValueOnce({
      code: "UNAUTHORIZED",
      status: 401,
    });

    const res = await POST(request({ shareId: "share_1", sku: "monthly" }) as never);

    expect(res.status).toBe(401);
    expect(createMpPreference).not.toHaveBeenCalled();
    expect(sessionRef.set).not.toHaveBeenCalled();
  });

  it("blocks non-owner callers before creating a preference", async () => {
    vi.mocked(requireSessionOwner).mockRejectedValueOnce({
      code: "FORBIDDEN",
      status: 403,
    });

    const res = await POST(
      request(
        { shareId: "share_1", sku: "monthly" },
        { Authorization: "Bearer other-user-token" }
      ) as never
    );

    expect(res.status).toBe(403);
    expect(createMpPreference).not.toHaveBeenCalled();
    expect(sessionRef.set).not.toHaveBeenCalled();
  });

  it("degrades without calling Mercado Pago when direct checkout credentials are absent", async () => {
    delete process.env.MP_ACCESS_TOKEN;

    const res = await POST(
      request(
        { shareId: "share_1", sku: "monthly" },
        { Authorization: "Bearer owner-token" }
      ) as never
    );
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain("El pago directo no está activo");
    expect(createMpPreference).not.toHaveBeenCalled();
    expect(sessionRef.set).not.toHaveBeenCalled();
  });
});
