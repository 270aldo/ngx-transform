"use client";

import React, { useState, useEffect } from "react";
import type { InsightsResult } from "@/types/ai";
import { cn } from "@/lib/utils";
import { NeonRadar } from "@/components/NeonRadar";
import { Share2, ChevronUp, ChevronDown, AlertTriangle, Target, Zap } from "lucide-react";

type StepKey = "m0" | "m4" | "m8" | "m12";

export function CinematicViewer({
    ai,
    imageUrls,
}: {
    ai: InsightsResult;
    imageUrls: { originalUrl?: string; images?: Partial<Record<StepKey, string>> };
}) {
    const [activeStep, setActiveStep] = useState<StepKey>("m0");
    const [showMental, setShowMental] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Preload images
    useEffect(() => {
        Object.values(imageUrls.images || {}).forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    }, [imageUrls]);

    const steps: { key: StepKey; label: string }[] = [
        { key: "m0", label: "HOY" },
        { key: "m4", label: "MES 4" },
        { key: "m8", label: "MES 8" },
        { key: "m12", label: "MES 12" },
    ];

    const currentImg = imageUrls.images?.[activeStep] || imageUrls.originalUrl || "";
    const entry = ai.timeline[activeStep];

    const handleStepChange = (step: StepKey) => {
        if (step === activeStep) return;
        setIsAnimating(true);
        setTimeout(() => {
            setActiveStep(step);
            setIsAnimating(false);
        }, 300);
    };

    // Touch Handling
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && !showMental) {
            setShowMental(true);
            if (navigator.vibrate) navigator.vibrate(50);
        }
        if (isRightSwipe && showMental) {
            setShowMental(false);
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mi Transformación NGX',
                    text: 'He descubierto mi máximo potencial. Mira mi proyección.',
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Enlace copiado al portapapeles");
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black text-white overflow-hidden z-50 flex flex-col"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className={cn(
                        "absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform",
                        isAnimating ? "scale-105 opacity-50 blur-sm" : "scale-100 opacity-100 blur-0"
                    )}
                    style={{ backgroundImage: `url(${currentImg})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 opacity-80" />
            </div>

            {/* HEADER */}
            <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter">
                        NGX <span className="text-[#6D00FF]">VISION</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                            PROTOCOL: {activeStep.toUpperCase()}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all active:scale-95"
                >
                    <Share2 className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 flex-1 flex flex-col justify-end pb-24 px-6">

                {/* TOGGLE SWITCH (Physical / Mental) */}
                <div className="flex justify-center mb-6">
                    <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                        <button
                            onClick={() => setShowMental(false)}
                            className={cn(
                                "px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all",
                                !showMental ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            FÍSICO
                        </button>
                        <button
                            onClick={() => setShowMental(true)}
                            className={cn(
                                "px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all",
                                showMental ? "bg-[#6D00FF] text-white shadow-[0_0_15px_rgba(109,0,255,0.5)]" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            MENTAL
                        </button>
                    </div>
                </div>

                {/* INFO CARDS */}
                <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">

                    {/* LEFT CARD: STATS & ANALYSIS */}
                    <div className={cn(
                        "bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-500 overflow-hidden",
                        showMental ? "opacity-50 scale-95 blur-sm" : "opacity-100 scale-100"
                    )}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold italic">{entry.title || "Análisis Biométrico"}</h2>
                                <p className="text-xs text-neutral-400 mt-1 max-w-[250px] line-clamp-2">{entry.description}</p>
                            </div>
                            {/* Expand Button */}
                            <button
                                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                className="text-[10px] font-bold text-[#6D00FF] flex items-center gap-1 hover:text-white transition-colors"
                            >
                                {isDetailsOpen ? "MENOS DETALLES" : "VER ANÁLISIS TÁCTICO"}
                                {isDetailsOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                        </div>

                        {/* RADAR CHART (NEON) */}
                        <div className="h-[200px] w-full flex items-center justify-center mb-4">
                            {entry.stats && <NeonRadar stats={entry.stats} />}
                        </div>

                        {/* HUD 2.0: EXPANDABLE DETAILS */}
                        <div className={cn(
                            "space-y-4 overflow-hidden transition-all duration-500",
                            isDetailsOpen ? "max-h-[500px] opacity-100 mt-4 pt-4 border-t border-white/10" : "max-h-0 opacity-0"
                        )}>
                            {/* Focus Points */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-[#00FF94] flex items-center gap-2">
                                    <Target size={12} /> OBJETIVOS TÁCTICOS
                                </h3>
                                <ul className="space-y-1">
                                    {entry.expectations?.map((exp, i) => (
                                        <li key={i} className="text-xs text-neutral-300 pl-4 border-l border-[#00FF94]/30">
                                            {exp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Risks */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-[#FF3B30] flex items-center gap-2">
                                    <AlertTriangle size={12} /> RIESGOS POTENCIALES
                                </h3>
                                <ul className="space-y-1">
                                    {entry.risks?.map((risk, i) => (
                                        <li key={i} className="text-xs text-neutral-300 pl-4 border-l border-[#FF3B30]/30">
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARD: MENTAL SHIFT */}
                    <div className={cn(
                        "bg-black/60 backdrop-blur-xl border-l-4 border-[#6D00FF] rounded-2xl p-6 transition-all duration-500 flex flex-col justify-center relative overflow-hidden",
                        !showMental ? "hidden lg:flex opacity-50 scale-95" : "flex opacity-100 scale-100"
                    )}>
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Zap size={100} />
                        </div>

                        <h3 className="text-xs font-bold text-[#6D00FF] tracking-widest mb-4 uppercase">Protocolo Mental</h3>

                        <blockquote className="text-xl font-medium text-white italic mb-6 relative z-10">
                            &ldquo;{entry.mental || "La disciplina es el puente entre metas y logros."}&rdquo;
                        </blockquote>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#6D00FF]/20 flex items-center justify-center text-[#6D00FF] font-bold text-xs">1</div>
                                <p className="text-xs text-neutral-300">Visualiza el resultado final cada mañana.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#6D00FF]/20 flex items-center justify-center text-[#6D00FF] font-bold text-xs">2</div>
                                <p className="text-xs text-neutral-300">Acepta la incomodidad como señal de crecimiento.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* TIMELINE NAV (BOTTOM) */}
            <div className="absolute bottom-0 left-0 w-full z-30 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-8 px-6">
                <div className="flex justify-between items-center max-w-md mx-auto relative">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />

                    {steps.map((step, index) => {
                        const isActive = activeStep === step.key;
                        const isPast = steps.findIndex(s => s.key === activeStep) > index;

                        return (
                            <button
                                key={step.key}
                                onClick={() => handleStepChange(step.key)}
                                className="group relative flex flex-col items-center gap-3"
                            >
                                <div className={cn(
                                    "w-3 h-3 rounded-full border-2 transition-all duration-300 z-10",
                                    isActive ? "bg-[#6D00FF] border-[#6D00FF] scale-125 shadow-[0_0_15px_#6D00FF]" :
                                        isPast ? "bg-white border-white" : "bg-black border-white/30"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-bold tracking-widest transition-colors",
                                    isActive ? "text-white" : "text-neutral-600 group-hover:text-neutral-400"
                                )}>
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
