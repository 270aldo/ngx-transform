/**
 * Sistema de Telemetría para NGX Transform
 *
 * Trackea eventos del funnel completo para análisis y optimización.
 * Controlado por FF_TELEMETRY_ENABLED (default: true)
 */

import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// ============================================================================
// Types
// ============================================================================

export type FunnelEvent =
  | "wizard_start"
  | "photo_uploaded"
  | "session_created"
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "analysis_retry"
  | "image_generation_started"
  | "image_m4_ready"
  | "image_m8_ready"
  | "image_m12_ready"
  | "image_generation_failed"
  | "image_generation_retry"
  | "results_viewed"
  | "share_clicked"
  | "share_completed"
  | "cta_clicked"
  | "cta_completed"
  | "plan_generated"
  | "email_sent"
  // Viral Optimization Sprint v2.1
  | "reveal_start"
  | "reveal_complete"
  | "reveal_skip"
  | "share_modal_open"
  | "share_intent_whatsapp"
  | "share_intent_instagram"
  | "share_intent_twitter"
  | "share_intent_facebook"
  | "share_intent_copy"
  | "content_unlocked"
  | "counter_viewed"
  | "email_sequence_start"
  | "email_D0_sent"
  | "email_D1_sent"
  | "email_D3_sent"
  | "email_D7_sent"
  | "agent_cta_viewed"
  | "agent_cta_clicked"
  | "referral_code_copied";

export interface EventPayload {
  sessionId: string;
  event: FunnelEvent;
  stage?: string;
  model_id?: string;
  latency_ms?: number;
  retry_count?: number;
  cost_estimate?: number;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionMetrics {
  sessionId: string;
  totalLatency_ms: number;
  analysisLatency_ms?: number;
  imageGenerationLatency_ms?: number;
  totalCost_estimate?: number;
  retryCount: number;
  status: "completed" | "failed" | "partial";
  completedAt?: FirebaseFirestore.Timestamp;
}

// ============================================================================
// Feature Flag
// ============================================================================

function isTelemetryEnabled(): boolean {
  const flag = process.env.FF_TELEMETRY_ENABLED;
  // Default to true if not set
  return flag !== "false";
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Trackea un evento del funnel
 */
export async function trackEvent(payload: EventPayload): Promise<void> {
  if (!isTelemetryEnabled()) {
    console.log(`[Telemetry OFF] ${payload.event} - ${payload.sessionId}`);
    return;
  }

  try {
    const db = getDb();
    const eventDoc = {
      ...payload,
      timestamp: FieldValue.serverTimestamp(),
      environment: process.env.NODE_ENV || "development",
    };

    // Guardar evento individual
    await db.collection("telemetry_events").add(eventDoc);

    // Actualizar métricas agregadas de la sesión
    await updateSessionMetrics(payload);

    console.log(`[Telemetry] ${payload.event} - ${payload.sessionId}`);
  } catch (error) {
    // Telemetría no debe romper el flujo principal
    console.error("[Telemetry Error]", error);
  }
}

/**
 * Actualiza métricas agregadas de una sesión
 */
async function updateSessionMetrics(payload: EventPayload): Promise<void> {
  const db = getDb();
  const metricsRef = db.collection("session_metrics").doc(payload.sessionId);

  const updates: Record<string, unknown> = {
    lastEvent: payload.event,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Acumular latencia si está presente
  if (payload.latency_ms) {
    updates.totalLatency_ms = FieldValue.increment(payload.latency_ms);

    if (payload.event === "analysis_completed") {
      updates.analysisLatency_ms = payload.latency_ms;
    }
    if (payload.event.startsWith("image_m") && payload.event.endsWith("_ready")) {
      updates.imageGenerationLatency_ms = FieldValue.increment(payload.latency_ms);
    }
  }

  // Acumular costo si está presente
  if (payload.cost_estimate) {
    updates.totalCost_estimate = FieldValue.increment(payload.cost_estimate);
  }

  // Acumular retries
  if (payload.retry_count && payload.retry_count > 0) {
    updates.retryCount = FieldValue.increment(payload.retry_count);
  }

  // Marcar estados finales
  if (payload.event === "image_m12_ready") {
    updates.status = "completed";
    updates.completedAt = FieldValue.serverTimestamp();
  }
  if (payload.event.includes("failed")) {
    updates.status = "failed";
    updates.failedAt = FieldValue.serverTimestamp();
    updates.lastError = payload.error_message;
  }

  await metricsRef.set(updates, { merge: true });
}

/**
 * Inicia el tracking de una sesión
 */
export async function initSessionMetrics(sessionId: string): Promise<void> {
  if (!isTelemetryEnabled()) return;

  try {
    const db = getDb();
    await db.collection("session_metrics").doc(sessionId).set({
      sessionId,
      totalLatency_ms: 0,
      retryCount: 0,
      status: "in_progress",
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("[Telemetry Error] initSessionMetrics:", error);
  }
}

// ============================================================================
// Utility: Timer para medir latencia
// ============================================================================

export interface LatencyTimer {
  start: number;
  stop: () => number;
}

export function startTimer(): LatencyTimer {
  const start = Date.now();
  return {
    start,
    stop: () => Date.now() - start,
  };
}

// ============================================================================
// Cost Estimation (basado en pricing de Gemini API)
// ============================================================================

export interface CostEstimate {
  model: string;
  operation: "analysis" | "image_generation";
  resolution?: "1K" | "2K" | "4K";
  batch?: boolean;
  estimatedCost: number;
}

/**
 * Estima el costo de una operación
 * Precios aproximados basados en Gemini API pricing (Diciembre 2025)
 */
export function estimateCost(params: Omit<CostEstimate, "estimatedCost">): number {
  const { operation, resolution = "2K", batch = false } = params;

  if (operation === "analysis") {
    // Gemini 2.5 Flash: ~$0.075/1M input tokens, ~$0.30/1M output tokens
    // Estimamos ~2000 tokens input, ~1000 tokens output por análisis
    return 0.0005; // ~$0.0005 por análisis
  }

  if (operation === "image_generation") {
    // Gemini 3 Pro Image pricing
    const basePricing = {
      "1K": { standard: 0.134, batch: 0.067 },
      "2K": { standard: 0.134, batch: 0.067 },
      "4K": { standard: 0.24, batch: 0.12 },
    };

    const pricing = basePricing[resolution] || basePricing["2K"];
    return batch ? pricing.batch : pricing.standard;
  }

  return 0;
}

// ============================================================================
// Convenience wrappers para eventos comunes
// ============================================================================

export const telemetry = {
  wizardStart: (sessionId: string) =>
    trackEvent({ sessionId, event: "wizard_start" }),

  photoUploaded: (sessionId: string) =>
    trackEvent({ sessionId, event: "photo_uploaded" }),

  sessionCreated: (sessionId: string) =>
    trackEvent({ sessionId, event: "session_created" }),

  analysisStarted: (sessionId: string, model_id: string) =>
    trackEvent({ sessionId, event: "analysis_started", model_id }),

  analysisCompleted: (sessionId: string, latency_ms: number, model_id: string) =>
    trackEvent({
      sessionId,
      event: "analysis_completed",
      latency_ms,
      model_id,
      cost_estimate: estimateCost({ model: model_id, operation: "analysis" }),
    }),

  analysisFailed: (sessionId: string, error_message: string, retry_count?: number) =>
    trackEvent({
      sessionId,
      event: "analysis_failed",
      error_message,
      retry_count,
    }),

  analysisRetry: (sessionId: string, retry_count: number) =>
    trackEvent({ sessionId, event: "analysis_retry", retry_count }),

  imageGenerationStarted: (sessionId: string, model_id: string) =>
    trackEvent({ sessionId, event: "image_generation_started", model_id }),

  imageMilestoneReady: (
    sessionId: string,
    milestone: "m4" | "m8" | "m12",
    latency_ms: number,
    model_id: string,
    resolution: "1K" | "2K" | "4K" = "2K"
  ) =>
    trackEvent({
      sessionId,
      event: `image_${milestone}_ready` as FunnelEvent,
      latency_ms,
      model_id,
      cost_estimate: estimateCost({
        model: model_id,
        operation: "image_generation",
        resolution,
      }),
    }),

  imageGenerationFailed: (sessionId: string, error_message: string, retry_count?: number) =>
    trackEvent({
      sessionId,
      event: "image_generation_failed",
      error_message,
      retry_count,
    }),

  resultsViewed: (sessionId: string) =>
    trackEvent({ sessionId, event: "results_viewed" }),

  shareClicked: (sessionId: string) =>
    trackEvent({ sessionId, event: "share_clicked" }),

  shareCompleted: (sessionId: string) =>
    trackEvent({ sessionId, event: "share_completed" }),

  ctaClicked: (sessionId: string, metadata?: Record<string, unknown>) =>
    trackEvent({ sessionId, event: "cta_clicked", metadata }),

  ctaCompleted: (sessionId: string) =>
    trackEvent({ sessionId, event: "cta_completed" }),

  planGenerated: (sessionId: string, latency_ms: number) =>
    trackEvent({ sessionId, event: "plan_generated", latency_ms }),

  emailSent: (sessionId: string) =>
    trackEvent({ sessionId, event: "email_sent" }),
};
