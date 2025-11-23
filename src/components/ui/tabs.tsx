"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type TabItem = { key: string; label: string };

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  const idx = Math.max(0, items.findIndex((i) => i.key === value));
  const count = items.length || 1;
  const width = 100 / count;
  const left = width * idx;

  return (
    <div className={cn("relative inline-flex w-full max-w-xs select-none", className)}>
      <div className="relative flex w-full rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-300"
          style={{ width: `${width}%`, transform: `translateX(${left}%)`, background: "#6D00FF33" }}
        />
        {items.map((i) => (
          <button
            key={i.key}
            className={cn(
              "relative z-10 flex-1 px-3 py-2 text-sm",
              i.key === value ? "text-[#6D00FF]" : "text-neutral-300 hover:text-white"
            )}
            onClick={() => onChange(i.key)}
            type="button"
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}
