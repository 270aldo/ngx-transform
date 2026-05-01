'use client';

/**
 * AgentOrchestration - GENESIS central con 4 capacidades
 * v11.0: GENESIS es la única entidad visible, los módulos son internos
 * Consume SSE desde /api/genesis-demo
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Flame,
  Leaf,
  Activity,
  Sparkles,
  Check,
  Loader2,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import type { AgentType, AgentStatus, AgentState } from '@/types/genesis';
import { AGENT_META, ORCHESTRATION_PHASES } from '@/lib/genesis-demo/agents';
import { ProgressBar } from '@/components/widgets/ProgressBar';

// v11.0: 4 capacidades de GENESIS (mapean a módulos internos)
const GENESIS_CAPABILITIES = [
  {
    key: 'entrenamiento',
    label: 'Entrenamiento',
    icon: Flame,
    color: '#fb923c',
    legacyAgents: ['BLAZE', 'ATLAS', 'TEMPO'], // módulos internos
  },
  {
    key: 'nutricion',
    label: 'Nutrición',
    icon: Leaf,
    color: '#34d399',
    legacyAgents: ['SAGE', 'MACRO', 'METABOL'],
  },
  {
    key: 'recuperacion',
    label: 'Recuperación',
    icon: Timer,
    color: '#7D1AFF',
    legacyAgents: ['WAVE', 'NOVA', 'LUNA'],
  },
  {
    key: 'habitos',
    label: 'Hábitos',
    icon: Sparkles,
    color: '#a78bfa',
    legacyAgents: ['SPARK', 'STELLA', 'LOGOS'],
  },
] as const;

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
  // v11.0: Track capability states instead of individual agents
  const [capabilityStates, setCapabilityStates] = useState<Record<string, AgentStatus>>({
    entrenamiento: 'pending',
    nutricion: 'pending',
    recuperacion: 'pending',
    habitos: 'pending',
  });

  // Legacy agent states for SSE compatibility
  const [agentStates, setAgentStates] = useState<Record<AgentType, AgentStatus>>(() => {
    const initial: Record<string, AgentStatus> = {};
    ['GENESIS', 'BLAZE', 'ATLAS', 'TEMPO', 'SAGE', 'MACRO', 'METABOL', 'WAVE', 'NOVA', 'LUNA', 'SPARK', 'STELLA', 'LOGOS'].forEach((agent) => {
      initial[agent] = 'pending';
    });
    return initial as Record<AgentType, AgentStatus>;
  });

  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [phaseTitle, setPhaseTitle] = useState<string>('Preparando análisis...');
  const [feedMessages, setFeedMessages] = useState<FeedMessage[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  // v11.0: Calculate progress based on capabilities (4 total)
  const calculateProgress = useCallback((states: Record<AgentType, AgentStatus>) => {
    // Map legacy agents to capabilities and calculate
    let completedCapabilities = 0;
    GENESIS_CAPABILITIES.forEach((cap) => {
      const allComplete = cap.legacyAgents.every((agent) => states[agent] === 'complete');
      if (allComplete) completedCapabilities++;
    });
    return Math.round((completedCapabilities / 4) * 100);
  }, []);

  // Update capability states when agent states change
  useEffect(() => {
    const newCapStates: Record<string, AgentStatus> = {};
    GENESIS_CAPABILITIES.forEach((cap) => {
      const statuses = cap.legacyAgents.map((agent) => agentStates[agent]);
      if (statuses.every((s) => s === 'complete')) {
        newCapStates[cap.key] = 'complete';
      } else if (statuses.some((s) => s === 'analyzing')) {
        newCapStates[cap.key] = 'analyzing';
      } else {
        newCapStates[cap.key] = 'pending';
      }
    });
    setCapabilityStates(newCapStates);
  }, [agentStates]);

  const [hasError, setHasError] = useState(false);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // SSE connection
  useEffect(() => {
    mountedRef.current = true;
    const eventSource = new EventSource(`/api/genesis-demo?shareId=${shareId}`);

    eventSource.addEventListener('phase', (e) => {
      if (!mountedRef.current) return;
      const data = JSON.parse(e.data);
      setCurrentPhase(data.phase);
      setPhaseTitle(data.title);
    });

    eventSource.addEventListener('agent', (e) => {
      if (!mountedRef.current) return;
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
      if (!mountedRef.current) return;
      setIsComplete(true);
      setProgress(100);
      eventSource.close();
      completionTimerRef.current = setTimeout(() => {
        if (mountedRef.current) onComplete();
      }, 1500);
    });

    eventSource.addEventListener('error', (e) => {
      if (eventSource.readyState !== EventSource.CLOSED) {
        console.error('SSE connection error:', e);
        if (mountedRef.current) setHasError(true);
      }
      eventSource.close();
    });

    return () => {
      mountedRef.current = false;
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
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

        {/* v11.0: GENESIS Central + 4 Capacidades */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center mb-6"
        >
          {/* GENESIS Nucleus */}
          <motion.div
            className="relative w-24 h-24 mb-6"
            animate={{
              boxShadow: isComplete
                ? '0 0 40px rgba(109, 0, 255, 0.5)'
                : '0 0 20px rgba(109, 0, 255, 0.3)'
            }}
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(circle, #6D00FF 0%, #4B0082 100%)',
              border: '2px solid rgba(109, 0, 255, 0.6)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            {!isComplete && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  border: '2px dashed rgba(255,255,255,0.2)',
                }}
              />
            )}
          </motion.div>

          {/* 4 Capability Nodes */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {GENESIS_CAPABILITIES.map((cap, index) => {
              const status = capabilityStates[cap.key];
              const IconComponent = cap.icon;

              return (
                <motion.div
                  key={cap.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor:
                      status === 'complete'
                        ? `${cap.color}20`
                        : status === 'analyzing'
                        ? `${cap.color}10`
                        : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${
                      status === 'complete'
                        ? `${cap.color}40`
                        : status === 'analyzing'
                        ? `${cap.color}30`
                        : 'rgba(255,255,255,0.05)'
                    }`,
                  }}
                >
                  {/* Status indicator */}
                  <div className="mb-2">
                    {status === 'complete' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: cap.color }}
                      >
                        <Check size={14} className="text-white" />
                      </motion.div>
                    ) : status === 'analyzing' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 size={20} style={{ color: cap.color }} />
                      </motion.div>
                    ) : (
                      <IconComponent
                        size={20}
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      />
                    )}
                  </div>

                  {/* Capability label */}
                  <span
                    className="text-xs font-semibold text-center"
                    style={{
                      color:
                        status === 'pending'
                          ? 'rgba(255,255,255,0.4)'
                          : cap.color,
                    }}
                  >
                    {cap.label}
                  </span>

                  {/* Pulse animation for analyzing */}
                  {status === 'analyzing' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        boxShadow: [
                          `0 0 0 0 ${cap.color}00`,
                          `0 0 0 4px ${cap.color}30`,
                          `0 0 0 0 ${cap.color}00`,
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Feed Messages - v11.0: GENESIS habla, módulos son internos */}
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
            <Activity size={12} className="text-[#6D00FF]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              GENESIS en tiempo real
            </span>
          </div>

          <div className="space-y-2 min-h-[100px]">
            <AnimatePresence mode="popLayout">
              {feedMessages.map((msg, index) => {
                // v11.0: Map agent to capability label
                const capabilityMap: Record<string, { label: string; color: string }> = {
                  BLAZE: { label: 'Entrenamiento', color: '#fb923c' },
                  ATLAS: { label: 'Entrenamiento', color: '#fb923c' },
                  TEMPO: { label: 'Entrenamiento', color: '#fb923c' },
                  SAGE: { label: 'Nutrición', color: '#34d399' },
                  MACRO: { label: 'Nutrición', color: '#34d399' },
                  METABOL: { label: 'Nutrición', color: '#34d399' },
                  WAVE: { label: 'Recuperación', color: '#7D1AFF' },
                  NOVA: { label: 'Recuperación', color: '#7D1AFF' },
                  LUNA: { label: 'Recuperación', color: '#7D1AFF' },
                  SPARK: { label: 'Hábitos', color: '#a78bfa' },
                  STELLA: { label: 'Hábitos', color: '#a78bfa' },
                  LOGOS: { label: 'Hábitos', color: '#a78bfa' },
                  GENESIS: { label: 'GENESIS', color: '#6D00FF' },
                };
                const cap = capabilityMap[msg.agent] || { label: 'GENESIS', color: '#6D00FF' };

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
                      style={{ color: cap.color }}
                    >
                      GENESIS • {cap.label}:
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

        {/* Error recovery */}
        <AnimatePresence>
          {hasError && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-red-400">
                <Activity size={16} />
                <span className="text-sm font-bold">Conexión perdida</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1 mb-3">
                Se interrumpió la conexión con GENESIS.
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setAgentStates(() => {
                    const initial: Record<string, AgentStatus> = {};
                    ['GENESIS', 'BLAZE', 'ATLAS', 'TEMPO', 'SAGE', 'MACRO', 'METABOL', 'WAVE', 'NOVA', 'LUNA', 'SPARK', 'STELLA', 'LOGOS'].forEach((agent) => {
                      initial[agent] = 'pending';
                    });
                    return initial as Record<AgentType, AgentStatus>;
                  });
                  setProgress(0);
                  setFeedMessages([]);
                  setPhaseTitle('Preparando análisis...');
                }}
                className="px-4 py-2 bg-[#6D00FF] text-white text-xs font-bold rounded-full hover:bg-[#5800cc] transition-colors"
              >
                Reintentar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion indicator - v11.0: GENESIS es la única entidad */}
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
                Preparando tu conversación con GENESIS...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AgentOrchestration;
