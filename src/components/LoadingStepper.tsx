"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStep {
  label: string;
  done: boolean;
  active: boolean;
}

interface LoadingStepperProps {
  steps: LoadingStep[];
  /** True when the pipeline has stopped on the active step (error). */
  failed?: boolean;
  className?: string;
}

/**
 * Compact stepper-timeline for the loading flow.
 * Mobile: vertical thin column with dot + label + connector line.
 * Desktop (md+): horizontal row with dots connected by a line.
 *
 * States per node:
 *  - done    → filled purple chip with check icon
 *  - active  → purple ring with subtle pulse halo (or amber if failed)
 *  - pending → muted ring
 */
export function LoadingStepper({ steps, failed = false, className }: LoadingStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: vertical compact list */}
      <ol className="flex flex-col gap-0 md:hidden">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const stoppedHere = failed && !step.done && step.active;
          return (
            <li key={step.label} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center" aria-hidden>
                <StepNode done={step.done} active={step.active} stopped={stoppedHere} />
                {!isLast ? (
                  <span
                    className={cn(
                      "w-px flex-1 transition-colors",
                      step.done ? "bg-[var(--ngx-purple)]/60" : "bg-white/10"
                    )}
                    style={{ minHeight: "1.75rem" }}
                  />
                ) : null}
              </div>
              <p
                className={cn(
                  "pb-6 pt-1 text-sm leading-tight transition-colors",
                  step.done
                    ? "text-white/85 font-medium"
                    : step.active && !failed
                      ? "text-white font-semibold"
                      : stoppedHere
                        ? "text-[color:var(--ngx-warning,#f97316)] font-semibold"
                        : "text-white/40"
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal row */}
      <ol className="hidden md:grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] items-start gap-0">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const stoppedHere = failed && !step.done && step.active;
          return (
            <li
              key={step.label}
              className="relative flex flex-col items-center text-center px-2"
              style={{ gridColumnStart: idx + 1 }}
            >
              {/* Connector to next node — drawn from this node's center to the next's */}
              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[14px] left-[calc(50%+18px)] right-[calc(-50%+18px)] h-px transition-colors",
                    steps[idx + 1].done || step.done ? "bg-[var(--ngx-purple)]/60" : "bg-white/10"
                  )}
                />
              ) : null}
              <StepNode done={step.done} active={step.active} stopped={stoppedHere} />
              <p
                className={cn(
                  "mt-3 text-xs leading-snug transition-colors max-w-[12ch]",
                  step.done
                    ? "text-white/85 font-medium"
                    : step.active && !failed
                      ? "text-white font-semibold"
                      : stoppedHere
                        ? "text-[color:var(--ngx-warning,#f97316)] font-semibold"
                        : "text-white/40"
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepNode({
  done,
  active,
  stopped,
}: {
  done: boolean;
  active: boolean;
  stopped: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300",
        done
          ? "border-[var(--ngx-purple)] bg-[var(--ngx-purple)] shadow-[var(--ngx-glow-primary-soft)]"
          : active && !stopped
            ? "border-[var(--ngx-purple)] bg-[var(--ngx-purple)]/15"
            : stopped
              ? "border-[color:var(--ngx-warning,#f97316)] bg-[color:var(--ngx-warning,#f97316)]/15"
              : "border-white/20 bg-white/[0.03]"
      )}
    >
      {/* Pulse halo for active state */}
      {active && !done && !stopped ? (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            backgroundColor: "var(--ngx-purple)",
            opacity: 0.35,
          }}
        />
      ) : null}

      {done ? (
        <Check className="relative z-10 h-3.5 w-3.5 text-white" strokeWidth={3} />
      ) : active && !stopped ? (
        <span
          className="relative z-10 h-2 w-2 rounded-full"
          style={{ backgroundColor: "var(--ngx-purple-light)" }}
        />
      ) : stopped ? (
        <span
          className="relative z-10 h-2 w-2 rounded-full"
          style={{ backgroundColor: "var(--ngx-warning, #f97316)" }}
        />
      ) : null}
    </span>
  );
}
