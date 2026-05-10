'use client';

/**
 * DemoChat - Chat interface with quick actions and A2UI widgets
 * v11.0: All messages from GENESIS with capability labels
 * Maximum 5 interactions before redirecting to plan
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Dumbbell,
  Utensils,
  HelpCircle,
  Sun,
  Calendar,
  ChevronRight,
  Brain,
} from 'lucide-react';
import type {
  AgentType,
  QuickAction as QuickActionType,
  WorkoutData,
  MealData,
  InsightData,
  ChecklistData,
  GenesisCapability,
} from '@/types/genesis';
import { INITIAL_QUICK_ACTIONS, CONTEXTUAL_QUICK_ACTIONS } from '@/lib/genesis-demo/agents';
import { WorkoutCard } from '@/components/widgets/WorkoutCard';
import { MealPlan } from '@/components/widgets/MealPlan';
import { InsightCard } from '@/components/widgets/InsightCard';
import { ChecklistWidget } from '@/components/widgets/ChecklistWidget';

// v11.0: Capability labels and colors
const CAPABILITY_META: Record<GenesisCapability, { label: string; color: string }> = {
  entrenamiento: { label: 'Entrenamiento', color: '#fb923c' },
  nutricion: { label: 'Nutrición', color: '#34d399' },
  recuperacion: { label: 'Recuperación', color: '#7D1AFF' },
  habitos: { label: 'Hábitos', color: '#a78bfa' },
};

// Map legacy agent types to capabilities for display
const AGENT_TO_CAPABILITY: Partial<Record<AgentType, GenesisCapability>> = {
  BLAZE: 'entrenamiento',
  ATLAS: 'entrenamiento',
  TEMPO: 'entrenamiento',
  SAGE: 'nutricion',
  MACRO: 'nutricion',
  METABOL: 'nutricion',
  WAVE: 'recuperacion',
  NOVA: 'recuperacion',
  LUNA: 'recuperacion',
  SPARK: 'habitos',
  STELLA: 'habitos',
  LOGOS: 'habitos',
};

// Icon map for quick actions
const ICON_MAP: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell size={14} />,
  Utensils: <Utensils size={14} />,
  HelpCircle: <HelpCircle size={14} />,
  Sun: <Sun size={14} />,
  Calendar: <Calendar size={14} />,
};

// Sample data for widgets
const SAMPLE_WORKOUT = {
  title: 'HIIT Upper Body',
  category: 'Fuerza + Cardio',
  duration: 45,
  calories: 420,
  exercises: [
    { name: 'Push-ups', sets: 4, reps: '12' },
    { name: 'Dumbbell Rows', sets: 4, reps: '10' },
    { name: 'Shoulder Press', sets: 3, reps: '12' },
    { name: 'Plank to Push-up', sets: 3, reps: '8' },
  ],
  coachNote: 'Mantén 60-90 segundos de descanso entre series para maximizar la hipertrofia.',
};

const SAMPLE_MEAL = {
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

const SAMPLE_INSIGHT = {
  title: 'Tu Plan Personalizado',
  trend: 'positive' as const,
  trendValue: '+85%',
  insight: 'Basado en tu perfil de nivel intermedio con 3 años de experiencia, hemos diseñado un programa que combina fuerza progresiva con HIIT para maximizar la definición muscular por Seasons.',
  recommendation: 'Tu ventana anabólica óptima es de 30-45 minutos post-entreno. Prioriza proteína de rápida absorción en este período.',
};

const SAMPLE_CHECKLIST = {
  title: 'Rutina Matutina - Día 1',
  items: [
    { id: '1', text: 'Despertar a las 6:30am', checked: false },
    { id: '2', text: '10 minutos de stretching', checked: false },
    { id: '3', text: 'Preparar meals del día', checked: false },
    { id: '4', text: 'Revisar entreno en la app', checked: false },
    { id: '5', text: 'Hidratación: 500ml de agua', checked: false },
  ],
};

interface Message {
  id: string;
  agent: AgentType;
  capability: GenesisCapability;
  content: string;
  widget?: DemoWidget;
}

type DemoWidget =
  | { type: 'workout'; data: WorkoutData }
  | { type: 'meal'; data: MealData }
  | { type: 'insight'; data: InsightData }
  | { type: 'checklist'; data: ChecklistData };

interface DemoChatProps {
  shareId: string;
  onComplete: () => void;
}

export function DemoChat({ onComplete }: DemoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [remainingMessages, setRemainingMessages] = useState(5);
  const [quickActions, setQuickActions] = useState<QuickActionType[]>(INITIAL_QUICK_ACTIONS);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);
  const completedInteractions = 5 - remainingMessages;

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return `msg-${messageIdRef.current}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: "end",
      behavior: messages.length > 1 ? "smooth" : "auto",
    });
  }, [isTyping, messages.length]);

  // v11.0: Initial message from GENESIS (Entrenamiento capability)
  useEffect(() => {
    const initialMessage: Message = {
      id: 'initial',
      agent: 'GENESIS',
      capability: 'entrenamiento',
      content: 'He diseñado tu entrenamiento del Día 1 basado en tu perfil de nivel intermedio y objetivo de definición.',
      widget: {
        type: 'workout',
        data: SAMPLE_WORKOUT,
      },
    };

    const setupTimer = setTimeout(() => setIsTyping(true), 0);
    const messageTimer = setTimeout(() => {
      setMessages([initialMessage]);
      setIsTyping(false);
      setRemainingMessages(4);
    }, 1000);
    return () => {
      clearTimeout(setupTimer);
      clearTimeout(messageTimer);
    };
  }, []);

  const handleQuickAction = (action: QuickActionType) => {
    if (remainingMessages <= 0) return;

    setIsTyping(true);

    // Determine response based on action
    let response: Message;
    let newQuickActions: QuickActionType[];

    // v11.0: resolve capability from legacy agent key
    const capability = AGENT_TO_CAPABILITY[action.agent] || 'entrenamiento';

    switch (action.widgetType) {
      case 'meal':
        response = {
          id: nextMessageId(),
          agent: 'GENESIS',
          capability: 'nutricion',
          content: 'Aquí está tu plan nutricional optimizado para tu objetivo de definición.',
          widget: { type: 'meal', data: SAMPLE_MEAL },
        };
        newQuickActions = CONTEXTUAL_QUICK_ACTIONS.meal || [];
        break;

      case 'insight':
        response = {
          id: nextMessageId(),
          agent: 'GENESIS',
          capability,
          content: 'Este es el análisis de por qué tu plan está diseñado así.',
          widget: { type: 'insight', data: SAMPLE_INSIGHT },
        };
        newQuickActions = CONTEXTUAL_QUICK_ACTIONS.insight || [];
        break;

      case 'checklist':
        response = {
          id: nextMessageId(),
          agent: 'GENESIS',
          capability: 'habitos',
          content: 'Tu rutina matutina para empezar el día con energía.',
          widget: { type: 'checklist', data: SAMPLE_CHECKLIST },
        };
        newQuickActions = CONTEXTUAL_QUICK_ACTIONS.checklist || [];
        break;

      case 'workout':
        response = {
          id: nextMessageId(),
          agent: 'GENESIS',
          capability: 'entrenamiento',
          content: 'Aquí tienes tu entrenamiento completo del Día 1.',
          widget: { type: 'workout', data: SAMPLE_WORKOUT },
        };
        newQuickActions = CONTEXTUAL_QUICK_ACTIONS.workout || [];
        break;

      default:
        // Final action - go to plan
        onComplete();
        return;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
      setRemainingMessages((prev) => prev - 1);

      // If this was the last message, show plan CTA
      if (remainingMessages - 1 <= 1) {
        setQuickActions([
          {
            id: 'plan',
            label: 'Ver plan completo',
            icon: 'Calendar',
            agent: 'GENESIS',
          },
        ]);
      } else {
        setQuickActions(newQuickActions);
      }
    }, 1500);
  };

  const renderWidget = (widget: Message['widget'], agent: AgentType) => {
    if (!widget) return null;

    switch (widget.type) {
      case 'workout':
        return <WorkoutCard data={widget.data} agent={agent} />;
      case 'meal':
        return <MealPlan data={widget.data} agent={agent} />;
      case 'insight':
        return <InsightCard data={widget.data} agent={agent} />;
      case 'checklist':
        return <ChecklistWidget data={widget.data} agent={agent} interactive={false} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-transparent flex flex-col text-white">
      {/* Header */}
      <div
        className="shrink-0 backdrop-blur-lg border-b border-[color:var(--ngx-border-subtle)] p-4"
        style={{ backgroundColor: "rgba(5,5,8,0.80)" }}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[color:var(--ngx-purple-light)]" />
            <span className="text-sm font-bold text-white tracking-wide">GENESIS</span>
          </div>
          <div
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] border"
            style={{
              backgroundColor: 'var(--ngx-purple-glass)',
              borderColor: 'rgba(109,0,255,0.30)',
              color: 'var(--ngx-purple-light)',
            }}
          >
            Demo {completedInteractions}/5
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => {
              const capMeta = CAPABILITY_META[message.capability];
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* GENESIS message with capability label */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="ngx-icon-box h-9 w-9 shrink-0">
                      <Brain size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ngx-purple-light)]">
                          GENESIS
                        </span>
                        <span className="text-[9px] text-white/30">·</span>
                        <span
                          className="text-[10px] font-medium uppercase tracking-[0.18em]"
                          style={{ color: capMeta.color }}
                        >
                          {capMeta.label}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 mt-1.5 leading-relaxed">{message.content}</p>
                    </div>
                  </div>

                  {/* Widget */}
                  {message.widget && renderWidget(message.widget, message.agent)}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/50 pl-12"
            >
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[color:var(--ngx-purple)]"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-[color:var(--ngx-purple)]"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-[color:var(--ngx-purple)]"
                />
              </div>
              <span className="text-xs">Analizando...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="shrink-0 backdrop-blur-lg border-t border-[color:var(--ngx-border-subtle)] p-4"
        style={{ backgroundColor: "rgba(5,5,8,0.80)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action)}
                disabled={isTyping}
                className="ngx-metal-card !p-3.5 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[color:var(--ngx-purple-light)] shrink-0">
                      {ICON_MAP[action.icon] || <MessageCircle size={14} />}
                    </span>
                    <span className="text-xs text-white font-medium truncate">{action.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-white/40 shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoChat;
