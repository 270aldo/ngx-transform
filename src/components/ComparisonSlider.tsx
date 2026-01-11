"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronsLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonSliderProps {
    imageBefore: string;
    imageAfter: string;
    contentBefore?: React.ReactNode;
    contentAfter?: React.ReactNode;
    labelBefore?: string;
    labelAfter?: string;
    className?: string;
}

export function ComparisonSlider({
    imageBefore,
    imageAfter,
    contentBefore,
    contentAfter,
    labelBefore = "ANTES",
    labelAfter = "DESPUÉS",
    className
}: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX);
        };

        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDragging]);

    // Opacity Logic for Liquid Transition
    // 0-45%: Before Content Fade Out
    // 55-100%: After Content Fade In
    const afterOpacity = Math.max(0, (50 - sliderPosition) / 50); // 1 at 0%, 0 at 50%
    const beforeOpacity = Math.max(0, (sliderPosition - 50) / 50); // 0 at 50%, 1 at 100%

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full overflow-hidden select-none cursor-ew-resize group", className)}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
            onTouchStart={() => setIsDragging(true)}
        >
            {/* Background Image (After) - Using object-contain for full visibility with a blurred backup */}
            <div className="absolute inset-0 w-full h-full bg-[#050505]">
                <Image
                    src={imageAfter}
                    alt=""
                    fill
                    className="object-cover blur-3xl opacity-20 scale-110"
                    unoptimized
                />
                <Image
                    src={imageAfter}
                    alt="After"
                    fill
                    className="object-contain"
                    unoptimized
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black italic tracking-widest text-white z-10 border border-white/10 shadow-xl">
                    {labelAfter}
                </div>
            </div>

            {/* Foreground Image (Before) - Clipped, also using object-contain */}
            <div
                className="absolute inset-0 h-full overflow-hidden border-r-2 border-white/50 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20"
                style={{ width: `${sliderPosition}%` }}
            >
                {/* We use a fixed width container inside the clipped div to keep image aspect ratio */}
                <div className="absolute inset-0 h-full bg-[#050505]" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
                    <Image
                        src={imageBefore}
                        alt=""
                        fill
                        className="object-cover blur-3xl opacity-20 scale-110"
                        unoptimized
                    />
                    <Image
                        src={imageBefore}
                        alt="Before"
                        fill
                        className="object-contain"
                        unoptimized
                    />
                    <div className="absolute top-4 left-4 bg-[#6D00FF]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black italic tracking-widest text-white z-10 border border-white/20 shadow-xl">
                        {labelBefore}
                    </div>
                </div>
            </div>

            {/* Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg -ml-[15px]">
                    <ChevronsLeftRight className="w-4 h-4 text-black" />
                </div>
            </div>

            {/* LIQUID CONTENT OVERLAYS */}
            {/* After Content (Visible when slider is left) */}
            <div
                className="absolute bottom-0 left-0 p-8 md:p-12 w-full pointer-events-none z-30 transition-opacity duration-300"
                style={{ opacity: afterOpacity }}
            >
                <div className="mix-blend-difference text-white">
                    {contentAfter}
                </div>
            </div>

            {/* Before Content (Visible when slider is right) */}
            <div
                className="absolute bottom-0 left-0 p-8 md:p-12 w-full pointer-events-none z-30 transition-opacity duration-300"
                style={{ opacity: beforeOpacity }}
            >
                <div className="mix-blend-difference text-white">
                    {contentBefore}
                </div>
            </div>
        </div>
    );
}
