import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("HybridOfferV2 telemetry compatibility", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/results/HybridOfferV2.tsx"),
    "utf8"
  );

  it("maps v2 click events before sending to the legacy hybrid-offer webhook endpoint", () => {
    expect(source).toContain("HYBRID_OFFER_WEBHOOK_EVENTS");
    expect(source).toContain('calendly_v2_clicked: "hybrid_offer_calendly_click"');
    expect(source).toContain('whatsapp_v2_clicked: "hybrid_offer_whatsapp_click"');
    expect(source).toContain("event: webhookEvent");
  });
});

