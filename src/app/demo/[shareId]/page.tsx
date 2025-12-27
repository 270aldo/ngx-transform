import { Metadata } from "next";
import { getDb } from "@/lib/firebaseAdmin";
import { DemoClient } from "./DemoClient";

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
  };
  ai?: {
    insightsText?: string;
    timeline?: Record<string, unknown>;
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  return {
    title: "GENESIS - Crea tu Plan | NGX Transform",
    description: `Conoce a GENESIS, tu coach IA personal (${shareId})`,
    openGraph: {
      title: "GENESIS - Crea tu Plan Gratis",
      description: "Conoce a GENESIS, tu coach IA que te guiará para crear tu primer plan de entrenamiento.",
    },
  };
}

export default async function DemoPage({
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
          <p className="text-neutral-400">No pudimos cargar tu perfil.</p>
        </div>
      </div>
    );
  }

  const data = snap.data() as SessionDoc;

  // Extract user context for GENESIS
  const userContext = {
    shareId,
    name: data.email?.split("@")[0] || "Usuario",
    age: data.input.age,
    sex: data.input.sex,
    level: data.input.level,
    goal: data.input.goal,
    weeklyTime: data.input.weeklyTime,
    insightsText: data.ai?.insightsText,
  };

  return <DemoClient userContext={userContext} />;
}
