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
      <div className="ngx-wizard-range-pills hidden xl:flex">
        {tabs.map((tab) => {
          const isActive = current === tab.id;
          const isDone = current > tab.id;
          return (
            <span
              key={tab.id}
              className={cn(
                "ngx-wizard-range-pill",
                isActive
                  ? "is-active"
                  : isDone
                    ? "is-done"
                    : ""
              )}
            >
              {tab.short}
            </span>
          );
        })}
      </div>

      {/* Mobile: counter + thin progress bar */}
      <div className="flex flex-col items-end gap-1.5 min-w-[88px] xl:hidden">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
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
