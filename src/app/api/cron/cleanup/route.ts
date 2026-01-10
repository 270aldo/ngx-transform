/**
 * Session Cleanup Cron Endpoint
 *
 * Cleans up abandoned sessions older than TTL.
 * Should be called by Vercel Cron or external scheduler.
 *
 * POST /api/cron/cleanup
 * Headers: x-cron-key: <CRON_API_KEY>
 *
 * Environment:
 * - CRON_API_KEY: Required for authentication
 * - SESSION_TTL_DAYS: Days before cleanup (default: 30)
 */

import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute max for cleanup

// ============================================================================
// Configuration
// ============================================================================

const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || "30");
const BATCH_SIZE = 100; // Firestore batch limit is 500, but we use smaller batches

// ============================================================================
// Types
// ============================================================================

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  skippedCount: number;
  errorCount: number;
  duration_ms: number;
  message?: string;
}

// ============================================================================
// Auth Helper
// ============================================================================

function validateCronKey(req: Request): boolean {
  const cronKey = process.env.CRON_API_KEY;
  if (!cronKey) {
    console.error("[Cleanup] CRON_API_KEY not configured");
    return false;
  }

  const providedKey = req.headers.get("x-cron-key") || req.headers.get("authorization")?.replace("Bearer ", "");

  return providedKey === cronKey;
}

// ============================================================================
// Cleanup Logic
// ============================================================================

async function cleanupAbandonedSessions(): Promise<CleanupResult> {
  const start = Date.now();
  let deletedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    const db = getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SESSION_TTL_DAYS);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    console.log(`[Cleanup] Looking for sessions older than ${cutoffDate.toISOString()}`);

    // Query for old sessions that are not completed
    // We preserve completed sessions (they have value for users)
    const query = db
      .collection("sessions")
      .where("createdAt", "<", cutoffTimestamp)
      .where("status", "in", ["pending", "analyzing", "generating", "failed", "partial"])
      .limit(BATCH_SIZE);

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log("[Cleanup] No sessions to clean up");
      return {
        success: true,
        deletedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        duration_ms: Date.now() - start,
        message: "No abandoned sessions found",
      };
    }

    console.log(`[Cleanup] Found ${snapshot.size} sessions to evaluate`);

    // Process in batches
    const batch = db.batch();
    const sessionsToDelete: string[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const sessionId = doc.id;

      // Double-check: skip if somehow completed
      if (data.status === "ready" || data.status === "completed") {
        skippedCount++;
        continue;
      }

      // Skip if has generated images (partial success)
      const hasImages = data.assets?.images && Object.keys(data.assets.images).length > 0;
      if (hasImages && data.status === "partial") {
        // Partial sessions with images are kept (user might return)
        skippedCount++;
        console.log(`[Cleanup] Skipping partial session with images: ${sessionId}`);
        continue;
      }

      // Mark for deletion
      sessionsToDelete.push(sessionId);
      batch.delete(doc.ref);
    }

    if (sessionsToDelete.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        skippedCount,
        errorCount: 0,
        duration_ms: Date.now() - start,
        message: "All sessions were preserved (completed or partial with images)",
      };
    }

    // Execute batch delete
    await batch.commit();
    deletedCount = sessionsToDelete.length;

    console.log(`[Cleanup] Deleted ${deletedCount} sessions: ${sessionsToDelete.join(", ")}`);

    // Also clean up related collections
    await cleanupRelatedData(db, sessionsToDelete);

    return {
      success: true,
      deletedCount,
      skippedCount,
      errorCount,
      duration_ms: Date.now() - start,
      message: `Cleaned up ${deletedCount} abandoned sessions`,
    };
  } catch (error) {
    console.error("[Cleanup] Error during cleanup:", error);
    return {
      success: false,
      deletedCount,
      skippedCount,
      errorCount: errorCount + 1,
      duration_ms: Date.now() - start,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clean up related data for deleted sessions
 */
async function cleanupRelatedData(
  db: FirebaseFirestore.Firestore,
  sessionIds: string[]
): Promise<void> {
  try {
    // Clean up job records
    const jobsQuery = db.collection("jobs").where("sessionId", "in", sessionIds.slice(0, 10)); // Firestore 'in' limit
    const jobsSnapshot = await jobsQuery.get();

    if (!jobsSnapshot.empty) {
      const batch = db.batch();
      jobsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`[Cleanup] Deleted ${jobsSnapshot.size} job records`);
    }

    // Clean up session metrics
    const metricsQuery = db.collection("session_metrics").where("sessionId", "in", sessionIds.slice(0, 10));
    const metricsSnapshot = await metricsQuery.get();

    if (!metricsSnapshot.empty) {
      const batch = db.batch();
      metricsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`[Cleanup] Deleted ${metricsSnapshot.size} metrics records`);
    }
  } catch (error) {
    // Don't fail the main cleanup if related data cleanup fails
    console.error("[Cleanup] Error cleaning related data:", error);
  }
}

/**
 * Clean up old spend tracking records (keep 7 days)
 */
async function cleanupOldSpendRecords(): Promise<number> {
  try {
    const db = getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    // Get old daily records
    const oldRecords = await db
      .collection("gemini_spend")
      .where("lastUpdated", "<", Timestamp.fromDate(cutoffDate))
      .limit(50)
      .get();

    if (oldRecords.empty) return 0;

    const batch = db.batch();
    oldRecords.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`[Cleanup] Deleted ${oldRecords.size} old spend records`);
    return oldRecords.size;
  } catch (error) {
    console.error("[Cleanup] Error cleaning spend records:", error);
    return 0;
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(req: Request) {
  // Validate authentication
  if (!validateCronKey(req)) {
    console.warn("[Cleanup] Unauthorized cleanup attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Cleanup] Starting cleanup job...");

  // Run cleanup tasks
  const [sessionResult, spendRecordsDeleted] = await Promise.all([
    cleanupAbandonedSessions(),
    cleanupOldSpendRecords(),
  ]);

  const response = {
    ...sessionResult,
    spendRecordsDeleted,
    ttlDays: SESSION_TTL_DAYS,
    timestamp: new Date().toISOString(),
  };

  console.log("[Cleanup] Cleanup completed:", response);

  return NextResponse.json(response, {
    status: sessionResult.success ? 200 : 500,
  });
}

// Also support GET for manual testing (still requires auth)
export async function GET(req: Request) {
  if (!validateCronKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Cleanup endpoint ready",
    ttlDays: SESSION_TTL_DAYS,
    batchSize: BATCH_SIZE,
    usage: "POST /api/cron/cleanup with x-cron-key header",
  });
}
