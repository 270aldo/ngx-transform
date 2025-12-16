"use client";

/**
 * PR-4: Plan Viewer Component
 *
 * Displays the 7-day personalized fitness plan
 * with workout, habits, nutrition, and mindset for each day
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Sun,
  Moon,
  Utensils,
  Brain,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Clock,
  Flame,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface DayPlan {
  day: number;
  workout: {
    focus: string;
    exercises: Exercise[];
    duration: number;
    intensity: string;
  };
  habits: {
    morning: string[];
    evening: string[];
  };
  nutrition: {
    calories: number;
    protein: number;
    meals: string[];
  };
  mindset: string;
}

interface Plan {
  sessionId: string;
  profile: {
    sex: string;
    age: number;
    goal: string;
    level: string;
    focusZone: string;
  };
  days: DayPlan[];
}

interface PlanViewerProps {
  plan: Plan;
  shareId: string;
}

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const INTENSITY_COLORS = {
  low: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  high: "text-red-400 bg-red-400/10",
};

const GOAL_LABELS = {
  definicion: "Definición",
  masa: "Masa Muscular",
  mixto: "Recomposición",
};

export function PlanViewer({ plan, shareId }: PlanViewerProps) {
  const [currentDay, setCurrentDay] = useState(1);
  const [activeTab, setActiveTab] = useState<"workout" | "habits" | "nutrition">("workout");

  const dayPlan = plan.days.find((d) => d.day === currentDay);
  if (!dayPlan) return null;

  const handlePrevDay = () => {
    if (currentDay > 1) setCurrentDay(currentDay - 1);
  };

  const handleNextDay = () => {
    if (currentDay < 7) setCurrentDay(currentDay + 1);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/plan/${shareId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Plan de 7 Días - NGX",
          text: "Mira mi plan personalizado de entrenamiento",
          url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black italic">
                PLAN <span className="text-[#6D00FF]">7 DÍAS</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {GOAL_LABELS[plan.profile.goal as keyof typeof GOAL_LABELS] || plan.profile.goal} •{" "}
                {plan.profile.level}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Day Navigation */}
      <div className="sticky top-[73px] z-40 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevDay}
              disabled={currentDay === 1}
              className={cn(
                "p-2 rounded-full transition-all",
                currentDay === 1
                  ? "opacity-30"
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-xs text-neutral-400">Día {currentDay} de 7</p>
              <h2 className="text-lg font-bold">{DAY_NAMES[currentDay]}</h2>
            </div>

            <button
              onClick={handleNextDay}
              disabled={currentDay === 7}
              className={cn(
                "p-2 rounded-full transition-all",
                currentDay === 7
                  ? "opacity-30"
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day pills */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={cn(
                  "w-8 h-8 rounded-full text-sm font-bold transition-all",
                  day === currentDay
                    ? "bg-[#6D00FF] text-white"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Workout Focus Header */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#6D00FF]/20 to-transparent border border-[#6D00FF]/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#6D00FF]" />
                  <span className="font-bold">{dayPlan.workout.focus}</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    INTENSITY_COLORS[dayPlan.workout.intensity as keyof typeof INTENSITY_COLORS] ||
                      INTENSITY_COLORS.medium
                  )}
                >
                  {dayPlan.workout.intensity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{dayPlan.workout.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>{dayPlan.nutrition.calories} kcal</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🥩</span>
                  <span>{dayPlan.nutrition.protein}g proteína</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: "workout", label: "Entreno", icon: Dumbbell },
                { id: "habits", label: "Hábitos", icon: Sun },
                { id: "nutrition", label: "Nutrición", icon: Utensils },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                    activeTab === tab.id
                      ? "bg-[#6D00FF] text-white"
                      : "bg-white/5 text-neutral-400 hover:bg-white/10"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "workout" && (
                <motion.div
                  key="workout"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {dayPlan.workout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-neutral-900 border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{exercise.name}</h4>
                        <span className="text-xs text-neutral-400">
                          Rest: {exercise.rest}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-[#6D00FF]">
                          {exercise.sets} series
                        </div>
                        <div className="text-neutral-300">{exercise.reps}</div>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-neutral-500 mt-2 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "habits" && (
                <motion.div
                  key="habits"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Morning */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold">Mañana</h4>
                    </div>
                    <ul className="space-y-2">
                      {dayPlan.habits.morning.map((habit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span className="text-neutral-300">{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evening */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold">Noche</h4>
                    </div>
                    <ul className="space-y-2">
                      {dayPlan.habits.evening.map((habit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span className="text-neutral-300">{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === "nutrition" && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Macros */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 text-center">
                      <p className="text-2xl font-black text-[#6D00FF]">
                        {dayPlan.nutrition.calories}
                      </p>
                      <p className="text-xs text-neutral-400">Calorías</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 text-center">
                      <p className="text-2xl font-black text-emerald-400">
                        {dayPlan.nutrition.protein}g
                      </p>
                      <p className="text-xs text-neutral-400">Proteína</p>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-white/5">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-[#6D00FF]" />
                      Comidas sugeridas
                    </h4>
                    <ul className="space-y-3">
                      {dayPlan.nutrition.meals.map((meal, index) => (
                        <li
                          key={index}
                          className="text-neutral-300 pl-4 border-l-2 border-[#6D00FF]/30"
                        >
                          {meal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mindset Quote */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-[#6D00FF]" />
                <h4 className="font-bold text-sm text-neutral-400">
                  MENTALIDAD DEL DÍA
                </h4>
              </div>
              <p className="text-lg text-white/90 italic leading-relaxed">
                "{dayPlan.mindset}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent p-4">
        <div className="max-w-2xl mx-auto">
          <a
            href={`/s/${shareId}`}
            className="block w-full py-4 px-6 rounded-2xl bg-[#6D00FF] text-center text-white font-bold hover:bg-[#5800CC] transition-colors"
          >
            Ver Mi Transformación
          </a>
        </div>
      </div>
    </div>
  );
}
