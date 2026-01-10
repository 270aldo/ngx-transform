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

    // Check if adding this request would exceed limits
    const wouldExceedDaily = dailySpend + estimatedCost > DAILY_LIMIT_USD;
    const wouldExceedHourly = hourlySpend + estimatedCost > HOURLY_LIMIT_USD;

    if (wouldExceedDaily) {
      console.error(`[SpendLimiter] Daily limit exceeded: $${dailySpend.toFixed(2)}/$${DAILY_LIMIT_USD}`);
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
      return {
        allowed: false,
        dailySpend,
        hourlySpend,
        dailyLimit: DAILY_LIMIT_USD,
        hourlyLimit: HOURLY_LIMIT_USD,
        reason: `Hourly spend limit exceeded ($${hourlySpend.toFixed(2)}/$${HOURLY_LIMIT_USD})`,
      };
    }

    return {
      allowed: true,
      dailySpend,
      hourlySpend,
      dailyLimit: DAILY_LIMIT_USD,
      hourlyLimit: HOURLY_LIMIT_USD,
    };
  } catch (error) {
    // On error, allow the request but log it (fail-open for user experience)
    console.error("[SpendLimiter] Error checking limits, allowing request:", error);
    return {
      allowed: true,
      dailySpend: 0,
      hourlySpend: 0,
      dailyLimit: DAILY_LIMIT_USD,
      hourlyLimit: HOURLY_LIMIT_USD,
      reason: "Error checking limits - allowing request",
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
    // Don't fail the request if spend tracking fails
    console.error("[SpendLimiter] Error recording spend:", error);
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
    console.error("[SpendLimiter] Error getting stats:", error);
    return {
      daily: { spend: 0, limit: DAILY_LIMIT_USD, remaining: DAILY_LIMIT_USD, requests: 0 },
      hourly: { spend: 0, limit: HOURLY_LIMIT_USD, remaining: HOURLY_LIMIT_USD, requests: 0 },
    };
  }
}
