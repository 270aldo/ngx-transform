"use client";

/**
 * PR-2: Compare Slider Component
 *
 * Interactive before/after comparison slider.
 * Supports touch and mouse interactions.
 *
 * Features:
 * - Drag to reveal before/after
 * - Touch-friendly on mobile
 * - Smooth animations
 * - Labels for each side
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  initialPosition?: number;  // 0-100
}

export function CompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = "ANTES",
  afterLabel = "DESPUÉS",
  className,
  initialPosition = 50,
}: CompareSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(newPosition);
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global listeners for mouse
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[4/5] overflow-hidden rounded-2xl cursor-ew-resize select-none",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image (Full, shown behind) */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* After Label */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1.5 rounded-full bg-[#6D00FF] text-white text-xs font-bold tracking-wider">
          {afterLabel}
        </span>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Before Label */}
      <div
        className="absolute top-4 left-4 z-10 transition-opacity duration-200"
        style={{ opacity: position > 15 ? 1 : 0 }}
      >
        <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider">
          {beforeLabel}
        </span>
      </div>

      {/* Slider Line */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        animate={{ scale: isDragging ? 1.1 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className={cn(
              "w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg",
              "border-2 border-[#6D00FF]"
            )}
            animate={{
              scale: isDragging ? 1.2 : 1,
              boxShadow: isDragging
                ? "0 0 20px rgba(109, 0, 255, 0.5)"
                : "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
            transition={{ duration: 0.15 }}
          >
            {/* Arrow indicators */}
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3 text-[#6D00FF]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
              <svg
                className="w-3 h-3 text-[#6D00FF]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Instructions (show briefly) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm">
          Arrastra para comparar
        </div>
      </motion.div>
    </div>
  );
}
