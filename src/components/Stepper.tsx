"use client";
import { cn } from "@/lib/utils";

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Foto" },
    { n: 3, label: "Datos" },
  ] as const;
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-3">
          <div className={cn(
            "h-8 px-3 rounded-full text-sm inline-flex items-center border",
            s.n <= current ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-neutral-900 border-neutral-800 text-neutral-400"
          )}>
            <span className="font-semibold mr-1">{s.n}</span> {s.label}
          </div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-neutral-800" />}
        </div>
      ))}
    </div>
  );
}
