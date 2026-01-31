"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const LOADING_STEPS = [
  "Iniciando escaneo biométrico...",
  "Analizando composición corporal...",
  "Definiendo estética cinematográfica...",
  "Ajustando identidad facial...",
  "Renderizando Mes 4...",
  "Renderizando Mes 8...",
  "Renderizando Mes 12...",
  "Pulido final y color grade...",
];

const TIPS = [
  "💡 La disciplina vence a la motivación el 100% de las veces.",
  "💡 Tu cuerpo es el reflejo directo de tu mente.",
  "💡 El dolor de hoy es la fuerza de mañana.",
  "💡 No busques tiempo, créalo.",
  "💡 La consistencia es la clave del alto rendimiento.",
];

const PROGRESS_BY_COUNT = [12, 45, 75, 100];

export function LoadingExperience({ shareId }: { shareId: string }) {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [status, setStatus] = useState<string>("processing");
  const [imageCount, setImageCount] = useState(0);
  const [progress, setProgress] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const startedGenerationRef = useRef(false);

  const stageLabel = useMemo(() => {
    if (status === "failed") return "Proceso detenido";
    if (imageCount >= 3) return "Listo";
    if (imageCount === 2) return "Mes 12 en curso";
    if (imageCount === 1) return "Mes 8 en curso";
    return "Mes 4 en curso";
  }, [status, imageCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/sessions/${shareId}`, { cache: "no-store" });
        const json = await res.json();
        if (!mounted) return;

        const nextStatus = json?.status || "processing";
        const images = (json?.assets?.images || {}) as Record<string, string>;
        const count = Object.keys(images).length;

        setStatus(nextStatus);
        setImageCount(count);
        setProgress(PROGRESS_BY_COUNT[Math.min(count, 3)]);

        if (!startedGenerationRef.current && (nextStatus === "analyzed" || nextStatus === "processing") && count === 0 && !authLoading) {
          startedGenerationRef.current = true;

          (async () => {
            try {
              const token = await getIdToken();

              if (!token) {
                setError("Error de autenticación. Inicia sesión e intenta de nuevo.");
                return;
              }

              const genRes = await fetch("/api/generate-images", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ sessionId: shareId }),
              });

              if (!genRes.ok) {
                const errData = await genRes.json();
                console.error("[Loading] Generation trigger failed:", errData.error);
                if (errData.error === "Unauthorized") {
                  setError("Error de autenticación. Redirigiendo...");
                } else if (errData.error === "AI generation is temporarily disabled") {
                  setError("La generación está pausada temporalmente. Intenta más tarde.");
                }
              }
            } catch (err) {
              console.error("[Loading] Error triggering generation:", err);
            }
          })();
        }

        if (nextStatus === "failed") {
          setError("No pudimos completar la generación. Intenta nuevamente.");
        }

        if (nextStatus === "ready" || count >= 3) {
          setTimeout(() => router.replace(`/s/${shareId}`), 800);
        }
      } catch {
        if (!mounted) return;
        setError("Problema de conexión. Reintentando...");
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [shareId, router, authLoading, getIdToken]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative w-64 h-64 mb-10">
        <div className="absolute inset-0 border-4 border-[#6D00FF]/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-2 border-2 border-dashed border-[#6D00FF]/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-[#6D00FF]/10 rounded-full animate-pulse blur-xl" />
        </div>
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden">
          <div className="w-full h-2 bg-[#6D00FF] shadow-[0_0_20px_#6D00FF] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold tracking-tighter text-white">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="text-center z-10 max-w-xl px-6 space-y-4">
        <p className="text-xs tracking-[0.4em] uppercase text-[#6D00FF]">NGX Transform</p>
        <h2 className="text-xl sm:text-2xl font-bold text-[#6D00FF] tracking-widest uppercase animate-pulse">
          {LOADING_STEPS[stepIndex]}
        </h2>
        <p className="text-sm text-neutral-300">{stageLabel}</p>

        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6D00FF] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 text-xs">
          {["Mes 4", "Mes 8", "Mes 12"].map((label, idx) => (
            <div
              key={label}
              className={cn(
                "rounded-xl border border-white/10 bg-white/5 p-3",
                imageCount > idx && "border-[#6D00FF] bg-[#6D00FF]/10"
              )}
            >
              <p className="uppercase tracking-wider text-neutral-400">{label}</p>
              <p className="text-sm font-semibold">
                {imageCount > idx ? "Listo" : "En proceso"}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>

      <div className="absolute bottom-12 px-6 w-full max-w-lg text-center">
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl backdrop-blur-sm">
          <p className="text-neutral-400 text-sm" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.replace(`/s/${shareId}`)}
        className="absolute top-6 right-6 text-xs text-neutral-400 border border-white/10 px-3 py-2 rounded-full hover:bg-white/10"
      >
        Ver resultados
      </motion.button>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
