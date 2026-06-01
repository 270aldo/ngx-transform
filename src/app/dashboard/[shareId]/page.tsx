"use client";

import { useEffect, useMemo, useState, use, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Activity, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { ComparisonSlider } from "@/components/ComparisonSlider";
import { EliteCard } from "@/components/EliteCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import type { InsightsResult } from "@/types/ai";

interface SessionDoc {
  shareId: string;
  input?: {
    goal?: string;
    level?: string;
  };
  ai?: InsightsResult & { letter_from_future?: string };
  status?: string;
  urls?: {
    originalUrl?: string;
    images?: Record<string, string>;
  };
}

function BentoCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden animate-in fade-in zoom-in duration-500 fill-mode-backwards lg-glass rounded-[18px] shadow-2xl",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function DashboardDetailPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SessionDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth?next=/dashboard/${shareId}`);
    }
  }, [authLoading, user, router, shareId]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = await getIdToken();
        if (!token) throw new Error("No se pudo validar tu sesión");

        const res = await fetch(`/api/sessions/${shareId}/private`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "No se pudo cargar la sesión");
        }
        const json = (await res.json()) as SessionDoc;
        setData(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, shareId, getIdToken]);

  const urls = data?.urls;
  const images = urls?.images || {};
  const m0 = urls?.originalUrl;
  const m12 = images.m12;

  const ai = data?.ai;
  const m12Stats = ai?.timeline?.m12?.stats;

  const insights = ai?.insightsText || "Tu proyección está lista.";

  const deleteSession = async () => {
    if (deleting) return;
    const confirmed = window.confirm(
      "Esto eliminará tu sesión, foto original y visualizaciones generadas. Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const token = await getIdToken();
      if (!token) throw new Error("No se pudo validar tu sesión");

      const res = await fetch(`/api/sessions/${shareId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo eliminar la sesión");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la sesión");
      setDeleting(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!data?.status) return "Procesando";
    if (data.status === "ready") return "Listo";
    if (data.status === "failed") return "Falló";
    return "Procesando";
  }, [data?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#6D00FF] border-t-transparent animate-spin" />
          <p className="text-xs tracking-widest text-neutral-500 uppercase">Cargando datos tácticos...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error de conexión</h1>
          <p className="text-neutral-400 mb-6">{error || "Intenta de nuevo"}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ngx-landing-shell relative min-h-screen overflow-x-hidden selection:bg-[#6D00FF] selection:text-white p-4 md:p-8 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(109,0,255,0.06),transparent_40%)] pointer-events-none" />

      {/* Top Bar */}
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-black italic tracking-tighter text-white">
            NGX <span className="text-[var(--ngx-purple-light)]">COMMAND</span>
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-white/45 mt-1 flex items-center gap-2">
            SESIÓN: {shareId.toUpperCase()}
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
            <span className={cn(
              "font-bold font-mono tracking-wider",
              statusLabel === "Listo" ? "text-[var(--ngx-success)]" : "text-amber-500"
            )}>{statusLabel.toUpperCase()}</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={deleteSession}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 rounded-full text-xs font-bold transition-all active:scale-95 text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            ELIMINAR SESIÓN
          </button>
          <Link
            href={`/s/${shareId}`}
            className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 text-white"
          >
            VER EXPERIENCIA PÚBLICA <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto mb-6 grid grid-cols-1 gap-3 relative z-10">
        <Link
          href={`/s/${shareId}`}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all active:scale-95 text-white"
        >
          VER EXPERIENCIA PÚBLICA <ArrowRight size={14} />
        </Link>
        <button
          onClick={deleteSession}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 rounded-full text-xs font-bold transition-all active:scale-95 text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          ELIMINAR SESIÓN
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)] relative z-10">

        {/* 1. HERO CELL (M0 vs M12 Comparison) - 3x2 for Massive impact */}
        <BentoCard className="col-span-1 md:col-span-3 lg:col-span-3 row-span-2 min-h-[600px] md:min-h-[850px] border-white/20 group rounded-[18px]">
          {m0 && m12 ? (
            <div className="relative w-full h-full">
              <ComparisonSlider
                imageBefore={m0}
                imageAfter={m12}
                className="h-full"
                labelBefore="ORIGEN"
                labelAfter="SUPREMA"
                contentAfter={
                  <div className="flex flex-col justify-end h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-sm bg-white text-black text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        MÁXIMIZACIÓN GENÉTICA
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse shadow-[0_0_10px_#00FF94]" />
                    </div>
                    <h2 className="font-display text-5xl md:text-8xl lg:text-9xl font-black italic tracking-tighter mb-4 leading-[0.9] text-white">
                      TU VERSIÓN SUPREMA
                    </h2>
                    <p className="text-sm md:text-lg max-w-2xl leading-relaxed opacity-90 font-medium text-white">
                      {insights.split('.')[0]}.
                    </p>
                  </div>
                }
                contentBefore={
                  <div className="flex flex-col justify-end h-full items-end text-right">
                    <div className="flex items-center gap-2 mb-3 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D00FF] animate-pulse shadow-[0_0_10px_#6D00FF]" />
                      <span className="px-2 py-0.5 rounded-sm bg-white text-black text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        PERFIL INICIAL
                      </span>
                    </div>
                    <h2 className="font-display text-5xl md:text-8xl lg:text-9xl font-black italic tracking-tighter mb-4 leading-[0.9] text-white">
                      TU PUNTO DE ORIGEN
                    </h2>
                    <p className="text-sm md:text-lg max-w-2xl leading-relaxed opacity-90 font-medium text-white">
                      El comienzo de todo. Tu potencial genético estaba esperando ser desbloqueado.
                    </p>
                  </div>
                }
              />
            </div>
          ) : m12 ? (
            <>
              <Image
                src={m12}
                alt="Proyección Season 3"
                fill
                sizes="(min-width: 1024px) 75vw, 100vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h2 className="font-display text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-2">
                  TU VERSIÓN SUPREMA
                </h2>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/45">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <p className="text-xs uppercase tracking-widest">Generando Proyección...</p>
            </div>
          )}
        </BentoCard>

        {/* 2. STATS CELL - Compact 1x1 stackable */}
        <BentoCard className="col-span-1 row-span-1 p-6 flex flex-col justify-between" delay={100}>
          <div>
            <h3 className="text-[10.5px] font-display font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={12} className="text-[var(--ngx-purple-light)]" /> BIOMETRÍA TEMPORADA
            </h3>
            <div className="space-y-4">
              {[
                { label: "FUERZA", value: m12Stats?.strength, color: "text-[var(--ngx-success)]" },
                { label: "ESTÉTICA", value: m12Stats?.aesthetics, color: "text-[var(--ngx-purple-light)]" },
                { label: "MENTAL", value: m12Stats?.mental, color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-[11px] font-display font-bold text-white/55 tracking-wider">{s.label}</span>
                  <span className={cn("text-xl font-bold font-mono tracking-wide", s.color)}>{s.value ?? "-"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-end">
            <div>
              <p className="text-[11px] text-white/45 uppercase tracking-wider">Potencial</p>
              <p className="font-display text-lg font-black italic text-white leading-none tracking-tight">ELITE</p>
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="text-right">
              <p className="text-[11px] font-bold text-[var(--ngx-success)] uppercase tracking-widest">OPTIMIZADO</p>
            </div>
          </div>
        </BentoCard>

        {/* 3. CTA CELL - Using standardized EliteCard, stacked below stats */}
        <EliteCard
          label="Protocolo Elite"
          title={"HAZLO\nREALIDAD."}
          actionText="CREAR MI PLAN"
          href={`/demo/${shareId}`}
          className="col-span-1 row-span-1 rounded-[18px]"
          delay={200}
        />

      </div>

      {/* Mobile only footer link */}
      <div className="md:hidden mt-8 text-center pb-8 animate-in fade-in delay-700 relative z-10">
        <Link
          href={`/s/${shareId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white transition-colors"
        >
          VER EXPERIENCIA INMERSIVA <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
}
