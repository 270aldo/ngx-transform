import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("P1 launch security invariants", () => {
  it("protects session-mutating public API routes with owner authorization", () => {
    for (const path of [
      "src/app/api/sessions/[shareId]/classify/route.ts",
      "src/app/api/events/hybrid-offer/route.ts",
      "src/app/api/feedback/route.ts",
      "src/app/api/brief/send/route.ts",
      "src/app/api/checkout/create-preference/route.ts",
    ]) {
      expect(source(path), path).toContain("requireSessionOwner");
    }
  });

  it("allows session deletion through owner auth instead of unreachable delete tokens only", () => {
    const route = source("src/app/api/sessions/[shareId]/route.ts");

    expect(route).toContain("requireSessionOwner");
    expect(route).toContain("validateDeleteToken");
    expect(route).toContain("owner auth is the primary path");
  });

  it("keeps public telemetry untrusted by default", () => {
    const route = source("src/app/api/telemetry/route.ts");
    const telemetry = source("src/lib/telemetry.ts");

    expect(route).toContain("trusted: false");
    expect(telemetry).toContain("trusted");
    expect(telemetry).toContain("updateSessionMetrics");
  });

  it("requires owner tokens from client-side launch-critical actions", () => {
    const voice = source("src/components/results/HybridVoiceAgent.tsx");
    const offer = source("src/components/results/HybridOfferV2.tsx");
    const nps = source("src/components/results/NPSQuick.tsx");

    expect(voice).toContain("Authorization: `Bearer ${token}`");
    expect(offer).toContain("Authorization: `Bearer ${token}`");
    expect(nps).toContain("Authorization: `Bearer ${token}`");
  });
});
