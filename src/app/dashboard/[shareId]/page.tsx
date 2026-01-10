"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { BookingCTA2 } from "@/components/BookingCTA2";
import { DownloadButton } from "@/components/DownloadButton";
import { SocialShareButton } from "@/components/SocialShareButton";
import { useAuth } from "@/components/auth/AuthProvider";
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

export default function DashboardDetailPage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SessionDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const m4 = images.m4;
  const m8 = images.m8;
  const m12 = images.m12;

  const ai = data?.ai;
  const m0Stats = ai?.timeline?.m0?.stats;
  const m12Stats = ai?.timeline?.m12?.stats;

  const insights = ai?.insightsText || "Tu proyección está lista.";
  const letter = ai?.letter_from_future;

  const statusLabel = useMemo(() => {
    if (!data?.status) return "Procesando";
    if (data.status === "ready") return "Listo";
    if (data.status === "failed") return "Falló";
    return "Procesando";
  }, [data?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-neutral-400">Cargando dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No pudimos cargar el dashboard</h1>
          <p className="text-neutral-400">{error || "Intenta de nuevo"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">Dashboard NGX</p>
            <span className="text-xs text-neutral-400">Estado: {statusLabel}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Tu resumen completo de transformación
          </h1>
          <p className="text-neutral-400 max-w-2xl">{insights}</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {m0 ? (
                <Image
                  src={m0}
                  alt="Inicio"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                  Imagen inicial no disponible
                </div>
              )}
              <div className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded-full">
                HOY
              </div>
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {m12 ? (
                <Image
                  src={m12}
                  alt="Mes 12"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                  Imagen m12 no disponible
                </div>
              )}
              <div className="absolute bottom-3 left-3 text-xs bg-[#6D00FF]/80 px-2 py-1 rounded-full">
                MES 12
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
                Indicadores clave
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Fuerza", value: m12Stats?.strength, base: m0Stats?.strength },
                  { label: "Estética", value: m12Stats?.aesthetics, base: m0Stats?.aesthetics },
                  { label: "Resistencia", value: m12Stats?.endurance, base: m0Stats?.endurance },
                  { label: "Mental", value: m12Stats?.mental, base: m0Stats?.mental },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-black/40 p-3 border border-white/5">
                    <p className="text-neutral-400 text-xs">{stat.label}</p>
                    <p className="text-xl font-bold">
                      {stat.value ?? "--"}
                      {stat.value !== undefined && stat.base !== undefined ? (
                        <span className="text-xs text-emerald-400 ml-2">
                          {stat.value - stat.base >= 0 ? "+" : ""}
                          {stat.value - stat.base}
                        </span>
                      ) : null}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-neutral-400">
                Carta del futuro
              </h3>
              <p className="text-sm text-neutral-300">
                {letter ||
                  "Tu versión de 12 meses te espera. Cada paso consistente te acerca más a esa realidad."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-neutral-400">Descargas rápidas</h3>
              <div className="flex items-center gap-3">
                <DownloadButton imageUrl={m4} filename={`ngx-${shareId}-m4`} />
                <DownloadButton imageUrl={m8} filename={`ngx-${shareId}-m8`} />
                <DownloadButton imageUrl={m12} filename={`ngx-${shareId}-m12`} />
                <SocialShareButton shareId={shareId} imageUrl={m12} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Ver resultados públicos</p>
                <p className="text-xs text-neutral-500">Comparte tu transformación cuando lo decidas.</p>
              </div>
              <Link
                href={`/s/${shareId}`}
                className="inline-flex items-center gap-2 text-[#6D00FF] hover:text-[#B98CFF] text-sm"
              >
                Ver share <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-[#6D00FF]" />
              Proyección avanzada
            </div>
            <p className="text-xs text-neutral-400">
              Explora la evolución completa, con tu before protegido y listo para compartir cuando decidas.
            </p>
          </div>
          <div className="lg:col-span-2">
            <BookingCTA2 shareId={shareId} />
          </div>
        </section>
      </div>
    </div>
  );
}
