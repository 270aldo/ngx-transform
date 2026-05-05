"use client";

import { ShieldCheck, Sparkles, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { WizardUploadCard } from "./WizardUploadCard";
import { WizardConsentPanel } from "./WizardConsentPanel";

interface WizardPhotoStepProps {
  previewUrl: string | null;
  consentTerms: boolean;
  consentAI: boolean;
  consentEmail: boolean;
  canAdvance: boolean;
  onClickPicker: () => void;
  onDropFile: (event: React.DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onChangeTerms: (value: boolean) => void;
  onChangeAI: (value: boolean) => void;
  onChangeEmail: (value: boolean) => void;
  onContinue: () => void;
}

const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: "Privado por diseño",
    text: "Tu foto solo se usa para operar esta sesión y generar tu resultado privado.",
  },
  {
    icon: Sparkles,
    title: "Sin promesas mágicas",
    text: "La imagen inspira. El sistema, la consistencia y el acompañamiento son lo que transforman.",
  },
  {
    icon: UserPlus,
    title: "Sin cuenta completa",
    text: "Primero avanza sin fricción. El correo se confirma al final para guardar tu acceso.",
  },
];

export function WizardPhotoStep({
  previewUrl,
  consentTerms,
  consentAI,
  consentEmail,
  canAdvance,
  onClickPicker,
  onDropFile,
  onDragOver,
  onDragEnter,
  onChangeTerms,
  onChangeAI,
  onChangeEmail,
  onContinue,
}: WizardPhotoStepProps) {
  const requiredAccepted = consentTerms && consentAI;
  const ctaLabel = !previewUrl
    ? "Sube una foto para continuar"
    : !requiredAccepted
      ? "Acepta el consentimiento"
      : "Continuar al perfil";

  return (
    <div className="w-full animate-in slide-in-from-right-8 fade-in duration-500">
      <section className="rounded-[28px] md:rounded-[32px] landing-surface-strong p-5 md:p-8 lg:p-10">
        <div className="grid items-stretch gap-6 lg:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {/* Left intro */}
          <LeftIntro />

          {/* Right column: upload + consent + cta */}
          <div className="flex flex-col gap-5">
            <WizardUploadCard
              previewUrl={previewUrl}
              onClickPicker={onClickPicker}
              onDropFile={onDropFile}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
            />

            {previewUrl ? (
              <WizardConsentPanel
                consentTerms={consentTerms}
                consentAI={consentAI}
                consentEmail={consentEmail}
                onChangeTerms={onChangeTerms}
                onChangeAI={onChangeAI}
                onChangeEmail={onChangeEmail}
              />
            ) : (
              <p className="text-xs leading-relaxed text-white/40 text-center sm:text-left">
                Cuando detectemos una imagen válida, te pediremos los consentimientos obligatorios para desbloquear el perfil corporal.
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-relaxed text-white/45">
                El correo se confirma al final, justo antes de generar tu visualización privada. Aquí no te pediremos contraseña.
              </p>
              <Button
                type="button"
                onClick={onContinue}
                disabled={!canAdvance}
                aria-label={ctaLabel}
                className="h-auto w-full sm:w-auto rounded-full bg-[var(--ngx-purple)] px-7 py-3.5 md:py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[var(--ngx-glow-primary)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LeftIntro() {
  return (
    <div className="flex flex-col">
      <span className="ngx-eyebrow inline-block mb-4">Paso 1 · foto base</span>
      <h1 className="landing-heading text-[2.4rem] sm:text-[2.65rem] md:text-[3.4rem] lg:text-[3.8rem] xl:text-[4.15rem] leading-[0.92] text-white tracking-[-0.02em]">
        Sube una foto real.
        <br />
        <span className="text-white/85">GENESIS prepara tu lectura inicial.</span>
      </h1>
      <p className="mt-5 max-w-xl text-sm md:text-[1rem] leading-relaxed text-white/65">
        Esta imagen no se usa para juzgarte. Se usa para entender tu punto de partida y generar una visualización aspiracional privada.
      </p>

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 md:p-5">
        <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
          Contrato de experiencia
        </span>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Esto no es un diagnóstico médico, una predicción exacta ni una evaluación clínica. Es una visualización aspiracional generada con IA para ayudarte a ver una dirección posible y decidir el siguiente paso con honestidad.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {TRUST_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"
            >
              <span
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  border: "1px solid rgba(109,0,255,0.20)",
                  background: "rgba(109,0,255,0.10)",
                  color: "var(--ngx-purple-light)",
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-bold text-white tracking-[-0.005em]">
                {item.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 text-xs leading-relaxed text-white/50">
        Si la foto no está lista, no te pediremos más datos. Primero resolvemos la base.
      </div>
    </div>
  );
}
