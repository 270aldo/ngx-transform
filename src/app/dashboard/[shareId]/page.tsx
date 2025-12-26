import Image from "next/image";
import { Metadata } from "next";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";
import type { InsightsResult } from "@/types/ai";
import { BookingCTA2 } from "@/components/BookingCTA2";
import { DownloadButton } from "@/components/DownloadButton";
import { SocialShareButton } from "@/components/SocialShareButton";

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
    trainingDaysPerWeek?: number;
    trainingHistoryYears?: number;
    nutritionQuality?: number;
    bodyFatLevel?: "bajo" | "medio" | "alto";
    trainingStyle?: "fuerza" | "hipertrofia" | "funcional" | "hiit" | "mixto";
    aestheticPreference?: "cinematic" | "editorial" | "street" | "minimal";
    focusAreas?: Array<"pecho" | "espalda" | "hombros" | "brazos" | "gluteos" | "piernas" | "core">;
    focusZone?: "upper" | "lower" | "abs" | "full";
  };
  photo?: { originalStoragePath?: string };
  assets?: { images?: Record<string, string> };
  ai?: InsightsResult & { letter_from_future?: string };
  plan?: unknown;
  status?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  return {
    title: "Dashboard NGX - Resumen Completo",
    description: `Resumen completo de la transformación (${shareId})`,
  };
}

async function resolveUrls(data: SessionDoc) {
  const originalPath = data.photo?.originalStoragePath;
  const images = data.assets?.images || {};

  const originalUrl = originalPath
    ? await getSignedUrl(originalPath, { expiresInSeconds: 3600 })
    : undefined;

  const m4 = images.m4 ? await getSignedUrl(images.m4, { expiresInSeconds: 3600 }) : undefined;
  const m8 = images.m8 ? await getSignedUrl(images.m8, { expiresInSeconds: 3600 }) : undefined;
  const m12 = images.m12 ? await getSignedUrl(images.m12, { expiresInSeconds: 3600 }) : undefined;

  return { originalUrl, m4, m8, m12 };
}

function formatDelta(value?: number, base?: number) {
  if (value === undefined || base === undefined) return "--";
  const diff = value - base;
  return diff >= 0 ? `+${diff}` : `${diff}`;
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const db = getDb();
  const snap = await db.collection("sessions").doc(shareId).get();

  if (!snap.exists) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sesión no encontrada</h1>
          <p className="text-neutral-400">No pudimos cargar el resumen.</p>
        </div>
      </div>
    );
  }

  const data = snap.data() as SessionDoc;
  const ai = data.ai;
  const { originalUrl, m4, m8, m12 } = await resolveUrls(data);

  const m0Stats = ai?.timeline?.m0?.stats;
  const m12Stats = ai?.timeline?.m12?.stats;

  const insights = ai?.insightsText || "Tu proyección está lista.";
  const letter = ai?.letter_from_future;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <header className="space-y-4">
          <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">Dashboard NGX</p>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Tu resumen completo de transformación
          </h1>
          <p className="text-neutral-400 max-w-2xl">{insights}</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {originalUrl ? (
                <Image
                  src={originalUrl}
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
                          {formatDelta(stat.value, stat.base)}
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
              <p className="text-xs text-neutral-500">
                Descarga con watermark o comparte directamente tu resultado.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Timeline completo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Mes 4", url: m4 },
              { label: "Mes 8", url: m8 },
              { label: "Mes 12", url: m12 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/40">
                  {item.url ? (
                    <Image src={item.url} alt={item.label} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                      {item.label} no disponible
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Plan personalizado</h2>
            <p className="text-sm text-neutral-400">
              Genera tu plan de 7 días basado en tu análisis y descárgalo de inmediato.
            </p>
            <BookingCTA2 shareId={shareId} hasPlan={Boolean(data.plan)} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#6D00FF]/15 to-transparent p-6 space-y-4">
            <h3 className="font-semibold">Resumen ejecutivo</h3>
            <ul className="text-sm text-neutral-300 space-y-2">
              <li>• Objetivo: {data.input.goal}</li>
              <li>• Nivel actual: {data.input.level}</li>
              <li>• Enfoque: {data.input.focusZone || "full"}</li>
              <li>• Tiempo semanal: {data.input.weeklyTime} horas</li>
              <li>• Entrenos/semana: {data.input.trainingDaysPerWeek ?? "--"}</li>
              <li>• Estilo de entrenamiento: {data.input.trainingStyle ?? "--"}</li>
              <li>• Nutrición: {data.input.nutritionQuality ?? "--"}/10</li>
              <li>• Grasa corporal: {data.input.bodyFatLevel ?? "--"}</li>
              <li>• Zonas foco: {data.input.focusAreas?.length ? data.input.focusAreas.join(", ") : "--"}</li>
              <li>• Estética: {data.input.aestheticPreference ?? "--"}</li>
            </ul>
            <a
              href={`/s/${shareId}`}
              className="text-sm text-[#6D00FF] hover:text-[#B98CFF] transition-colors"
            >
              Volver a resultados
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
