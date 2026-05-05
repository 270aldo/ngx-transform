"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";

const LOADING_STEPS = [
  "Iniciando escaneo biométrico...",
  "Analizando densidad muscular...",
  "Calculando potencial metabólico...",
  "Proyectando estructura ósea...",
  "Sintetizando datos genéticos...",
  "Optimizando simetría...",
  "Renderizando proyección 8K...",
  "Finalizando transformación...",
];

const TIPS = [
  "La disciplina vence a la motivación cuando hay sistema.",
  "Tu cuerpo refleja la calidad de tus decisiones diarias.",
  "La constancia es el multiplicador de resultados.",
  "No busques tiempo, diseña tu entorno para crearlo.",
  "La consistencia es la clave del alto rendimiento.",
];

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden text-white py-10 md:py-0" style={{ background: "rgba(5, 5, 8, 0.95)" }}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Genesis ambient glow */}
      <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full blur-[120px]" style={{ backgroundColor: "rgba(109,0,255,0.18)" }} />

      {/* Scanner Ring */}
      <div className="relative w-64 h-64 mb-12">
        <div className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite]" style={{ border: "4px solid rgba(109,0,255,0.30)" }} />
        <div className="absolute inset-2 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ border: "2px dashed rgba(109,0,255,0.50)" }} />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full animate-pulse blur-xl" style={{ background: "rgba(109,0,255,0.10)" }} />
        </div>

        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden">
          <div className="w-full h-2 absolute top-0 animate-[scan_3s_ease-in-out_infinite]" style={{ backgroundColor: "var(--ngx-purple)", boxShadow: "0 0 20px var(--ngx-purple)" }} />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-4xl tabular-nums tracking-[-0.02em] text-white">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3 text-center z-10 max-w-md px-6">
        <div className="flex justify-center mb-2">
          <Logo variant="full" size="md" />
        </div>
        <h2
          className="ngx-eyebrow text-[12px] !tracking-[0.22em] animate-pulse"
          style={{ color: "var(--ngx-purple-light)" }}
        >
          {LOADING_STEPS[stepIndex]}
        </h2>
        <div className="h-1 w-full rounded-full overflow-hidden mt-4 bg-white/[0.06] border border-white/[0.04]">
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
        <div className="ngx-glass-clear !p-4 rounded-2xl">
          <p className="text-sm text-white/65 leading-relaxed animate-[fadeIn_0.5s_ease-in-out]" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
