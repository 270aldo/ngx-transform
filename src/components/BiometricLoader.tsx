"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import { RiveOrb } from "@/components/RiveOrb";

const LOADING_STEPS = [
  "Leyendo tu foto base...",
  "Calibrando tu punto de partida...",
  "Visualizando Season 1...",
  "Visualizando Season 2...",
  "Construyendo Season 3...",
  "Preparando tu lectura inicial...",
] as const;

const TIPS = [
  "La disciplina vence a la motivación cuando hay sistema.",
  "Tu cuerpo refleja la calidad de tus decisiones diarias.",
  "La constancia es el multiplicador de resultados.",
  "No busques tiempo, diseña tu entorno para crearlo.",
] as const;

export function BiometricLoader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() * 2;
        return Math.min(prev + increment, 100);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden text-white py-10 md:py-0"
      style={{ background: "rgba(5, 5, 8, 0.95)" }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ backgroundColor: "rgba(109,0,255,0.18)" }}
      />
      <div
        className="pointer-events-none absolute right-[-8%] bottom-[12%] h-[360px] w-[360px] rounded-full blur-[120px]"
        style={{ backgroundColor: "rgba(109,0,255,0.10)" }}
      />

      {/* GENESIS orb */}
      <div className="mb-6 md:mb-10">
        <RiveOrb>
          <span className="font-mono font-bold text-3xl md:text-4xl tabular-nums tracking-[-0.02em] text-white">
            {Math.round(progress)}%
          </span>
        </RiveOrb>
      </div>

      {/* Status */}
      <div className="space-y-4 text-center z-10 max-w-md px-6">
        <div className="flex justify-center mb-2">
          <Logo variant="full" size="md" />
        </div>
        <h2
          className="ngx-eyebrow text-[12px] !tracking-[0.22em] animate-pulse"
          style={{ color: "var(--ngx-purple-light)" }}
        >
          {LOADING_STEPS[stepIndex]}
        </h2>
        <div className="h-1 w-full rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.04]">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
              boxShadow: "0 0 12px rgba(109,0,255,0.40)",
            }}
          />
        </div>
      </div>

      {/* Tip card — relative on mobile, absolute on md+ */}
      <div className="mt-8 px-6 w-full max-w-lg text-center md:absolute md:mt-0 md:bottom-12">
        <div className="ngx-metal-card !p-5">
          <div className="relative z-10">
            <p className="text-sm text-white/75 leading-relaxed animate-[fadeIn_0.5s_ease-in-out]" key={tipIndex}>
              {TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
