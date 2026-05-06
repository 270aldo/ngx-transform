import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlanPreview } from "./PlanPreview";

describe("PlanPreview conversion layout", () => {
  it("shows the unlock comparison after the free day preview", () => {
    const html = renderToStaticMarkup(
      <PlanPreview shareId="demo" onUnlock={() => undefined} />
    );

    const checklistIndex = html.indexOf("Rutina Completa - Día 1");
    const ctaIndex = html.indexOf("Desbloquear mi plan completo");

    expect(checklistIndex).toBeGreaterThan(-1);
    expect(ctaIndex).toBeGreaterThan(checklistIndex);
  });
});
