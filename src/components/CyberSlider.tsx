"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface CyberSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    valueDisplay?: string | number;
    suffix?: string;
    trackColor?: "violet" | "emerald" | "amber" | "blue" | "red";
}

export function CyberSlider({
    label,
    valueDisplay,
    suffix = "",
    className,
    trackColor = "violet",
    ...props
}: CyberSliderProps) {
    const min = Number(props.min ?? 0);
    const max = Number(props.max ?? 100);
    const currentValue = Number(props.value ?? props.defaultValue ?? min);
    const progress = max > min ? Math.min(100, Math.max(0, ((currentValue - min) / (max - min)) * 100)) : 0;

    const colors = {
        violet: "accent-[#6D00FF]",
        emerald: "accent-emerald-500",
        amber: "accent-amber-500",
        blue: "accent-[#7D1AFF]",
        red: "accent-red-500",
    };

    const textColors = {
        violet: "text-[#6D00FF]",
        emerald: "text-emerald-500",
        amber: "text-amber-500",
        blue: "text-[#7D1AFF]",
        red: "text-red-500",
    };

    const fillColors = {
        violet: "from-[#6D00FF] to-[#9A5BFF]",
        emerald: "from-emerald-500 to-lime-400",
        amber: "from-amber-500 to-orange-400",
        blue: "from-[#7D1AFF] to-cyan-400",
        red: "from-red-500 to-rose-400",
    };

    return (
        <div className={cn("group rounded-[24px] border border-white/8 bg-black/20 px-4 py-4 backdrop-blur-sm transition-colors hover:border-white/12", className)}>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 group-hover:text-white/70 transition-colors">
                        {label}
                    </label>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/20">
                        Ajuste activo
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className={cn("text-[1.85rem] font-black italic tracking-[-0.06em] leading-none", textColors[trackColor])}>
                            {valueDisplay ?? props.value}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/28">{suffix}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 relative h-3 w-full">
                <div className="absolute inset-0 rounded-full border border-white/6 bg-white/6" />
                <div
                    className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r shadow-[0_0_22px_rgba(109,0,255,0.18)]", fillColors[trackColor])}
                    style={{ width: `${progress}%` }}
                />

                <input
                    type="range"
                    className={cn(
                        "absolute inset-0 z-10 w-full h-full bg-transparent appearance-none cursor-pointer focus:outline-none",
                        "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-transparent",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/40 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125",
                        colors[trackColor]
                    )}
                    {...props}
                />
            </div>
        </div>
    );
}
