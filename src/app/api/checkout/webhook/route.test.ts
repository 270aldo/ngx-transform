import crypto from "crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { getDb } from "@/lib/firebaseAdmin";
import { fetchMpPayment, getHybridSkuConfig } from "@/lib/mercadoPago";
import { trackEvent } from "@/lib/telemetry";

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/mercadoPago", () => ({
  fetchMpPayment: vi.fn(),
  getHybridSkuConfig: vi.fn(),
  parseExternalReference: vi.fn((ref?: string) => {
    if (!ref) return null;
    const idx = ref.indexOf("__");
    if (idx <= 0) return null;
    return { shareId: ref.slice(0, idx), internalId: ref.slice(idx + 2) };
  }),
}));

vi.mock("@/lib/telemetry", () => ({
  trackEvent: vi.fn(async () => undefined),
}));

function signature({
  dataId = "pay_1",
  requestId = "req_1",
  ts,
  secret = "mp-webhook-secret",
}: {
  dataId?: string;
  requestId?: string;
  ts: string;
  secret?: string;
}) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

function webhookRequest({
  body = { type: "payment", data: { id: "pay_1" } },
  dataId = "pay_1",
  requestId = "req_1",
  signatureValue,
}: {
  body?: unknown;
  dataId?: string;
  requestId?: string;
  signatureValue?: string;
} = {}) {
  const raw = JSON.stringify(body);
  const ts = Math.floor(Date.now() / 1000).toString();
  const v1 = signatureValue ?? signature({ dataId, requestId, ts });

  return new NextRequest(
    `https://ngx.test/api/checkout/webhook?data.id=${encodeURIComponent(dataId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-request-id": requestId,
        "x-signature": `ts=${ts},v1=${v1}`,
      },
      body: raw,
    }
  );
}

function setupDb(session: unknown = {
  checkout: {
    internalId: "hybrid_monthly_v1",
    amount: 199,
    currency: "MXN",
  },
}) {
  const sessionRef = {
    get: vi.fn(async () => ({ exists: !!session, data: () => session })),
    set: vi.fn(async () => undefined),
  };
  const collection = vi.fn(() => ({
    doc: vi.fn(() => sessionRef),
  }));
  vi.mocked(getDb).mockReturnValue({ collection } as never);
  return { sessionRef };
}

function approvedPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: "pay_1",
    status: "approved",
    status_detail: "accredited",
    external_reference: "share_1__hybrid_monthly_v1",
    metadata: {
      sku: "monthly",
      internalId: "hybrid_monthly_v1",
    },
    transaction_amount: 199,
    currency_id: "MXN",
    payer: { email: "owner@test.com" },
    date_approved: "2026-06-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("Mercado Pago webhook API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MP_WEBHOOK_SECRET = "mp-webhook-secret";
    vi.mocked(getHybridSkuConfig).mockReturnValue({
      sku: "monthly",
      internalId: "hybrid_monthly_v1",
      price: 199,
      currency: "MXN",
      label: "Acceso mensual",
      description: "NGX HYBRID mensual",
    });
    vi.mocked(fetchMpPayment).mockResolvedValue(approvedPayment() as never);
  });

  it("marks a valid approved payment as converted", async () => {
    const { sessionRef } = setupDb();

    const res = await POST(webhookRequest() as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        ok: true,
        paymentId: "pay_1",
        shareId: "share_1",
        status: "completed",
      })
    );
    expect(fetchMpPayment).toHaveBeenCalledWith("pay_1");
    expect(sessionRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        checkout: expect.objectContaining({
          provider: "mercadopago",
          sku: "monthly",
          internalId: "hybrid_monthly_v1",
          paymentId: "pay_1",
          status: "completed",
          mpStatus: "approved",
          amount: 199,
          payerEmail: "owner@test.com",
        }),
        hybridStatus: "converted",
      }),
      { merge: true }
    );
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "share_1",
        event: "mp_checkout_completed",
        metadata: expect.objectContaining({
          sku: "monthly",
          paymentId: "pay_1",
          amount: 199,
        }),
      })
    );
  });

  it("rejects an invalid signature before fetching payment or mutating state", async () => {
    const { sessionRef } = setupDb();

    const res = await POST(
      webhookRequest({ signatureValue: "not-a-valid-signature" }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid signature");
    expect(fetchMpPayment).not.toHaveBeenCalled();
    expect(sessionRef.set).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("does not convert when the internal SKU mismatches the existing checkout intent", async () => {
    const { sessionRef } = setupDb({
      checkout: {
        internalId: "hybrid_quarterly_v1",
        amount: 199,
        currency: "MXN",
      },
    });

    const res = await POST(webhookRequest() as never);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe("SKU mismatch");
    expect(sessionRef.set).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("does not convert when the approved payment amount mismatches the configured SKU", async () => {
    const { sessionRef } = setupDb();
    vi.mocked(fetchMpPayment).mockResolvedValueOnce(
      approvedPayment({ transaction_amount: 999 }) as never
    );

    const res = await POST(webhookRequest() as never);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe("Amount mismatch");
    expect(sessionRef.set).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("does not convert when the approved payment currency mismatches the configured SKU", async () => {
    const { sessionRef } = setupDb();
    vi.mocked(fetchMpPayment).mockResolvedValueOnce(
      approvedPayment({ currency_id: "USD" }) as never
    );

    const res = await POST(webhookRequest() as never);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe("Currency mismatch");
    expect(sessionRef.set).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("treats an already completed payment as idempotent", async () => {
    const { sessionRef } = setupDb({
      checkout: {
        paymentId: "pay_1",
        status: "completed",
        internalId: "hybrid_monthly_v1",
        amount: 199,
        currency: "MXN",
      },
    });

    const res = await POST(webhookRequest() as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.alreadyProcessed).toBe(true);
    expect(sessionRef.set).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
