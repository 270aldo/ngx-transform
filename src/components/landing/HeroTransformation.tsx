"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Brain, ShieldCheck, Sparkles } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

interface HeroTransformationProps {
  className?: string;
  compact?: boolean;
}

/**
 * Hero comparison: dynamic before/after slider in a single framed canvas.
 * - Drag the vertical handle to reveal Season 3 progressively.
 * - Touch + mouse + keyboard (left/right arrows) supported.
 * - Falls back to a static layout if `transformationDemo` is missing.
 */
export function HeroTransformation({ className, compact = false }: HeroTransformationProps) {
  const { config } = useLandingConfig();
  const demo = config.copy.hero.transformationDemo;

  const [position, setPosition] = useState(compact ? 42 : 50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const next = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(next);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => updatePosition(e.clientX);
    const onUp = () => {
      setIsDragging(false);
      // Snap to 50% if very close (premium UX touch)
      setPosition((p) => (Math.abs(p - 50) <= 4 ? 50 : p));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
    if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 5));
  };

  return (
    <div
      className={`${compact ? "" : "animate-on-scroll-scale delay-400"} relative w-full ${className ?? ""}`}
    >
      <div className={`ngx-card ${compact ? "!p-2" : "!p-3 md:!p-4"}`}>
        <div className={`overflow-hidden ${compact ? "rounded-[18px]" : "rounded-[24px]"} border border-white/[0.08] bg-[#07070A]`}>
          {/* Top chrome — slim */}
          <div className={`flex items-center justify-between border-b border-white/[0.06] ${compact ? "px-3 py-2" : "px-5 py-3"}`}>
            <div className="flex items-center gap-3">
              <div
                className={`flex ${compact ? "h-8 w-8 rounded-xl" : "h-9 w-9 rounded-2xl"} items-center justify-center`}
                style={{
                  background: "rgba(109, 0, 255, 0.15)",
                  border: "1px solid rgba(109, 0, 255, 0.25)",
                }}
              >
                <Brain className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
              </div>
              <p className={`${compact ? "text-xs" : "text-sm"} font-bold text-white tracking-normal`}>Visualización GENESIS</p>
            </div>
            <span className={`${compact ? "hidden min-[380px]:inline-flex" : "inline-flex"} items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-white/55`}>
              <ShieldCheck className="h-3 w-3" />
              No compartida
            </span>
          </div>

          {/* Compare canvas */}
          <div
            ref={containerRef}
            className={`relative ${compact ? "aspect-[21/9] min-h-[150px]" : "aspect-[4/5]"} w-full select-none cursor-ew-resize touch-pan-y`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => {
              setIsDragging(false);
              setPosition((p) => (Math.abs(p - 50) <= 4 ? 50 : p));
            }}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-label="Comparativa entre punto de partida y Season 3. Arrastra para ver la transformación."
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            tabIndex={0}
          >
            {demo && demo.beforeImage && demo.afterImage ? (
              <>
                {/* AFTER (Season 3) — full layer underneath */}
                <Image
                  src={demo.afterImage}
                  alt={demo.afterLabel ?? "Season 3"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover object-center"
                />

                {/* BEFORE — clipped layer on top */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - position}% 0 0)`,
                    transition: isDragging ? "none" : "clip-path 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <Image
                    src={demo.beforeImage}
                    alt={demo.beforeLabel ?? "Punto de partida"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 540px"
                    className="object-cover object-center"
                  />
                </div>

                {/* Subtle gradient bottom for legibility */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Labels */}
                <span className={`pointer-events-none absolute ${compact ? "top-3 left-3" : "top-4 left-4"} inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/85`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  {demo.beforeLabel ?? "Punto de partida"}
                </span>
                <span
                  className={`pointer-events-none absolute ${compact ? "top-3 right-3" : "top-4 right-4"} inline-flex items-center gap-1.5 rounded-full backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.22em]`}
                  style={{
                    border: "1px solid rgba(109, 0, 255, 0.30)",
                    background: "rgba(109, 0, 255, 0.15)",
                    color: "var(--ngx-purple-light)",
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {demo.afterLabel ?? "Season 3"}
                </span>

                {/* Vertical divider + handle */}
                <div
                  className="pointer-events-none absolute inset-y-0 w-px bg-white/85 shadow-[0_0_24px_rgba(109,0,255,0.35)]"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-0.5px)",
                    transition: isDragging ? "none" : "left 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
                <div
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex ${compact ? "h-10 w-10" : "h-12 w-12"} items-center justify-center rounded-full border border-white/30 bg-black/70 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(109,0,255,0.4)]`}
                  style={{
                    left: `${position}%`,
                    transition: isDragging ? "none" : "left 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l-6-6 6-6" />
                    <path d="M15 6l6 6-6 6" />
                  </svg>
                </div>

                {/* Hint pill (bottom) */}
                <span className={`${compact ? "hidden sm:inline-flex" : "inline-flex"} pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-sm px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/65`}>
                  Arrastra para ver tu progresión
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0833] to-[#050505]">
                <Sparkles className="h-12 w-12 text-[#6D00FF]/40" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-6 blur-[90px] rounded-full -z-10" style={{ backgroundColor: "rgba(109, 0, 255, 0.10)" }} />
    </div>
  );
}
