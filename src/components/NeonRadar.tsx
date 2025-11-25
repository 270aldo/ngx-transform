"use client";

import React from "react";
import { motion } from "framer-motion";

interface NeonRadarProps {
    stats: {
        strength: number;
        aesthetics: number;
        endurance: number;
        mental: number;
    };
    color?: string;
}

export function NeonRadar({ stats, color = "#6D00FF" }: NeonRadarProps) {
    // Config
    const size = 200;
    const center = size / 2;
    const radius = (size / 2) - 40; // Padding for labels
    const maxVal = 100;

    // Data Points
    const data = [
        { label: "FUERZA", value: stats.strength, angle: 0 },       // Top
        { label: "ESTÉTICA", value: stats.aesthetics, angle: 90 },  // Right
        { label: "MENTAL", value: stats.mental, angle: 180 },       // Bottom
        { label: "RESISTENCIA", value: stats.endurance, angle: 270 }, // Left
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
        <div className="relative flex items-center justify-center w-full h-full">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
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
                    fill={color}
                    fillOpacity={0.2}
                    stroke={color}
                    strokeWidth={2}
                    filter="url(#glow)"
                />

                {/* Labels */}
                {data.map((d, i) => {
                    const p = getPoint(120, d.angle); // Push labels out slightly
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="10"
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
