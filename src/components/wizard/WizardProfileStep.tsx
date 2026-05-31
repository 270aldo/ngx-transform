"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { CyberSlider } from "@/components/CyberSlider";
import { EliteOptionCard } from "@/components/EliteOptionCard";
import type { WizardFormValues } from "./wizardSchema";

interface WizardProfileStepProps {
  register: UseFormRegister<WizardFormValues>;
  watch: UseFormWatch<WizardFormValues>;
  setValue: UseFormSetValue<WizardFormValues>;
}

/**
 * Stage 2: Perfil corporal — biometrics + composition baseline.
 * Pure view of form state. No business logic.
 */
export function WizardProfileStep({ register, watch, setValue }: WizardProfileStepProps) {
  return (
    <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-8">
      <div className="text-center">
        <span className="ngx-eyebrow-pill mb-4 mx-auto">Paso 2 · Perfil corporal</span>
        <h2 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "20ch" }}>
          Le damos contexto a tu punto de partida.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
          Estos datos no sustituyen una medición clínica. Sólo calibran el rango visual para que la lectura sea más coherente con tu punto de partida real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-stretch">
        <div className="ngx-section-panel !p-5 md:!p-6 flex h-full flex-col gap-5">
          <CyberSlider
            label="Edad"
            {...register("age")}
            min={18} max={80} step={1}
            valueDisplay={watch("age")}
            suffix="AÑOS"
          />
          <CyberSlider
            label="Altura"
            {...register("heightCm")}
            min={140} max={220} step={1}
            valueDisplay={watch("heightCm")}
            suffix="CM"
            trackColor="emerald"
          />
          <CyberSlider
            label="Peso"
            {...register("weightKg")}
            min={40} max={150} step={0.5}
            valueDisplay={watch("weightKg")}
            suffix="KG"
            trackColor="violet"
          />

          <div className="ngx-metal-card !p-4">
            <div className="relative z-10">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Referencia corporal</span>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["male", "female"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue("sex", s)}
                    data-selected={watch("sex") === s}
                    className="ngx-choice-button py-3 text-[10px] font-mono uppercase tracking-[0.18em]"
                  >
                    {s === "male" ? "Masculino" : "Femenino"}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/45">
                Se usa como parámetro de calibración visual. No define identidad, diagnóstico ni resultado.
              </p>
            </div>
          </div>

          <div className="ngx-metal-card !p-4">
            <div className="relative z-10">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Cómo se usa</span>
              <div className="mt-3 grid gap-2 text-xs leading-relaxed text-white/55">
                <p>Edad, altura y peso ayudan a evitar una visualización exagerada.</p>
                <p>La composición visual orienta el tipo de cambio: postura, proporción, cintura o músculo funcional.</p>
              </div>
            </div>
          </div>

          <p className="mt-auto text-xs leading-relaxed text-white/45 px-1">
            Mientras más honestos sean estos datos, mejor se sentirá el puente entre imagen, insight y roadmap.
          </p>
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="ngx-glass !p-5 md:!p-6 flex-1">
            <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Composición visual inicial</span>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <EliteOptionCard
                title="BASE LIGERA"
                description="Poca grasa visible o estructura delgada. La prioridad será construir músculo y postura."
                selected={watch("bodyFatLevel") === "bajo"}
                onClick={() => setValue("bodyFatLevel", "bajo")}
                idx={1}
              />
              <EliteOptionCard
                title="BASE INTERMEDIA"
                description="Punto mixto: recomposición, fuerza progresiva y mejor proporción visual."
                selected={watch("bodyFatLevel") === "medio"}
                onClick={() => setValue("bodyFatLevel", "medio")}
                idx={2}
              />
              <EliteOptionCard
                title="BASE CON RESERVA"
                description="Mayor margen de reducción de grasa. La visualización priorizará cintura, energía y músculo funcional."
                selected={watch("bodyFatLevel") === "alto"}
                onClick={() => setValue("bodyFatLevel", "alto")}
                idx={3}
              />
            </div>
          </div>

          <div className="ngx-metal-card !p-5">
            <div className="relative z-10">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Lectura inicial</span>
              <p className="mt-2 text-base font-bold text-white">Todavía no estamos diagnosticando.</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Sólo estamos construyendo una base más útil para que la visualización y el siguiente paso tengan coherencia entre sí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
