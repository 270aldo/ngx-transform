"use client";

import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { CyberSlider } from "@/components/CyberSlider";
import type { WizardFormValues } from "./wizardSchema";

interface WizardClosingStepProps {
  register: UseFormRegister<WizardFormValues>;
  watch: UseFormWatch<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
  authedEmail: string | null;
  usingAnonymousAccess: boolean;
  consentEmail: boolean;
  onChangeConsentEmail: (value: boolean) => void;
  resolvedEmail: string | null | undefined;
  selectedGoalLabel: string;
  selectedFocusLabel: string;
  previewUrl: string | null;
  canSubmitWizard: boolean;
  loading: boolean;
}

/**
 * Stage 4: Cierre privado — mental log sliders + email + summary + submit.
 */
export function WizardClosingStep({
  register,
  watch,
  errors,
  authedEmail,
  usingAnonymousAccess,
  consentEmail,
  onChangeConsentEmail,
  resolvedEmail,
  selectedGoalLabel,
  selectedFocusLabel,
  previewUrl,
  canSubmitWizard,
  loading,
}: WizardClosingStepProps) {
  return (
    <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center">
        <span className="ngx-eyebrow-pill mb-4 mx-auto">Paso 4 · Cierre privado</span>
        <h2 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "26ch" }}>
          Cerramos la calibración y activamos tu acceso.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
          Un último ajuste mental y el correo donde quieres recibir tu acceso privado. Después sí generamos la visualización y el siguiente paso.
        </p>
      </div>

      <div className="w-full ngx-section-panel !p-6 md:!p-8 space-y-5">
        <CyberSlider
          label="Nivel de Disciplina"
          {...register("disciplineRating")}
          min={1} max={10}
          valueDisplay={watch("disciplineRating") + "/10"}
          trackColor="amber"
        />
        <CyberSlider
          label="Calidad de Sueño"
          {...register("sleepQuality")}
          min={1} max={10}
          valueDisplay={watch("sleepQuality") + "/10"}
          trackColor="violet"
        />
        <CyberSlider
          label="Carga de Estrés"
          {...register("stressLevel")}
          min={1} max={10}
          valueDisplay={watch("stressLevel") + "/10"}
          trackColor="red"
        />
      </div>

      <div className="w-full ngx-metal-card !p-5 md:!p-6">
        <div className="relative z-10">
          <div>
            <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Acceso privado</span>
            {authedEmail && !usingAnonymousAccess ? (
              <>
                <p className="mt-2 text-sm text-white">{authedEmail}</p>
                <Input
                  {...register("email")}
                  readOnly
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </>
            ) : (
              <>
                <div className="relative mt-3">
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="tu@email.com"
                    className="bg-white/5 border-[color:var(--ngx-border-subtle)] rounded-2xl py-6 pl-12 text-white focus:border-[var(--ngx-purple)] transition-all"
                  />
                  <Eye className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                </div>
                <p className="mt-2 text-xs text-white/45 leading-relaxed">
                  Te enviaremos aquí el enlace privado a tu visualización y a tu roadmap inicial.
                </p>
              </>
            )}
            {errors.email ? (
              <p className="mt-2 text-left text-xs text-red-300">{errors.email.message}</p>
            ) : null}
          </div>

          <label className="mt-4 flex items-start gap-3 cursor-pointer group border-t border-[color:var(--ngx-border-subtle)] pt-4">
            <input
              type="checkbox"
              checked={consentEmail}
              onChange={(e) => onChangeConsentEmail(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[var(--ngx-purple)]"
            />
            <span className="text-xs text-white/55 group-hover:text-white/80 transition-colors leading-relaxed">
              Quiero recibir correos de seguimiento y novedades de NGX Transform. <span className="text-white/35">(opcional)</span>
            </span>
          </label>
        </div>
      </div>

      <div className="w-full ngx-metal-card !p-5">
        <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-5">
          <div>
            <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Acceso</span>
            <p className="mt-1.5 text-sm text-white">{resolvedEmail || "Pendiente de confirmar"}</p>
          </div>
          <div>
            <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Foto</span>
            <p className="mt-1.5 text-sm text-white">{previewUrl ? "Cargada y lista" : "No detectada"}</p>
          </div>
          <div>
            <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Objetivo</span>
            <p className="mt-1.5 text-sm text-white">{selectedGoalLabel}</p>
          </div>
          <div>
            <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Enfoque</span>
            <p className="mt-1.5 text-sm text-white">{selectedFocusLabel}</p>
          </div>
        </div>
      </div>

      {!canSubmitWizard ? (
        <p className="text-center text-xs text-amber-300">
          Antes de generar tu visualización necesitamos un correo válido y conservar la foto cargada del paso 1.
        </p>
      ) : null}

      <p className="max-w-2xl text-center text-xs text-white/45 leading-relaxed">
        En el siguiente paso generaremos una visualización aproximada de tu potencial con IA. Después podrás ver un roadmap inicial para entender qué necesitarías construir antes de pensar en un sistema más serio.
      </p>

      <div className="w-full">
        <Button
          type="submit"
          disabled={!canSubmitWizard || loading}
          className="w-full rounded-full bg-[var(--ngx-purple)] py-6 text-base font-bold uppercase tracking-[0.14em] text-white shadow-[var(--ngx-glow-primary)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none disabled:translate-y-0"
        >
          Generar visualización y siguiente paso
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
