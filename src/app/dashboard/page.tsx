"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";

interface SessionSummary {
  shareId: string;
  status?: string;
  shareOriginal: boolean;
  shareScope?: {
    shareOriginal?: boolean;
    shareInsights?: boolean;
    shareProfile?: boolean;
    shareImages?: boolean;
  };
  goal?: string;
  level?: string;
  createdAt?: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?next=/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = await getIdToken();
        if (!token) throw new Error("No se pudo validar tu sesión");

        const res = await fetch("/api/sessions/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "No se pudieron cargar tus sesiones");
        }
        const json = await res.json();
        setSessions(json.sessions || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado";
        addToast({ variant: "error", message });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, getIdToken, addToast]);

  const updateShareSettings = async (shareId: string, updates: Record<string, boolean>) => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error("No se pudo validar tu sesión");
      const res = await fetch(`/api/sessions/${shareId}/share-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo actualizar");
      }
      const json = await res.json();
      setSessions((prev) =>
        prev.map((s) =>
          s.shareId === shareId
            ? {
                ...s,
                shareOriginal: json?.shareScope?.shareOriginal ?? s.shareOriginal,
                shareScope: json?.shareScope ?? s.shareScope,
              }
            : s
        )
      );
      addToast({ variant: "success", message: "Preferencias actualizadas" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      addToast({ variant: "error", message });
    }
  };  return (
    <div className="ngx-landing-shell relative min-h-screen overflow-x-hidden selection:bg-[#6D00FF] selection:text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 relative z-10">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: "var(--ngx-purple-light)" }}>
              DASHBOARD GÉNESIS
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase leading-none tracking-tight text-white">
              Tus sesiones
            </h1>
            <p className="text-sm text-white/55">
              Controla qué compartes y accede a tus transformaciones privadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/wizard")}
            className="lg-cta lg-cta--primary text-xs !py-3 !px-6"
          >
            Crear nueva sesión
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--ngx-purple)] border-t-transparent animate-spin" />
            <p className="text-xs tracking-widest text-white/40 uppercase">Cargando sesiones...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="ngx-card !p-8 text-center">
            <p className="text-sm text-white/55">Aún no tienes sesiones de calibración creadas.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session) => (
              <div key={session.shareId} className="ngx-card !p-6 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-white/40 tracking-wider">
                      ID: {session.shareId.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-lg font-bold text-white mt-1">
                      {session.goal === "definicion"
                        ? "Recomposición atlética"
                        : session.goal === "masa"
                        ? "Construir músculo funcional"
                        : "Híbrido de rendimiento"}
                      <span className="text-xs font-normal text-white/55 ml-2">
                        · {session.level === "novato" ? "Novato" : session.level === "intermedio" ? "Intermedio" : "Avanzado"}
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full animate-pulse",
                          session.status === "ready" ? "bg-[var(--ngx-success)]" : "bg-amber-500"
                        )}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                        {session.status === "ready" ? "Calibración lista" : "Procesando..."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/${session.shareId}`}
                      className="text-xs font-bold uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-full transition-all"
                    >
                      Ver consola táctica
                    </Link>
                    <Link
                      href={`/s/${session.shareId}`}
                      className="text-xs font-bold uppercase tracking-wider text-white bg-[var(--ngx-purple)] px-4 py-2 rounded-full shadow-[var(--lg-glow-primary-sm)] hover:bg-[var(--ngx-primary-hover)] transition-all"
                    >
                      Ver resultados
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "shareOriginal",
                      title: "Compartir foto original",
                      desc: "Permite mostrar tu foto inicial en el enlace público.",
                    },
                    {
                      key: "shareImages",
                      title: "Compartir imágenes generadas",
                      desc: "Permite mostrar tus visualizaciones en el enlace público.",
                    },
                    {
                      key: "shareInsights",
                      title: "Compartir análisis",
                      desc: "Muestra insights y texto generado en el enlace público.",
                    },
                    {
                      key: "shareProfile",
                      title: "Compartir perfil",
                      desc: "Comparte objetivo y nivel (sin datos sensibles).",
                    },
                  ].map((item) => {
                    const scope = session.shareScope || {};
                    const current =
                      item.key === "shareOriginal"
                        ? scope.shareOriginal ?? session.shareOriginal
                        : item.key === "shareInsights"
                        ? scope.shareInsights ?? false
                        : item.key === "shareImages"
                        ? scope.shareImages ?? false
                        : scope.shareProfile ?? false;
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">{item.title}</p>
                          <p className="text-[11px] text-white/45 leading-tight max-w-[32ch]">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            current
                              ? "bg-[var(--ngx-purple)] text-white shadow-[var(--lg-glow-primary-sm)]"
                              : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                          )}
                          onClick={() =>
                            updateShareSettings(session.shareId, { [item.key]: !current })
                          }
                        >
                          {current ? "ACTIVO" : "OFF"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
