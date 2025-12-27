"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Moon,
  Salad,
  Brain,
  Flame,
  Timer,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest?: string;
}

interface DayPlan {
  dayNumber: number;
  dayName: string;
  type: "training" | "rest" | "active_recovery";
  focus?: string;
  exercises?: Exercise[];
  habits: string[];
  nutrition?: string;
  mindset?: string;
}

interface WeekPlanSummary {
  weekNumber: number;
  userName: string;
  goal: string;
  level: string;
  structure: string;
  weeklyFocus: string;
  days: DayPlan[];
  progressMetrics: string[];
}

interface PlanDashboardProps {
  plan: WeekPlanSummary;
}

export function PlanDashboard({ plan }: PlanDashboardProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const currentDay = plan.days.find((d) => d.dayNumber === selectedDay);

  const trainingDays = plan.days.filter((d) => d.type === "training").length;
  const restDays = plan.days.filter((d) => d.type === "rest").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D00FF]/20 text-[#B98CFF] text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Plan Semana {plan.weekNumber}</span>
        </div>
        <h2 className="text-2xl font-bold text-white">{plan.userName}</h2>
        <p className="text-neutral-400">
          {plan.goal} • Nivel {plan.level} • {plan.structure}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <Dumbbell className="w-5 h-5 text-[#6D00FF] mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{trainingDays}</p>
          <p className="text-xs text-neutral-400">Entrenamientos</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <Moon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{restDays}</p>
          <p className="text-xs text-neutral-400">Descanso</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">7</p>
          <p className="text-xs text-neutral-400">Hábitos/día</p>
        </div>
      </motion.div>

      {/* Weekly Focus */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#6D00FF]/10 to-transparent rounded-xl border border-[#6D00FF]/20 p-4"
      >
        <h3 className="text-sm font-semibold text-[#B98CFF] mb-2">Enfoque Semanal</h3>
        <p className="text-sm text-neutral-300 leading-relaxed">{plan.weeklyFocus}</p>
      </motion.div>

      {/* Day Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {plan.days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDay(day.dayNumber)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
              selectedDay === day.dayNumber
                ? "bg-[#6D00FF] text-white"
                : day.type === "training"
                ? "bg-white/10 text-white hover:bg-white/20"
                : day.type === "active_recovery"
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            <span className="text-xs block">{day.dayName.slice(0, 3)}</span>
            <span className="text-lg font-bold">{day.dayNumber}</span>
          </button>
        ))}
      </motion.div>

      {/* Day Detail */}
      {currentDay && (
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentDay.dayName}
              </h3>
              <p className="text-sm text-neutral-400">
                {currentDay.type === "training"
                  ? currentDay.focus
                  : currentDay.type === "active_recovery"
                  ? "Recuperación Activa"
                  : "Día de Descanso"}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentDay.type === "training"
                  ? "bg-[#6D00FF]/20 text-[#B98CFF]"
                  : currentDay.type === "active_recovery"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-orange-500/20 text-orange-400"
              }`}
            >
              {currentDay.type === "training"
                ? "Entrenamiento"
                : currentDay.type === "active_recovery"
                ? "Activo"
                : "Descanso"}
            </div>
          </div>

          {/* Exercises */}
          {currentDay.exercises && currentDay.exercises.length > 0 && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#6D00FF]" />
                <span className="text-sm font-medium text-white">Ejercicios</span>
              </div>
              <div className="divide-y divide-white/5">
                {currentDay.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#6D00FF]/20 text-[#B98CFF] text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-white">{exercise.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-neutral-300">
                        {exercise.sets} x {exercise.reps}
                      </span>
                      {exercise.rest && (
                        <span className="text-xs text-neutral-500 block">
                          {exercise.rest} descanso
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habits */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Hábitos</span>
            </div>
            <div className="p-4 space-y-2">
              {currentDay.habits.map((habit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-white/20" />
                  <span className="text-sm text-neutral-300">{habit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition & Mindset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentDay.nutrition && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Salad className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Nutrición</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {currentDay.nutrition}
                </p>
              </div>
            )}
            {currentDay.mindset && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Mindset</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {currentDay.mindset}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Progress Metrics Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl border border-white/10 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Métricas a Trackear</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.progressMetrics.slice(0, 3).map((metric, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/5 rounded text-xs text-neutral-400"
            >
              {metric.split("(")[0].trim()}
            </span>
          ))}
          {plan.progressMetrics.length > 3 && (
            <span className="px-2 py-1 bg-white/5 rounded text-xs text-neutral-500">
              +{plan.progressMetrics.length - 3} más
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Export types for use in other components
export type { WeekPlanSummary, DayPlan, Exercise };
