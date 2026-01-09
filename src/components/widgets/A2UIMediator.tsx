'use client';

/**
 * A2UIMediator - Dynamic widget renderer
 * Switch de renderizado para diferentes tipos de widgets A2UI
 */

import React from 'react';
import type { WidgetType, WidgetData, AgentType } from '@/types/genesis';
import { WorkoutCard } from './WorkoutCard';
import { MealPlan } from './MealPlan';
import { InsightCard } from './InsightCard';
import { ChecklistWidget } from './ChecklistWidget';

interface A2UIMediatorProps {
  widget: WidgetData;
  onAction?: () => void;
  actionLabel?: string;
}

export function A2UIMediator({
  widget,
  onAction,
  actionLabel,
}: A2UIMediatorProps) {
  const { type, agent, data } = widget;

  switch (type) {
    case 'workout':
      return (
        <WorkoutCard
          data={data as any}
          agent={agent}
          onAction={onAction}
          actionLabel={actionLabel}
        />
      );

    case 'meal':
      return (
        <MealPlan
          data={data as any}
          agent={agent}
          onAction={onAction}
          actionLabel={actionLabel}
        />
      );

    case 'insight':
      return (
        <InsightCard
          data={data as any}
          agent={agent}
          onAction={onAction}
          actionLabel={actionLabel}
        />
      );

    case 'checklist':
      return (
        <ChecklistWidget
          data={data as any}
          agent={agent}
          onAction={onAction}
          actionLabel={actionLabel}
        />
      );

    default:
      console.warn(`Unknown widget type: ${type}`);
      return null;
  }
}

/**
 * Helper function to create widget data
 */
export function createWidget(
  type: WidgetType,
  agent: AgentType,
  data: any
): WidgetData {
  return { type, agent, data };
}

export default A2UIMediator;
