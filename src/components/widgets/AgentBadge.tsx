'use client';

/**
 * AgentBadge - Shows which agent generated the content
 * ESTILOS EXACTOS - NO MODIFICAR
 */

import React from 'react';
import {
  Brain,
  Flame,
  Move,
  Heart,
  Activity,
  Leaf,
  PieChart,
  Zap,
  Sparkles,
  Sun,
  BarChart2,
  Moon,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import type { AgentType } from '@/types/genesis';
import { getAgentMeta } from '@/lib/genesis-demo/agents';

const AGENT_TO_CAPABILITY_LABEL: Partial<Record<AgentType, string>> = {
  GENESIS: 'Coach IA',
  BLAZE: 'Entrenamiento', ATLAS: 'Entrenamiento', TEMPO: 'Entrenamiento',
  SAGE: 'Nutrición', MACRO: 'Nutrición', METABOL: 'Nutrición',
  WAVE: 'Recuperación', NOVA: 'Recuperación', LUNA: 'Recuperación',
  SPARK: 'Hábitos', STELLA: 'Hábitos', LOGOS: 'Hábitos',
};

const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  Flame,
  Move,
  Heart,
  Activity,
  Leaf,
  PieChart,
  Zap,
  Sparkles,
  Sun,
  BarChart2,
  Moon,
  BookOpen,
};

interface AgentBadgeProps {
  agent: AgentType;
  className?: string;
}

export function AgentBadge({ agent, className }: AgentBadgeProps) {
  const meta = getAgentMeta(agent);
  const IconComponent = ICON_MAP[meta.icon] || Brain;

  return (
    <div className={`flex items-center gap-2 mb-4 opacity-80 ${className || ''}`}>
      {/* Icon box */}
      <div
        className="p-1.5 rounded-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <IconComponent
          size={12}
          style={{ color: meta.color }}
        />
      </div>

      {/* Label - EXACT STYLING */}
      <span
        className="text-[10px] font-black uppercase"
        style={{
          letterSpacing: '0.2em',
          color: meta.color,
        }}
      >
        GENESIS · {AGENT_TO_CAPABILITY_LABEL[agent] || 'Coach IA'}
      </span>
    </div>
  );
}

export default AgentBadge;
