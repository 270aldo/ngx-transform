"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectOption = { label: string; value: string };

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value?: string;
  onChange?: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("w-full h-10 rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-100 flex items-center justify-between", open && "ring-2 ring-emerald-500")}
      >
        <span className={cn(!selected && "text-neutral-500")}>{selected?.label || placeholder || "Seleccionar"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-neutral-400"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 shadow-lg max-h-56 overflow-auto">
          {options.map((o) => (
            <button
              key={o.value}
              className={cn("w-full text-left px-3 py-2 text-sm hover:bg-neutral-900", o.value === value && "bg-neutral-900 text-emerald-400")}
              onClick={() => { onChange?.(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
