"use client";

import { cn } from "@/lib/utils";

export interface WizardStageTab {
  id: number;
  short: string;
}

interface WizardProgressTabsProps {
  tabs: readonly WizardStageTab[];
  current: number;
}

export function WizardProgressTabs({ tabs, current }: WizardProgressTabsProps) {
  const totalSteps = tabs.length;
  const progressPct = Math.round((current / totalSteps) * 100);

  return (
    <>
      {/* Desktop: full pills */}
      <div className="hidden md:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1.5">
        {tabs.map((tab) => {
          const isActive = current === tab.id;
          const isDone = current > tab.id;
          return (
            <span
              key={tab.id}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-mono transition-all",
                isActive
                  ? "bg-[var(--ngx-purple)] text-white shadow-[0_0_18px_rgba(109,0,255,0.3)]"
                  : isDone
                    ? "bg-[var(--ngx-purple-dim)] text-[var(--ngx-purple-light)]"
                    : "text-white/35"
              )}
            >
              {tab.short}
            </span>
          );
        })}
      </div>

      {/* Mobile: counter + thin progress bar */}
      <div className="md:hidden flex flex-col items-end gap-1.5 min-w-[88px]">
        <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-white/55">
          {current} / {totalSteps}
        </span>
        <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
              boxShadow: "0 0 8px rgba(109,0,255,0.4)",
            }}
          />
        </div>
      </div>
    </>
  );
}
