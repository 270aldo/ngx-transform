'use client';

/**
 * WorkoutCard - Displays workout information with exercises
 * Portado de genesis_A2UI/frontend/components/Widgets.tsx
 */

import React from 'react';
import { Clock, Flame, Dumbbell } from 'lucide-react';
import type { AgentType, WorkoutData } from '@/types/genesis';
import { getAgentColor } from '@/lib/genesis-demo/agents';
import { GlassCard } from './GlassCard';
import { AgentBadge } from './AgentBadge';
import { ActionButton } from './ActionButton';

interface WorkoutCardProps {
  data: WorkoutData;
  agent?: AgentType;
  onAction?: () => void;
  actionLabel?: string;
  maxExercises?: number;
}

export function WorkoutCard({
  data,
  agent = 'GENESIS',
  onAction,
  actionLabel = 'Comenzar entreno',
  maxExercises = 3,
}: WorkoutCardProps) {
  const color = getAgentColor(agent);
  const displayExercises = data.exercises.slice(0, maxExercises);
  const hasMoreExercises = data.exercises.length > maxExercises;

  return (
    <GlassCard borderColor={color}>
      <AgentBadge agent={agent} />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">{data.title}</h3>
          <span className="text-[10px] text-white/40 uppercase">
            {data.category}
          </span>
        </div>

        {/* Duration badge */}
        <div
          className="px-2 py-1 rounded text-white/70 text-[10px] font-medium"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Clock size={10} className="inline mr-1" />
          {data.duration} min
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1 text-white/50 text-xs">
          <Clock size={12} />
          <span>{data.duration} min</span>
        </div>
        <div className="flex items-center gap-1 text-white/50 text-xs">
          <Flame size={12} />
          <span>{data.calories} kcal</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-2 mb-4">
        {displayExercises.map((exercise, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Numbered circle */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                backgroundColor: `${color}33`,
                color: color,
              }}
            >
              {index + 1}
            </div>

            {/* Exercise info */}
            <div className="flex-1">
              <span className="text-xs text-white">{exercise.name}</span>
              <div className="text-[10px] text-white/40">
                {exercise.sets}x{exercise.reps}
                {exercise.rest && ` • ${exercise.rest} descanso`}
              </div>
            </div>
          </div>
        ))}

        {hasMoreExercises && (
          <div className="text-[10px] text-white/30 pl-9">
            +{data.exercises.length - maxExercises} ejercicios más
          </div>
        )}
      </div>

      {/* Coach note */}
      {data.coachNote && (
        <div
          className="p-3 rounded-xl mb-4 text-xs text-white/70"
          style={{
            backgroundColor: `${color}1A`,
            border: `1px solid ${color}33`,
          }}
        >
          <Dumbbell size={12} className="inline mr-2" style={{ color }} />
          {data.coachNote}
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

export default WorkoutCard;
