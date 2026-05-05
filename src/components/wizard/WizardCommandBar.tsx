"use client";

import { ChevronLeft, Sparkles } from "lucide-react";
import { WizardProgressTabs, type WizardStageTab } from "./WizardProgressTabs";

interface WizardCommandBarProps {
  current: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  tabs: readonly WizardStageTab[];
  onBack: () => void;
  isDemoMode?: boolean;
}

/**
 * Single unified command bar for the wizard:
 *  [back] | [WIZARD PRIVADO + title + subtitle + paso N/4] | [progress tabs]
 *
 * Replaces the previous two separate floating capsules.
 */
export function WizardCommandBar({
  current,
  totalSteps,
  title,
  subtitle,
  tabs,
  onBack,
  isDemoMode = false,
}: WizardCommandBarProps) {
  return (
    <div className="fixed inset-x-0 top-3 z-50 px-3 md:top-6 md:px-4">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5 rounded-[var(--ngx-r-xl)] border border-[color:var(--ngx-border-subtle)] bg-black/55 px-3 py-3 md:px-4 md:py-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {/* Left: back button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[color:var(--ngx-border-subtle)] bg-black/35 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/75 transition-colors hover:bg-black/55 hover:text-white"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Atrás</span>
        </button>

        {/* Center: kicker + title + subtitle + step badge */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="ngx-icon-box hidden sm:flex h-10 w-10">
            <Sparkles size={18} className="text-[color:var(--ngx-purple-light)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
                Wizard privado
              </span>
              <span className="rounded-full border border-[color:var(--ngx-border-subtle)] bg-white/[0.04] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/55">
                Paso {current} / {totalSteps}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2 min-w-0">
              <span className="truncate text-sm md:text-base font-body font-bold text-white tracking-[-0.005em]">
                {title}
              </span>
              {isDemoMode ? (
                <span className="rounded-full border border-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--ngx-purple-light)]">
                  Demo
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 hidden md:block text-xs leading-relaxed text-white/45 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: progress tabs (desktop) / counter+bar (mobile) */}
        <WizardProgressTabs tabs={tabs} current={current} />
      </div>
    </div>
  );
}
