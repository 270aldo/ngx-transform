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
    text: "La imagen inspira. El sistema y la consistencia son lo que transforman.",
  },
  {
    icon: UserPlus,
    title: "Sin cuenta completa",
    text: "Avanza sin fricción. El correo se confirma al final para guardar tu acceso.",
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
      <section className="ngx-section-panel">
        {/* Main 2-col grid: [intro + contrato + helper] | [upload + consent + cta] */}
        <div className="grid items-stretch gap-6 lg:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <LeftIntro />

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
              <p className="text-xs leading-relaxed text-white/45 text-center sm:text-left">
                Cuando detectemos una imagen válida, te pediremos los consentimientos obligatorios para desbloquear el perfil corporal.
              </p>
            )}

            <div className="flex flex-col gap-3 mt-auto">
              <Button
                type="button"
                onClick={onContinue}
                disabled={!canAdvance}
                aria-label={ctaLabel}
                className="h-auto w-full rounded-full bg-[var(--ngx-purple)] px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[var(--ngx-glow-primary)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-[11px] leading-relaxed text-white/40 text-center">
                El correo se confirma al final, justo antes de generar tu visualización privada. Aquí no te pediremos contraseña.
              </p>
            </div>
          </div>
        </div>

        {/* Trust cards — full width row below the 2-col grid, breaks the asymmetry */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 items-stretch">
          {TRUST_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="ngx-card h-full !p-5">
                <span className="ngx-card-icon mb-4">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="ngx-card-title !text-[0.95rem]">{item.title}</p>
                <p className="ngx-card-desc !text-xs mt-2">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function LeftIntro() {
  return (
    <div className="flex flex-col">
      <span className="ngx-eyebrow-pill mb-4">Paso 1 · foto base</span>

      <h1 className="ngx-h1 !text-left max-w-[15ch]">
        Sube una foto real.
        <br />
        <span className="text-white/85">GENESIS prepara tu lectura inicial.</span>
      </h1>

      <p className="mt-5 max-w-xl text-sm md:text-[0.95rem] leading-relaxed text-white/65">
        Esta imagen no se usa para juzgarte. Se usa para entender tu punto de partida y generar una visualización aspiracional privada.
      </p>

      <div className="ngx-card mt-6 !p-4 md:!p-5">
        <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
          Contrato de experiencia
        </span>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Esto no es un diagnóstico médico, una predicción exacta ni una evaluación clínica. Es una visualización aspiracional generada con IA para ayudarte a ver una dirección posible y decidir el siguiente paso con honestidad.
        </p>
      </div>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-white/45 px-1">
        Si la foto no está lista, no te pediremos más datos. Primero resolvemos la base.
      </p>
    </div>
  );
}
