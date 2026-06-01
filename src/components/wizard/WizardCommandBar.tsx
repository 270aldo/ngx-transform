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
    <div className="safe-area-mt-top fixed inset-x-0 top-3 z-50 px-3 md:top-5 md:px-4">
      <div className="ngx-wizard-commandbar mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 md:gap-5 md:px-4">
        {/* Left: back button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Atrás"
          className="ngx-wizard-glass-button inline-flex h-11 min-w-[44px] shrink-0 items-center gap-2 px-3"
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
              <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-purple-300)" }}>
                Wizard privado
              </span>
              <span className="ngx-wizard-step-chip px-2 py-0.5">
                Paso {current} / {totalSteps}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2 min-w-0">
              <span className="truncate font-display text-sm font-black uppercase leading-none text-white md:text-base">
                {title}
              </span>
              {isDemoMode ? (
                <span className="rounded-full border border-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/15 px-2 py-0.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--ngx-purple-light)]">
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
