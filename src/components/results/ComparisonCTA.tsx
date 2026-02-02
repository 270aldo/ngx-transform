'use client';

/**
 * ComparisonCTA - Tabla comparativa Por tu cuenta vs Con GENESIS
 * Aparece en la página de PlanPreview
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';

interface ComparisonCTAProps {
  onSubscribe?: () => void;
  subscribeUrl?: string;
}

const COMPARISON_ROWS = [
  {
    feature: 'Rutinas',
    without: 'Genéricas',
    with: 'Personalizadas',
  },
  {
    feature: 'Nutrición',
    without: 'Templates',
    with: 'Adaptativa',
  },
  {
    feature: 'Ajustes',
    without: 'Manuales',
    with: 'Automáticos',
  },
  {
    feature: 'Soporte',
    without: 'FAQ',
    with: 'GENESIS 24/7',
  },
  {
    feature: 'Progreso',
    without: 'Tú solo',
    with: 'Guiado IA',
  },
];

export function ComparisonCTA({
  onSubscribe,
  subscribeUrl = 'https://ngx.app/subscribe',
}: ComparisonCTAProps) {
  const handleClick = () => {
    if (onSubscribe) {
      onSubscribe();
    } else if (subscribeUrl) {
      window.open(subscribeUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles size={16} className="text-[#6D00FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">
          ¿Por qué necesitas GENESIS?
        </h3>
      </div>

      {/* Comparison Table */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Table Header */}
        <div className="grid grid-cols-3 border-b border-white/10">
          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Aspecto
          </div>
          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-white/40 text-center border-x border-white/10">
            Por tu cuenta
          </div>
          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-[#6D00FF] text-center">
            GENESIS
          </div>
        </div>

        {/* Table Rows */}
        {COMPARISON_ROWS.map((row, index) => (
          <div
            key={row.feature}
            className={`grid grid-cols-3 ${
              index < COMPARISON_ROWS.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            {/* Feature */}
            <div className="p-3 text-xs text-white font-medium">
              {row.feature}
            </div>

            {/* Without */}
            <div className="p-3 text-xs text-white/40 text-center border-x border-white/10 flex items-center justify-center gap-1">
              <X size={12} className="text-red-400/60" />
              <span>{row.without}</span>
            </div>

            {/* With GENESIS */}
            <div className="p-3 text-xs text-white text-center flex items-center justify-center gap-1">
              <Check size={12} className="text-[#00FF88]" />
              <span className="font-medium">{row.with}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="w-full py-4 px-6 rounded-2xl font-bold text-white flex flex-col items-center justify-center gap-1 transition-all"
        style={{
          background: 'linear-gradient(135deg, #6D00FF 0%, #5B21B6 100%)',
          boxShadow: '0 8px 32px rgba(109, 0, 255, 0.4)',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <span className="text-sm uppercase tracking-wider">
            Desbloquear mi plan completo
          </span>
          <ArrowRight size={18} />
        </div>
        <span className="text-[10px] text-white/60 font-normal">
          Accede a los 7 días + 4 capacidades de IA
        </span>
      </motion.button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <span className="text-[10px] text-white/30 flex items-center gap-1">
          <Check size={10} className="text-[#00FF88]" />
          Garantía 7 días
        </span>
        <span className="text-[10px] text-white/30 flex items-center gap-1">
          <Check size={10} className="text-[#00FF88]" />
          Cancela cuando quieras
        </span>
      </div>
    </motion.div>
  );
}

export default ComparisonCTA;
