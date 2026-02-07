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

    return (
        <div className={cn("space-y-4 group", className)}>
            <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-white transition-colors">
                    {label}
                </label>
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-black italic tracking-tighter transition-all group-hover:scale-110 origin-right", textColors[trackColor])}>
                        {valueDisplay ?? props.value}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">{suffix}</span>
                </div>
            </div>

            <div className="relative h-2 w-full">
                {/* Custom Track Background */}
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/5 rounded-full overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors">
                    {/* Can add grid lines here if desired */}
                </div>

                <input
                    type="range"
                    className={cn(
                        "relative z-10 w-full h-full bg-transparent appearance-none cursor-pointer focus:outline-none",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125",
                        colors[trackColor]
                    )}
                    {...props}
                />
            </div>
        </div>
    );
}
