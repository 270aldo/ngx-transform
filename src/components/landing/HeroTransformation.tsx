"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Brain, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

interface HeroTransformationProps {
  className?: string;
}

/**
 * Hero comparison: dynamic before/after slider in a single framed canvas.
 * - Drag the vertical handle to reveal week 12 progressively.
 * - Touch + mouse + keyboard (left/right arrows) supported.
 * - Falls back to a static layout if `transformationDemo` is missing.
 */
export function HeroTransformation({ className }: HeroTransformationProps) {
  const { config } = useLandingConfig();
  const demo = config.copy.hero.transformationDemo;

  const [position, setPosition] = useState(50);
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
    <div className={`animate-on-scroll-scale delay-400 relative w-full ${className ?? ""}`}>
      <div className="landing-surface rounded-[28px] p-3 md:p-4">
        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#07070A]">
          {/* Top chrome */}
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6D00FF]/15 border border-[#6D00FF]/25">
                <Brain className="h-4 w-4 text-[#B98CFF]" />
              </div>
              <div className="leading-tight">
                <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">briefing privado</p>
                <p className="text-sm font-semibold text-white">Visualización GENESIS</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              No compartida
            </span>
          </div>

          {/* Compare canvas */}
          <div
            ref={containerRef}
            className="relative aspect-[4/5] w-full select-none cursor-ew-resize touch-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => {
              setIsDragging(false);
              setPosition((p) => (Math.abs(p - 50) <= 4 ? 50 : p));
            }}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-label="Comparativa antes y semana 12. Arrastra para ver la transformación."
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            tabIndex={0}
          >
            {demo ? (
              <>
                {/* AFTER (week 12) — full layer underneath */}
                <Image
                  src={demo.afterImage}
                  alt={demo.afterLabel ?? "Semana 12"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover"
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
                    alt={demo.beforeLabel ?? "Antes"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 540px"
                    className="object-cover"
                  />
                </div>

                {/* Subtle gradient bottom for legibility */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Labels */}
                <span className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  {demo.beforeLabel ?? "Hoy"}
                </span>
                <span className="pointer-events-none absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-[#6D00FF]/30 bg-[#6D00FF]/15 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#C5A4FF]">
                  <Sparkles className="h-3 w-3" />
                  {demo.afterLabel ?? "Semana 12"}
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
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/70 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(109,0,255,0.4)]"
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
                <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                  Arrastra para ver tu progresión
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0833] to-[#050505]">
                <Sparkles className="h-12 w-12 text-[#6D00FF]/40" />
              </div>
            )}
          </div>

          {/* Bottom chrome — meta tags */}
          <div className="flex flex-wrap items-center gap-2 border-t border-white/6 bg-[#050505]/92 px-4 py-3 md:px-6">
            {[
              { icon: Brain, label: "Visualización GENESIS" },
              { icon: ShieldCheck, label: "Privado" },
              { icon: Zap, label: "4 etapas" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400"
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-6 bg-[#6D00FF]/10 blur-[90px] rounded-full -z-10" />
    </div>
  );
}
