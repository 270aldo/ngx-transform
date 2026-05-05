"use client";

import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";

interface EliteOptionCardProps {
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  idx?: number; // For animation delay
  imageSrc?: string;
  imageAlt?: string;
  icon?: LucideIcon;
  iconLabel?: string;
  overlayTone?: "violet" | "deep";
  compact?: boolean;
}

/**
 * Selectable option card with NEOGEN-X DS styling.
 *  - Idle: subtle glass + white-8 border
 *  - Selected: 2px purple LEFT border (DS signature) + soft glow
 *  - Title is sans-serif bold uppercase (no italic display)
 *  - Eyebrow uses .ngx-eyebrow tokens
 */
export function EliteOptionCard({
  title,
  description,
  selected = false,
  onClick,
  className,
  idx = 0,
  imageSrc,
  imageAlt,
  icon: Icon,
  iconLabel,
  overlayTone = "violet",
  compact = false,
}: EliteOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={imageAlt || title}
      aria-pressed={selected}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-l-2 border transition-all duration-200 active:scale-[0.98] animate-in fade-in zoom-in slide-in-from-bottom-4 fill-mode-backwards text-left w-full",
        selected
          ? "border-l-[var(--ngx-purple)] border-y-[var(--ngx-purple)]/30 border-r-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/[0.06] shadow-[var(--ngx-glow-primary-soft)]"
          : "border-l-transparent border-white/[0.08] bg-white/[0.025] hover:border-l-[var(--ngx-purple-light)] hover:border-white/[0.18] hover:bg-white/[0.04]",
        className
      )}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Optional background image with gradient overlay */}
      {imageSrc && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-35"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div
            className={cn(
              "absolute inset-0",
              overlayTone === "deep"
                ? "bg-gradient-to-b from-[#050505]/30 via-[#050505]/80 to-[#050505]/95"
                : "bg-gradient-to-b from-[var(--ngx-purple)]/[0.08] via-[#050505]/75 to-[#050505]/95"
            )}
          />
        </div>
      )}

      {/* Selected check pill */}
      <span
        className={cn(
          "absolute top-3 right-3 flex w-6 h-6 rounded-full items-center justify-center transition-all duration-200",
          selected
            ? "bg-[var(--ngx-purple)] opacity-100 scale-100"
            : "bg-white/[0.04] border border-white/[0.10] opacity-0 scale-75 group-hover:opacity-100"
        )}
      >
        <Check size={12} className="text-white" />
      </span>

      <div
        className={cn(
          "relative h-full flex flex-col justify-between gap-4",
          compact ? "p-4" : "p-5"
        )}
      >
        <div>
          {idx ? (
            <span className="block mb-3 ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
              Opción {String(idx).padStart(2, "0")}
            </span>
          ) : null}
          <h3
            className={cn(
              "font-body font-bold uppercase text-lg leading-tight tracking-[-0.005em] transition-colors duration-200",
              selected ? "text-white" : "text-white/85 group-hover:text-white"
            )}
          >
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm font-body leading-relaxed text-white/55 group-hover:text-white/70 transition-colors">
              {description}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/[0.10] bg-black/35 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase font-mono text-white/75">
            <Icon size={12} className="text-[var(--ngx-purple-light)]" />
            <span>{iconLabel ?? "Misión elite"}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}
