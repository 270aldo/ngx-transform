import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";
import type { StepKey } from "@/types/ai";

interface Params {
  shareId: string;
}

export async function GET(_: Request, context: { params: Promise<Params> }) {
  try {
    const { shareId } = await context.params;
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const data = snap.data() as { photo?: { originalStoragePath?: string }; assets?: { images?: Partial<Record<StepKey, string>> } };

    const response: { originalUrl?: string; images?: Partial<Record<StepKey, string>> } = {};
    if (data.photo?.originalStoragePath) {
      try {
        response.originalUrl = await getSignedUrl(data.photo.originalStoragePath);
      } catch (err) {
        console.warn("No se pudo firmar URL original", err);
      }
    }
    if (data.assets?.images) {
      const entries = await Promise.all(
        Object.entries(data.assets.images).map(async ([key, path]) => {
          if (!path) return null;
          try {
            const url = await getSignedUrl(path);
            return [key as StepKey, url] as const;
          } catch (err) {
            console.warn("No se pudo firmar URL generada", err);
            return null;
          }
        })
      );
      response.images = Object.fromEntries(entries.filter(Boolean) as Array<[StepKey, string]>);
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/sessions/[shareId]/urls", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
