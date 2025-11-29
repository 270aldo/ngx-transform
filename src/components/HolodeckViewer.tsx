"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { InsightsResult, TimelineEntry } from "@/types/ai";

interface HolodeckViewerProps {
    data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: any;
        ai: InsightsResult;
        assets?: { images?: Record<string, string> };
    };
}

export default function HolodeckViewer({ data }: HolodeckViewerProps) {
    const [activeTab, setActiveTab] = useState<"stats" | "timeline" | "mind">("stats");
    const [isExpanded, setIsExpanded] = useState(false);

    // Get the best image for the hero background (M12 > M8 > M4)
    const heroImage = data.assets?.images?.m12 || data.assets?.images?.m8 || data.assets?.images?.m4 || null;
    const timeline = data.ai.timeline;

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
            {/* 1. HERO IMAGE LAYER */}
            <div className="absolute inset-0 z-0">
                {heroImage ? (
                    <Image
                        src={heroImage}
                        alt="Transformation"
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <span className="text-neutral-500">Renderizando Futuro...</span>
                    </div>
                )}
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
            </div>

            {/* 2. HUD HEADER */}
            <div className="absolute top-0 left-0 w-full z-10 p-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter italic text-white">
                        NGX <span className="text-[#6D00FF]">VISION</span>
                    </h1>
                    <p className="text-[10px] text-neutral-400 tracking-widest uppercase">
                        PROTOCOL: {data.input.focusZone?.toUpperCase() || "FULL BODY"}
                    </p>
                </div>
                <div className="px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                    <span className="text-[10px] font-bold text-[#00FF94] animate-pulse">● LIVE</span>
                </div>
            </div>

            {/* 3. GLASS SHEET (BOTTOM PANEL) */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={`absolute bottom-0 left-0 w-full z-20 bg-black/60 backdrop-blur-xl border-t border-white/10 rounded-t-3xl transition-all duration-500 ${isExpanded ? "h-[85vh]" : "h-[45vh]"
                    }`}
            >
                {/* Drag Handle */}
                <div
                    className="w-full h-8 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                </div>

                {/* Content Container */}
                <div className="px-6 pb-8 h-full overflow-y-auto no-scrollbar">
                    {/* Tabs */}
                    <div className="flex items-center gap-6 mb-6 border-b border-white/5 pb-2">
                        {(["stats", "timeline", "mind"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-xs font-bold tracking-widest uppercase pb-2 transition-all ${activeTab === tab
                                    ? "text-[#6D00FF] border-b-2 border-[#6D00FF]"
                                    : "text-neutral-500 hover:text-white"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* TAB CONTENT */}
                    <AnimatePresence mode="wait">
                        {activeTab === "stats" && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-white">Biometría Proyectada</h2>
                                    <PowerBar label="FUERZA" value={timeline.m12.stats?.strength || 85} color="#FF3B30" />
                                    <PowerBar label="ESTÉTICA" value={timeline.m12.stats?.aesthetics || 92} color="#6D00FF" />
                                    <PowerBar label="RESISTENCIA" value={timeline.m12.stats?.endurance || 78} color="#00FF94" />
                                    <PowerBar label="MENTALIDAD" value={timeline.m12.stats?.mental || 95} color="#00C7BE" />
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-xs font-bold text-neutral-400 mb-2 uppercase">Análisis del Coach</h3>
                                    <p className="text-sm text-neutral-200 leading-relaxed">
                                        {data.ai.insightsText || "Tu potencial genético indica una respuesta favorable a la hipertrofia sarcomérica. La clave será la consistencia en la fase 2."}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "timeline" && (
                            <motion.div
                                key="timeline"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <TimelineCard step="m4" data={timeline.m4} />
                                <TimelineCard step="m8" data={timeline.m8} />
                                <TimelineCard step="m12" data={timeline.m12} isFinal />
                            </motion.div>
                        )}

                        {activeTab === "mind" && (
                            <motion.div
                                key="mind"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-8">
                                    <span className="text-4xl">🧠</span>
                                    <h2 className="text-xl font-bold mt-4 mb-2">Mentalidad Estoica</h2>
                                    <p className="text-neutral-400 text-sm italic">&ldquo;No es lo que te pasa, sino cómo reaccionas a lo que te pasa.&rdquo;</p>
                                </div>

                                <div className="space-y-4">
                                    <MindItem step="Fase 1" text={timeline.m4.mental} />
                                    <MindItem step="Fase 2" text={timeline.m8.mental} />
                                    <MindItem step="Fase 3" text={timeline.m12.mental} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function PowerBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold tracking-wider text-neutral-400">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function TimelineCard({ step, data, isFinal }: { step: string; data: TimelineEntry; isFinal?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border ${isFinal ? "bg-[#6D00FF]/10 border-[#6D00FF]/50" : "bg-white/5 border-white/5"}`}>
            <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFinal ? "bg-[#6D00FF] text-white" : "bg-white/10 text-neutral-400"}`}>
                    {step.toUpperCase()}
                </span>
                {isFinal && <span className="text-[10px] text-[#6D00FF] font-bold">META FINAL</span>}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{data.title || "Evolución"}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">{data.description}</p>
        </div>
    );
}

function MindItem({ step, text }: { step: string; text: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="w-1 h-full min-h-[40px] bg-white/10 rounded-full" />
            <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">{step}</span>
                <p className="text-sm text-white">{text}</p>
            </div>
        </div>
    );
}
