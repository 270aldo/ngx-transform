import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("RiveOrb mobile gating + code-split (fix-21)", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/RiveOrb.tsx"),
    "utf8",
  );

  it("loads the Rive runtime via next/dynamic with a static fallback", () => {
    expect(source).toContain("next/dynamic");
    expect(source).toContain("RiveOrbAnimated");
    expect(source).toContain("ssr: false");
    expect(source).toContain("StaticOrbRing");
  });

  it("gates animation on connection quality / viewport, not always-on", () => {
    expect(source).toContain("effectiveType");
    expect(source).toContain("saveData");
    expect(source).toContain("innerWidth >= 768");
  });

  it("keeps @rive-app off the static path (it lives in the dynamic chunk)", () => {
    // No static import of the runtime; it's only in RiveOrbAnimated's chunk.
    expect(source).not.toContain('from "@rive-app');
  });
});
