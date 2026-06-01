"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface CyberSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueDisplay?: string | number;
  suffix?: string;
  trackColor?: "violet" | "emerald" | "amber" | "blue" | "red";
}

/**
 * Slider with NEOGEN-X DS styling.
 * - Wrap uses ngx-glass surface tones (no per-component border/blur).
 * - Label is .ngx-eyebrow (mono uppercase purple-tinted).
 * - Value is JetBrains Mono tabular-nums (bold, not italic).
 * - Track fill uses CSS vars so accent colors stay token-bound.
 */
export function CyberSlider({
  label,
  valueDisplay,
  suffix = "",
  className,
  trackColor = "violet",
  ...props
}: CyberSliderProps) {
  const min = Number(props.min ?? 0);
  const max = Number(props.max ?? 100);
  const currentValue = Number(props.value ?? props.defaultValue ?? min);
  const progress =
    max > min ? Math.min(100, Math.max(0, ((currentValue - min) / (max - min)) * 100)) : 0;

  // Map color → fill gradient + accent color (CSS-native accent-color for thumb)
  const trackFill: Record<NonNullable<CyberSliderProps["trackColor"]>, string> = {
    violet: "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
    emerald: "linear-gradient(90deg, var(--ngx-success), #5EE2A8)",
    amber: "linear-gradient(90deg, var(--ngx-warning), #FFB347)",
    blue: "linear-gradient(90deg, var(--ngx-blue), #5BBFFF)",
    red: "linear-gradient(90deg, var(--ngx-error), #FF8B95)",
  };
  const trackGlow: Record<NonNullable<CyberSliderProps["trackColor"]>, string> = {
    violet: "0 0 8px rgba(109, 0, 255, 0.14)",
    emerald: "0 0 8px rgba(0, 245, 170, 0.12)",
    amber: "0 0 8px rgba(255, 217, 61, 0.12)",
    blue: "0 0 8px rgba(33, 150, 243, 0.12)",
    red: "0 0 8px rgba(255, 107, 107, 0.12)",
  };
  const valueColor: Record<NonNullable<CyberSliderProps["trackColor"]>, string> = {
    violet: "var(--ngx-white)",
    emerald: "var(--ngx-white)",
    amber: "var(--ngx-white)",
    blue: "var(--ngx-white)",
    red: "var(--ngx-white)",
  };
  const accentClass: Record<NonNullable<CyberSliderProps["trackColor"]>, string> = {
    violet: "[--accent:#9D4EDD]",
    emerald: "[--accent:#00F5AA]",
    amber: "[--accent:#FFD93D]",
    blue: "[--accent:#2196F3]",
    red: "[--accent:#FF6B6B]",
  };

  return (
    <div
      className={cn(
        "rounded-[14px] border border-[var(--lg-rim-regular)] bg-[var(--lg-glass-thin)] px-4 py-4 shadow-[var(--lg-shadow-inset)] transition-colors hover:border-[var(--lg-rim-strong)]",
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <span
            className="ngx-eyebrow !text-[11px]"
            style={{ color: "var(--ngx-fg-3)" }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-display text-2xl font-black tabular-nums leading-none tracking-[-0.02em] md:text-[1.65rem]"
            style={{ color: valueColor[trackColor] }}
          >
            {valueDisplay ?? props.value}
          </span>
          {suffix ? (
            <span
              className="font-display text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--ngx-fg-4)" }}
            >
              {suffix}
            </span>
          ) : null}
        </div>
      </div>

      {/* Wrapper is 44px tall for a comfortable touch target (a11y); the visual
          track stays thin (h-2.5) and vertically centered. The range input fills
          the wrapper, so its hit area is the full 44px. */}
      <div className="mt-3 relative h-11 w-full">
        {/* Track base */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-white/[0.06] border border-white/[0.04]" />
        {/* Track fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-2.5 rounded-full pointer-events-none"
          style={{
            width: `${progress}%`,
            background: trackFill[trackColor],
            boxShadow: trackGlow[trackColor],
          }}
        />

        <input
          type="range"
          className={cn(
            "absolute inset-0 z-10 w-full h-full bg-transparent appearance-none cursor-pointer focus:outline-none",
            "[&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-transparent",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/40",
            "[&::-webkit-slider-thumb]:bg-white",
            "[&::-webkit-slider-thumb]:shadow-[0_3px_12px_rgba(0,0,0,0.28)]",
            "[&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-125",
            // Native accent color on the thumb (Firefox + WebKit fallback)
            accentClass[trackColor],
            "accent-[var(--accent)]"
          )}
          {...props}
        />
      </div>
    </div>
  );
}
