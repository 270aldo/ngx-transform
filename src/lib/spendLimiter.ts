/**
 * Gemini API Spend Limiter
 *
 * Tracks and limits Gemini API spending to prevent cost overruns during viral surges.
 * Uses Firestore to track spend aggregates with atomic increments.
 *
 * Limits are configurable via environment variables:
 * - GEMINI_DAILY_LIMIT_USD: Max spend per day (default: $50)
 * - GEMINI_HOURLY_LIMIT_USD: Max spend per hour (default: $10)
 */

import * as Sentry from "@sentry/nextjs";
import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// ============================================================================
// Configuration
// ============================================================================

const DAILY_LIMIT_USD = Number(process.env.GEMINI_DAILY_LIMIT_USD || "50");
const HOURLY_LIMIT_USD = Number(process.env.GEMINI_HOURLY_LIMIT_USD || "10");

// Collection for spend tracking
const SPEND_COLLECTION = "gemini_spend";

// ============================================================================
// Types
// ============================================================================

export interface SpendRecord {
  periodKey: string;
  totalSpend: number;
  requestCount: number;
  lastUpdated: FirebaseFirestore.Timestamp;
}

export interface SpendCheckResult {
  allowed: boolean;
  dailySpend: number;
  hourlySpend: number;
  dailyLimit: number;
  hourlyLimit: number;
  reason?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current day key (UTC)
 */
function getDayKey(): string {
  const now = new Date();
  return `day_${now.toISOString().slice(0, 10)}`; // e.g., "day_2026-01-10"
}

/**
 * Get the current hour key (UTC)
 */
function getHourKey(): string {
  const now = new Date();
  return `hour_${now.toISOString().slice(0, 13)}`; // e.g., "hour_2026-01-10T14"
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Process-level cache of the last successful Firestore read. Used as a
 * fallback when Firestore is unavailable so we don't hard-fail every
 * AI request during transient outages (typical Firestore cold-start
 * blips can be ~5-30s). Stale-while-degraded.
 */
let lastSpendCache:
  | {
      dailySpend: number;
      hourlySpend: number;
      readAt: number;
    }
  | null = null;
const SPEND_CACHE_TTL_MS = 5 * 60_000; // 5 minutes

/**
 * Check if a request is allowed based on current spend limits
 */
export async function checkSpendLimit(estimatedCost: number = 0): Promise<SpendCheckResult> {
  try {
    const db = getDb();
    const dayKey = getDayKey();
    const hourKey = getHourKey();

    // Get current spend levels
    const [dayDoc, hourDoc] = await Promise.all([
      db.collection(SPEND_COLLECTION).doc(dayKey).get(),
      db.collection(SPEND_COLLECTION).doc(hourKey).get(),
    ]);

    const dailySpend = (dayDoc.data()?.totalSpend as number) || 0;
    const hourlySpend = (hourDoc.data()?.totalSpend as number) || 0;

    // Refresh in-memory cache for fail-degraded mode (AUDIT-024)
    lastSpendCache = { dailySpend, hourlySpend, readAt: Date.now() };

    // Check if adding this request would exceed limits
    const wouldExceedDaily = dailySpend + estimatedCost > DAILY_LIMIT_USD;
    const wouldExceedHourly = hourlySpend + estimatedCost > HOURLY_LIMIT_USD;

    if (wouldExceedDaily) {
      console.error(`[SpendLimiter] Daily limit exceeded: $${dailySpend.toFixed(2)}/$${DAILY_LIMIT_USD}`);
      // Sentry alert hook: this is the actual block, fire as 'error'
      Sentry.captureMessage("spend.daily.exceeded", {
        level: "error",
        tags: { component: "spendLimiter", scope: "daily" },
        extra: { dailySpend, dailyLimit: DAILY_LIMIT_USD, estimatedCost },
      });
      return {
        allowed: false,
        dailySpend,
        hourlySpend,
        dailyLimit: DAILY_LIMIT_USD,
        hourlyLimit: HOURLY_LIMIT_USD,
        reason: `Daily spend limit exceeded ($${dailySpend.toFixed(2)}/$${DAILY_LIMIT_USD})`,
      };
    }

    if (wouldExceedHourly) {
      console.error(`[SpendLimiter] Hourly limit exceeded: $${hourlySpend.toFixed(2)}/$${HOURLY_LIMIT_USD}`);
      Sentry.captureMessage("spend.hourly.exceeded", {
        level: "error",
        tags: { component: "spendLimiter", scope: "hourly" },
        extra: { hourlySpend, hourlyLimit: HOURLY_LIMIT_USD, estimatedCost },
      });
      return {
        allowed: false,
        dailySpend,
        hourlySpend,
        dailyLimit: DAILY_LIMIT_USD,
        hourlyLimit: HOURLY_LIMIT_USD,
        reason: `Hourly spend limit exceeded ($${hourlySpend.toFixed(2)}/$${HOURLY_LIMIT_USD})`,
      };
    }

    // Pre-warning: emit a warning when crossing 80% so ops can react
    // before hitting the hard cap. Sentry alert rule should de-dup.
    const dailyRatio = (dailySpend + estimatedCost) / DAILY_LIMIT_USD;
    const hourlyRatio = (hourlySpend + estimatedCost) / HOURLY_LIMIT_USD;
    if (dailyRatio >= 0.8) {
      Sentry.captureMessage("spend.daily.warning_80pct", {
        level: "warning",
        tags: { component: "spendLimiter", scope: "daily" },
        extra: { dailySpend, dailyLimit: DAILY_LIMIT_USD, ratio: dailyRatio },
      });
    } else if (hourlyRatio >= 0.8) {
      Sentry.captureMessage("spend.hourly.warning_80pct", {
        level: "warning",
        tags: { component: "spendLimiter", scope: "hourly" },
        extra: { hourlySpend, hourlyLimit: HOURLY_LIMIT_USD, ratio: hourlyRatio },
      });
    }

    return {
      allowed: true,
      dailySpend,
      hourlySpend,
      dailyLimit: DAILY_LIMIT_USD,
      hourlyLimit: HOURLY_LIMIT_USD,
    };
  } catch (error) {
    console.error("[SpendLimiter] Error reading limits:", error);

    // AUDIT-024 — degraded mode. Prefer the last successful in-memory
    // read over fail-closed when the cache is recent. This rides out
    // short Firestore blips without blocking legitimate users while
    // still respecting recent spend totals.
    if (
      process.env.NODE_ENV === "production" &&
      lastSpendCache &&
      Date.now() - lastSpendCache.readAt < SPEND_CACHE_TTL_MS
    ) {
      const wouldExceedDaily = lastSpendCache.dailySpend + estimatedCost > DAILY_LIMIT_USD;
      const wouldExceedHourly = lastSpendCache.hourlySpend + estimatedCost > HOURLY_LIMIT_USD;
      Sentry.captureMessage("spend.firestore.read_failed_degraded", {
        level: "warning",
        tags: { component: "spendLimiter", mode: "degraded" },
        extra: {
          cacheAgeMs: Date.now() - lastSpendCache.readAt,
          dailySpend: lastSpendCache.dailySpend,
          hourlySpend: lastSpendCache.hourlySpend,
        },
      });
      if (wouldExceedDaily || wouldExceedHourly) {
        return {
          allowed: false,
          dailySpend: lastSpendCache.dailySpend,
          hourlySpend: lastSpendCache.hourlySpend,
          dailyLimit: DAILY_LIMIT_USD,
          hourlyLimit: HOURLY_LIMIT_USD,
          reason: "Spend limit exceeded (degraded mode, cached value)",
        };
      }
      return {
        allowed: true,
        dailySpend: lastSpendCache.dailySpend,
        hourlySpend: lastSpendCache.hourlySpend,
        dailyLimit: DAILY_LIMIT_USD,
        hourlyLimit: HOURLY_LIMIT_USD,
        reason: "Degraded mode - serving from cache",
      };
    }

    // Fail CLOSED in production when cache is missing or stale —
    // protect against uncapped API bills.
    if (process.env.NODE_ENV === "production") {
      Sentry.captureMessage("spend.firestore.read_failed_closed", {
        level: "error",
        tags: { component: "spendLimiter", mode: "fail-closed" },
      });
      return {
        allowed: false,
        dailySpend: 0,
        hourlySpend: 0,
        dailyLimit: DAILY_LIMIT_USD,
        hourlyLimit: HOURLY_LIMIT_USD,
        reason: "Spend limits unavailable - blocking request for cost protection",
      };
    }
    // Dev mode: allow request
    return {
      allowed: true,
      dailySpend: 0,
      hourlySpend: 0,
      dailyLimit: DAILY_LIMIT_USD,
      hourlyLimit: HOURLY_LIMIT_USD,
      reason: "Error checking limits - allowing request (dev mode)",
    };
  }
}

/**
 * Record spend after a successful API call
 */
export async function recordSpend(cost: number, operation: string): Promise<void> {
  if (cost <= 0) return;

  try {
    const db = getDb();
    const dayKey = getDayKey();
    const hourKey = getHourKey();

    const batch = db.batch();

    // Update daily spend
    const dayRef = db.collection(SPEND_COLLECTION).doc(dayKey);
    batch.set(
      dayRef,
      {
        periodKey: dayKey,
        totalSpend: FieldValue.increment(cost),
        requestCount: FieldValue.increment(1),
        lastUpdated: FieldValue.serverTimestamp(),
        lastOperation: operation,
      },
      { merge: true }
    );

    // Update hourly spend
    const hourRef = db.collection(SPEND_COLLECTION).doc(hourKey);
    batch.set(
      hourRef,
      {
        periodKey: hourKey,
        totalSpend: FieldValue.increment(cost),
        requestCount: FieldValue.increment(1),
        lastUpdated: FieldValue.serverTimestamp(),
        lastOperation: operation,
      },
      { merge: true }
    );

    await batch.commit();

    console.log(`[SpendLimiter] Recorded $${cost.toFixed(4)} for ${operation}`);
  } catch (error) {
    console.error("[SpendLimiter] Error recording spend - cost may be untracked:", error);
    // Retry once on transient errors
    try {
      const db = getDb();
      const dayKey = getDayKey();
      await db.collection(SPEND_COLLECTION).doc(dayKey).set(
        { totalSpend: FieldValue.increment(cost), requestCount: FieldValue.increment(1), lastUpdated: FieldValue.serverTimestamp() },
        { merge: true }
      );
      console.log(`[SpendLimiter] Retry succeeded for $${cost.toFixed(4)}`);
    } catch (retryError) {
      console.error("[SpendLimiter] Retry also failed - spend record LOST:", retryError);
    }
  }
}

/**
 * Get current spend statistics
 */
export async function getSpendStats(): Promise<{
  daily: { spend: number; limit: number; remaining: number; requests: number };
  hourly: { spend: number; limit: number; remaining: number; requests: number };
}> {
  try {
    const db = getDb();
    const dayKey = getDayKey();
    const hourKey = getHourKey();

    const [dayDoc, hourDoc] = await Promise.all([
      db.collection(SPEND_COLLECTION).doc(dayKey).get(),
      db.collection(SPEND_COLLECTION).doc(hourKey).get(),
    ]);

    const dailySpend = (dayDoc.data()?.totalSpend as number) || 0;
    const dailyRequests = (dayDoc.data()?.requestCount as number) || 0;
    const hourlySpend = (hourDoc.data()?.totalSpend as number) || 0;
    const hourlyRequests = (hourDoc.data()?.requestCount as number) || 0;

    return {
      daily: {
        spend: dailySpend,
        limit: DAILY_LIMIT_USD,
        remaining: Math.max(0, DAILY_LIMIT_USD - dailySpend),
        requests: dailyRequests,
      },
      hourly: {
        spend: hourlySpend,
        limit: HOURLY_LIMIT_USD,
        remaining: Math.max(0, HOURLY_LIMIT_USD - hourlySpend),
        requests: hourlyRequests,
      },
    };
  } catch (error) {
    console.error("[SpendLimiter] Error getting stats - returning unavailable:", error);
    return {
      daily: { spend: -1, limit: DAILY_LIMIT_USD, remaining: 0, requests: -1 },
      hourly: { spend: -1, limit: HOURLY_LIMIT_USD, remaining: 0, requests: -1 },
    };
  }
}
