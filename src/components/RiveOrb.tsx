"use client";

import { useEffect, useRef, useState } from "react";
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from "@rive-app/react-canvas";
import { cn } from "@/lib/utils";

// Self-host Rive's WASM so we don't depend on external CDNs (CSP-friendly,
// also avoids latency hits from jsdelivr/unpkg).
RuntimeLoader.setWasmUrl("/rive.wasm");

interface RiveOrbProps {
  /** Max pixel size on desktop. Scales down on mobile via clamp(). */
  size?: number;
  /** Min size on small viewports. Default 180. */
  minSize?: number;
  /** Viewport-relative size between min and max. Default 48vw. */
  fluid?: string;
  className?: string;
  /** Optional center overlay (e.g. progress percentage). */
  children?: React.ReactNode;
}

/**
 * GENESIS orb — Rive-powered ambient animation rendered above a soft purple halo.
 * The wrapper applies mix-blend-mode + circular clip so the artboard's dark
 * background fades into the page bg cleanly. Falls back to a static ring if
 * the .riv asset fails to load.
 */
export function RiveOrb({
  size = 280,
  minSize = 180,
  fluid = "48vw",
  className,
  children,
}: RiveOrbProps) {
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const riveWrapperRef = useRef<HTMLDivElement>(null);
  const [renderedSize, setRenderedSize] = useState(size);

  const { rive, RiveComponent } = useRive({
    src: "/orb.riv",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoadError: () => setHasError(true),
  });

  // Track the rendered container size so the Rive canvas matches.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setRenderedSize(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rive's runtime sets the canvas inline style to width:0/height:0; manually
  // size it to match the container, then resize the drawing surface so the
  // animation actually renders at the expected pixel dimensions (with DPR).
  useEffect(() => {
    const canvas = riveWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    canvas.style.width = `${renderedSize}px`;
    canvas.style.height = `${renderedSize}px`;
    if (rive) rive.resizeDrawingSurfaceToCanvas();
  }, [rive, renderedSize]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex-shrink-0", className)}
      style={{
        width: `clamp(${minSize}px, ${fluid}, ${size}px)`,
        aspectRatio: "1 / 1",
      }}
      aria-hidden
    >
      {/* Soft halo behind the orb */}
      <div
        className="pointer-events-none absolute inset-[-15%] rounded-full blur-[80px]"
        style={{ background: "radial-gradient(closest-side, rgba(109,0,255,0.55), rgba(109,0,255,0.18) 55%, transparent 80%)" }}
      />

      {/* Rive orb — radial mask fades the artboard's dark edges into
          transparent so the orb floats without a visible canvas circle.
          Plus-lighter blend additionally suppresses any residual dark.
          Style on the wrapper because Rive's runtime overrides the
          <canvas> inline style. */}
      {!hasError ? (
        <div
          ref={riveWrapperRef}
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
      ) : (
        // Fallback: static ring + pulse if .riv fails to load
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div
            className="h-[70%] w-[70%] rounded-full"
            style={{
              border: "2px solid rgba(109,0,255,0.45)",
              boxShadow: "0 0 60px rgba(109,0,255,0.35), inset 0 0 40px rgba(109,0,255,0.20)",
            }}
          />
        </div>
      )}

      {/* Optional centered overlay (e.g. percentage) */}
      {children ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
