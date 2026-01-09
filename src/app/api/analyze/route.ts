import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { AnalyzeSchema } from "@/lib/validators";
import { getSignedUrl } from "@/lib/storage";
import { generateInsightsFromImage } from "@/lib/gemini";
import { FieldValue } from "firebase-admin/firestore";
import { telemetry, startTimer } from "@/lib/telemetry";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";
import {
  getOrCreateJob,
  markJobInProgress,
  markJobCompleted,
  markJobFailed,
  withRetry,
} from "@/lib/jobManager";
import type { SessionDocument } from "@/types/ai";

// ============================================================================
// Constants
// ============================================================================

const MAX_RETRIES = Number(process.env.MAX_ANALYSIS_RETRIES || "3");
const MODEL_ID = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(req: Request) {
  const timer = startTimer();
  let parsedSessionId: string | undefined;

  try {
    const body = await req.json();
    const parsed = AnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    parsedSessionId = sessionId;

    // Rate limiting by IP (Upstash Redis)
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit("api:analyze", clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY no está configurado" }, { status: 400 });
    }

    const db = getDb();
    const ref = db.collection("sessions").doc(sessionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const data = snap.data() as SessionDocument | undefined;
    if (!data) {
      return NextResponse.json({ error: "Session data missing" }, { status: 500 });
    }

    // Verificar si ya está analizado (idempotencia)
    const job = await getOrCreateJob(sessionId, "analysis");
    if (job.status === "completed" && data.ai) {
      console.log(`[Analyze] Session ${sessionId} already analyzed, returning cached`);
      return NextResponse.json({ ok: true, ai: data.ai, cached: true });
    }

    const photoPath = data.photo?.originalStoragePath;
    if (!photoPath) {
      return NextResponse.json({ error: "Missing photo" }, { status: 400 });
    }

    // Marcar job en progreso
    await markJobInProgress(`${sessionId}_analysis`);

    // Track inicio de análisis
    await telemetry.analysisStarted(sessionId, MODEL_ID);

    const imageUrl = await getSignedUrl(photoPath, { expiresInSeconds: 3600 });

    // Ejecutar análisis con retry automático
    let retryCount = 0;
    const ai = await withRetry(
      async () => {
        return await generateInsightsFromImage({
          imageUrl,
          profile: data.input,
        });
      },
      {
        maxRetries: MAX_RETRIES,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
      },
      (attempt, error) => {
        retryCount = attempt;
        console.log(`[Analyze] Retry ${attempt}/${MAX_RETRIES} for ${sessionId}: ${error.message}`);
        // Track retry
        telemetry.analysisRetry(sessionId, attempt);
      }
    );

    // Guardar resultado
    await ref.set(
      {
        ai,
        status: "analyzed",
        analyzedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Marcar job completado
    await markJobCompleted(`${sessionId}_analysis`);

    // Track análisis completado
    const latency = timer.stop();
    await telemetry.analysisCompleted(sessionId, latency, MODEL_ID);

    console.log(`[Analyze] Completed ${sessionId} in ${latency}ms (${retryCount} retries)`);

    return NextResponse.json({
      ok: true,
      ai,
      latency_ms: latency,
      retry_count: retryCount,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[Analyze] Error:", e);

    // Track fallo
    if (parsedSessionId) {
      await telemetry.analysisFailed(parsedSessionId, message);
      await markJobFailed(`${parsedSessionId}_analysis`, message);

      // Actualizar estado de sesión
      try {
        await getDb()
          .collection("sessions")
          .doc(parsedSessionId)
          .set(
            {
              status: "failed",
              lastError: message,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
      } catch (updateError) {
        console.error("[Analyze] Failed to update session status:", updateError);
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
