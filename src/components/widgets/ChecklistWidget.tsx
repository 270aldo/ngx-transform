'use client';

/**
 * ChecklistWidget - Interactive checklist with completion states
 * Portado de genesis_A2UI/frontend/components/Widgets.tsx
 */

import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { AgentType, ChecklistData, ChecklistItem } from '@/types/genesis';
import { getAgentColor } from '@/lib/genesis-demo/agents';
import { GlassCard } from './GlassCard';
import { AgentBadge } from './AgentBadge';
import { ActionButton } from './ActionButton';
import { ProgressBar } from './ProgressBar';

interface ChecklistWidgetProps {
  data: ChecklistData;
  agent?: AgentType;
  onAction?: () => void;
  actionLabel?: string;
  interactive?: boolean;
  onItemToggle?: (itemId: string, checked: boolean) => void;
}

export function ChecklistWidget({
  data,
  agent = 'GENESIS',
  onAction,
  actionLabel = 'Marcar como completado',
  interactive = true,
  onItemToggle,
}: ChecklistWidgetProps) {
  const color = getAgentColor(agent);
  const successColor = '#00FF88';

  // Local state for interactive mode
  const [items, setItems] = useState<ChecklistItem[]>(data.items);

  const handleToggle = (itemId: string) => {
    if (!interactive) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );

    const item = items.find((i) => i.id === itemId);
    if (item && onItemToggle) {
      onItemToggle(itemId, !item.checked);
    }
  };

  const completedCount = items.filter((item) => item.checked).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <GlassCard borderColor={color}>
      <AgentBadge agent={agent} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white">{data.title}</h3>
        <span className="text-[10px] text-white/50">
          {completedCount}/{items.length} completados
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <ProgressBar progress={progress} color={successColor} height={4} />
      </div>

      {/* Checklist items */}
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
              interactive ? 'cursor-pointer' : ''
            } ${
              item.checked
                ? 'opacity-60'
                : 'hover:bg-white/10'
            }`}
            style={{
              backgroundColor: item.checked
                ? `${successColor}10`
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: item.checked
                ? `${successColor}20`
                : 'transparent',
            }}
          >
            {/* Checkbox */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                item.checked ? 'border-transparent' : 'border-white/30'
              }`}
              style={{
                backgroundColor: item.checked ? successColor : 'transparent',
                borderColor: item.checked ? successColor : undefined,
              }}
            >
              {item.checked ? (
                <CheckCircle2 size={14} className="text-black" />
              ) : (
                <Circle size={14} className="text-white/30" />
              )}
            </div>

            {/* Item text */}
            <span
              className={`text-xs transition-all ${
                item.checked
                  ? 'text-white/50 line-through'
                  : 'text-white font-medium'
              }`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {onAction && (
        <ActionButton
          color={progress === 100 ? successColor : color}
          onClick={onAction}
        >
          {actionLabel}
        </ActionButton>
      )}
    </GlassCard>
  );
}

export default ChecklistWidget;
