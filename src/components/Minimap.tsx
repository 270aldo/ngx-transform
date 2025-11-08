"use client";

import { cn } from "@/lib/utils";

type Point = { x: number; y: number; label: string };

export function Minimap({ src, points }: { src?: string; points?: Point[] }) {
  return (
    <div className={cn("relative rounded-xl border border-border/70 bg-card/80 p-3", !src && "aspect-[4/5]") }>
      {src ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="minimap" className="block h-32 w-full rounded-lg object-cover" />
          {points?.map((p, idx) => (
            <span
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/80 bg-primary/70 px-1 text-[10px] text-white shadow"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            >
              {idx + 1}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Sin miniatura
        </div>
      )}
      {points && points.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {points.map((p, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/80 text-[10px] text-white">
                {idx + 1}
              </span>
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
