'use client';

/**
 * TransformationSummary - Timeline compacto + Stats + CTA a Genesis Demo
 * Aparece después del CinematicViewer
 */

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
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
  const router = useRouter();

  // Extract stats from timeline
  const m0Stats = ai.timeline?.m0?.stats;
  const m12Stats = ai.timeline?.m12?.stats;

  // Calculate deltas
  const weightDelta = m0Stats && m12Stats
    ? Math.round((m12Stats.strength - m0Stats.strength) * 0.1) // Simplified calculation
    : -6;
  const fatDelta = m0Stats && m12Stats
    ? Math.round((m0Stats.aesthetics - m12Stats.aesthetics) * 0.1)
    : -8;
  const muscleDelta = m0Stats && m12Stats
    ? Math.round((m12Stats.strength - m0Stats.strength) * 0.15)
    : 7;

  // Timeline images
  const timelineImages = [
    { label: 'HOY', key: 'm0', url: imageUrls.originalUrl },
    { label: 'MES 4', key: 'm4', url: imageUrls.images?.m4 },
    { label: 'MES 8', key: 'm8', url: imageUrls.images?.m8 },
    { label: 'MES 12', key: 'm12', url: imageUrls.images?.m12 },
  ];

  const handleCTAClick = () => {
    router.push(`/s/${shareId}/demo`);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full bg-[#050505] py-12 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Tu Transformación en 12 Meses
          </h2>
          <p className="text-sm text-white/50">
            Diseñada por GENESIS, tu coach de inteligencia artificial
          </p>
        </motion.div>

        {/* Timeline Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center mb-8 px-2"
        >
          {timelineImages.map((item, index) => (
            <div key={item.key} className="flex flex-col items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className="absolute h-0.5 bg-gradient-to-r from-white/10 to-white/20"
                  style={{
                    width: 'calc(25% - 40px)',
                    left: `calc(${index * 25}% + 20px)`,
                    top: '32px',
                  }}
                />
              )}

              {/* Image thumbnail */}
              <div
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 mb-2"
                style={{
                  borderColor: index === 3 ? '#6D00FF' : 'rgba(255,255,255,0.1)',
                }}
              >
                {item.url ? (
                  <Image
                    src={item.url}
                    alt={item.label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-[10px] text-white/30">
                      {item.key.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Final glow */}
                {index === 3 && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: '0 0 20px rgba(109, 0, 255, 0.5)',
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  index === 3 ? 'text-[#6D00FF]' : 'text-white/50'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-4 mb-8"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp size={14} className="text-[#00FF88]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Resumen de Cambios
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Weight */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown size={12} className="text-[#00FF88]" />
                <span className="text-lg md:text-xl font-bold text-white">
                  {weightDelta > 0 ? '+' : ''}{weightDelta}kg
                </span>
              </div>
              <span className="text-[10px] text-white/40 uppercase">Peso</span>
            </div>

            {/* Body fat */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown size={12} className="text-[#00FF88]" />
                <span className="text-lg md:text-xl font-bold text-white">
                  {fatDelta}%
                </span>
              </div>
              <span className="text-[10px] text-white/40 uppercase">Grasa</span>
            </div>

            {/* Muscle */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={12} className="text-[#00FF88]" />
                <span className="text-lg md:text-xl font-bold text-white">
                  +{muscleDelta}%
                </span>
              </div>
              <span className="text-[10px] text-white/40 uppercase">Músculo</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCTAClick}
          className="w-full py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all"
          style={{
            background: 'linear-gradient(135deg, #6D00FF 0%, #5B21B6 100%)',
            boxShadow: '0 8px 32px rgba(109, 0, 255, 0.4)',
          }}
        >
          <Sparkles size={18} />
          <span className="text-sm uppercase tracking-wider">
            Ver cómo GENESIS crea tu plan
          </span>
          <ArrowRight size={18} />
        </motion.button>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[10px] text-white/30 mt-4"
        >
          GENESIS analizará tu perfil con 4 capacidades especializadas en tiempo real
        </motion.p>
      </div>
    </motion.section>
  );
}

export default TransformationSummary;
