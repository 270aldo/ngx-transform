import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getHybridSkuConfig } from "./mercadoPago";

/**
 * Locks in the single-payment contract: Checkout Pro is a one-time charge, so no
 * SKU description may promise recurrence ("Renovable" / "continuo"). See fix-05.
 */
describe("getHybridSkuConfig — single-payment framing", () => {
  const KEYS = [
    "NEXT_PUBLIC_HYBRID_PRICE_MONTHLY",
    "NEXT_PUBLIC_HYBRID_PRICE_QUARTERLY",
    "NEXT_PUBLIC_HYBRID_PRICE_ANNUAL",
    "NEXT_PUBLIC_HYBRID_LABEL_MONTHLY",
    "NEXT_PUBLIC_HYBRID_LABEL_QUARTERLY",
    "NEXT_PUBLIC_HYBRID_LABEL_ANNUAL",
  ];
  const SKUS = ["monthly", "quarterly", "annual"] as const;
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = {};
    for (const k of KEYS) saved[k] = process.env[k];
    process.env.NEXT_PUBLIC_HYBRID_PRICE_MONTHLY = "199";
    process.env.NEXT_PUBLIC_HYBRID_PRICE_QUARTERLY = "499";
    process.env.NEXT_PUBLIC_HYBRID_PRICE_ANNUAL = "1799";
    // Clear label overrides so the DEFAULT_DESCRIPTIONS under test are used.
    delete process.env.NEXT_PUBLIC_HYBRID_LABEL_MONTHLY;
    delete process.env.NEXT_PUBLIC_HYBRID_LABEL_QUARTERLY;
    delete process.env.NEXT_PUBLIC_HYBRID_LABEL_ANNUAL;
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("no SKU description promises recurrence", () => {
    for (const sku of SKUS) {
      const cfg = getHybridSkuConfig(sku);
      expect(cfg).not.toBeNull();
      expect(cfg!.description).not.toMatch(/Renovable/i);
      expect(cfg!.description).not.toMatch(/continuo/i);
    }
  });

  it("every SKU declares a single payment", () => {
    for (const sku of SKUS) {
      expect(getHybridSkuConfig(sku)!.description).toContain("Pago único");
    }
  });

  it("returns null when the price is not configured (never charges $0)", () => {
    delete process.env.NEXT_PUBLIC_HYBRID_PRICE_MONTHLY;
    expect(getHybridSkuConfig("monthly")).toBeNull();
  });
});
