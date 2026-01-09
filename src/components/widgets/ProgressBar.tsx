'use client';

/**
 * ProgressBar - Animated progress indicator
 * ESTILOS EXACTOS - NO MODIFICAR
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  className?: string;
  showPercentage?: boolean;
  animate?: boolean;
}

export function ProgressBar({
  progress,
  color = '#6D00FF',
  height = 6,
  className,
  showPercentage = false,
  animate = true,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full', className)}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-white/50 uppercase font-bold">
            Progreso
          </span>
          <span className="text-xs text-white font-mono">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Fill */}
        <div
          className={cn(
            'h-full rounded-full',
            animate && 'transition-all duration-500 ease-out'
          )}
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
