"use client";

import { motion } from "framer-motion";
import { AgentStatus } from "@/types/demo";
import { Flame, Brain, Timer } from "lucide-react";

interface AgentStatusBarProps {
  status: AgentStatus;
}

// v11.0 Doctrine: Módulos de GENESIS (no agentes individuales)
const moduleConfigs = [
  {
    key: "blaze" as const, // legacy key para compatibilidad
    name: "Entrenamiento",
    icon: Flame,
    activeColor: "text-orange-400",
    bgColor: "bg-orange-400",
    description: "Optimizando",
  },
  {
    key: "sage" as const,
    name: "Nutrición",
    icon: Brain,
    activeColor: "text-emerald-400",
    bgColor: "bg-emerald-400",
    description: "Calibrando",
  },
  {
    key: "tempo" as const,
    name: "Recuperación",
    icon: Timer,
    activeColor: "text-blue-400",
    bgColor: "bg-blue-400",
    description: "Programando",
  },
];

export function AgentStatusBar({ status }: AgentStatusBarProps) {
  // Encontrar módulo activo para mostrar estado de GENESIS
  const activeModule = moduleConfigs.find((m) => status[m.key] === "loading");
  const allComplete = Object.values(status).every((s) => s === "complete");

  return (
    <div className="py-4 px-6 bg-white/5 rounded-xl border border-white/10">
      {/* GENESIS Header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6D00FF] to-[#B98CFF] flex items-center justify-center">
          <Brain className="w-3 h-3 text-white" />
        </div>
        <p className="text-sm font-medium text-white">
          {allComplete
            ? "GENESIS: Análisis completado"
            : activeModule
            ? `GENESIS: ${activeModule.description} ${activeModule.name.toLowerCase()}`
            : "GENESIS: Preparando análisis..."}
        </p>
      </div>

      {/* Module Progress */}
      <div className="flex items-center justify-center gap-6">
        {moduleConfigs.map((module) => {
          const moduleStatus = status[module.key];
          const Icon = module.icon;
          const isActive = moduleStatus !== "pending";
          const isLoading = moduleStatus === "loading";
          const isComplete = moduleStatus === "complete";

          return (
            <div key={module.key} className="flex flex-col items-center gap-2">
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
                      isActive ? module.activeColor : "text-neutral-600"
                    }`}
                  />
                </motion.div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black transition-colors ${
                    isComplete
                      ? module.bgColor
                      : isLoading
                      ? `${module.bgColor} animate-pulse`
                      : "bg-neutral-600"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-medium transition-colors ${
                    isActive ? module.activeColor : "text-neutral-600"
                  }`}
                >
                  {module.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for inline use
export function AgentStatusInline({ status }: AgentStatusBarProps) {
  const activeModule = moduleConfigs.find((m) => status[m.key] === "loading");
  const allComplete = Object.values(status).every((s) => s === "complete");

  return (
    <div className="flex items-center gap-3">
      <Brain className="w-4 h-4 text-[#6D00FF]" />
      <span className="text-xs text-white/70">
        {allComplete
          ? "Análisis completado"
          : activeModule
          ? `${activeModule.description} ${activeModule.name.toLowerCase()}...`
          : "Preparando..."}
      </span>
      <div className="flex items-center gap-2">
        {moduleConfigs.map((module) => {
          const moduleStatus = status[module.key];
          const isComplete = moduleStatus === "complete";
          const isLoading = moduleStatus === "loading";

          return (
            <div
              key={module.key}
              className={`w-2 h-2 rounded-full transition-colors ${
                isComplete
                  ? module.bgColor
                  : isLoading
                  ? `${module.bgColor} animate-pulse`
                  : "bg-neutral-600"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
