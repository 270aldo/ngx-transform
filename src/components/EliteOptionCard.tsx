"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface EliteOptionCardProps {
    title: string;
    description?: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
    idx?: number; // For animation delay
}

export function EliteOptionCard({
    title,
    description,
    selected = false,
    onClick,
    className,
    idx = 0,
}: EliteOptionCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 active:scale-95 animate-in fade-in zoom-in slide-in-from-bottom-4 fill-mode-backwards",
                selected
                    ? "bg-[#6D00FF]/20 border-[#6D00FF] shadow-[0_0_30px_rgba(109,0,255,0.4)] scale-[1.02]"
                    : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 hover:scale-[1.01]",
                className
            )}
            style={{ animationDelay: `${idx * 50}ms` }}
        >
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />

            {/* Selection Indicator */}
            <div className={cn(
                "absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300",
                selected
                    ? "bg-[#6D00FF] border-[#6D00FF] opacity-100 scale-100"
                    : "border-white/20 bg-black/20 opacity-0 scale-75 group-hover:opacity-100"
            )}>
                <Check size={12} className="text-white" />
            </div>

            <div className="relative p-5 h-full flex flex-col justify-between">
                <div>
                    <h3 className={cn(
                        "text-lg font-black italic uppercase tracking-tighter leading-none transition-colors duration-300",
                        selected ? "text-white" : "text-white/70 group-hover:text-white"
                    )}>
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-2 text-xs text-neutral-400 font-medium leading-relaxed group-hover:text-neutral-300 transition-colors">
                            {description}
                        </p>
                    )}
                </div>

                {/* Active Decoration */}
                <div className={cn(
                    "h-0.5 w-full mt-4 transition-all duration-500 rounded-full",
                    selected ? "bg-[#00FF94] shadow-[0_0_10px_#00FF94]" : "bg-white/5 group-hover:bg-white/20"
                )} />
            </div>
        </div>
    );
}
