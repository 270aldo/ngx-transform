"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/shadcn/ui/button";
import { Card } from "@/components/shadcn/ui/card";
import { useToast } from "@/components/ui/toast-provider";

interface SessionSummary {
  shareId: string;
  status?: string;
  shareOriginal: boolean;
  shareScope?: {
    shareOriginal?: boolean;
    shareInsights?: boolean;
    shareProfile?: boolean;
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
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">Dashboard NGX</p>
            <h1 className="text-3xl font-semibold">Tus sesiones</h1>
            <p className="text-sm text-neutral-400">
              Controla qué compartes y accede a tus transformaciones privadas.
            </p>
          </div>
          <Button onClick={() => router.push("/wizard")}>Crear nueva sesión</Button>
        </header>

        {loading ? (
          <p className="text-sm text-neutral-400">Cargando sesiones...</p>
        ) : sessions.length === 0 ? (
          <Card className="p-6 glass-panel rounded-2xl">
            <p className="text-sm text-neutral-400">Aún no tienes sesiones creadas.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.shareId} className="p-5 glass-panel rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Sesión {session.shareId}</p>
                    <p className="text-xs text-neutral-500">
                      {session.goal || "Objetivo no definido"} · {session.level || "Nivel n/d"} ·{" "}
                      {session.status || "processing"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/${session.shareId}`} className="text-sm text-[#6D00FF]">
                      Ver detalle
                    </Link>
                    <Link href={`/s/${session.shareId}`} className="text-sm text-neutral-300">
                      Ver share
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    {
                      key: "shareOriginal",
                      title: "Compartir foto original",
                      desc: "Permite mostrar tu foto inicial en el enlace público.",
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
                        : scope.shareProfile ?? false;
                    return (
                      <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="text-xs text-neutral-500">{item.desc}</p>
                        </div>
                        <Button
                          variant={current ? "default" : "outline"}
                          className={current ? "" : "border-white/10"}
                          onClick={() =>
                            updateShareSettings(session.shareId, { [item.key]: !current })
                          }
                        >
                          {current ? "Activo" : "Desactivado"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
