"use client";

import React from "react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/shadcn/ui/tooltip";

type Point = { x: number; y: number; label: string };

export function OverlayImage({ src, points }: { src?: string; points?: Point[] }) {
  const hasImage = !!src;
  return (
<div className="relative w-full max-w-xl rounded-2xl border border-border overflow-hidden bg-card">
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="preview" className="w-full h-auto" />
      ) : (
        <div className="aspect-[4/5] w-full bg-[radial-gradient(circle_at_30%_20%,rgba(109,0,255,0.15),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(91,33,182,0.2),transparent_50%)] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-[#6D00FF]/20 flex items-center justify-center">
              <span className="block w-5 h-5 rounded bg-[#6D00FF]" />
            </div>
            <p className="text-neutral-400 text-sm">Sin imagen (demo)</p>
          </div>
        </div>
      )}
      {hasImage && (
        <TooltipProvider>
          {points?.map((p, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block w-3 h-3 rounded-full bg-[#6D00FF] shadow-[0_0_10px_rgba(109,0,255,0.6)]" />
                </TooltipTrigger>
                <TooltipContent>{p.label}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      )}
    </div>
  );
}
