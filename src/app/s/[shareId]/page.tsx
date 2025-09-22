import { getDb } from "@/lib/firebaseAdmin";
import type { InsightsResult } from "@/types/ai";
import { TimelineViewer } from "@/components/TimelineViewer";
import RefreshClient from "./refresh-client";
import EmailClient from "./EmailClient";
import DeleteClient from "./DeleteClient";
import CopyLinkClient from "./CopyLinkClient";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { ImageViewer } from "@/components/results/ImageViewer";
import { InsightsCard } from "@/components/results/InsightsCard";
import { ActionsCard } from "@/components/results/ActionsCard";
import { ProfileSummaryCard } from "@/components/results/ProfileSummaryCard";

export const dynamic = "force-dynamic";

interface SessionDoc {
  shareId: string;
  email?: string | null;
  input: {
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    level: "novato" | "intermedio" | "avanzado";
    goal: "definicion" | "masa" | "mixto";
    weeklyTime: number;
    notes?: string;
  };
  photo?: { originalStoragePath?: string };
  ai?: InsightsResult;
  assets?: { images?: Record<string, string> };
  status: "processing" | "ready" | "failed";
}

async function getUrls(shareId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : ""}/api/sessions/${shareId}/urls`, { cache: "no-store" });
  if (!res.ok) return {} as { originalUrl?: string; images?: Record<string, string> };
  return (await res.json()) as { originalUrl?: string; images?: Record<string, string> };
}

export default async function Page({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();
  if (!snap.exists) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold">Sesión no encontrada</h1>
        </div>
      </div>
    );
  }
  const data = snap.data() as SessionDoc | undefined;
  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold">Sesión inválida</h1>
        </div>
      </div>
    );
  }
  const ai = data.ai as InsightsResult | undefined;
  const urls = await getUrls(shareId);
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  // Client actions moved to client components

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
<h1 className="text-2xl font-medium">Resultados</h1>
            <p className="text-neutral-400 text-sm">ID: {shareId}</p>
          </div>
          <div className="hidden md:flex gap-2">
            <EmailClient shareId={shareId} />
            <CopyLinkClient shareId={shareId} />
{bookingUrl && (
              <Button asChild variant="secondary">
                <a href={bookingUrl} target="_blank" rel="noreferrer">Reserva asesoría</a>
              </Button>
            )}
            <DeleteClient shareId={shareId} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Izquierda: Visor (sticky) */}
          <div className="md:col-span-4 md:sticky md:top-20 space-y-4">
            <ImageViewer ai={ai || ({} as any)} imageUrls={urls} />
          </div>

          {/* Centro: Contenido principal */}
          <div className="md:col-span-5 space-y-4">
            {data.status !== "ready" || !ai ? (
              <>
                <Card>
                  <CardContent className="whitespace-pre-wrap text-muted-foreground">
                    Procesando análisis... esperamos los resultados.
                  </CardContent>
                </Card>
                <RefreshClient shareId={shareId} active={true} />
              </>
            ) : (
              <>
                <InsightsCard insightsText={ai.insightsText} />
                <TimelineViewer ai={ai} imageUrls={urls} />
              </>
            )}
          </div>

          {/* Derecha: Acciones y resumen (sticky) */}
          <div className="md:col-span-3 md:sticky md:top-20 space-y-4">
            <ActionsCard shareId={shareId} bookingUrl={bookingUrl} />
            <ProfileSummaryCard profile={data.input} />
          </div>
        </div>
      </div>
    </div>
  );
}

