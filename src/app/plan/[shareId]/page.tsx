import { getDb } from "@/lib/firebaseAdmin";
import { Metadata } from "next";
import { PlanViewer } from "./PlanViewer";

export const dynamic = "force-dynamic";

interface PlanDoc {
  sessionId: string;
  profile: {
    sex: string;
    age: number;
    goal: string;
    level: string;
    focusZone: string;
  };
  days: Array<{
    day: number;
    workout: {
      focus: string;
      exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        rest: string;
        notes?: string;
      }>;
      duration: number;
      intensity: string;
    };
    habits: {
      morning: string[];
      evening: string[];
    };
    nutrition: {
      calories: number;
      protein: number;
      meals: string[];
    };
    mindset: string;
  }>;
  generatedAt?: unknown;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  return {
    title: "Tu Plan de 7 Días - NGX Transform",
    description:
      "Plan personalizado de entrenamiento, nutrición y hábitos para tu transformación física.",
  };
}

export default async function PlanPage({
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
          <p className="text-neutral-400">El plan solicitado no existe.</p>
        </div>
      </div>
    );
  }

  const data = snap.data() as { plan?: PlanDoc };

  if (!data.plan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Plan no generado</h1>
          <p className="text-neutral-400">
            Primero debes ver tus resultados de transformación.
          </p>
          <a
            href={`/s/${shareId}`}
            className="mt-4 inline-block px-6 py-3 bg-[#6D00FF] rounded-full text-white font-bold hover:bg-[#5800CC] transition-colors"
          >
            Ver Resultados
          </a>
        </div>
      </div>
    );
  }

  return <PlanViewer plan={data.plan} shareId={shareId} />;
}
