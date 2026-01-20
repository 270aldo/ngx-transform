"use client";

/**
 * HeroTransformation Component
 *
 * Wrapper for CompareSlider that integrates with the landing page theme.
 * Shows a before/after transformation demo with glow effects.
 *
 * Features:
 * - Reuses production-ready CompareSlider
 * - Theme-aware glow and styling
 * - Animated entrance
 * - Fallback to HeroPreview if no images
 */

import { motion } from "framer-motion";
import { CompareSlider } from "@/components/results/CompareSlider";
import { useLandingConfig } from "./LandingProvider";
import { User, Sparkles } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface HeroTransformationProps {
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function HeroTransformation({ className }: HeroTransformationProps) {
  const { config } = useLandingConfig();
  const { theme, copy } = config;
  const { transformationDemo } = copy.hero;

  // If no transformation demo images, show fallback preview
  if (!transformationDemo?.beforeImage || !transformationDemo?.afterImage) {
    return <HeroPreviewFallback theme={theme} />;
  }

  return (
    <motion.div
      className={`relative w-full max-w-md mx-auto group ${className ?? ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Glow Effect */}
      <div
        className="absolute -inset-4 rounded-[28px] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.primary}66, ${theme.primary}22, transparent 70%)`,
        }}
      />

      {/* CompareSlider Container */}
      <div className="relative">
        {/* Glass border effect */}
        <div
          className="absolute -inset-[1px] rounded-[20px] opacity-50"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}66, transparent 50%, ${theme.accent}33)`,
          }}
        />

        {/* Main Slider */}
        <CompareSlider
          beforeImage={transformationDemo.beforeImage}
          afterImage={transformationDemo.afterImage}
          beforeLabel={transformationDemo.beforeLabel ?? "ANTES"}
          afterLabel={transformationDemo.afterLabel ?? "DESPUÉS"}
          className="relative z-10 rounded-[20px] shadow-2xl"
          initialPosition={35}
        />
      </div>

      {/* Stats badge floating */}
      <motion.div
        className="absolute -bottom-4 -right-4 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
      >
        <div
          className="px-4 py-2 rounded-xl backdrop-blur-md border shadow-xl"
          style={{
            backgroundColor: `${theme.primary}cc`,
            borderColor: `${theme.accent}66`,
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">
              +34% Proyección
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hint text */}
      <motion.p
        className="mt-6 text-center text-xs text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Arrastra para comparar
      </motion.p>
    </motion.div>
  );
}

// ============================================================================
// Fallback Preview (same as original HeroPreview)
// ============================================================================

interface HeroPreviewFallbackProps {
  theme: {
    primary: string;
    accent: string;
  };
}

function HeroPreviewFallback({ theme }: HeroPreviewFallbackProps) {
  return (
    <div className="animate-on-scroll-scale delay-500 relative w-full max-w-4xl group">
      <div
        className="absolute -inset-1 rounded-[20px] blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000"
        style={{
          background: `linear-gradient(to top, ${theme.primary}33, ${theme.primary}0d, transparent)`,
        }}
      />
      <div className="relative glass-panel rounded-[16px] border border-white/10 overflow-hidden shadow-2xl aspect-video flex flex-col bg-[#050507]/80">
        <div className="glass-highlight" />

        {/* Window Header */}
        <div className="h-10 border-b border-white/5 flex justify-between items-center px-4 bg-black/40">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="text-[9px] text-slate-600 uppercase tracking-widest">
            NGX_Transform_Preview
          </div>
          <div className="w-10" />
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div className="relative z-10 flex items-center gap-8">
            {/* Timeline Preview */}
            <div className="flex items-end gap-4">
              {["HOY", "MES 4", "MES 8", "MES 12"].map((label, i) => (
                <div key={label} className="text-center">
                  <div
                    className={`w-16 h-24 rounded-lg ${
                      i === 0
                        ? "bg-white/5 border border-white/10"
                        : i === 3
                        ? "border shadow-[0_0_20px_rgba(109,0,255,0.3)]"
                        : "bg-white/5 border border-white/5"
                    } flex items-center justify-center`}
                    style={
                      i === 3
                        ? {
                            backgroundColor: `${theme.primary}33`,
                            borderColor: `${theme.primary}66`,
                          }
                        : undefined
                    }
                  >
                    <User
                      className={`w-6 h-6 ${i === 3 ? "" : "text-slate-600"}`}
                      style={i === 3 ? { color: theme.accent } : undefined}
                    />
                  </div>
                  <p
                    className={`mt-2 text-[10px] ${
                      i === 3 ? "font-medium" : "text-slate-500"
                    }`}
                    style={i === 3 ? { color: theme.accent } : undefined}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-2">
              <div
                className="w-16 h-px"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.2), ${theme.primary}80)`,
                }}
              />
              <Sparkles
                className="w-5 h-5 animate-pulse"
                style={{ color: theme.accent }}
              />
            </div>

            {/* Stats Preview */}
            <div className="glass-panel rounded-xl p-4 border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                Proyección
              </p>
              <div className="text-2xl text-white font-semibold">
                +34
                <span className="text-lg" style={{ color: theme.accent }}>
                  %
                </span>
              </div>
              <p className="text-[10px] text-emerald-400">Masa muscular</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
