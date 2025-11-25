"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const LOADING_STEPS = [
    "Iniciando escaneo biométrico...",
    "Analizando densidad muscular...",
    "Calculando potencial metabólico...",
    "Proyectando estructura ósea...",
    "Sintetizando datos genéticos...",
    "Optimizando simetría...",
    "Renderizando proyección 8K...",
    "Finalizando transformación..."
];

const TIPS = [
    "💡 La disciplina vence a la motivación el 100% de las veces.",
    "💡 Tu cuerpo es el reflejo directo de tu mente.",
    "💡 El dolor de hoy es la fuerza de mañana.",
    "💡 No busques tiempo, créalo.",
    "💡 La consistencia es la clave del alto rendimiento."
];

export function BiometricLoader() {
    const [stepIndex, setStepIndex] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Progress bar simulation (40s approx)
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Non-linear progress for realism
                const increment = Math.random() * 2;
                return Math.min(prev + increment, 100);
            });
        }, 800);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Cycle through technical steps
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Cycle through tips
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white overflow-hidden font-mono">
            {/* Background Grid Animation */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Central Scanner Visual */}
            <div className="relative w-64 h-64 mb-12">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-[#6D00FF]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 border-2 border-dashed border-[#6D00FF]/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                {/* Inner Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-[#6D00FF]/10 rounded-full animate-pulse blur-xl" />
                </div>

                {/* Scanning Line */}
                <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden">
                    <div className="w-full h-2 bg-[#6D00FF] shadow-[0_0_20px_#6D00FF] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
                </div>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold tracking-tighter text-white">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Status Text */}
            <div className="space-y-2 text-center z-10 max-w-md px-6">
                <h2 className="text-xl font-bold text-[#6D00FF] tracking-widest uppercase animate-pulse">
                    {LOADING_STEPS[stepIndex]}
                </h2>
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden mt-4">
                    <div
                        className="h-full bg-[#6D00FF] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Tip Card */}
            <div className="absolute bottom-12 px-6 w-full max-w-lg text-center">
                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-neutral-400 text-sm animate-[fadeIn_0.5s_ease-in-out]" key={tipIndex}>
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
