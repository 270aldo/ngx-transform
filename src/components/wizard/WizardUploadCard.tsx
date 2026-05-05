"use client";

import Image from "next/image";
import { Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardUploadCardProps {
  previewUrl: string | null;
  onClickPicker: () => void;
  onDropFile: (event: React.DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
}

const CHECKLIST = [
  "Cuerpo completo",
  "Buena iluminación",
  "Sin filtros",
  "Pose natural",
] as const;

/**
 * Upload zone with two states. Uses NEOGEN-X glass + DS spacing.
 */
export function WizardUploadCard({
  previewUrl,
  onClickPicker,
  onDropFile,
  onDragOver,
  onDragEnter,
}: WizardUploadCardProps) {
  const hasPreview = Boolean(previewUrl);

  return (
    <div className="ngx-glass !p-4 md:!p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--ngx-border-subtle)] pb-4">
        <div>
          <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
            Foto base
          </span>
          <p className="mt-1.5 text-base font-bold text-white tracking-[-0.005em]">
            Carga tu imagen privada
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors whitespace-nowrap",
            hasPreview
              ? "border border-[var(--ngx-success)]/30 bg-[var(--ngx-success)]/10 text-[var(--ngx-success)]"
              : "border border-white/10 bg-white/[0.04] text-white/45"
          )}
        >
          {hasPreview ? "Archivo listo" : "Cuerpo completo"}
        </span>
      </div>

      {/* Drop zone */}
      <label
        onDrop={onDropFile}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onClick={onClickPicker}
        className={cn(
          "group relative mt-4 flex min-h-[280px] md:min-h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-all cursor-pointer",
          hasPreview
            ? "border-[color:var(--ngx-border-active)] bg-[var(--ngx-purple)]/[0.05]"
            : "border-[color:var(--ngx-border-subtle)] bg-white/[0.015] hover:border-white/[0.22] hover:bg-white/[0.03]"
        )}
      >
        {hasPreview && previewUrl ? <PreviewState previewUrl={previewUrl} /> : <EmptyState />}
      </label>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full max-w-sm px-6 py-8 text-center transition-transform group-hover:scale-[1.005]">
      {/* Upload icon — sober, smaller */}
      <div className="ngx-icon-box mx-auto h-14 w-14">
        <Upload className="h-6 w-6" />
      </div>

      {/* Headline — clean body bold instead of italic chunky display */}
      <h3 className="mt-4 font-body font-bold text-base md:text-lg text-white leading-tight tracking-[-0.005em]">
        Arrastra tu foto aquí
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-white/55">
        JPG, PNG o WEBP · máximo 8MB
      </p>

      {/* Inline meta — replaces gordo chips. One sober line with bullets. */}
      <p className="mt-4 text-[10px] uppercase tracking-[0.16em] font-mono text-white/40 leading-relaxed">
        Privado · Consentimiento · Sin login
      </p>

      {/* Checklist — same DS, slightly smaller */}
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-left">
        {CHECKLIST.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[11px] leading-tight text-white/55"
          >
            <span className="ngx-icon-box h-3.5 w-3.5 !rounded-full">
              <Check className="h-2 w-2" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewState({ previewUrl }: { previewUrl: string }) {
  return (
    <>
      {/* Foreground: contained image (no body crop) */}
      <Image
        src={previewUrl}
        alt="Vista previa protegida"
        fill
        className="z-10 object-contain p-4 md:p-5"
        unoptimized
      />
      {/* Background: blurred wallpaper */}
      <Image
        src={previewUrl}
        alt=""
        fill
        aria-hidden
        className="z-0 object-cover blur-2xl opacity-15 scale-110"
        unoptimized
      />
      {/* Bottom gradient + label */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
      <div className="absolute left-4 top-4 z-20 rounded-full border border-[color:var(--ngx-border-subtle)] bg-black/55 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
        Vista previa protegida
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            Imagen detectada y lista para validarse
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            Puedes cambiarla antes de continuar al perfil corporal.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--ngx-purple)] px-4 py-2 text-xs font-bold text-white shadow-[var(--ngx-glow-primary)] whitespace-nowrap">
          <Upload size={14} />
          Cambiar foto
        </div>
      </div>
    </>
  );
}
