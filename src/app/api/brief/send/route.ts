/**
 * POST /api/brief/send  { shareId }
 *
 * Path #5 del flujo de salida v12.1: el usuario que NO está listo hoy pide
 * recibir su brief por correo. Es captura, no conversión inmediata.
 *
 * Reglas:
 *  - Rate limit por IP (3/h vía Upstash)
 *  - Idempotencia: si session.briefSentAt existe, devolvemos 200 alreadySent
 *    sin volver a enviar (el modal de la UI mostrará el mensaje correcto)
 *  - Si Resend no está configurado, devolvemos 503 graceful (mismo patrón
 *    que MP create-preference)
 *  - Si la session no tiene email guardado, 400 (no podemos enviar a nadie)
 *  - Email suppression (unsubscribe) se respeta
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";
import { trackEvent } from "@/lib/telemetry";
import { isEmailSuppressed } from "@/lib/emailSuppression";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from "@/lib/rateLimit";
import { getConfiguredFromEmail } from "@/lib/emailConfig";
import BriefDelivery from "@/emails/transactional/BriefDelivery";
import type { Bottleneck, Diagnostic, InsightsResult } from "@/types/ai";

export const runtime = "nodejs";

const Body = z.object({
  shareId: z.string().min(1).max(120),
});

function getFromEmail(): string | null {
  return getConfiguredFromEmail("BRIEF_SEND");
}

const BOTTLENECK_LABELS: Record<Bottleneck, string> = {
  training_progression: "Entrenamiento sin progresión trazable",
  nutrition_consistency: "Consistencia de ejecución",
  recovery: "Recuperación insuficiente",
  structure: "Falta de estructura semanal",
  expectations: "Expectativas mal calibradas",
  accountability: "Falta de accountability externo",
};

interface UserInputSnapshot {
  age?: number;
  sleepQuality?: number;
  disciplineRating?: number;
  stressLevel?: number;
  weightKg?: number;
}

const NUTRITION_CLAIM_PATTERN =
  /prote[ií]na|calor[ií]a|déficit|super[aá]vit|ingesta|comida|nutrici[oó]n|macros?|dieta/i;

function removeUnderspecifiedNutritionClaims(items?: string[]): string[] {
  return (items ?? []).filter((item) => !NUTRITION_CLAIM_PATTERN.test(item));
}

function sanitizeDominantError(error?: string): string | undefined {
  if (!error) return undefined;
  if (!NUTRITION_CLAIM_PATTERN.test(error)) return error;
  return "Sin estructura semanal trazable, lo que parece flexibilidad se vuelve improvisación y reduce adherencia.";
}

function deriveSignals(
  diagnostic: Diagnostic | undefined,
  input: UserInputSnapshot
): {
  muscle_health_score: number;
  biological_age_estimate: number;
  chronologicalAge: number;
  metabolic_risk: "BAJO" | "MEDIO" | "ALTO";
  leverages: string[];
  dominant_error: string | undefined;
} {
  const age = input.age ?? 32;
  const sleepQ = input.sleepQuality ?? 6;
  const disciplineR = input.disciplineRating ?? 6;
  const stress = input.stressLevel ?? 5;

  const stressPenalty = Math.max(0, stress - 5) * 0.3;
  const sleepPenalty = Math.max(0, 7 - sleepQ) * 0.55;
  const disciplinePenalty = Math.max(0, 7 - disciplineR) * 0.35;

  const heuristicBio = Math.round(
    age + sleepPenalty + disciplinePenalty + stressPenalty
  );
  const ageDelta = heuristicBio - age;
  const heuristicScore = Math.max(
    35,
    Math.min(95, 88 - Math.round(ageDelta * 2.4))
  );

  let heuristicRisk: "BAJO" | "MEDIO" | "ALTO" = "BAJO";
  if (age > 40 && (sleepQ < 6 || disciplineR < 5)) heuristicRisk = "ALTO";
  else if (sleepQ < 6 || disciplineR < 5 || stress > 7 || age > 40)
    heuristicRisk = "MEDIO";

  return {
    muscle_health_score: diagnostic?.muscle_health_score ?? heuristicScore,
    biological_age_estimate:
      diagnostic?.biological_age_estimate ?? heuristicBio,
    chronologicalAge: age,
    metabolic_risk: diagnostic?.metabolic_risk ?? heuristicRisk,
    leverages: removeUnderspecifiedNutritionClaims(diagnostic?.leverages).length
      ? removeUnderspecifiedNutritionClaims(diagnostic?.leverages).slice(0, 3)
      : [
          "Entrenamiento de fuerza 3x/semana con progresión clara",
          "Agenda semanal simple para reducir decisiones improvisadas",
          "Sueño de 7-9h con horario consistente",
        ],
    dominant_error: sanitizeDominantError(diagnostic?.dominant_error),
  };
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

interface SessionPartial {
  email?: string | null;
  input?: UserInputSnapshot & { age?: number };
  ai?: InsightsResult;
  photo?: { originalStoragePath?: string };
  assets?: { images?: Record<string, string> };
  briefSentAt?: unknown;
  briefMessageId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const limit = await checkRateLimit("api:brief", ip);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Espera unos minutos." },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const parsed = Body.parse(await req.json());

    const db = getDb();
    const sessionRef = db.collection("sessions").doc(parsed.shareId);
    const snap = await sessionRef.get();
    if (!snap.exists) {
      return NextResponse.json(
        { ok: false, error: "Sesión no encontrada." },
        { status: 404 }
      );
    }

    const data = snap.data() as SessionPartial | undefined;
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Datos incompletos." },
        { status: 404 }
      );
    }

    // Idempotencia — si ya enviamos, no volvemos a enviar pero damos 200.
    if (data.briefSentAt) {
      await trackEvent({
        sessionId: parsed.shareId,
        event: "brief_email_requested",
        metadata: { idempotent: true },
      });
      return NextResponse.json({ ok: true, alreadySent: true });
    }

    const email = data.email;
    if (!email) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No tenemos email asociado a esta sesión. Vuelve al wizard para crear una nueva.",
        },
        { status: 400 }
      );
    }

    if (await isEmailSuppressed(email)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Este email solicitó darse de baja. Re-suscríbete desde el footer de cualquier correo NGX si quieres volver a recibir comunicación.",
        },
        { status: 410 }
      );
    }

    const resend = getResend();
    if (!resend) {
      // Modo dev / sin Resend: registramos intención pero no enviamos
      console.warn(
        "[BRIEF_SEND] RESEND_API_KEY no configurado — devolviendo 503 graceful."
      );
      await trackEvent({
        sessionId: parsed.shareId,
        event: "brief_email_failed",
        metadata: { reason: "resend_not_configured" },
      });
      return NextResponse.json(
        { ok: false, error: "El envío de email no está configurado." },
        { status: 503 }
      );
    }

    // Firmar URLs de las imágenes (TTL largo — el correo puede leerse días después)
    const TTL = 60 * 60 * 24 * 14; // 14 días
    let m0ImageUrl: string | undefined;
    let m12ImageUrl: string | undefined;

    try {
      const originalPath = data.photo?.originalStoragePath;
      if (originalPath) {
        m0ImageUrl = await getSignedUrl(originalPath, {
          expiresInSeconds: TTL,
        });
      }
      const m12Path = data.assets?.images?.m12;
      if (m12Path) {
        m12ImageUrl = await getSignedUrl(m12Path, {
          expiresInSeconds: TTL,
        });
      }
    } catch (signErr) {
      console.warn(
        "[BRIEF_SEND] Error firmando URLs (continuamos sin imágenes):",
        signErr
      );
    }

    const ai = data.ai;
    const diagnostic = ai?.diagnostic;
    const signals = deriveSignals(diagnostic, data.input ?? {});
    const bottleneck =
      diagnostic?.bottleneck === "nutrition_consistency"
        ? "structure"
        : diagnostic?.bottleneck;
    const bottleneckLabel = bottleneck
      ? BOTTLENECK_LABELS[bottleneck]
      : undefined;

    const subject = "Tu brief NGX Vision — diagnóstico + roadmap";
    const from = getFromEmail();
    if (!from) {
      console.error("[BRIEF_SEND] RESEND_FROM_EMAIL not configured in production");
      return NextResponse.json(
        { ok: false, error: "El envío de correo no está configurado." },
        { status: 503 }
      );
    }

    const { data: sendData, error: sendError } = await resend.emails.send({
      from,
      to: email,
      subject,
      react: BriefDelivery({
        shareId: parsed.shareId,
        m0ImageUrl,
        m12ImageUrl,
        bottleneck,
        bottleneckLabel,
        dominantError: signals.dominant_error,
        leverages: signals.leverages,
        muscleHealthScore: signals.muscle_health_score,
        biologicalAge: signals.biological_age_estimate,
        chronologicalAge: signals.chronologicalAge,
        metabolicRisk: signals.metabolic_risk,
      }),
    });

    if (sendError) {
      console.error("[BRIEF_SEND] Resend error:", sendError);
      await trackEvent({
        sessionId: parsed.shareId,
        event: "brief_email_failed",
        metadata: { reason: "resend_error" },
      });
      return NextResponse.json(
        { ok: false, error: "No pudimos enviar el correo. Intenta más tarde." },
        { status: 502 }
      );
    }

    await sessionRef.set(
      {
        briefSentAt: FieldValue.serverTimestamp(),
        briefMessageId: sendData?.id ?? null,
        lastActivityAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await trackEvent({
      sessionId: parsed.shareId,
      event: "brief_email_sent",
      metadata: { messageId: sendData?.id, hasDiagnostic: !!diagnostic },
    });

    return NextResponse.json({
      ok: true,
      alreadySent: false,
      messageId: sendData?.id ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[BRIEF_SEND]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
