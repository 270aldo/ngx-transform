'use client';

/**
 * AgentOrchestration - Grid de 13 agentes con animación de análisis
 * Consume SSE desde /api/genesis-demo
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Check,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import type { AgentType, AgentStatus, AgentState } from '@/types/genesis';
import { AGENT_META, ORCHESTRATION_PHASES } from '@/lib/genesis-demo/agents';
import { ProgressBar } from '@/components/widgets/ProgressBar';

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, Flame, Move, Heart, Activity, Leaf, PieChart,
  Zap, Sparkles, Sun, BarChart2, Moon, BookOpen,
};

// All agents in grid order
const GRID_AGENTS: (AgentType | null)[] = [
  'GENESIS', 'STELLA', 'LOGOS', 'BLAZE',
  'TEMPO', 'ATLAS', 'SAGE', 'MACRO',
  'METABOL', 'WAVE', 'SPARK', 'NOVA',
  'LUNA', null, null, null,
];

interface AgentOrchestrationProps {
  shareId: string;
  onComplete: () => void;
}

interface FeedMessage {
  agent: AgentType;
  message: string;
  timestamp: number;
}

export function AgentOrchestration({ shareId, onComplete }: AgentOrchestrationProps) {
  const [agentStates, setAgentStates] = useState<Record<AgentType, AgentStatus>>(() => {
    const initial: Record<string, AgentStatus> = {};
    GRID_AGENTS.forEach((agent) => {
      if (agent) initial[agent] = 'pending';
    });
    return initial as Record<AgentType, AgentStatus>;
  });

  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [phaseTitle, setPhaseTitle] = useState<string>('Preparando análisis...');
  const [feedMessages, setFeedMessages] = useState<FeedMessage[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate progress based on completed agents
  const calculateProgress = useCallback((states: Record<AgentType, AgentStatus>) => {
    const totalAgents = 13;
    const completedAgents = Object.values(states).filter((s) => s === 'complete').length;
    return Math.round((completedAgents / totalAgents) * 100);
  }, []);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource(`/api/genesis-demo?shareId=${shareId}`);

    eventSource.addEventListener('phase', (e) => {
      const data = JSON.parse(e.data);
      setCurrentPhase(data.phase);
      setPhaseTitle(data.title);
    });

    eventSource.addEventListener('agent', (e) => {
      const data = JSON.parse(e.data);
      const { agent, status, message } = data as AgentState;

      setAgentStates((prev) => {
        const newStates = { ...prev, [agent]: status };
        setProgress(calculateProgress(newStates));
        return newStates;
      });

      // Add to feed (only if message is defined)
      if (message) {
        setFeedMessages((prev) => [
          { agent, message, timestamp: Date.now() },
          ...prev.slice(0, 4), // Keep last 5 messages
        ]);
      }
    });

    eventSource.addEventListener('complete', () => {
      setIsComplete(true);
      setProgress(100);
      eventSource.close(); // Close connection after completion
      setTimeout(() => {
        onComplete();
      }, 1500);
    });

    eventSource.addEventListener('error', (e) => {
      // Only log error if connection failed unexpectedly (not after complete)
      if (eventSource.readyState !== EventSource.CLOSED) {
        console.error('SSE connection error:', e);
      }
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [shareId, onComplete, calculateProgress]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain size={20} className="text-[#6D00FF]" />
            <h1 className="text-lg font-bold text-white">
              GENESIS está analizando tu perfil
            </h1>
          </div>
          <p className="text-sm text-white/50">{phaseTitle}</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <ProgressBar
            progress={progress}
            color="#6D00FF"
            height={8}
            showPercentage
          />
        </motion.div>

        {/* Agent Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-2 mb-6"
        >
          {GRID_AGENTS.map((agent, index) => {
            if (!agent) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const meta = AGENT_META[agent];
            const status = agentStates[agent];
            const IconComponent = ICON_MAP[meta.icon] || Brain;

            return (
              <motion.div
                key={agent}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="aspect-square rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor:
                    status === 'complete'
                      ? `${meta.color}20`
                      : status === 'analyzing'
                      ? `${meta.color}10`
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    status === 'complete'
                      ? `${meta.color}40`
                      : status === 'analyzing'
                      ? `${meta.color}30`
                      : 'rgba(255,255,255,0.05)'
                  }`,
                }}
              >
                {/* Status indicator */}
                <div className="mb-1">
                  {status === 'complete' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: meta.color }}
                    >
                      <Check size={12} className="text-white" />
                    </motion.div>
                  ) : status === 'analyzing' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 size={16} style={{ color: meta.color }} />
                    </motion.div>
                  ) : (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    />
                  )}
                </div>

                {/* Agent icon */}
                <IconComponent
                  size={14}
                  style={{
                    color:
                      status === 'pending'
                        ? 'rgba(255,255,255,0.3)'
                        : meta.color,
                  }}
                />

                {/* Agent name */}
                <span
                  className="text-[8px] font-bold uppercase mt-1 text-center"
                  style={{
                    color:
                      status === 'pending'
                        ? 'rgba(255,255,255,0.3)'
                        : meta.color,
                  }}
                >
                  {meta.name}
                </span>

                {/* Pulse animation for analyzing */}
                {status === 'analyzing' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${meta.color}00`,
                        `0 0 0 4px ${meta.color}30`,
                        `0 0 0 0 ${meta.color}00`,
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feed Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity size={12} className="text-white/50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Feed en tiempo real
            </span>
          </div>

          <div className="space-y-2 min-h-[100px]">
            <AnimatePresence mode="popLayout">
              {feedMessages.map((msg, index) => {
                const meta = AGENT_META[msg.agent];
                return (
                  <motion.div
                    key={msg.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1 - index * 0.15, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-xs"
                  >
                    <span
                      className="font-bold mr-2"
                      style={{ color: meta.color }}
                    >
                      [{meta.name}]
                    </span>
                    <span className="text-white/70">{msg.message}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {feedMessages.length === 0 && (
              <div className="text-xs text-white/30 text-center py-4">
                Iniciando análisis...
              </div>
            )}
          </div>
        </motion.div>

        {/* Completion indicator */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-[#00FF88]">
                <Check size={16} />
                <span className="text-sm font-bold">Análisis completado</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1">
                Preparando tu chat con los agentes...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AgentOrchestration;
