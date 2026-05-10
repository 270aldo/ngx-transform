import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoChat } from "./DemoChat";
import { AgentBadge } from "@/components/widgets/AgentBadge";
import type { AgentType } from "@/types/genesis";

const LEGACY_MODULE_NAMES = [
  "BLAZE",
  "ATLAS",
  "TEMPO",
  "SAGE",
  "MACRO",
  "METABOL",
  "WAVE",
  "NOVA",
  "LUNA",
  "SPARK",
  "STELLA",
  "LOGOS",
];

describe("DemoChat layout", () => {
  it("keeps quick actions in normal layout instead of sticky overlay", () => {
    const html = renderToStaticMarkup(
      <DemoChat shareId="demo" onComplete={() => undefined} />
    );

    expect(html).not.toContain("sticky bottom-0");
    expect(html).not.toContain("restantes");
  });

  it("does not render legacy module names in public chat markup", () => {
    const html = renderToStaticMarkup(
      <DemoChat shareId="demo" onComplete={() => undefined} />
    );

    for (const legacyName of LEGACY_MODULE_NAMES) {
      expect(html).not.toContain(legacyName);
    }
  });

  it("maps legacy widget agent badges to GENESIS capability labels", () => {
    const legacyAgents: AgentType[] = ["BLAZE", "SAGE", "WAVE", "LOGOS"];

    for (const agent of legacyAgents) {
      const html = renderToStaticMarkup(<AgentBadge agent={agent} />);
      expect(html).toContain("GENESIS");
      expect(html).not.toContain(agent);
    }
  });
});
