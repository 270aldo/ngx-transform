'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import type { InsightsResult } from '@/types/ai';

interface TransformationSummaryProps {
  ai: InsightsResult;
  imageUrls: {
    originalUrl?: string;
    images?: Record<string, string>;
  };
  shareId: string;
}

export function TransformationSummary({
  ai,
  imageUrls,
  shareId,
}: TransformationSummaryProps) {
  const m0Stats = ai.timeline?.m0?.stats;
  const m12Stats = ai.timeline?.m12?.stats;

  const weightDelta = m0Stats && m12Stats ? Math.round((m12Stats.strength - m0Stats.strength) * 0.1) : 5;
  const fatDelta = m0Stats && m12Stats ? Math.round((m0Stats.aesthetics - m12Stats.aesthetics) * 0.1) : -5;
  const muscleDelta = m0Stats && m12Stats ? Math.round((m12Stats.strength - m0Stats.strength) * 0.15) : 7;

  const timelineImages = [
    { label: 'HOY', key: 'm0', url: imageUrls.originalUrl },
    { label: 'MES 4', key: 'm4', url: imageUrls.images?.m4 },
    { label: 'MES 8', key: 'm8', url: imageUrls.images?.m8 },
    { label: 'MES 12', key: 'm12', url: imageUrls.images?.m12 },
  ];
  const bridgeQuestions = [
    'Qué versión de ti te está llamando de verdad',
    'Qué tan lejos se siente esa versión desde hoy',
    'Si vale la pena convertir ese deseo en un plan real',
  ];

  const handleCTAClick = () => {
    window.location.href = `/s/${shareId}/plan`;
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
        <div className="relative overflow-hidden rounded-[32px] landing-surface-strong p-6 md:p-8 lg:p-10">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: "url('/images/backgrounds/results-abstract.svg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(109,0,255,0.12),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(184,148,255,0.08),transparent_22%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
            <div>
              <p className="landing-kicker mb-4">Puente de visualización</p>
              <h2 className="landing-heading text-[2.2rem] leading-[0.92] text-white md:text-[3rem]">
                Tu visualización
                <br />
                a 12 meses.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
                La imagen abre la posibilidad. El valor real empieza cuando conviertes esa reacción en dirección: qué haría falta, qué hábito pesa más y qué sistema sí tendría sentido para ti.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
                <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Esta pieza responde</p>
                <div className="mt-4 space-y-3">
                  {bridgeQuestions.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A5FF]" />
                      <p className="text-sm leading-relaxed text-white/72">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[28px] landing-surface p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C8A5FF]" />
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">Resumen orientativo</p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-2xl font-semibold text-white">+{weightDelta} kg</span>
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/30">Peso orientativo</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-2xl font-semibold text-white">{fatDelta}%</span>
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/30">Grasa estimada</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-2xl font-semibold text-white">+{muscleDelta}%</span>
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/30">Músculo estimado</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-white/50">
                  No es una promesa exacta. Es una visión útil para decidir si ese resultado te mueve lo suficiente como para traducirlo a estructura, hábitos y seguimiento.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] landing-surface p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Secuencia visual</p>
                  <p className="mt-2 text-lg font-semibold text-white">De hoy hacia una posibilidad</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
                  4 hitos
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {timelineImages.map((item, index) => (
                  <div
                    key={item.key}
                    className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03] p-3"
                  >
                    <div
                      className="relative aspect-[4/5] overflow-hidden rounded-[18px] border"
                      style={{
                        borderColor: index === 3 ? 'rgba(109,0,255,0.45)' : 'rgba(255,255,255,0.08)',
                        boxShadow: index === 3 ? '0 0 24px rgba(109,0,255,0.18)' : undefined,
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
                      <span className={index === 3 ? 'text-[10px] uppercase tracking-[0.18em] text-[#C8A5FF]' : 'text-[10px] uppercase tracking-[0.18em] text-white/38'}>
                        {item.label}
                      </span>
                      {index === 3 ? (
                        <span className="rounded-full border border-[#6D00FF]/25 bg-[#6D00FF]/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#C8A5FF]">
                          Potencial
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm leading-relaxed text-white/60">
                  La visualización es aproximada. El roadmap convierte el impacto visual en un siguiente paso más serio y accionable.
                </p>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCTAClick}
                className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-2xl bg-[#6D00FF] px-5 py-4 text-white shadow-[0_0_28px_rgba(109,0,255,0.26)] transition-all hover:bg-[#5F00DE]"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  Traducir esta visión a roadmap
                </span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default TransformationSummary;
