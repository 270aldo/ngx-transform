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
    m0: { month: 0, focus: "Evaluación inicial, técnica y hábitos", mental: "Establece las bases con disciplina y paciencia.", expectations: ["Aprender patrones básicos", "Rutina sostenible"], risks: ["Sobrecarga inicial", "Falta de adherencia"] },
    m4: { month: 4, focus: "Fuerza base y composición", mental: "La consistencia vence al talento. Confía en el proceso.", expectations: ["Mejoras de fuerza 10-20%", "Energía diaria"], risks: ["Saltarse recuperación", "Estancamiento"] },
    m8: { month: 8, focus: "Volumen inteligente y consistencia", mental: "Rompe tus propios límites. La incomodidad es crecimiento.", expectations: ["Mayor tolerancia a volumen", "Postura/mejores patrones"], risks: ["Sobrentrenamiento"] },
    m12: { month: 12, focus: "Consolidación y métricas claras", mental: "Has construido un nuevo estándar. Esto es solo el comienzo.", expectations: ["Fuerza +20-40% (variabilidad)", "Hábitos consolidados"], risks: ["Desmotivación por comparaciones"] },
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
  const kpis = [
    { title: "Fuerza", value: 70, desc: "+20–40% a 12m" },
    { title: "Consistencia", value: 80, desc: "≥3 días/sem" },
    { title: "Energía diaria", value: 65, desc: "Mejoría sostenida" },
  ];
  const recomendaciones = [
    "Prioriza técnica en movimientos base (sentadilla, empuje, tracción)",
    "Bloques de 6–8 semanas con deload ligero",
    "Monitorea horas de sueño y proteína diaria",
  ];
  const pasos = [
    "Sube una foto clara (frontal) y valida datos",
    "Recibe análisis + plan visual 0/4/8/12",
    "Agenda asesoría si buscas plan personalizado",
  ];
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
            <ActionsCard shareId="demo" goal={profile.goal} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ProfileSummaryCard profile={profile as any} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendChart() {
  // Valores demo en % para 0/4/8/12
  const points = [40, 58, 70, 85];
  const months = [0, 4, 8, 12];
  const w = 640; const h = 180; const pad = 28;
  const xs = (i: number) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const ys = (v: number) => h - pad - (v / 100) * (h - pad * 2);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="gline" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#B98CFF"/>
          <stop offset="100%" stopColor="#6D00FF"/>
        </linearGradient>
      </defs>
      {/* Ejes mínimos */}
      <g stroke="#262626" strokeWidth="1">
        <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} />
        <line x1={pad} y1={pad} x2={pad} y2={h-pad} />
      </g>
      {/* Línea */}
      <path d={d} fill="none" stroke="url(#gline)" strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 6px rgba(109,0,255,0.6))" }} />
      {/* Puntos */}
      {points.map((v, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(v)} r={4} fill="#6D00FF" />
          <text x={xs(i)} y={h-8} textAnchor="middle" className="fill-neutral-400 text-[10px]">
            {months[i]}m
          </text>
          <text x={xs(i)} y={ys(v)-8} textAnchor="middle" className="fill-neutral-300 text-[10px]">
            {v}%
          </text>
        </g>
      ))}
    </svg>
  );
}
