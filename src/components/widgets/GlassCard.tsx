'use client';

/**
 * GlassCard - Base component for all A2UI widgets
 * ESTILOS EXACTOS - NO MODIFICAR
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  borderColor?: string;
  className?: string;
  animate?: boolean;
}

export function GlassCard({
  children,
  borderColor = '#6D00FF',
  className,
  animate = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-3xl p-5 mb-3 overflow-hidden',
        animate && 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
        className
      )}
      style={{
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${borderColor}20`,
        animationFillMode: 'both',
      }}
    >
      {/* Noise/Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Gradient highlight overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlassCard;
