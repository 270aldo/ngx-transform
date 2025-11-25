"use client";

import React, { useState } from "react";
import type { InsightsResult } from "@/types/ai";
import { OverlayImage } from "@/components/OverlayImage";
import { Minimap } from "@/components/Minimap";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";

type StepKey = "m0" | "m4" | "m8" | "m12";

export function TimelineViewer({
  ai,
  imageUrls,
}: {
  ai: InsightsResult;
  imageUrls: { originalUrl?: string; images?: Partial<Record<StepKey, string>> };
}) {
  const [step, setStep] = useState<StepKey>("m0");
  const steps: StepKey[] = ["m0", "m4", "m8", "m12"];

  const currentPoints = ai.overlays?.[step];
  const preferred = imageUrls.images?.[step];
  const imgSrc = preferred || imageUrls.originalUrl || "";

  const entry = ai.timeline[step];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-3">
        <Tabs value={step} onValueChange={(k) => setStep(k as StepKey)}>
          <TabsList className="w-full grid grid-cols-4">
            {steps.map((k) => (
              <TabsTrigger key={k} value={k}>{k.toUpperCase()}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <OverlayImage src={imgSrc} points={currentPoints} />
        <div className="opacity-80">
          <Minimap src={imgSrc} points={currentPoints} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid gap-4">
          {/* Split View: Physical vs Mental */}
          <div className="grid grid-cols-2 gap-4">
            {/* Physical Column */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Físico</h3>
                <p className="text-sm text-neutral-200">{entry?.focus}</p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Expectativas</h3>
                <ul className="space-y-1.5">
                  {entry?.expectations?.map((e, i) => (
                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="text-[#6D00FF] mt-0.5">→</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mental Column - The "Soul" (Subtle but distinct) */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#6D00FF]/5 border border-[#6D00FF]/20">
                <h3 className="text-xs font-medium text-[#6D00FF] uppercase tracking-wider mb-2">Mentalidad</h3>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {entry?.mental || "Enfoque en la constancia y la resiliencia mental."}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Riesgos</h3>
                <ul className="space-y-1.5">
                  {entry?.risks?.map((e, i) => (
                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5">⚠</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
