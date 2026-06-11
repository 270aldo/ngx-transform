import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AgentBridgeCTA booking link (fix-22 #75)", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/AgentBridgeCTA.tsx"),
    "utf8",
  );

  it("guards against opening a blank tab when no booking URL is configured", () => {
    expect(source).toContain("if (!bookingUrl)");
  });

  it("opens the booking URL synchronously with noopener", () => {
    expect(source).toMatch(
      /window\.open\(bookingUrl, "_blank", "noopener,noreferrer"\)/,
    );
  });
});
