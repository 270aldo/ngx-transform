"use client";

import Link from "next/link";
import { AnimatedBlobs, ScrollAnimator } from "@/components/landing";
import {
  Zap,
  Shield,
  Brain,
  Camera,
  User,
  Sparkles,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <ScrollAnimator>
      <div className="relative min-h-screen overflow-x-hidden selection:bg-[#6D00FF] selection:text-white">
        {/* Background */}
        <AnimatedBlobs />

        {/* Main Content */}
        <main className="relative z-10 pt-32 pb-20">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-48">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="animate-on-scroll inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border-[#6D00FF]/40 mb-12 shadow-[0_0_40px_-10px_rgba(109,0,255,0.4)] hover:border-[#6D00FF]/70 hover:shadow-[0_0_50px_-10px_rgba(109,0,255,0.5)] transition-all duration-300 cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] text-slate-300 tracking-wide">
                  Powered by Gemini AI
                </span>
                <span className="h-3 w-px bg-white/20" />
                <span className="text-[11px] text-[#a78bfa] tracking-wide">
                  v2.1
                </span>
              </div>

              {/* Title */}
              <h1 className="animate-on-scroll delay-100 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] text-white tracking-tighter mb-6 font-semibold">
                Visualiza tu
                <br className="hidden sm:block" />
                <span className="text-gradient-lg">transformación.</span>
              </h1>

              {/* Subtitle */}
              <p className="animate-on-scroll delay-200 text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mb-14 font-light">
                IA que proyecta tu evolución física en 12 meses. Sube tu foto,
                recibe tu timeline personalizado. Gratis.
              </p>

              {/* CTAs */}
              <div className="animate-on-scroll delay-300 flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
                <Link
                  href="/wizard"
                  className="group relative px-8 py-4 rounded-full bg-[#6D00FF] hover:bg-[#5b00d6] text-white text-sm font-semibold tracking-wide overflow-hidden transition-all duration-300 shadow-[0_0_30px_-5px_rgba(109,0,255,0.6)] hover:shadow-[0_0_50px_-5px_rgba(109,0,255,0.8)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative flex items-center gap-2">
                    Comenzar Gratis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="animate-on-scroll delay-400 flex items-center gap-4 mb-16">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 border-2 border-[#030005]" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-300 border-2 border-[#030005]" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 border-2 border-[#030005]" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-300 border-2 border-[#030005]" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white font-medium">
                    +10,000 transformaciones
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Esta semana en NGX
                  </p>
                </div>
              </div>

              {/* Hero Preview */}
              <div className="animate-on-scroll-scale delay-500 relative w-full max-w-4xl group">
                <div className="absolute -inset-1 bg-gradient-to-t from-[#6D00FF]/20 via-[#6D00FF]/5 to-transparent rounded-[20px] blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000" />
                <div className="relative glass-panel rounded-[16px] border border-white/10 overflow-hidden shadow-2xl aspect-video flex flex-col bg-[#050507]/80">
                  <div className="glass-highlight" />

                  {/* Window Header */}
                  <div className="h-10 border-b border-white/5 flex justify-between items-center px-4 bg-black/40">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-widest">
                      NGX_Transform_Preview
                    </div>
                    <div className="w-10" />
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    <div className="relative z-10 flex items-center gap-8">
                      {/* Timeline Preview */}
                      <div className="flex items-end gap-4">
                        {["HOY", "MES 4", "MES 8", "MES 12"].map((label, i) => (
                          <div key={label} className="text-center">
                            <div
                              className={`w-16 h-24 rounded-lg ${
                                i === 0
                                  ? "bg-white/5 border border-white/10"
                                  : i === 3
                                  ? "bg-[#6D00FF]/20 border border-[#6D00FF]/40 shadow-[0_0_20px_rgba(109,0,255,0.3)]"
                                  : "bg-white/5 border border-white/5"
                              } flex items-center justify-center`}
                            >
                              <User
                                className={`w-6 h-6 ${
                                  i === 3 ? "text-[#a78bfa]" : "text-slate-600"
                                }`}
                              />
                            </div>
                            <p
                              className={`mt-2 text-[10px] ${
                                i === 3
                                  ? "text-[#a78bfa] font-medium"
                                  : "text-slate-500"
                              }`}
                            >
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-px bg-gradient-to-r from-white/20 to-[#6D00FF]/50" />
                        <Sparkles className="w-5 h-5 text-[#a78bfa] animate-pulse" />
                      </div>

                      {/* Stats Preview */}
                      <div className="glass-panel rounded-xl p-4 border border-white/10">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                          Proyección
                        </p>
                        <div className="text-2xl text-white font-semibold">
                          +34<span className="text-[#a78bfa] text-lg">%</span>
                        </div>
                        <p className="text-[10px] text-emerald-400">
                          Masa muscular
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "99.9", suffix: "%", label: "Precisión IA" },
                { value: "<3", suffix: "min", label: "Análisis" },
                { value: "1M", suffix: "+", label: "Transformaciones" },
                { value: "186", suffix: "+", label: "Países" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`animate-on-scroll ${
                    i > 0 ? `delay-${i}00` : ""
                  } glass-panel rounded-2xl p-8 text-center border-glow-hover`}
                >
                  <div className="text-4xl md:text-5xl text-white font-semibold tracking-tight mb-2">
                    {stat.value}
                    <span className="text-[#a78bfa]">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - Large */}
              <div className="animate-on-scroll md:col-span-2 glass-panel rounded-3xl p-10 relative overflow-hidden border-glow-hover group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6D00FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                    <Brain className="w-6 h-6 text-[#a78bfa]" />
                  </div>
                  <h3 className="text-2xl text-white mb-4 font-semibold">
                    Análisis Biométrico IA
                  </h3>
                  <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                    Gemini analiza tu estructura corporal, composición y
                    potencial genético para crear proyecciones realistas y
                    personalizadas.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 group-hover:opacity-50 transition-opacity">
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#6D00FF] to-transparent blur-3xl" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="animate-on-scroll delay-100 glass-panel rounded-3xl p-10 relative overflow-hidden border-glow-hover flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    Privacidad Total
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Tu foto se procesa y elimina. Zero almacenamiento.
                  </p>
                </div>
                <div className="mt-8 flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                  <span className="text-[10px] uppercase text-slate-500">
                    Encriptación E2E
                  </span>
                </div>
              </div>

              {/* Feature 3 - Full width */}
              <div className="animate-on-scroll delay-200 md:col-span-3 glass-panel rounded-3xl p-10 relative overflow-hidden border-glow-hover flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 relative z-10">
                  <h3 className="text-2xl text-white mb-4 font-semibold">
                    Timeline de 12 Meses
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    No es solo un antes/después. Visualiza tu progreso en 4
                    etapas: Hoy, Mes 4, Mes 8 y Mes 12 con estadísticas y
                    métricas detalladas.
                  </p>
                </div>
                <div className="flex-1 w-full relative h-24">
                  <div className="absolute inset-0 flex items-center justify-center gap-4">
                    {["m0", "m4", "m8", "m12"].map((m, i) => (
                      <div
                        key={m}
                        className={`w-14 h-14 rounded-lg ${
                          i === 3
                            ? "bg-[#151518] border border-[#6D00FF]/40 shadow-[0_0_30px_-10px_rgba(109,0,255,0.3)] z-10"
                            : "bg-[#111] border border-white/10 opacity-50 scale-90 blur-[1px]"
                        } flex items-center justify-center`}
                      >
                        {i === 3 ? (
                          <Check className="w-5 h-5 text-[#6D00FF]" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-white/10" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-3xl text-white mb-4 tracking-tight font-semibold">
                Cómo Funciona
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                De foto a proyección en menos de 3 minutos.
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px timeline-line hidden md:block" />

              {/* Steps */}
              {[
                {
                  step: "01",
                  title: "Sube tu Foto",
                  desc: "Una foto actual de cuerpo completo. Frontal, buena iluminación.",
                  icon: Camera,
                },
                {
                  step: "02",
                  title: "Completa tu Perfil",
                  desc: "Datos biométricos, objetivos y estilo de vida. 2 minutos máximo.",
                  icon: User,
                },
                {
                  step: "03",
                  title: "Recibe tu Timeline",
                  desc: "IA genera tu proyección personalizada con 4 etapas de transformación.",
                  icon: Sparkles,
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    i < 2 ? "mb-16" : ""
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      i % 2 === 0 ? "md:text-right order-2 md:order-1" : ""
                    } animate-on-scroll${i % 2 === 0 ? "-left" : "-right"} ${
                      i > 0 ? `delay-${i}00` : ""
                    }`}
                  >
                    <div
                      className={`glass-panel rounded-2xl p-8 border-glow-hover ${
                        i % 2 === 0 ? "" : "md:order-3"
                      }`}
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D00FF]/10 border border-[#6D00FF]/20 mb-4">
                        <span className="text-[10px] text-[#a78bfa]">
                          PASO {item.step}
                        </span>
                      </div>
                      <h3 className="text-xl text-white mb-3 font-medium">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`relative z-10 ${
                      i % 2 === 0 ? "order-1 md:order-2" : ""
                    } animate-on-scroll-scale delay-${i}00`}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#6D00FF] flex items-center justify-center shadow-[0_0_30px_rgba(109,0,255,0.4)]">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div
                    className={`flex-1 ${
                      i % 2 === 0 ? "order-3" : ""
                    } hidden md:block`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
            <h2 className="animate-on-scroll text-sm text-slate-500 mb-10 uppercase tracking-widest pl-2">
              Lo que dicen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  text: "Increíble la precisión. Mi proyección de mes 12 se parece mucho a mi progreso real después de entrenar 8 meses.",
                  name: "Carlos M.",
                  role: "Usuario verificado",
                  gradient: "from-blue-400 to-cyan-300",
                },
                {
                  text: "Lo usé para motivarme. Ver mi potencial me dio la disciplina que necesitaba para empezar a entrenar en serio.",
                  name: "Ana R.",
                  role: "Usuario verificado",
                  gradient: "from-emerald-400 to-green-300",
                },
                {
                  text: "Como entrenador, lo uso con mis clientes para mostrarles su potencial. La visualización es poderosísima.",
                  name: "Diego L.",
                  role: "Personal Trainer",
                  gradient: "from-purple-400 to-pink-300",
                },
              ].map((testimonial, i) => (
                <div
                  key={testimonial.name}
                  className={`animate-on-scroll ${
                    i > 0 ? `delay-${i}00` : ""
                  } glass-panel p-8 rounded-2xl hover:bg-white/[0.02] transition-colors ${
                    i === 1 ? "translate-y-0 md:translate-y-8" : ""
                  }`}
                >
                  <div className="flex gap-1 text-[#6D00FF] mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonial.gradient}`}
                    />
                    <div>
                      <div className="text-white text-xs font-medium">
                        {testimonial.name}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="animate-on-scroll-scale relative glass-panel rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 cta-gradient" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#6D00FF] blur-[120px] opacity-20" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl text-white mb-6 tracking-tight font-semibold">
                  ¿Listo para ver tu potencial?
                </h2>
                <p className="text-slate-400 text-sm mb-10 max-w-md mx-auto">
                  Únete a miles de personas que ya visualizaron su
                  transformación. Gratis, sin registro, sin compromisos.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link
                    href="/wizard"
                    className="group relative px-10 py-4 rounded-full bg-[#6D00FF] hover:bg-[#5b00d6] text-white text-sm font-semibold tracking-wide overflow-hidden transition-all duration-300 shadow-[0_0_40px_-5px_rgba(109,0,255,0.6)] hover:shadow-[0_0_60px_-5px_rgba(109,0,255,0.8)] hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative flex items-center gap-2">
                      Comenzar Ahora
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                  <span className="text-slate-500 text-xs">
                    Análisis en menos de 3 minutos
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#6D00FF] blur-md opacity-40" />
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-400 rounded flex items-center justify-center border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-[#030005]" />
                  </div>
                </div>
                <span className="text-white font-medium tracking-tight text-sm">
                  NGX Transform
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[10px] text-slate-500">
                  Todos los sistemas operativos
                </span>
              </div>

              <p className="text-slate-600 text-[10px]">
                © 2024 NGX. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ScrollAnimator>
  );
}
