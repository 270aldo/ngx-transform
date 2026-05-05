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

const CHIPS = ["Privado", "Consentimiento", "Sin login completo"] as const;
const CHECKLIST = [
  "Cuerpo completo",
  "Buena iluminación",
  "Sin filtros",
  "Pose natural",
] as const;

/**
 * Upload zone with two states:
 *  - Empty:   icon + headline + spec subline + chips + mini checklist
 *  - Preview: image (object-contain) + protected overlay + "Cambiar foto"
 *
 * The card itself does NOT host the file input — that lives in the parent form
 * for react-hook-form registration. The label element here just delegates clicks
 * and drag-and-drop events.
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
    <div className="rounded-[24px] md:rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-4 md:p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
            Foto base
          </span>
          <p className="mt-1.5 text-base md:text-lg font-bold text-white tracking-[-0.01em]">
            Carga tu imagen privada
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors",
            hasPreview
              ? "border border-[var(--ngx-success)]/30 bg-[var(--ngx-success)]/10 text-[var(--ngx-success)]"
              : "border border-white/10 bg-white/[0.04] text-white/45"
          )}
        >
          {hasPreview ? "Archivo listo" : "Cuerpo completo"}
        </span>
      </div>

      {/* Drop zone label */}
      <label
        onDrop={onDropFile}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onClick={onClickPicker}
        className={cn(
          "group relative mt-4 flex min-h-[300px] md:min-h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-[22px] md:rounded-[24px] border border-dashed transition-all cursor-pointer",
          hasPreview
            ? "border-[var(--ngx-purple)]/45 bg-[var(--ngx-purple)]/[0.05]"
            : "border-white/[0.12] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
        )}
      >
        {hasPreview && previewUrl ? (
          <PreviewState previewUrl={previewUrl} />
        ) : (
          <EmptyState />
        )}
      </label>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-sm px-6 py-8 text-center transition-transform group-hover:scale-[1.01]">
      <div
        className="mx-auto flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full"
        style={{
          background: "rgba(109, 0, 255, 0.12)",
          border: "1px solid rgba(109, 0, 255, 0.30)",
          boxShadow: "0 0 30px rgba(109,0,255,0.18)",
        }}
      >
        <Upload className="h-7 w-7 md:h-8 md:w-8 text-[var(--ngx-purple)]" />
      </div>

      <h3 className="mt-5 font-display font-black uppercase tracking-[-0.02em] text-white text-[1.35rem] md:text-[1.5rem] leading-tight">
        Arrastra tu foto aquí
      </h3>
      <p className="mt-3 text-xs md:text-sm leading-relaxed text-white/55">
        JPG o PNG · máximo 8MB · cuerpo completo, buena luz y pose natural.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {CHIPS.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55"
          >
            {chip}
          </span>
        ))}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-left">
        {CHECKLIST.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[11px] leading-tight text-white/55"
          >
            <span
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "rgba(109,0,255,0.15)",
                border: "1px solid rgba(109,0,255,0.35)",
              }}
            >
              <Check className="h-2 w-2 text-[var(--ngx-purple-light)]" />
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
      {/* Foreground: contained image (no crop) */}
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
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
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
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--ngx-purple)] px-4 py-2 text-xs font-bold text-white shadow-[var(--ngx-glow-primary)]">
          <Upload size={14} />
          Cambiar foto
        </div>
      </div>
    </>
  );
}
