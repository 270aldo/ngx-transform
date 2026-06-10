"use client";

import { useEffect, useRef, useState } from "react";
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from "@rive-app/react-canvas";

// Self-host Rive's WASM so we don't depend on external CDNs (CSP-friendly).
// This lives here, in the dynamically-imported chunk, so the ~1.8MB wasm and
// the @rive-app/react-canvas runtime are never pulled on the static path.
RuntimeLoader.setWasmUrl("/rive.wasm");

/**
 * The heavy half of the GENESIS orb: the Rive runtime + the 8.9MB orb.riv
 * asset. Loaded via next/dynamic only when RiveOrb decides to animate (fast
 * connection / desktop). On a slow link, saveData, or a phone, it is never
 * imported, so neither the runtime JS nor the assets are fetched (fix-21).
 */
export function RiveOrbAnimated({ size = 280 }: { size?: number }) {
  const [hasError, setHasError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [renderedSize, setRenderedSize] = useState(size);

  const { rive, RiveComponent } = useRive({
    src: "/orb.riv",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setHasError(true),
  });

  // Track the rendered width so the Rive canvas matches the container.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setRenderedSize(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rive's runtime sets the canvas inline style to 0×0; size it to the
  // container and resize the drawing surface (with DPR).
  useEffect(() => {
    const canvas = rootRef.current?.querySelector("canvas");
    if (!canvas) return;
    canvas.style.width = `${renderedSize}px`;
    canvas.style.height = `${renderedSize}px`;
    if (rive) rive.resizeDrawingSurfaceToCanvas();
  }, [rive, renderedSize]);

  if (hasError) {
    // Same zero-weight ring the static path uses, if the asset fails mid-load.
    return (
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div
          className="h-[70%] w-[70%] rounded-full"
          style={{
            border: "2px solid rgba(109,0,255,0.45)",
            boxShadow:
              "0 0 60px rgba(109,0,255,0.35), inset 0 0 40px rgba(109,0,255,0.20)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative z-10 h-full w-full"
      style={{
        mixBlendMode: "plus-lighter",
        maskImage:
          "radial-gradient(circle at 50% 50%, black 0%, black 38%, transparent 62%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, black 0%, black 38%, transparent 62%)",
      }}
    >
      <RiveComponent />
    </div>
  );
}
