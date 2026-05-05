"use client";

import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Activity, Cpu, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { EliteOptionCard } from "@/components/EliteOptionCard";
import type { WizardFormValues } from "./wizardSchema";

interface WizardObjectiveStepProps {
  watch: UseFormWatch<WizardFormValues>;
  setValue: UseFormSetValue<WizardFormValues>;
}

/**
 * Stage 3: Objetivo y contexto — goal selection + level + days + focus zone.
 */
export function WizardObjectiveStep({ watch, setValue }: WizardObjectiveStepProps) {
  return (
    <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-8">
      <div className="text-center">
        <span className="ngx-eyebrow-pill mb-4 mx-auto">Paso 3 · Objetivo y contexto</span>
        <h2 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "20ch" }}>
          Define la dirección de tu visualización.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
          Aquí decidimos qué versión de ti estamos intentando visualizar para que el resultado tenga una intención clara, no sólo un efecto bonito.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EliteOptionCard
          className="h-64"
          title="DEFINICIÓN EXTREMA"
          description="Maximiza la definición muscular y reduce grasa corporal a un dígito."
          selected={watch("goal") === "definicion"}
          onClick={() => setValue("goal", "definicion")}
          idx={1}
          imageSrc="/images/backgrounds/goal-definicion.svg"
          imageAlt="Definición extrema"
          icon={Target}
          iconLabel="Precisión metabólica"
          overlayTone="deep"
        />
        <EliteOptionCard
          className="h-64"
          title="HIPERTROFIA MASIVA"
          description="Prioriza volumen muscular, densidad y ganancia de tamaño total."
          selected={watch("goal") === "masa"}
          onClick={() => setValue("goal", "masa")}
          idx={2}
          imageSrc="/images/backgrounds/goal-hipertrofia.svg"
          imageAlt="Hipertrofia masiva"
          icon={Activity}
          iconLabel="Densidad y volumen"
        />
        <EliteOptionCard
          className="h-64"
          title="HÍBRIDO ATLÉTICO"
          description="Equilibrio entre rendimiento, estética y funcionalidad en todo el cuerpo."
          selected={watch("goal") === "mixto"}
          onClick={() => setValue("goal", "mixto")}
          idx={3}
          imageSrc="/images/backgrounds/goal-hibrido.svg"
          imageAlt="Híbrido atlético"
          icon={Cpu}
          iconLabel="Rendimiento total"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ngx-card !p-6">
          <span className="ngx-eyebrow !text-[10px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>Nivel de experiencia</span>
          <div className="grid grid-cols-3 gap-2">
            {([{ id: "novato", l: "Novato" }, { id: "intermedio", l: "Pro" }, { id: "avanzado", l: "Elite" }] as const).map((lv) => (
              <button
                key={lv.id}
                type="button"
                onClick={() => setValue("level", lv.id)}
                className={cn(
                  "py-3 rounded-xl border text-[10px] font-mono uppercase tracking-[0.18em] transition-all duration-150",
                  watch("level") === lv.id
                    ? "bg-[var(--ngx-purple)] text-white border-[var(--ngx-purple)] shadow-[var(--ngx-glow-primary-soft)]"
                    : "bg-white/[0.03] text-white/45 border-[color:var(--ngx-border-subtle)] hover:border-white/20 hover:text-white/70"
                )}
              >
                {lv.l}
              </button>
            ))}
          </div>
        </div>

        <div className="ngx-card !p-6">
          <span className="ngx-eyebrow !text-[10px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>Días disponibles por semana</span>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValue("weeklyTime", d)}
                className={cn(
                  "py-3 rounded-xl border text-xs font-mono uppercase tracking-[0.14em] transition-all duration-150",
                  watch("weeklyTime") === d
                    ? "bg-[var(--ngx-purple)] text-white border-[var(--ngx-purple)] shadow-[var(--ngx-glow-primary-soft)]"
                    : "bg-white/[0.03] text-white/45 border-[color:var(--ngx-border-subtle)] hover:border-white/20 hover:text-white/70"
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ngx-section-panel !p-6 md:!p-8">
        <span className="ngx-eyebrow !text-[10px] block mb-5" style={{ color: "var(--ngx-fg-3)" }}>Zona de enfoque principal</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {([
            { id: "upper", l: "Tren Superior" }, { id: "lower", l: "Tren Inferior" },
            { id: "abs", l: "Core & Abs" }, { id: "full", l: "Full Body" }
          ] as const).map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setValue("focusZone", z.id)}
              className={cn(
                "p-4 rounded-xl border text-center cursor-pointer transition-all duration-150 active:scale-[0.97]",
                watch("focusZone") === z.id
                  ? "bg-[var(--ngx-purple)] border-[var(--ngx-purple)] text-white shadow-[var(--ngx-glow-primary-soft)]"
                  : "bg-white/[0.02] border-[color:var(--ngx-border-subtle)] text-white/55 hover:text-white/85 hover:border-white/20"
              )}
            >
              <span className="text-xs font-mono uppercase tracking-[0.16em]">{z.l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
