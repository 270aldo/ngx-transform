"use client";

import { motion } from "framer-motion";
import { AgentStatus } from "@/types/demo";
import { Flame, Brain, Timer } from "lucide-react";

interface AgentStatusBarProps {
  status: AgentStatus;
}

const agentConfigs = [
  {
    key: "blaze" as const,
    name: "BLAZE",
    icon: Flame,
    activeColor: "text-orange-400",
    bgColor: "bg-orange-400",
    description: "Estructura",
  },
  {
    key: "sage" as const,
    name: "SAGE",
    icon: Brain,
    activeColor: "text-emerald-400",
    bgColor: "bg-emerald-400",
    description: "Progresión",
  },
  {
    key: "tempo" as const,
    name: "TEMPO",
    icon: Timer,
    activeColor: "text-blue-400",
    bgColor: "bg-blue-400",
    description: "Tiempos",
  },
];

export function AgentStatusBar({ status }: AgentStatusBarProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4 px-6 bg-white/5 rounded-xl border border-white/10">
      {agentConfigs.map((agent) => {
        const agentStatus = status[agent.key];
        const Icon = agent.icon;
        const isActive = agentStatus !== "pending";
        const isLoading = agentStatus === "loading";
        const isComplete = agentStatus === "complete";

        return (
          <div key={agent.key} className="flex flex-col items-center gap-2">
            {/* Icon with status indicator */}
            <div className="relative">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? "bg-white/10" : "bg-white/5"
                }`}
                animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.6, repeat: isLoading ? Infinity : 0 }}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? agent.activeColor : "text-neutral-600"
                  }`}
                />
              </motion.div>

              {/* Status dot */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black transition-colors ${
                  isComplete
                    ? agent.bgColor
                    : isLoading
                    ? `${agent.bgColor} animate-pulse`
                    : "bg-neutral-600"
                }`}
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <p
                className={`text-xs font-medium transition-colors ${
                  isActive ? agent.activeColor : "text-neutral-600"
                }`}
              >
                {agent.name}
              </p>
              <p className="text-[10px] text-neutral-500">{agent.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compact version for inline use
export function AgentStatusInline({ status }: AgentStatusBarProps) {
  return (
    <div className="flex items-center gap-3">
      {agentConfigs.map((agent) => {
        const agentStatus = status[agent.key];
        const isActive = agentStatus !== "pending";
        const isLoading = agentStatus === "loading";
        const isComplete = agentStatus === "complete";

        return (
          <div key={agent.key} className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                isComplete
                  ? agent.bgColor
                  : isLoading
                  ? `${agent.bgColor} animate-pulse`
                  : "bg-neutral-600"
              }`}
            />
            <span
              className={`text-xs transition-colors ${
                isActive ? agent.activeColor : "text-neutral-600"
              }`}
            >
              {agent.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
