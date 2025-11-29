"use client";

import { motion } from "framer-motion";
import type { TimelineStep } from "./TransformationViewer";

interface TimelineNavProps {
  currentStep: TimelineStep;
  onStepChange: (step: TimelineStep) => void;
}

const steps: { key: TimelineStep; label: string }[] = [
  { key: "m0", label: "HOY" },
  { key: "m4", label: "MES 4" },
  { key: "m8", label: "MES 8" },
  { key: "m12", label: "MES 12" },
];

export function TimelineNav({ currentStep, onStepChange }: TimelineNavProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full">
      {/* Progress line */}
      <div className="relative h-0.5 sm:h-1 bg-neutral-800 rounded-full mb-3 sm:mb-4 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
          initial={false}
          animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step buttons */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isPast = index < currentIndex;

          return (
            <button
              key={step.key}
              onClick={() => onStepChange(step.key)}
              className="relative flex flex-col items-center gap-1.5 sm:gap-2 group min-h-[44px] px-1"
            >
              {/* Dot with glow effect */}
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="timeline-glow"
                    className="absolute -inset-1.5 sm:-inset-2 bg-[var(--primary)]/30 rounded-full blur-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  className={`
                    relative w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-300
                    ${isActive
                      ? "bg-[var(--primary)] border-[var(--primary)] shadow-[0_0_12px_var(--primary)]"
                      : isPast
                        ? "bg-[var(--primary)]/50 border-[var(--primary)]/50"
                        : "bg-neutral-800 border-neutral-600 group-hover:border-neutral-400"
                    }
                  `}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              </div>

              {/* Label */}
              <span
                className={`
                  text-[10px] sm:text-xs font-medium transition-colors duration-300
                  ${isActive
                    ? "text-white"
                    : isPast
                      ? "text-neutral-400"
                      : "text-neutral-500 group-hover:text-neutral-300"
                  }
                `}
              >
                {step.label}
              </span>

              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="timeline-indicator"
                  className="absolute -bottom-1 w-6 sm:w-8 h-0.5 bg-[var(--primary)] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
