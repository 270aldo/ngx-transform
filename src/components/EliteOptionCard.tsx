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
    <div
      onClick={onClick}
      role="button"
      aria-label={imageAlt || title}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-[24px] border transition-all duration-300 active:scale-95 animate-in fade-in zoom-in slide-in-from-bottom-4 fill-mode-backwards",
        selected
          ? "border-[#6D00FF]/55 bg-[#11081C] shadow-[0_0_30px_rgba(109,0,255,0.22)] scale-[1.01]"
          : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06] hover:scale-[1.01]",
        className
      )}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {imageSrc && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-40"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div
            className={cn(
              "absolute inset-0",
              overlayTone === "deep"
                ? "bg-gradient-to-b from-[#050505]/20 via-[#050505]/75 to-[#050505]/95"
                : "bg-gradient-to-b from-[#6D00FF]/10 via-[#050505]/70 to-[#050505]/95"
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          selected ? "bg-[#6D00FF]/14" : "bg-transparent"
        )}
      />

      <div className="absolute inset-0 opacity-[0.12] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />

      <div
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300",
          selected
            ? "bg-[#6D00FF] border-[#6D00FF] opacity-100 scale-100"
            : "border-white/15 bg-black/20 opacity-0 scale-75 group-hover:opacity-100"
        )}
      >
        <Check size={12} className="text-white" />
      </div>

      <div
        className={cn(
          "relative h-full flex flex-col justify-between",
          compact ? "p-4" : "p-5"
        )}
      >
        <div>
          {idx ? (
            <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-white/38">
              Opción {String(idx).padStart(2, "0")}
            </p>
          ) : null}
          <h3
            className={cn(
              "font-body text-[1.3rem] font-black italic uppercase tracking-[-0.05em] leading-[0.95] transition-colors duration-300",
              selected ? "text-white" : "text-white/80 group-hover:text-white"
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-3 text-sm text-neutral-300/90 font-body leading-relaxed group-hover:text-neutral-200 transition-colors">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {Icon ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase font-mono text-white/80">
              <Icon size={14} className="text-[#B98CFF]" />
              <span>{iconLabel ?? "Misión elite"}</span>
            </div>
          ) : null}

          <div
            className={cn(
              "h-px w-full transition-all duration-500 rounded-full",
              selected ? "bg-[#6D00FF]/80 shadow-[0_0_10px_#6D00FF]" : "bg-white/10 group-hover:bg-white/20"
            )}
          />
        </div>
      </div>
    </div>
  );
}
