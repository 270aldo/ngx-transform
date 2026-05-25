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
    violet: "0 0 10px rgba(109, 0, 255, 0.24)",
    emerald: "0 0 10px rgba(0, 245, 170, 0.22)",
    amber: "0 0 10px rgba(255, 217, 61, 0.20)",
    blue: "0 0 10px rgba(33, 150, 243, 0.20)",
    red: "0 0 10px rgba(255, 107, 107, 0.20)",
  };
  const valueColor: Record<NonNullable<CyberSliderProps["trackColor"]>, string> = {
    violet: "var(--ngx-purple-light)",
    emerald: "var(--ngx-success)",
    amber: "var(--ngx-warning)",
    blue: "var(--ngx-blue)",
    red: "var(--ngx-error)",
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
        "rounded-[var(--ngx-r-card)] border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/[0.13]",
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <span
            className="ngx-eyebrow !text-[10px]"
            style={{ color: "var(--ngx-fg-3)" }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono font-bold text-2xl md:text-[1.65rem] tabular-nums leading-none tracking-normal"
            style={{ color: valueColor[trackColor] }}
          >
            {valueDisplay ?? props.value}
          </span>
          {suffix ? (
            <span
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--ngx-fg-4)" }}
            >
              {suffix}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 relative h-2.5 w-full">
        {/* Track base */}
        <div className="absolute inset-0 rounded-full bg-white/[0.06] border border-white/[0.04]" />
        {/* Track fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
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
            "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)]",
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
