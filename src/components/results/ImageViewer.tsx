"use client"

import React, { useMemo, useState } from "react"
import type { InsightsResult } from "@/types/ai"
import { Card, CardContent } from "@/components/shadcn/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs"
import { Button } from "@/components/shadcn/ui/button"
import { OverlayImage } from "@/components/OverlayImage"
import { Minimap } from "@/components/Minimap"

export type StepKey = "m0" | "m4" | "m8" | "m12"

export function ImageViewer({
  ai,
  imageUrls,
  defaultStep = "m0",
}: {
  ai: InsightsResult
  imageUrls: { originalUrl?: string; images?: Partial<Record<StepKey, string>> }
  defaultStep?: StepKey
}) {
  const [step, setStep] = useState<StepKey>(defaultStep)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showGrid, setShowGrid] = useState(false)

  const steps: StepKey[] = ["m0", "m4", "m8", "m12"]
  const currentSrc = useMemo(() => {
    const preferred = imageUrls?.images?.[step]
    return preferred || imageUrls?.originalUrl || ""
  }, [imageUrls, step])

  const currentPoints = showOverlay ? ai?.overlays?.[step] : undefined

  return (
    <Card>
      <CardContent className="space-y-3">
        <Tabs value={step} onValueChange={(v) => setStep(v as StepKey)}>
          <TabsList className="w-full grid grid-cols-4">
            {steps.map((k) => (
              <TabsTrigger key={k} value={k}>{k.toUpperCase()}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          {/* Optional subtle grid overlay */}
          <div className={showGrid ? "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(109,0,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,0,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] rounded-2xl z-10" : "hidden"} />

          <OverlayImage src={currentSrc} points={currentPoints} />
        </div>

        <div className="flex items-center gap-2">
<Button variant="ghost" onClick={() => setShowOverlay((v) => !v)}>
            {showOverlay ? "Ocultar anotaciones" : "Mostrar anotaciones"}
          </Button>
<Button variant="ghost" onClick={() => setShowGrid((v) => !v)}>
            {showGrid ? "Ocultar guía" : "Mostrar guía"}
          </Button>
          {currentSrc && (
            <a href={currentSrc} download className="ml-auto">
<Button variant="outline">Descargar</Button>
            </a>
          )}
        </div>

        <div className="opacity-80">
          <Minimap src={currentSrc} points={currentPoints} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {steps.map((k) => {
            const src = imageUrls?.images?.[k] || imageUrls?.originalUrl || ""
            return (
              <button
                key={k}
                type="button"
                onClick={() => setStep(k)}
                className={`relative aspect-[4/5] overflow-hidden rounded-xl border ${step===k ? 'border-primary' : 'border-border'}`}
                aria-label={`Vista ${k.toUpperCase()}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {src ? (<img src={src} alt={k} className="w-full h-full object-cover" />) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
