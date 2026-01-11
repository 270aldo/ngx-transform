"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EliteCardProps {
    label: string;
    title: string;
    subtitle?: string;
    actionText?: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    className?: string;
    delay?: number;
}

/**
 * Reusable component for the "Elite Protocol" signature style.
 * Features: Electric Violet gradient, grain texture, cinematic typography.
 */
export function EliteCard({
    label,
    title,
    subtitle,
    actionText,
    href,
    onClick,
    icon = <Sparkles size={16} />,
    className,
    delay = 0,
}: EliteCardProps) {
    const content = (
        <div className="h-full bg-gradient-to-br from-[#6D00FF] via-[#4c00b0] to-black p-6 flex flex-col justify-between relative overflow-hidden group">
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest mb-2 border-b border-white/20 pb-2 inline-block">
                        {label}
                    </p>
                    <h3 className="text-2xl font-black italic text-white leading-none mt-2 uppercase">
                        {title.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-white/60 mt-3 font-medium max-w-[80%] leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-md group-hover:bg-white/20 transition-colors">
                    {icon}
                </div>
            </div>

            {actionText && (
                <div className="relative z-10 mt-8">
                    <div
                        className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        {actionText} <ArrowRight size={14} />
                    </div>
                </div>
            )}
        </div>
    );

    const containerClasses = cn(
        "relative overflow-hidden rounded-2xl border border-[#6D00FF]/50 shadow-[0_0_30px_rgba(109,0,255,0.15)] animate-in fade-in zoom-in duration-500 fill-mode-backwards",
        className
    );

    const style = { animationDelay: `${delay}ms` };

    if (href) {
        return (
            <Link href={href} className={containerClasses} style={style}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={cn(containerClasses, "text-left cursor-pointer")} style={style}>
            {content}
        </button>
    );
}
