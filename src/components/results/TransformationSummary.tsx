'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { Bottleneck, InsightsResult } from '@/types/ai';
import { getSeasonMilestoneLabel } from '@/lib/seasonMilestones';

interface UserInputSnapshot {
  age?: number;
  goal?: 'definicion' | 'masa' | 'mixto';
  level?: 'novato' | 'intermedio' | 'avanzado';
}

interface TransformationSummaryProps {
  ai: InsightsResult;
  imageUrls: {
    originalUrl?: string;
    images?: Record<string, string>;
  };
  /** Mantenido para compatibilidad con call sites existentes; ya no se usa internamente. */
  shareId?: string;
  userInput?: UserInputSnapshot;
}

const BOTTLENECK_LABELS: Record<Bottleneck, string> = {
  training_progression: 'Entrenamiento sin progresión trazable',
  nutrition_consistency: 'Consistencia de ejecución',
  recovery: 'Recuperación insuficiente',
  structure: 'Falta de estructura semanal',
  expectations: 'Expectativas mal calibradas',
  accountability: 'Falta de accountability externo',
};

const BOTTLENECK_DESCRIPTIONS: Record<Bottleneck, string> = {
  training_progression:
    'Entrenas con consistencia, pero sin un sistema de progresión semanal. Los músculos dejan de adaptarse a las pocas semanas y entras en un plateau silencioso.',
  nutrition_consistency:
    'La calidad del plan importa menos que su estabilidad. Cuando cada día se decide desde cero, la inconsistencia neutraliza avance antes que cualquier optimización fina.',
  recovery:
    'Tu volumen de entrenamiento está por encima de lo que recuperas. Más sesiones no es más resultado: la fatiga acumulada está saboteando la adaptación.',
  structure:
    'Lo que parece flexibilidad termina siendo improvisación semanal. Sin estructura escrita antes del lunes, las decisiones de cada día consumen más de lo que producen.',
  expectations:
    'Estás midiendo el progreso con la ventana equivocada. Cuatro semanas no muestran transformación; la frustración prematura sabotea las ocho siguientes.',
  accountability:
    'Operas sin accountability externo. Sin alguien que pregunte de vuelta, la disciplina necesita ser identidad — y eso lleva años, no semanas.',
};

function computeScoreDeltas(ai: InsightsResult) {
  const m0 = ai.timeline?.m0?.stats;
  const m12 = ai.timeline?.m12?.stats;

  if (!m0 || !m12) {
    return { strengthDelta: 0, aestheticsDelta: 0, enduranceDelta: 0 };
  }

  return {
    strengthDelta: m12.strength - m0.strength,
    aestheticsDelta: m12.aesthetics - m0.aesthetics,
    enduranceDelta: m12.endurance - m0.endurance,
  };
}

export function TransformationSummary({
  ai,
  imageUrls,
}: TransformationSummaryProps) {
  const { strengthDelta, aestheticsDelta, enduranceDelta } =
    computeScoreDeltas(ai);

  const bottleneck =
    ai.diagnostic?.bottleneck === 'nutrition_consistency'
      ? 'structure'
      : ai.diagnostic?.bottleneck;
  const bottleneckLabel = bottleneck ? BOTTLENECK_LABELS[bottleneck] : null;
  const bottleneckDescription = bottleneck
    ? BOTTLENECK_DESCRIPTIONS[bottleneck]
    : null;

  const rawTimelineImages = [
    { label: getSeasonMilestoneLabel('m0'), key: 'm0', url: imageUrls.originalUrl },
    { label: getSeasonMilestoneLabel('m4'), key: 'm4', url: imageUrls.images?.m4 },
    { label: getSeasonMilestoneLabel('m8'), key: 'm8', url: imageUrls.images?.m8 },
    { label: getSeasonMilestoneLabel('m12'), key: 'm12', url: imageUrls.images?.m12 },
  ];
  const seenUrls = new Set<string>();
  const timelineImages = rawTimelineImages.map((item) => {
    if (!item.url) return item;
    if (seenUrls.has(item.url)) return { ...item, url: undefined };
    seenUrls.add(item.url);
    return item;
  });

  const bridgeQuestions = [
    'Qué versión de ti te está llamando de verdad',
    'Qué tan lejos se siente esa versión desde hoy',
    'Si vale la pena convertir ese deseo en un plan real',
  ];

  const handleCTAClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const target = document.getElementById('season-roadmap');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.section
      id="results-summary"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="relative w-full px-4 py-10 scroll-mt-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="ngx-section-panel">
          <div
            className="absolute inset-0 opacity-[0.16] pointer-events-none"
            style={{
              backgroundImage: "url('/images/backgrounds/results-abstract.svg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(109,0,255,0.06),transparent_34%)] pointer-events-none" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
            <div>
              <span className="ngx-eyebrow-pill mb-4">Puente de visualización</span>
              <h2 className="ngx-h1 !text-left">
                Tu visión de temporada.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
                La imagen abre la posibilidad. El valor real empieza cuando conviertes esa reacción en dirección: qué haría falta, qué hábito pesa más y qué sistema sí tendría sentido para ti.
              </p>

              <div className="mt-6 ngx-metal-card !p-5">
                <div className="relative z-10">
                  <span className="ngx-eyebrow !text-[10px]" style={{ color: 'var(--ngx-fg-3)' }}>Esta pieza responde</span>
                  <div className="mt-3 space-y-3">
                    {bridgeQuestions.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--ngx-purple-light)' }} />
                        <p className="text-sm leading-relaxed text-white/75">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 ngx-metal-card !p-5 md:!p-6">
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--ngx-purple-light)' }} />
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: 'var(--ngx-fg-3)' }}>Resumen orientativo</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2" style={{ color: 'var(--ngx-success)' }}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-mono text-2xl font-bold tabular-nums text-white">
                            {strengthDelta >= 0 ? `+${strengthDelta}` : strengthDelta}
                          </span>
                        </div>
                        <span className="ngx-eyebrow !text-[10px] mt-2 block" style={{ color: 'var(--ngx-fg-4)' }}>Fuerza visual</span>
                      </div>
                    </div>
                    <div className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2" style={{ color: 'var(--ngx-success)' }}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-mono text-2xl font-bold tabular-nums text-white">
                            {aestheticsDelta >= 0 ? `+${aestheticsDelta}` : aestheticsDelta}
                          </span>
                        </div>
                        <span className="ngx-eyebrow !text-[10px] mt-2 block" style={{ color: 'var(--ngx-fg-4)' }}>Composición visual</span>
                      </div>
                    </div>
                    <div className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2" style={{ color: 'var(--ngx-success)' }}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-mono text-2xl font-bold tabular-nums text-white">
                            {enduranceDelta >= 0 ? `+${enduranceDelta}` : enduranceDelta}
                          </span>
                        </div>
                        <span className="ngx-eyebrow !text-[10px] mt-2 block" style={{ color: 'var(--ngx-fg-4)' }}>Capacidad de trabajo</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-white/55">
                    No son kilos, grasa ni masa medidos. Son cambios orientativos en una escala visual 0-100 para decidir si esa dirección merece estructura, hábitos y seguimiento.
                  </p>
                </div>
              </div>

              {bottleneckLabel && bottleneckDescription && (
                <div
                  className="mt-5 ngx-metal-card !p-5 md:!p-6"
                  style={{ borderColor: 'rgba(109,0,255,0.28)' }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2">
                      <Target
                        className="h-4 w-4"
                        style={{ color: 'var(--ngx-purple-light)' }}
                      />
                      <span
                        className="ngx-eyebrow !text-[10px]"
                        style={{ color: 'var(--ngx-purple-light)' }}
                      >
                        Tu palanca principal parece ser
                      </span>
                    </div>
                    <p className="mt-3 text-base font-bold text-white">
                      {bottleneckLabel}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {bottleneckDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="ngx-metal-card !p-5 md:!p-6">
              <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="ngx-eyebrow !text-[10px]" style={{ color: 'var(--ngx-fg-3)' }}>Secuencia visual</span>
                  <p className="mt-2 text-lg font-bold text-white">De hoy hacia una posibilidad</p>
                </div>
                <span className="rounded-full border border-[color:var(--ngx-border-subtle)] bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/55 whitespace-nowrap">
                  4 hitos
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {timelineImages.map((item, index) => (
                  <div
                    key={item.key}
                    className="ngx-metal-card overflow-hidden !p-3"
                  ><div className="relative z-10">
                    <div
                      className="relative aspect-[4/5] overflow-hidden rounded-[18px] border"
                      style={{
                        borderColor: index === 3 ? 'rgba(109,0,255,0.45)' : 'rgba(255,255,255,0.08)',
                        boxShadow: index === 3 ? 'var(--ngx-glow-primary-soft)' : undefined,
                      }}
                    >
                      {item.url ? (
                        <>
                          <Image
                            src={item.url}
                            alt={item.label}
                            fill
                            sizes="(max-width: 768px) 40vw, 20vw"
                            quality={88}
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/[0.02] text-[10px] uppercase tracking-[0.18em] text-white/35">
                          Procesando
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: index === 3 ? 'var(--ngx-purple-light)' : 'var(--ngx-fg-4)' }}
                      >
                        {item.label}
                      </span>
                      {index === 3 ? (
                        <span
                          className="rounded-full px-2 py-1 text-[9px] uppercase tracking-[0.16em]"
                          style={{
                            background: 'rgba(109,0,255,0.10)',
                            border: '1px solid rgba(109,0,255,0.25)',
                            color: 'var(--ngx-purple-light)',
                          }}
                        >
                          Potencial
                        </span>
                      ) : null}
                    </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 ngx-metal-card !p-4">
                <div className="relative z-10">
                  <p className="text-sm leading-relaxed text-white/65">
                    La visualización es aproximada. El roadmap convierte el impacto visual en un siguiente paso más serio y accionable.
                  </p>
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCTAClick}
                className="ngx-primary-cta mt-6 inline-flex w-full px-5 py-4 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Ver el roadmap de temporada</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default TransformationSummary;
