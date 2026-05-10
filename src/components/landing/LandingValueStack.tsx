"use client";

import { useLandingConfig } from "./LandingProvider";

const RECEIVE_LABELS = ["Visual", "Lectura", "Ruta", "Dirección"] as const;

/**
 * LandingValueStack — "Qué Recibes". Rediseñado en feat/landing-visual-polish.
 *
 * Decisiones:
 * - Cero cards (sin ngx-metal-card / sin border / sin glass bg). Solo
 *   divisores hairline entre celdas para crear estructura sin contenedores.
 * - Cada entregable trae un MICRO-MOCK del producto real en lugar de
 *   un ícono lucide genérico. El landing se siente como preview del
 *   producto, no como folleto.
 * - Mood blanco + purple-light suave. Diferente del ámbar de Problem
 *   (alarma) y del purple-glow del HybridOffer (acción). Esta sección
 *   es informativa/inventarial.
 */
export function LandingValueStack() {
  const { config } = useLandingConfig();
  const { valueStack } = config.copy;
  if (!valueStack) return null;

  // Micro-mocks por índice — coherentes con el output real del producto.
  const microMocks = [
    <VisualMock key="visual" />,
    <LecturaMock key="lectura" />,
    <RutaMock key="ruta" />,
    <DireccionMock key="direccion" />,
  ];

  return (
    <section id="que-recibes" className="relative w-full px-4 py-24 md:py-32 scroll-mt-24">
      <div className="relative mx-auto max-w-6xl">
        {/* HEADER — split asimétrico */}
        <div className="grid gap-6 md:gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end mb-16 md:mb-20">
          <div className="animate-on-scroll">
            <div className="mb-7 flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-10 shrink-0"
                style={{ background: "rgba(184,148,255,0.55)" }}
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "var(--ngx-purple-light)" }}
              >
                {valueStack.sectionLabel}
              </span>
            </div>

            <h2 className="ngx-h1 !text-left">
              {valueStack.title}
              <br />
              <span style={{ color: "rgba(255,255,255,0.45)" }}>
                {valueStack.highlight}
              </span>
            </h2>
          </div>

          <p
            className="animate-on-scroll delay-100 max-w-md text-base leading-relaxed text-white/62"
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.10)",
              paddingLeft: "1.25rem",
            }}
          >
            {valueStack.subtitle}
          </p>
        </div>

        {/* GRID 2x2 sin cards — divisores hairline forman la estructura */}
        <div
          className="relative grid grid-cols-1 sm:grid-cols-2"
          style={{
            // Líneas hairline interna entre celdas, no bordes externos.
            // Las divs absolutas evitan que el grid gap genere padding visible.
          }}
        >
          {/* Línea vertical central (oculta en mobile) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px sm:block"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(255,255,255,0.10) 14%, rgba(255,255,255,0.10) 86%, transparent)",
            }}
          />
          {/* Línea horizontal central */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 14%, rgba(255,255,255,0.10) 86%, transparent)",
            }}
          />

          {valueStack.items.slice(0, 4).map((item, index) => {
            const animationDelay =
              ["", "delay-100", "delay-200", "delay-300"][index] ?? "";
            const label = RECEIVE_LABELS[index] ?? `Recibes 0${index + 1}`;
            return (
              <div
                key={item.title}
                className={`animate-on-scroll ${animationDelay} relative px-2 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14`}
              >
                {/* Micro-mock del producto — top */}
                <div className="mb-6 flex h-[88px] items-center">
                  {microMocks[index]}
                </div>

                {/* Marca semántica */}
                <span
                  className="mb-3 inline-block font-mono text-[10px] uppercase tracking-[0.32em]"
                  style={{ color: "rgba(184,148,255,0.85)" }}
                >
                  {label}
                </span>

                {/* Título grande */}
                <h3 className="ngx-h3 !text-left">{item.title}</h3>

                {/* Body */}
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60 md:text-[0.97rem]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────── Micro-mocks del producto ────────────── */

function VisualMock() {
  // Dos mini-frames lado a lado: HOY (gris) → SEMANA 12 (purple glow)
  return (
    <div className="flex items-end gap-2">
      <div
        className="relative h-[72px] w-[52px] overflow-hidden rounded-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <span className="absolute bottom-1 left-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/40">
          Hoy
        </span>
      </div>
      <span
        aria-hidden
        className="mb-3 h-px w-3"
        style={{ background: "rgba(184,148,255,0.45)" }}
      />
      <div
        className="relative h-[88px] w-[64px] overflow-hidden rounded-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(109,0,255,0.30), rgba(109,0,255,0.08))",
          border: "1px solid rgba(109,0,255,0.55)",
          boxShadow: "0 0 18px rgba(109,0,255,0.30)",
        }}
      >
        <span
          className="absolute bottom-1 left-1.5 font-mono text-[8px] uppercase tracking-[0.18em]"
          style={{ color: "var(--ngx-purple-light)" }}
        >
          Mes 12
        </span>
      </div>
    </div>
  );
}

function LecturaMock() {
  // Score circular mini con número 72
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - 0.72 * circumference;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[68px] w-[68px]">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="var(--ngx-purple)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ filter: "drop-shadow(0 0 4px rgba(109,0,255,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-base font-bold tabular-nums text-white">
            72
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className="h-1 w-16 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--ngx-purple) 78%, rgba(255,255,255,0.06) 78%)",
          }}
        />
        <div
          className="h-1 w-12 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--ngx-purple-light) 64%, rgba(255,255,255,0.06) 64%)",
          }}
        />
        <div
          className="h-1 w-14 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(184,148,255,0.7) 58%, rgba(255,255,255,0.06) 58%)",
          }}
        />
      </div>
    </div>
  );
}

function RutaMock() {
  // 4 mini-fases conectadas con líneas
  const phases = ["1", "2", "3", "4"];
  return (
    <div className="flex items-center">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-[10px] font-bold tabular-nums"
            style={{
              background:
                i === 0
                  ? "rgba(109,0,255,0.20)"
                  : "rgba(255,255,255,0.04)",
              border:
                i === 0
                  ? "1px solid rgba(109,0,255,0.55)"
                  : "1px solid rgba(255,255,255,0.10)",
              color: i === 0 ? "var(--ngx-purple-light)" : "rgba(255,255,255,0.5)",
            }}
          >
            {p}
          </div>
          {i < phases.length - 1 && (
            <div
              aria-hidden
              className="h-px w-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function DireccionMock() {
  // Badge "Empieza por aquí" + checkmark — eco directo del producto real
  return (
    <div className="flex flex-col items-start gap-2">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em]"
        style={{
          background: "rgba(109,0,255,0.18)",
          border: "1px solid rgba(109,0,255,0.45)",
          color: "var(--ngx-purple-light)",
        }}
      >
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full"
          style={{
            background: "var(--ngx-purple-light)",
            boxShadow: "0 0 6px rgba(184,148,255,0.7)",
          }}
        />
        Empieza por aquí
      </span>
      <div
        className="rounded-md px-3 py-2 text-[10px] leading-tight text-white/72"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxWidth: "180px",
        }}
      >
        Plan semanal escrito antes del lunes — no improvisar día a día.
      </div>
    </div>
  );
}
