"use client";
import type { InsightsResult } from "@/types/ai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TimelineViewer } from "@/components/TimelineViewer";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { ImageViewer } from "@/components/results/ImageViewer";
import { InsightsCard } from "@/components/results/InsightsCard";
import { ActionsCard } from "@/components/results/ActionsCard";
import { ProfileSummaryCard } from "@/components/results/ProfileSummaryCard";

// Demo page rendered on client for interactive sub‑nav and skeletons

const mock: InsightsResult = {
  insightsText: `Resumen NGX (demo)
- Progresos esperados conservadores.
- Enfoque en técnica, fuerza base y hábitos.
- Recordatorio: no es consejo médico.`,
  timeline: {
    m0: { month: 0, focus: "Evaluación inicial, técnica y hábitos", expectations: ["Aprender patrones básicos", "Rutina sostenible"], risks: ["Sobrecarga inicial", "Falta de adherencia"] },
    m4: { month: 4, focus: "Fuerza base y composición", expectations: ["Mejoras de fuerza 10-20%", "Energía diaria"], risks: ["Saltarse recuperación", "Estancamiento"] },
    m8: { month: 8, focus: "Volumen inteligente y consistencia", expectations: ["Mayor tolerancia a volumen", "Postura/mejores patrones"], risks: ["Sobrentrenamiento"] },
    m12: { month: 12, focus: "Consolidación y métricas claras", expectations: ["Fuerza +20-40% (variabilidad)", "Hábitos consolidados"], risks: ["Desmotivación por comparaciones"] },
  },
  overlays: {
    m0: [ { x: 0.5, y: 0.2, label: "Postura" }, { x: 0.5, y: 0.55, label: "Core" } ],
    m4: [ { x: 0.52, y: 0.18, label: "Cuello relajado" }, { x: 0.5, y: 0.58, label: "Respiración" } ],
    m8: [ { x: 0.48, y: 0.19, label: "Hombros" }, { x: 0.5, y: 0.6, label: "Estabilidad" } ],
    m12:[ { x: 0.5, y: 0.17, label: "Alineación" }, { x: 0.5, y: 0.58, label: "Control" } ],
  },
};

export default function DemoResultPage() {
  // En demo: usamos placeholder (sin URLs firmadas)
  const imageUrls = { } as const;
  const profile = { age: 28, sex: "male", heightCm: 178, weightKg: 78, level: "intermedio", goal: "definicion", weeklyTime: 4 } as const;
  const [loading, setLoading] = useState(true);
  // Loading breve para skeletons y animaciones suaves
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  // Active section highlight via IntersectionObserver
  const [active, setActive] = useState<string>("resumen");
  useEffect(() => {
    const ids = ["resumen", "proyeccion", "recs", "pasos"];
    const obs = new IntersectionObserver(
      (entries) => {
        // pick most visible
        const vis = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis?.target?.id) setActive(vis.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.1, 0.25, 0.5, 0.75]}
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3">
          <div>
<h1 className="text-2xl font-medium">Resultados (Demo)</h1>
            <p className="text-neutral-400 text-sm">Proyección visual por etapas y acciones concretas</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/wizard" className="inline-flex bg-neutral-900 border border-[#6D00FF]/60 text-white rounded-md px-3 py-1.5 text-sm hover:bg-neutral-900 shadow-[0_0_10px_rgba(109,0,255,0.6)]">Nuevo análisis</Link>
            <Link href="/" className="inline-flex bg-[#6D00FF] text-white rounded-md px-3 py-1.5 text-sm hover:brightness-110 shadow-[0_0_10px_rgba(109,0,255,0.6)]">Inicio</Link>
          </div>
        </div>

        {/* Sub‑nav (chips) como Tabs shadcn */}
        <nav className="sticky top-14 z-10 -mt-2 bg-gradient-to-b from-neutral-950 to-neutral-950/60 backdrop-blur py-2">
          <Tabs value={active} onValueChange={(v) => {
            const el = document.getElementById(v);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
            <TabsList className="w-fit">
              {[
                { id: "resumen", label: "Resumen" },
                { id: "proyeccion", label: "Proyección" },
                { id: "recs", label: "Recomendaciones" },
                { id: "pasos", label: "Pasos" },
              ].map((c) => (
                <TabsTrigger key={c.id} value={c.id}>{c.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>

        {/* Nuevo layout demo: 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Izquierda: Visor (sticky) */}
          <div className="md:col-span-4 md:sticky md:top-20 space-y-4">
            {loading ? (
              <Skeleton className="h-[520px] w-full" />
            ) : (
              <ImageViewer ai={mock} imageUrls={imageUrls} />
            )}
          </div>

          {/* Centro: Insights + Timeline */}
          <div className="md:col-span-5 space-y-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            ) : (
              <InsightsCard insightsText={mock.insightsText} />
            )}

            {loading ? (
              <Skeleton className="h-[420px] w-full" />
            ) : (
              <TimelineViewer ai={mock} imageUrls={imageUrls} />
            )}
          </div>

          {/* Derecha: Acciones + Perfil (demo) */}
          <div className="md:col-span-3 md:sticky md:top-20 space-y-4">
            {/* En demo, las acciones pueden apuntar a /s/demo, sólo para visual */}
            <ActionsCard shareId="demo" />
            <ProfileSummaryCard profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

