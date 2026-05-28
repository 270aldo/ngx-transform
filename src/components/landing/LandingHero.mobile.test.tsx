import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LandingProvider } from "./LandingProvider";
import { LandingHero } from "./LandingHero";

describe("LandingHero mobile conversion layout", () => {
  it("shows a mobile product preview before the primary CTA", () => {
    const html = renderToStaticMarkup(
      <LandingProvider variant="general">
        <LandingHero />
      </LandingProvider>
    );

    const subtitleIndex = html.indexOf("Sube una foto real");
    const previewIndex = html.indexOf('data-testid="mobile-hero-preview"');
    const ctaIndex = html.indexOf("Iniciar diagnóstico");

    expect(subtitleIndex).toBeGreaterThan(-1);
    expect(previewIndex).toBeGreaterThan(subtitleIndex);
    expect(previewIndex).toBeLessThan(ctaIndex);
  });

  it("frames the hero as aspirational possibility, not blocker diagnosis", () => {
    const html = renderToStaticMarkup(
      <LandingProvider variant="general">
        <LandingHero />
      </LandingProvider>
    );

    expect(html).toContain("Visualizas una posibilidad");
    expect(html).toContain("Una versión aspiracional, sin exagerar.");
    expect(html).not.toContain("Entiendes qué te frena");
    expect(html).not.toContain("Lo que te frena");
  });
});
