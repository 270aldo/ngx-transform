"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface RadarStatsProps {
    data: {
        subject: string;
        A: number;
        fullMark: number;
    }[];
}

export function RadarStats({ data }: RadarStatsProps) {
    return (
        <div className="w-full h-[200px] md:h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: "bold" }}
                    />
                    <Radar
                        name="Stats"
                        dataKey="A"
                        stroke="#6D00FF"
                        strokeWidth={2}
                        fill="#6D00FF"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#6D00FF]/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#6D00FF]/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#6D00FF]/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#6D00FF]/50" />
        </div>
    );
}
