"use client";
import Image from "next/image";

export function Minimap({ src, points }: { src: string; points?: { x: number; y: number }[] }) {
  return (
    <div className="relative w-28 h-28 border border-neutral-800 rounded overflow-hidden bg-neutral-900">
      {src && (
        <Image src={src} alt="minimap" width={112} height={112} unoptimized className="w-full h-full object-cover" />
      )}
      {points?.map((p, i) => (
        <span key={i} className="absolute w-1.5 h-1.5 rounded-full bg-[#6D00FF]"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: "translate(-50%, -50%)" }} />
      ))}
    </div>
  );
}
