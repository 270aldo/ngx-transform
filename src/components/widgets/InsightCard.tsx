'use client';

/**
 * InsightCard - Displays insights with trends and recommendations
 * Portado de genesis_A2UI/frontend/components/Widgets.tsx
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import type { AgentType, InsightData, TrendType } from '@/types/genesis';
import { getAgentColor } from '@/lib/genesis-demo/agents';
import { GlassCard } from './GlassCard';
import { AgentBadge } from './AgentBadge';
import { ActionButton } from './ActionButton';

const TREND_COLORS: Record<TrendType, string> = {
  positive: '#00FF88',
  negative: '#FF4444',
  neutral: '#6366F1',
};

const TREND_ICONS: Record<TrendType, React.ReactNode> = {
  positive: <TrendingUp size={12} />,
  negative: <TrendingDown size={12} />,
  neutral: <Minus size={12} />,
};

interface InsightCardProps {
  data: InsightData;
  agent?: AgentType;
  onAction?: () => void;
  actionLabel?: string;
}

export function InsightCard({
  data,
  agent = 'STELLA',
  onAction,
  actionLabel = 'Ver más detalles',
}: InsightCardProps) {
  const color = getAgentColor(agent);
  const trendColor = TREND_COLORS[data.trend];

  return (
    <GlassCard borderColor={color}>
      <AgentBadge agent={agent} />

      {/* Header with trend badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold text-white">{data.title}</h3>

        {/* Trend badge */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: `${trendColor}20`,
            color: trendColor,
          }}
        >
          {TREND_ICONS[data.trend]}
          {data.trendValue && <span>{data.trendValue}</span>}
        </div>
      </div>

      {/* Insight text */}
      <p className="text-white/80 text-sm leading-relaxed mb-4">
        {data.insight}
      </p>

      {/* Recommendation box */}
      {data.recommendation && (
        <div
          className="p-3 rounded-xl mb-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/70 text-xs leading-relaxed">
              {data.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Action button */}
      {onAction && (
        <ActionButton color={color} onClick={onAction}>
          {actionLabel}
        </ActionButton>
      )}
    </GlassCard>
  );
}

export default InsightCard;
