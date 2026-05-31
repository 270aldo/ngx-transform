"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  Camera,
  CheckCircle2,
  FileText,
  Mail,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

const OUTCOMES = [
  {
    label: "Visual",
    title: "Visualización aspiracional",
    text: "Una referencia aspiracional para imaginar una dirección posible. Inspira, no garantiza.",
    icon: Sparkles,
  },
  {
    label: "Lectura",
    title: "Lectura inicial",
    text: "Foto, biometría declarada y contexto personal se traducen en señales orientativas.",
    icon: Brain,
  },
  {
    label: "Ruta",
    title: "Dirección de 12 semanas",
    text: "Un mapa inicial para decidir si avanzar solo o revisar HYBRID.",
    icon: CalendarCheck,
  },
] as const;

const RESULT_ROWS = [
  { label: "Fuerza", value: "48", delta: "base", tone: "neutral" },
  { label: "Estética", value: "55", delta: "visual", tone: "purple" },
  { label: "Resistencia", value: "45", delta: "base", tone: "neutral" },
  { label: "Mental", value: "72", delta: "contexto", tone: "purple" },
] as const;

const ROADMAP = [
  { phase: "01", weeks: "1-3", title: "Fundación" },
  { phase: "02", weeks: "4-7", title: "Construcción" },
  { phase: "03", weeks: "8-11", title: "Ajuste" },
  { phase: "04", weeks: "12", title: "Diagnóstico" },
] as const;

const TRUST = [
  "visualización aspiracional, no garantía.",
  "Lectura orientativa, no diagnóstico médico.",
  "Tu correo permite enviar y recuperar el resultado.",
] as const;

export function LandingJourney() {
  const { config, trackCta } = useLandingConfig();
  const { howItWorks, hero } = config.copy;
  const [videoOpen, setVideoOpen] = useState(false);
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/wizard";
  const isBookingExternal = bookingUrl.startsWith("http");
  const founderVideoUrl = config.copy.explainerVideo?.videoUrl;

  return (
    <div className="ngx-lg-wallpaper relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-[620px] bg-gradient-to-b from-transparent via-white/[0.08] to-transparent xl:block" />
      <nav
        aria-label="Progreso de la landing"
        className="pointer-events-none absolute left-1/2 top-28 z-10 hidden -translate-x-[620px] flex-col gap-5 xl:flex"
      >
        {["Recibes", "Funciona", "Resultado", "HYBRID"].map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${
                index === 0 ? "bg-[var(--ngx-purple)] shadow-[0_0_12px_rgba(109,0,255,0.75)]" : "bg-white/20"
              }`}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
              {item}
            </span>
          </div>
        ))}
      </nav>

      <section id="que-recibes" className="ngx-lg-section ngx-lg-receives-section">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-12">
          <div className="animate-on-scroll">
            <span className="ngx-lg-label">Qué recibes</span>
            <h2 className="ngx-lg-heading mt-4 max-w-[10.5ch]">
              No es solo una imagen. Es dirección inicial.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/58">
              Transform convierte tu foto y contexto declarado en una visualización aspiracional, una lectura orientativa y un primer mapa de acción.
            </p>
          </div>

          <div className="ngx-lg-glass ngx-receives-panel overflow-hidden">
            {OUTCOMES.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} grid gap-4 border-t border-white/[0.075] p-5 first:border-t-0 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-5 md:p-7`}
                >
                  <span className="ngx-lg-icon ngx-receives-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="ngx-lg-kicker">{item.label}</p>
                    <h3 className="mt-1 font-display text-2xl font-black uppercase leading-none tracking-normal text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/58">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="ngx-lg-section">
        <div className="mb-8 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div className="animate-on-scroll">
            <span className="ngx-lg-label">Cómo funciona</span>
            <h2 className="ngx-lg-heading mt-4 max-w-[11ch]">
              De curiosidad a claridad.
            </h2>
          </div>
          <p className="animate-on-scroll delay-100 max-w-2xl text-base leading-relaxed text-white/60">
            Cuatro pasos, una sola intención: convertir una reacción visual en una lectura útil y un siguiente paso defendible.
          </p>
        </div>

        <ol className="grid gap-3 md:grid-cols-4">
          {howItWorks.steps.map((step, index) => {
            const Icon = index === 0 ? Camera : index === 1 ? Brain : index === 2 ? FileText : Target;
            return (
              <li
                key={step.step}
                className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} ngx-lg-step`}
                data-active={index === 0 ? "true" : "false"}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ngx-purple-light)]">
                    Paso {step.step}
                  </span>
                  <Icon className="h-4 w-4 text-white/45" />
                </div>
                <h3 className="mt-6 font-display text-xl font-black uppercase leading-none tracking-normal text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/56">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="reporte-ejemplo" className="ngx-lg-section">
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
          <div className="animate-on-scroll-left">
            <span className="ngx-lg-label">Ejemplo de resultado</span>
            <h2 className="ngx-lg-heading mt-4 max-w-[12ch]">
              Lo entiendes en menos de 10 segundos.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/62">
              Primero ves el impacto visual. Después la lectura inicial. Al final, una dirección de 12 semanas y el siguiente paso hacia HYBRID.
            </p>
            <div className="mt-7 space-y-3">
              {TRUST.map((item) => (
                <p key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/58">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--ngx-purple-light)]" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="animate-on-scroll-right delay-100 ngx-lg-browser">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">
                Resultado privado
              </span>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative min-h-[360px] overflow-hidden border-b border-white/[0.07] lg:border-b-0 lg:border-r">
                <Image
                  src={hero.transformationDemo?.afterImage || "https://images.unsplash.com/photo-1645810809381-97f6fd2f7d10?w=900&h=1200&fit=crop&crop=faces"}
                  alt="Visualización aspiracional"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050218] via-[#050218]/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="ngx-lg-kicker text-[var(--ngx-purple-light)]">Visualización</p>
                  <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-white">
                    Season 1
                  </h3>
                  <p className="mt-2 text-sm text-white/62">
                    Aspiracional, no garantía.
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
                  <div className="ngx-lg-score">
                    <span>72</span>
                    <small>/100</small>
                  </div>
                  <div>
                    <p className="ngx-lg-kicker">Lectura inicial</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/62">
                      Score orientativo calculado desde foto, biometría declarada y autopercepción. No reemplaza medición clínica.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {RESULT_ROWS.map((row) => (
                    <div key={row.label} className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
                      <p className="ngx-lg-kicker">{row.label}</p>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <span className="font-mono text-3xl font-bold leading-none text-white tabular-nums">
                          {row.value}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
                            row.tone === "purple"
                              ? "border border-[var(--lg-rim-purple)] bg-[var(--lg-glass-purple-soft)] text-[var(--ngx-purple-light)]"
                              : "border border-white/[0.08] bg-white/[0.035] text-white/42"
                          }`}
                        >
                          {row.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
                  <p className="ngx-lg-kicker">Dirección de 12 semanas</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {ROADMAP.map((item, index) => (
                      <div key={item.phase}>
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold ${
                            index === 0
                              ? "border-[var(--lg-rim-purple)] bg-[var(--lg-glass-purple)] text-white"
                              : "border-white/[0.10] bg-black/20 text-white/55"
                          }`}
                        >
                          {item.phase}
                        </span>
                        <p className="mt-3 font-display text-sm font-black uppercase leading-none text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/38">
                          Sem {item.weeks}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="puente" className="ngx-lg-section pb-12 md:pb-16">
        <div className="ngx-lg-hybrid grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <span className="ngx-lg-label">NGX HYBRID · Diagnóstico</span>
            <h2 className="mt-4 font-display text-[clamp(2.45rem,4.8vw,4.45rem)] font-black uppercase leading-[0.88] tracking-normal text-white">
              La imagen inspira. El sistema transforma. El humano sostiene.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/62">
              Transform no promete un resultado. Sirve para abrir una conversación seria: qué señales aparecen, qué estructura tendría sentido durante 12 semanas y qué necesita revisar un humano antes de recomendar HYBRID.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "GENESIS ordena visualización, entrenamiento y hábitos.",
                "Un coach revisa contexto real antes de venderte algo.",
                "12 semanas con checkpoints, no promesas.",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
                  <ShieldCheck className="h-4 w-4 text-[var(--ngx-purple-light)]" />
                  <p className="mt-4 text-sm leading-relaxed text-white/62">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ngx-lg-offer-panel">
            <p className="ngx-lg-kicker text-[var(--ngx-purple-light)]">Siguiente paso recomendado</p>
            <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none text-white">
              Revisa si HYBRID tiene fit contigo.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/58">
              Una llamada breve para convertir tu lectura en una decisión: avanzar solo, ajustar primero o entrar a una temporada HYBRID.
            </p>

            <div className="mt-6 grid gap-3">
              <a
                href={bookingUrl}
                target={isBookingExternal ? "_blank" : undefined}
                rel={isBookingExternal ? "noreferrer noopener" : undefined}
                onClick={() => trackCta("landing_hybrid_primary", "book_hybrid_diagnosis", "Agendar diagnóstico HYBRID")}
                className="ngx-primary-cta inline-flex px-6 text-sm"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Agendar diagnóstico HYBRID</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                href="/wizard"
                onClick={() => trackCta("landing_hybrid_secondary", "receive_brief_email", "Recibir mi brief por correo")}
                className="ngx-secondary-cta inline-flex px-6 text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Recibir mi brief por correo</span>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
              <button
                type="button"
                onClick={() => {
                  trackCta("landing_hybrid_video", "founder_video_interest", "Ver video fundador");
                  setVideoOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/58 transition hover:border-white/[0.16] hover:text-white"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Ver video fundador
              </button>
              <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/36">
                15 min · sin presión
              </span>
            </div>
          </div>
        </div>
      </section>

      {videoOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/72 px-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Video fundador"
        >
          <div className="ngx-lg-glass relative w-full max-w-3xl overflow-hidden !rounded-[18px]">
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.10] bg-black/35 text-white/70 transition hover:text-white"
              aria-label="Cerrar video fundador"
            >
              <X className="h-4 w-4" />
            </button>

            {founderVideoUrl ? (
              <video
                src={founderVideoUrl}
                controls
                playsInline
                className="aspect-video w-full bg-black object-cover"
              />
            ) : (
              <div className="grid gap-6 p-6 md:grid-cols-[0.82fr_1.18fr] md:p-8">
                <div className="flex min-h-[240px] flex-col justify-end rounded-xl border border-[var(--lg-rim-purple)] bg-[radial-gradient(circle_at_50%_0%,rgba(109,0,255,0.28),transparent_64%),rgba(255,255,255,0.04)] p-5">
                  <PlayCircle className="h-9 w-9 text-[var(--ngx-purple-light)]" />
                  <p className="mt-6 ngx-lg-kicker text-[var(--ngx-purple-light)]">Founder brief</p>
                  <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-white">
                    Por qué HYBRID existe.
                  </h3>
                </div>

                <div className="pr-8 md:pr-10">
                  <p className="ngx-lg-kicker text-[var(--ngx-purple-light)]">Sin promesas</p>
                  <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none text-white">
                    La imagen abre la puerta. La revisión decide el camino.
                  </h3>
                  <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/62">
                    <p>
                      HYBRID es para quien necesita estructura, seguimiento y contexto humano antes de comprometerse a una temporada de 12 semanas.
                    </p>
                    <p>
                      No es para quien busca una garantía visual, una receta médica o una compra impulsiva desde una imagen.
                    </p>
                    <p>
                      En el diagnóstico revisamos fit, fricción, compromiso y qué tendría sentido ejecutar primero.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={bookingUrl}
                      target={isBookingExternal ? "_blank" : undefined}
                      rel={isBookingExternal ? "noreferrer noopener" : undefined}
                      onClick={() => trackCta("landing_video_modal_primary", "book_hybrid_diagnosis", "Agendar diagnóstico")}
                      className="ngx-primary-cta inline-flex min-h-12 px-5 text-xs"
                    >
                      Agendar diagnóstico
                    </a>
                    <Link
                      href="/wizard"
                      onClick={() => trackCta("landing_video_modal_secondary", "start_diagnostic", "Empezar con Transform")}
                      className="ngx-secondary-cta inline-flex min-h-12 px-5 text-xs"
                    >
                      Empezar con Transform
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
