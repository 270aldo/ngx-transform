"use client";

import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Activity, Clock3, Cpu, Target } from "lucide-react";
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
  const goal = watch("goal");
  const focusZone = watch("focusZone");
  const goalIntent =
    goal === "masa"
      ? "Entendido. La visualización va a priorizar fuerza útil, densidad muscular y proporciones naturales."
      : goal === "mixto"
        ? "Entendido. La visualización va a equilibrar rendimiento, estética, recuperación y consistencia semanal."
        : "Entendido. La visualización va a priorizar recomposición, postura y una versión atlética sin exagerar.";
  const focusLabel =
    focusZone === "upper"
      ? "tren superior"
      : focusZone === "lower"
        ? "tren inferior"
        : focusZone === "abs"
          ? "core y zona media"
          : "cuerpo completo";

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
          title="RECOMPOSICIÓN ATLÉTICA"
          description="Buscar una versión más atlética, con mejor postura, proporción y cintura visual."
          selected={watch("goal") === "definicion"}
          onClick={() => setValue("goal", "definicion")}
          idx={1}
          imageSrc="/images/backgrounds/goal-definicion.svg"
          imageAlt="Recomposición atlética"
          icon={Target}
          iconLabel="Composición visual"
          overlayTone="deep"
        />
        <EliteOptionCard
          className="h-64"
          title="CONSTRUIR MÚSCULO FUNCIONAL"
          description="Ganar fuerza y músculo útil con proporciones naturales."
          selected={watch("goal") === "masa"}
          onClick={() => setValue("goal", "masa")}
          idx={2}
          imageSrc="/images/backgrounds/goal-hipertrofia.svg"
          imageAlt="Músculo funcional"
          icon={Activity}
          iconLabel="Densidad y volumen"
        />
        <EliteOptionCard
          className="h-64"
          title="HÍBRIDO DE RENDIMIENTO"
          description="Equilibrar rendimiento, estética, recuperación y consistencia."
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
        <div className="ngx-metal-card !p-6">
          <div className="relative z-10">
            <span className="ngx-eyebrow !text-[11px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>Nivel de experiencia</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                {
                  id: "novato",
                  l: "Principiante",
                  d: "Retomando o menos de 6 meses consistentes",
                },
                {
                  id: "intermedio",
                  l: "Intermedio",
                  d: "6-24 meses con base y algo de progresión",
                },
                {
                  id: "avanzado",
                  l: "Avanzado",
                  d: "2+ años con técnica y progresión trazable",
                },
              ] as const).map((lv) => (
                <button
                  key={lv.id}
                  type="button"
                  onClick={() => setValue("level", lv.id)}
                  data-selected={watch("level") === lv.id}
                  className="ngx-choice-button flex min-h-[72px] flex-col items-start justify-center gap-1 px-4 py-3 text-left"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                    {lv.l}
                  </span>
                  <span className="text-[11px] leading-snug text-white/45">
                    {lv.d}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ngx-metal-card !p-6">
          <div className="relative z-10">
            <span className="ngx-eyebrow !text-[11px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>Días disponibles por semana</span>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("trainingDaysPerWeek", d)}
                  data-selected={watch("trainingDaysPerWeek") === d}
                  className="ngx-choice-button py-3 text-xs font-mono uppercase tracking-[0.14em]"
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ngx-section-panel !p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="ngx-eyebrow !text-[11px] block mb-2" style={{ color: "var(--ngx-fg-3)" }}>Duración real por sesión</span>
            <p className="text-sm leading-relaxed text-white/55">
              GENESIS usa esto para calibrar una visualización aspiracional, no una promesa de volumen imposible.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 md:min-w-[360px]">
            {[30, 45, 60, 75].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setValue("sessionDurationMinutes", minutes)}
                data-selected={watch("sessionDurationMinutes") === minutes}
                className="ngx-choice-button flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-mono uppercase tracking-[0.12em]"
              >
                <Clock3 className="h-3.5 w-3.5" />
                {minutes}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.045] px-5 py-4">
        <p className="text-sm leading-relaxed text-white/68">
          {goalIntent} El foco principal será {focusLabel}; sigue siendo una visualización aspiracional, no una garantía.
        </p>
      </div>

      <div className="ngx-section-panel !p-6 md:!p-8">
        <span className="ngx-eyebrow !text-[11px] block mb-5" style={{ color: "var(--ngx-fg-3)" }}>Zona de enfoque principal</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {([
            { id: "upper", l: "Tren Superior" }, { id: "lower", l: "Tren Inferior" },
            { id: "abs", l: "Core & Abs" }, { id: "full", l: "Full Body" }
          ] as const).map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setValue("focusZone", z.id)}
              data-selected={watch("focusZone") === z.id}
              className="ngx-choice-button p-4 text-center cursor-pointer active:scale-[0.97]"
            >
              <span className="text-xs font-mono uppercase tracking-[0.16em]">{z.l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
