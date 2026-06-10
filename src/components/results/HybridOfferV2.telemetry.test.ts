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

  it("prioritizes HYBRID diagnostic and brief CTAs", () => {
    expect(source).toContain("Agendar diagnóstico HYBRID");
    expect(source).toContain("Recibir mi brief por correo");
    expect(source).toContain("Ver video del fundador");
    expect(source).toContain("Ayudas antes de decidir");
    expect(source).not.toContain("Cohorte abierta");
  });

  it("keeps direct checkout behind a public feature flag", () => {
    expect(source).toContain("NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT");
    expect(source).toContain("directCheckoutEnabled &&");
    expect(source).toContain("Compra directa opcional");
  });

  it("can route the founder video placeholder to the voice agent when enabled", () => {
    expect(source).toContain("NEXT_PUBLIC_FF_HYBRID_VOICE_AGENT");
    expect(source).toContain('document.getElementById("hybrid-voice-agent")');
    expect(source).toContain("onVoiceAgentFallback");
  });

  it("opens external CTAs synchronously in the gesture, never after an await (fix-22 iOS)", () => {
    // iOS Safari blocks window.open that runs after a network await. The popup
    // must fire in the same tick as the click; telemetry is fire-and-forget.
    expect(source).not.toMatch(/await\s+emitTelemetry\([^)]*\);\s*window\.open/);
    const opens = source.match(/window\.open\([^)]*\)/g) ?? [];
    expect(opens.length).toBeGreaterThan(0);
    for (const call of opens) {
      expect(call).toContain("noopener");
    }
  });
});
