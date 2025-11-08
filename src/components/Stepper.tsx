"use client";

import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Foto" },
  { id: 3, label: "Resumen" },
] as const;

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center justify-between gap-4 text-sm">
      {steps.map((step, idx) => {
        const isActive = current === step.id;
        const isCompleted = current > step.id;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                isActive && "border-primary text-primary",
                isCompleted && "border-primary bg-primary/10 text-primary",
                !isActive && !isCompleted && "border-border text-muted-foreground"
              )}
            >
              {step.id}
            </div>
            <span className={cn("font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
            {idx < steps.length - 1 && (
              <span className="mx-4 hidden flex-1 border-t border-dashed border-border/70 sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
