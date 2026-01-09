'use client';

/**
 * ActionButton - CTA button with gradient styling
 * ESTILOS EXACTOS - NO MODIFICAR
 */

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary';

interface ActionButtonProps {
  children: React.ReactNode;
  color?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function ActionButton({
  children,
  color = '#6D00FF',
  variant = 'primary',
  onClick,
  disabled = false,
  className,
  icon,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full py-3 rounded-xl text-xs font-bold uppercase transition-all',
        'flex items-center justify-center gap-2',
        isPrimary
          ? 'text-white shadow-lg hover:opacity-90'
          : 'text-white/60 hover:bg-white/10',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        letterSpacing: '0.1em',
        background: isPrimary
          ? `linear-gradient(135deg, ${color}, ${color}CC)`
          : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export default ActionButton;
