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
        <div className="grid gap-3">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-semibold">Foco</h3>
            <p className="text-muted-foreground text-sm mt-1">{entry?.focus}</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-semibold">Expectativas</h3>
            <ul className="list-disc list-inside text-muted-foreground text-sm mt-1">
              {entry?.expectations?.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-semibold">Riesgos</h3>
            <ul className="list-disc list-inside text-muted-foreground text-sm mt-1">
              {entry?.risks?.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
