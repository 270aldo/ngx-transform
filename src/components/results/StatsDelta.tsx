"use client";

/**
 * PR-2: Stats Delta Component
 *
 * Animated display of stats progression between milestones.
 * Shows current stats with delta indicators.
 *
 * Features:
 * - Animated number counting
 * - Delta indicators (+ green, - red)
 * - Visual progress bars
 * - Responsive grid layout
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  strength: number;
  aesthetics: number;
  endurance: number;
  mental: number;
}

interface StatsDeltaProps {
  from: Stats;
  to: Stats;
  className?: string;
  animate?: boolean;
}

const STAT_CONFIG = [
  { key: "strength" as const, label: "FUERZA", icon: "💪" },
  { key: "aesthetics" as const, label: "ESTÉTICA", icon: "✨" },
  { key: "endurance" as const, label: "RESISTENCIA", icon: "🔥" },
  { key: "mental" as const, label: "MENTAL", icon: "🧠" },
];

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export function StatsDelta({
  from,
  to,
  className,
  animate = true,
}: StatsDeltaProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {STAT_CONFIG.map((stat, index) => {
        const fromValue = from[stat.key];
        const toValue = to[stat.key];
        const delta = toValue - fromValue;
        const isPositive = delta > 0;
        const isNegative = delta < 0;

        return (
          <motion.div
            key={stat.key}
            initial={animate ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative p-4 rounded-2xl",
              "bg-gradient-to-br from-neutral-900 to-neutral-950",
              "border border-white/5"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs font-bold text-neutral-400 tracking-wider">
                  {stat.label}
                </span>
              </div>
              {/* Delta indicator */}
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                  isPositive && "bg-emerald-500/20 text-emerald-400",
                  isNegative && "bg-red-500/20 text-red-400",
                  !isPositive && !isNegative && "bg-neutral-500/20 text-neutral-400"
                )}
              >
                {isPositive && <TrendingUp className="w-3 h-3" />}
                {isNegative && <TrendingDown className="w-3 h-3" />}
                {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                <span>
                  {isPositive && "+"}
                  {delta}
                </span>
              </div>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {animate ? <AnimatedNumber value={toValue} /> : toValue}
              </span>
              <span className="text-neutral-500 text-sm">/100</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={animate ? { width: `${fromValue}%` } : { width: `${toValue}%` }}
                animate={{ width: `${toValue}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  toValue >= 80 && "bg-gradient-to-r from-[#6D00FF] to-emerald-400",
                  toValue >= 60 && toValue < 80 && "bg-gradient-to-r from-[#6D00FF] to-[#7D1AFF]",
                  toValue >= 40 && toValue < 60 && "bg-[#6D00FF]",
                  toValue < 40 && "bg-gradient-to-r from-amber-500 to-[#6D00FF]"
                )}
              />
            </div>

            {/* From value (small) */}
            <div className="mt-2 text-xs text-neutral-500">
              Inicio: {fromValue}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
