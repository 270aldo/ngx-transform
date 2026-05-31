import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LandingProvider } from "./LandingProvider";
import { LandingJourney } from "./LandingJourney";

describe("LandingJourney Compact Liquid Glass narrative", () => {
  it("frames the below-fold landing as aspiration, insight and HYBRID direction", () => {
    const html = renderToStaticMarkup(
      <LandingProvider variant="general">
        <LandingJourney />
      </LandingProvider>
    );

    expect(html).toContain("Visualización aspiracional");
    expect(html).toContain("Lectura inicial");
    expect(html).toContain("Dirección de 12 semanas");
    expect(html).toContain("visualización aspiracional, no garantía.");
    expect(html).toContain("La imagen inspira. El sistema transforma. El humano sostiene.");
    expect(html).not.toContain("Privado por diseño");
    expect(html).not.toContain("La imagen puede incomodarte");
    expect(html).not.toContain("Entiendes qué te frena");
    expect(html).not.toContain("Lo que te frena");
  });

  it("keeps the HYBRID block to two main CTAs", () => {
    const html = renderToStaticMarkup(
      <LandingProvider variant="general">
        <LandingJourney />
      </LandingProvider>
    );

    expect(html).toContain("Agendar diagnóstico HYBRID");
    expect(html).toContain("Recibir mi brief por correo");
    expect(html).toContain("Ver video fundador");
    expect((html.match(/ngx-primary-cta/g) ?? []).length).toBe(1);
    expect((html.match(/ngx-secondary-cta/g) ?? []).length).toBe(1);
  });
});
