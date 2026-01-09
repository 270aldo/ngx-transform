'use client';

/**
 * PlanPreview - Day 1 complete + Days 2-7 locked
 * Shows full content for Day 1 and blurred/locked cards for Days 2-7
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Utensils,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import type { AgentType } from '@/types/genesis';
import { AGENT_META } from '@/lib/genesis-demo/agents';
import { GlassCard } from '@/components/widgets/GlassCard';
import { WorkoutCard } from '@/components/widgets/WorkoutCard';
import { MealPlan } from '@/components/widgets/MealPlan';
import { ChecklistWidget } from '@/components/widgets/ChecklistWidget';

// Day names
const DAY_NAMES = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];

// Sample data for Day 1
const DAY_1_WORKOUT = {
  title: 'HIIT Upper Body - Fase 1',
  category: 'Fuerza + Definición',
  duration: 45,
  calories: 420,
  exercises: [
    { name: 'Push-ups', sets: 4, reps: '12' },
    { name: 'Dumbbell Rows', sets: 4, reps: '10' },
    { name: 'Shoulder Press', sets: 3, reps: '12' },
    { name: 'Plank to Push-up', sets: 3, reps: '8' },
    { name: 'Tricep Dips', sets: 3, reps: '15' },
  ],
  coachNote: 'Mantén 60-90 segundos de descanso entre series para maximizar la hipertrofia. Enfócate en la conexión mente-músculo.',
};

const DAY_1_MEAL = {
  title: 'Plan Nutricional - Día 1',
  totalCalories: 2200,
  meals: [
    { time: '7:00', name: 'Avena con proteína y frutos rojos', calories: 450 },
    { time: '10:00', name: 'Yogur griego con nueces', calories: 280, isHighlight: true },
    { time: '13:00', name: 'Pollo a la plancha con arroz y verduras', calories: 650 },
    { time: '16:00', name: 'Batido de proteína post-entreno', calories: 320 },
    { time: '20:00', name: 'Salmón con quinoa y espárragos', calories: 500 },
  ],
};

const DAY_1_CHECKLIST = {
  title: 'Rutina Completa - Día 1',
  items: [
    { id: '1', text: 'Despertar a las 6:30am', checked: false },
    { id: '2', text: '10 minutos de stretching matutino', checked: false },
    { id: '3', text: 'Preparar meals del día', checked: false },
    { id: '4', text: 'Completar entrenamiento HIIT Upper Body', checked: false },
    { id: '5', text: 'Hidratación: 3L de agua mínimo', checked: false },
    { id: '6', text: '8 horas de sueño (22:00 - 06:00)', checked: false },
  ],
};

// Locked day preview data (partial/blurred)
const LOCKED_DAYS = [
  { day: 2, workout: 'Lower Body Strength', meals: 5, tasks: 6 },
  { day: 3, workout: 'Active Recovery + Cardio', meals: 5, tasks: 5 },
  { day: 4, workout: 'Push Day', meals: 5, tasks: 6 },
  { day: 5, workout: 'Pull Day', meals: 5, tasks: 6 },
  { day: 6, workout: 'Full Body HIIT', meals: 5, tasks: 5 },
  { day: 7, workout: 'Rest + Meal Prep', meals: 5, tasks: 4 },
];

interface PlanPreviewProps {
  shareId: string;
  onUnlock: () => void;
}

export function PlanPreview({ shareId, onUnlock }: PlanPreviewProps) {
  const [selectedDay, setSelectedDay] = useState(0);

  const isLocked = selectedDay > 0;

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 0) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 6) {
      setSelectedDay(selectedDay + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-lg border-b border-white/5 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#6D00FF]" />
              <span className="text-sm font-bold text-white">Tu Plan de 7 Días</span>
            </div>
            <div
              className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: '#6D00FF20',
                color: '#6D00FF',
              }}
            >
              1/7 Desbloqueado
            </div>
          </div>

          {/* Day navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDay('prev')}
              disabled={selectedDay === 0}
              className="p-2 rounded-lg transition-all disabled:opacity-30"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <ChevronLeft size={16} className="text-white" />
            </button>

            <div className="flex gap-1">
              {DAY_NAMES.map((name, index) => (
                <button
                  key={name}
                  onClick={() => setSelectedDay(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === index
                      ? 'bg-[#6D00FF] text-white'
                      : index === 0
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-white/50'
                  }`}
                >
                  {index + 1}
                  {index > 0 && <Lock size={8} className="inline ml-1 opacity-50" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigateDay('next')}
              disabled={selectedDay === 6}
              className="p-2 rounded-lg transition-all disabled:opacity-30"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {!isLocked ? (
              // Day 1 - Full content
              <motion.div
                key="day-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Day header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {DAY_NAMES[0]} - GÉNESIS
                  </h2>
                  <p className="text-sm text-white/50">
                    Tu transformación comienza hoy
                  </p>
                </div>

                {/* Workout */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell size={14} className="text-[#FF4500]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF4500]">
                      Entrenamiento
                    </span>
                  </div>
                  <WorkoutCard data={DAY_1_WORKOUT} agent="BLAZE" />
                </div>

                {/* Meal Plan */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils size={14} className="text-[#10B981]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
                      Nutrición
                    </span>
                  </div>
                  <MealPlan data={DAY_1_MEAL} agent="SAGE" />
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare size={14} className="text-[#FBBF24]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FBBF24]">
                      Tareas del Día
                    </span>
                  </div>
                  <ChecklistWidget data={DAY_1_CHECKLIST} agent="SPARK" interactive={false} />
                </div>
              </motion.div>
            ) : (
              // Locked days - Blurred content
              <motion.div
                key={`day-${selectedDay + 1}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Day header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {DAY_NAMES[selectedDay]}
                  </h2>
                  <p className="text-sm text-white/50">
                    Contenido bloqueado
                  </p>
                </div>

                {/* Locked workout */}
                <div className="relative">
                  <div
                    className="rounded-2xl p-5 filter blur-sm pointer-events-none"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Dumbbell size={14} className="text-white/30" />
                      <span className="text-xs font-bold text-white/30">
                        {LOCKED_DAYS[selectedDay - 1].workout}
                      </span>
                    </div>
                    <div className="h-32 bg-white/5 rounded-xl" />
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Lock size={20} className="text-white/50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locked meal */}
                <div className="relative">
                  <div
                    className="rounded-2xl p-5 filter blur-sm pointer-events-none"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Utensils size={14} className="text-white/30" />
                      <span className="text-xs font-bold text-white/30">
                        {LOCKED_DAYS[selectedDay - 1].meals} comidas planificadas
                      </span>
                    </div>
                    <div className="h-24 bg-white/5 rounded-xl" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Lock size={20} className="text-white/50" />
                    </div>
                  </div>
                </div>

                {/* Locked checklist */}
                <div className="relative">
                  <div
                    className="rounded-2xl p-5 filter blur-sm pointer-events-none"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare size={14} className="text-white/30" />
                      <span className="text-xs font-bold text-white/30">
                        {LOCKED_DAYS[selectedDay - 1].tasks} tareas del día
                      </span>
                    </div>
                    <div className="h-20 bg-white/5 rounded-xl" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Lock size={20} className="text-white/50" />
                    </div>
                  </div>
                </div>

                {/* Unlock message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-6"
                >
                  <Sparkles size={24} className="text-[#6D00FF] mx-auto mb-3" />
                  <p className="text-sm text-white/70 mb-1">
                    Desbloquea los 7 días completos
                  </p>
                  <p className="text-xs text-white/50">
                    Con GENESIS Premium tienes acceso a tu plan personalizado completo
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default PlanPreview;
