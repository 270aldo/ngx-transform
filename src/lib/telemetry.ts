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
  | "auth_failed"
  | "rate_limit_blocked"
  | "spend_limit_blocked"
  | "job_lock_denied"
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
  | "email_D5_sent"
  | "email_D7_sent"
  | "email_D10_sent"
  | "email_D14_sent"
  | "agent_cta_viewed"
  | "agent_cta_clicked"
  | "referral_code_copied"
  | "hybrid_offer_calendly_click"
  | "hybrid_offer_whatsapp_click"
  | "hybrid_offer_chat_click"
  | "nps_submitted"
  // v12 Comercial Exit Flow
  | "hybrid_offer_v2_viewed"
  | "mp_checkout_clicked"
  | "mp_checkout_redirected"
  | "mp_checkout_completed"
  | "mp_checkout_failed"
  | "mp_checkout_pending"
  | "video_founder_opened"
  | "video_founder_played"
  | "video_founder_progress_25"
  | "video_founder_progress_50"
  | "video_founder_progress_75"
  | "video_founder_completed"
  | "calendly_v2_clicked"
  | "whatsapp_v2_clicked"
  | "hybrid_sku_selected"
  // v12.1 Brief by email
  | "brief_email_requested"
  | "brief_email_sent"
  | "brief_email_failed"
  // HYBRID voice classifier
  | "voice_agent_opened"
  | "voice_agent_connected"
  | "voice_agent_classified"
  | "voice_agent_cta_clicked";

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
 * Simple PII scrubber to redact email addresses from strings and objects
 */
function scrubPII(data: unknown): unknown {
  if (typeof data === "string") {
    // Redact emails
    return data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
  }
  if (Array.isArray(data)) {
    return data.map(scrubPII);
  }
  if (typeof data === "object" && data !== null) {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip obviously safe keys to save perf
      if (["sessionId", "event", "stage", "model_id", "timestamp"].includes(key)) {
        scrubbed[key] = value;
      } else {
        scrubbed[key] = scrubPII(value);
      }
    }
    return scrubbed;
  }
  return data;
}

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

    // Scrub PII from payload before saving
    const safePayload = scrubPII(payload) as EventPayload;

    const eventDoc = {
      ...safePayload,
      timestamp: FieldValue.serverTimestamp(),
      environment: process.env.NODE_ENV || "development",
    };

    // Guard Firestore writes against deadline_exceeded hangs (observed up to 60s).
    // Telemetry must never block the request path: race the write against a 5s timeout
    // and silently drop on slow networks. Critical events use Sentry, not this pipeline.
    const writeWithTimeout = <T>(promise: Promise<T>, label: string): Promise<T | null> =>
      Promise.race<T | null>([
        promise,
        new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn(`[Telemetry] ${label} skipped (5s timeout) — ${payload.event}`);
            resolve(null);
          }, 5000)
        ),
      ]).catch((error) => {
        console.warn(`[Telemetry] ${label} failed:`, error);
        return null;
      });

    // Run both writes in parallel; either or both can quietly drop.
    await Promise.all([
      writeWithTimeout(db.collection("telemetry_events").add(eventDoc), "event write"),
      writeWithTimeout(updateSessionMetrics(safePayload), "metrics update"),
    ]);

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

  authFailed: (sessionId: string, metadata?: Record<string, unknown>) =>
    trackEvent({ sessionId, event: "auth_failed", metadata }),

  rateLimitBlocked: (sessionId: string, endpoint: string) =>
    trackEvent({ sessionId, event: "rate_limit_blocked", metadata: { endpoint } }),

  spendLimitBlocked: (sessionId: string, reason?: string) =>
    trackEvent({ sessionId, event: "spend_limit_blocked", metadata: { reason } }),

  jobLockDenied: (sessionId: string, jobType: string) =>
    trackEvent({ sessionId, event: "job_lock_denied", metadata: { jobType } }),

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

  // v12 Comercial Exit Flow
  hybridOfferV2Viewed: (sessionId: string) =>
    trackEvent({ sessionId, event: "hybrid_offer_v2_viewed" }),

  mpCheckoutClicked: (sessionId: string, sku: "monthly" | "quarterly" | "annual") =>
    trackEvent({
      sessionId,
      event: "mp_checkout_clicked",
      metadata: { sku, intent: "conversion", location: "hybrid_offer_v2" },
    }),

  mpCheckoutRedirected: (sessionId: string, sku: string, preferenceId: string) =>
    trackEvent({
      sessionId,
      event: "mp_checkout_redirected",
      metadata: { sku, preferenceId },
    }),

  mpCheckoutCompleted: (
    sessionId: string,
    metadata: { sku: string; amount: number; paymentId: string }
  ) => trackEvent({ sessionId, event: "mp_checkout_completed", metadata }),

  mpCheckoutFailed: (sessionId: string, reason: string) =>
    trackEvent({ sessionId, event: "mp_checkout_failed", metadata: { reason } }),

  mpCheckoutPending: (sessionId: string, paymentId: string) =>
    trackEvent({ sessionId, event: "mp_checkout_pending", metadata: { paymentId } }),

  videoFounderOpened: (sessionId: string) =>
    trackEvent({ sessionId, event: "video_founder_opened" }),

  videoFounderPlayed: (sessionId: string) =>
    trackEvent({ sessionId, event: "video_founder_played" }),

  videoFounderProgress: (sessionId: string, milestone: 25 | 50 | 75) =>
    trackEvent({
      sessionId,
      event: `video_founder_progress_${milestone}` as FunnelEvent,
    }),

  videoFounderCompleted: (sessionId: string) =>
    trackEvent({ sessionId, event: "video_founder_completed" }),

  calendlyV2Clicked: (sessionId: string) =>
    trackEvent({ sessionId, event: "calendly_v2_clicked" }),

  whatsappV2Clicked: (sessionId: string) =>
    trackEvent({ sessionId, event: "whatsapp_v2_clicked" }),

  hybridSkuSelected: (sessionId: string, sku: "monthly" | "quarterly" | "annual") =>
    trackEvent({
      sessionId,
      event: "hybrid_sku_selected",
      metadata: { sku },
    }),
};
