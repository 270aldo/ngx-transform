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
        "relative group cursor-pointer overflow-hidden rounded-[18px] border border-l-2 transition-all duration-200 active:scale-[0.98] animate-in fade-in zoom-in slide-in-from-bottom-4 fill-mode-backwards text-left w-full",
        selected
          ? "border-l-[var(--ngx-purple)] border-y-[var(--lg-rim-purple)] border-r-[var(--lg-rim-purple)] bg-[var(--lg-glass-purple)] shadow-[var(--lg-shadow-glass),var(--lg-shadow-inset-purple),var(--lg-glow-purple-sm)]"
          : "border-l-transparent border-[var(--lg-rim-regular)] bg-[var(--lg-glass-regular)] shadow-[var(--lg-shadow-glass),var(--lg-shadow-inset)] hover:border-l-[var(--ngx-purple)] hover:border-[var(--lg-rim-strong)] hover:bg-[var(--lg-glass-thick)]",
        className
      )}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Optional background image with gradient overlay */}
      {imageSrc && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.16] transition-opacity duration-300 group-hover:opacity-[0.24]"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div
            className={cn(
              "absolute inset-0",
              overlayTone === "deep"
                ? "bg-gradient-to-b from-[var(--ngx-navy-950)]/20 via-[var(--ngx-navy-950)]/72 to-[var(--ngx-navy-950)]/96"
                : "bg-gradient-to-b from-[var(--ngx-purple)]/[0.06] via-[var(--ngx-navy-950)]/72 to-[var(--ngx-navy-950)]/96"
            )}
          />
        </div>
      )}

      {/* Selected check pill */}
      <span
        className={cn(
          "absolute top-3 right-3 flex w-6 h-6 rounded-full items-center justify-center transition-all duration-200",
          selected
            ? "bg-[var(--ngx-purple)] opacity-100 scale-100 shadow-[var(--lg-glow-purple-sm)]"
            : "bg-[var(--lg-glass-thin)] border border-[var(--lg-rim-thin)] opacity-0 scale-75 group-hover:opacity-100"
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
            <span className="block mb-3 ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
              Opción {String(idx).padStart(2, "0")}
            </span>
          ) : null}
          <h3
            className={cn(
              "font-display text-lg font-black uppercase leading-[1.04] tracking-normal transition-colors duration-200",
              selected ? "text-white" : "text-white/85 group-hover:text-white"
            )}
          >
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm font-body leading-relaxed text-white/58 group-hover:text-white/74 transition-colors">
              {description}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--lg-rim-thin)] bg-[var(--lg-glass-thin)] px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
            <Icon size={12} className="text-[var(--ngx-purple-300)]" />
            <span>{iconLabel ?? "Misión elite"}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}
