import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("share results page lead magnet wiring", () => {
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/s/[shareId]/page.tsx"),
    "utf8"
  );

  it("uses the lead magnet result stack as the primary experience", () => {
    expect(pageSource).toContain("TransformationViewer2");
    expect(pageSource).toContain("surfaceMode=\"lead-magnet\"");
    expect(pageSource).toContain("MuscleHealthScore");
    expect(pageSource).toContain("TransformationSummary");
    expect(pageSource).toContain("SeasonRoadmap");
    expect(pageSource).toContain("HybridVoiceAgent");
    expect(pageSource).toContain("NEXT_PUBLIC_FF_HYBRID_VOICE_AGENT");
    expect(pageSource).toContain("GenesisTextChat");
    expect(pageSource).toContain("NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT");
    expect(pageSource).toContain("HybridOfferV2");
  });

  it("does not mount legacy dense result or feedback sections", () => {
    expect(pageSource).not.toContain("<SeasonVisionReport");
    expect(pageSource).not.toContain("<NPSQuick");
    expect(pageSource).not.toContain("<HybridOfferSection");
  });
});
