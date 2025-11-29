"use client";

import React from "react";
import { motion } from "framer-motion";

type Size = "sm" | "md" | "lg";

interface NeonRadarProps {
    // Support both object and individual props
    stats?: {
        strength: number;
        aesthetics: number;
        endurance: number;
        mental: number;
    };
    // Individual props (alternative API)
    strength?: number;
    aesthetics?: number;
    endurance?: number;
    mental?: number;
    // Customization
    color?: string;
    size?: Size;
    showLabels?: boolean;
}

const sizeConfig: Record<Size, { size: number; labelOffset: number; fontSize: number }> = {
    sm: { size: 120, labelOffset: 110, fontSize: 7 },
    md: { size: 180, labelOffset: 115, fontSize: 9 },
    lg: { size: 240, labelOffset: 120, fontSize: 11 },
};

export function NeonRadar({
    stats,
    strength,
    aesthetics,
    endurance,
    mental,
    color,
    size: sizeKey = "md",
    showLabels = true,
}: NeonRadarProps) {
    // Resolve stats from either object or individual props
    const resolvedStats = stats || {
        strength: strength ?? 0,
        aesthetics: aesthetics ?? 0,
        endurance: endurance ?? 0,
        mental: mental ?? 0,
    };

    // Use CSS variable if no color provided - default to primary color
    const fillColor = color || "#6D00FF"; // --primary fallback

    // Config based on size
    const config = sizeConfig[sizeKey];
    const svgSize = config.size;
    const center = svgSize / 2;
    const radius = (svgSize / 2) - (showLabels ? 35 : 15);
    const maxVal = 100;

    // Data Points
    const data = [
        { label: "FUERZA", value: resolvedStats.strength, angle: 0 },       // Top
        { label: "ESTÉTICA", value: resolvedStats.aesthetics, angle: 90 },  // Right
        { label: "MENTAL", value: resolvedStats.mental, angle: 180 },       // Bottom
        { label: "RESISTENCIA", value: resolvedStats.endurance, angle: 270 }, // Left
    ];

    // Helper to calculate coordinates
    const getPoint = (value: number, angle: number) => {
        const r = (value / maxVal) * radius;
        const rad = (angle - 90) * (Math.PI / 180); // -90 to start at top
        return {
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
        };
    };

    // Generate Polygon Path
    const points = data.map((d) => getPoint(d.value, d.angle));
    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";

    // Generate Background Grids (25%, 50%, 75%, 100%)
    const grids = [25, 50, 75, 100].map((level) => {
        const gridPoints = data.map((d) => getPoint(level, d.angle));
        return gridPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";
    });

    return (
        <div className="relative flex items-center justify-center">
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="overflow-visible">
                {/* Background Grids */}
                {grids.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        fill="none"
                        stroke="white"
                        strokeOpacity={0.1}
                        strokeWidth={1}
                    />
                ))}

                {/* Axes */}
                {data.map((d, i) => {
                    const p = getPoint(100, d.angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            stroke="white"
                            strokeOpacity={0.1}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* The Data Polygon */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={pathData}
                    fill={fillColor}
                    fillOpacity={0.2}
                    stroke={fillColor}
                    strokeWidth={2}
                    filter="url(#glow)"
                />

                {/* Labels */}
                {showLabels && data.map((d, i) => {
                    const p = getPoint(config.labelOffset, d.angle);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize={config.fontSize}
                            fontWeight="bold"
                            className="tracking-widest"
                            style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
                        >
                            {d.label}
                        </text>
                    );
                })}

                {/* Glow Filter */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
