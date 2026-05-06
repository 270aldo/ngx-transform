import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoChat } from "./DemoChat";

describe("DemoChat layout", () => {
  it("keeps quick actions in normal layout instead of sticky overlay", () => {
    const html = renderToStaticMarkup(
      <DemoChat shareId="demo" onComplete={() => undefined} />
    );

    expect(html).not.toContain("sticky bottom-0");
    expect(html).not.toContain("restantes");
  });
});
