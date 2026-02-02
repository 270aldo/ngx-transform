'use client';

/**
 * MealPlan - Displays meal schedule with calories
 * Portado de genesis_A2UI/frontend/components/Widgets.tsx
 */

import React from 'react';
import { Utensils } from 'lucide-react';
import type { AgentType, MealData } from '@/types/genesis';
import { getAgentColor } from '@/lib/genesis-demo/agents';
import { GlassCard } from './GlassCard';
import { AgentBadge } from './AgentBadge';
import { ActionButton } from './ActionButton';

interface MealPlanProps {
  data: MealData;
  agent?: AgentType;
  onAction?: () => void;
  actionLabel?: string;
}

export function MealPlan({
  data,
  agent = 'GENESIS',
  onAction,
  actionLabel = 'Ver recetas',
}: MealPlanProps) {
  const color = getAgentColor(agent);

  return (
    <GlassCard borderColor={color}>
      <AgentBadge agent={agent} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Utensils size={14} style={{ color }} />
          <h3 className="text-sm font-bold text-white">{data.title}</h3>
        </div>
        <div className="text-xs text-white/50">
          {data.totalCalories} kcal total
        </div>
      </div>

      {/* Meals list */}
      <div className="space-y-2 mb-4">
        {data.meals.map((meal, index) => (
          <div
            key={index}
            className={`flex items-center py-2 px-3 rounded-xl ${
              meal.isHighlight
                ? ''
                : 'bg-transparent'
            }`}
            style={
              meal.isHighlight
                ? {
                    backgroundColor: `${color}10`,
                    border: `1px solid ${color}20`,
                  }
                : {}
            }
          >
            {/* Time */}
            <span
              className={`text-[10px] font-bold uppercase w-16 ${
                meal.isHighlight ? '' : 'text-white/50'
              }`}
              style={meal.isHighlight ? { color } : {}}
            >
              {meal.time}
            </span>

            {/* Meal name */}
            <span
              className={`text-xs flex-1 ${
                meal.isHighlight ? 'font-bold' : 'text-white'
              }`}
              style={meal.isHighlight ? { color } : {}}
            >
              {meal.name}
            </span>

            {/* Calories */}
            <span className="text-[10px] text-white/30">
              {meal.calories} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {onAction && (
        <ActionButton color={color} onClick={onAction}>
          {actionLabel}
        </ActionButton>
      )}
    </GlassCard>
  );
}

export default MealPlan;
