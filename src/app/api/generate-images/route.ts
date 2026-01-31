/**
 * PR-1: Image Generation Route with Identity Chain Support
 *
 * This route generates transformation images using Nano Banana Pro.
 * Features:
 * - Identity Chain: Uses previous step as reference for consistency
 * - user_visual_anchor: Preserves facial identity across milestones
 * - Quality gates: Validates outputs and retries if needed
 * - Graceful degradation: Continues on partial failures
 */

import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { GenerateImagesSchema } from "@/lib/validators";
import { getSignedUrl, uploadBuffer } from "@/lib/storage";
import {
  generateTransformedImage,
  type NanoStep,
  type GenerationResult,
} from "@/lib/nanobanana";
import { extractVisualAnchor, extractStyleProfile } from "@/lib/gemini";
import { getImageConfig, estimateSessionCost } from "@/lib/imageConfig";
import { FieldValue } from "firebase-admin/firestore";
import sharp from "sharp";
import { telemetry, startTimer } from "@/lib/telemetry";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";
import { checkSpendLimit, recordSpend } from "@/lib/spendLimiter";
import { requireAuth } from "@/lib/authServer";
import { getAiGenerationFlag } from "@/lib/aiKillSwitch";
import {
  getOrCreateJob,
  acquireJobLock,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
  getPendingMilestones,
  withRetry,
} from "@/lib/jobManager";
import type { SessionDocument, AnalysisOutput, InsightsResult } from "@/types/ai";
import { completeReferral } from "@/lib/viral/referralTracking";

// ============================================================================
// Config
// ============================================================================

export const runtime = "nodejs";
export const maxDuration = 180; // 3 minutes for image generation with Identity Chain

const MAX_RETRIES = Number(process.env.MAX_IMAGE_GENERATION_RETRIES || "2");

// Step ordering for Identity Chain
const STEP_ORDER: NanoStep[] = ["m4", "m8", "m12"];
const PREVIOUS_STEP: Record<NanoStep, NanoStep | null> = {
  m4: null,
  m8: "m4",
  m12: "m8",
};

const WORKER_TOKEN = process.env.AI_WORKER_TOKEN || "";

function isWorkerRequest(req: Request): boolean {
  if (!WORKER_TOKEN) return false;
  const headerToken = req.headers.get("x-worker-token") || "";
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("workerToken") || "";
  const token = headerToken || queryToken;
  return token === WORKER_TOKEN;
}

// ============================================================================
// Watermark Utility
// ============================================================================

async function applyWatermark(
  buffer: Buffer,
  contentType: string
): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    const img = sharp(buffer);
    const meta = await img.metadata();
    const width = meta.width ?? 1200;
    const height = meta.height ?? 1600;
    const fontSize = Math.max(Math.floor(width / 18), 32);
    const padding = Math.max(Math.floor(width / 28), 32);
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .txt { fill: rgba(255,255,255,0.18); font-size:${fontSize}px; font-family:'Inter','Helvetica',Arial,sans-serif; font-weight:700; letter-spacing:3px; }
        </style>
        <text x="${width - padding}" y="${height - padding}" text-anchor="end" class="txt">NGX TRANSFORM</text>
      </svg>
    `;
    const wmBuffer = Buffer.from(svg);
    const composited = img.composite([{ input: wmBuffer }]);

    let out: Buffer;
    let outType: string;
    if (meta.format === "png") {
      out = await composited.png().toBuffer();
      outType = "image/png";
    } else {
      out = await composited.jpeg({ quality: 85 }).toBuffer();
      outType = "image/jpeg";
    }
    return { buffer: out, contentType: outType };
  } catch (err) {
    console.error("[Watermark] Failed, sending original:", err);
    return { buffer, contentType };
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(req: Request) {
  const timer = startTimer();
  let parsedSessionId: string | undefined;

  try {
    const body = await req.json();
    const parsed = GenerateImagesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    parsedSessionId = sessionId;

    const isWorker = isWorkerRequest(req);

    // Kill switch for AI generation
    const aiFlag = await getAiGenerationFlag();
    if (!aiFlag.enabled) {
      return NextResponse.json(
        { error: "AI generation is temporarily disabled", source: aiFlag.source },
        { status: 503 }
      );
    }

    // Rate limiting by IP (Upstash Redis)
    if (!isWorker) {
      const clientIP = getClientIP(req);
      const rateLimitResult = await checkRateLimit("api:generate-images", clientIP);
      if (!rateLimitResult.success) {
        if (parsedSessionId) {
          telemetry.rateLimitBlocked(parsedSessionId, "api:generate-images");
        }
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment." },
          { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY no está configurada" }, { status: 400 });
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

    // Auth check: require auth for non-worker requests
    if (!isWorker) {
      const authUser = await requireAuth(req);
      const ownerUid = (data as unknown as Record<string, unknown>).ownerUid as string | undefined;
      if (ownerUid && authUser.uid !== ownerUid) {
        console.warn(`[GenerateImages] Owner mismatch: Token uid=${authUser.uid} Session ownerUid=${ownerUid}`);
        telemetry.authFailed(sessionId, { reason: "owner_mismatch" });
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (data.email && authUser.email && authUser.email.toLowerCase() !== data.email.toLowerCase()) {
        console.warn(`[GenerateImages] Email mismatch: Token=${authUser.email} Session=${data.email}`);
        telemetry.authFailed(sessionId, { reason: "email_mismatch" });
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Get image config
    const imageConfig = getImageConfig();

    // Check if already complete
    const job = await getOrCreateJob(sessionId, "image_generation");

    if (job.status === "completed" && data.assets?.images) {
      const existingImages = data.assets.images;
      if (["m4", "m8", "m12"].every((s) => existingImages[s])) {
        console.log(`[GenerateImages] Session ${sessionId} already complete, returning cached`);
        return NextResponse.json({ ok: true, images: existingImages, cached: true });
      }
    }

    // Get pending milestones (for resumability)
    const pendingMilestones = await getPendingMilestones(sessionId);
    const requestedSteps = (parsed.data.steps ?? ["m4", "m8", "m12"]) as NanoStep[];

    // Filter to only pending steps, but maintain order for Identity Chain
    const stepsToProcess = STEP_ORDER.filter(
      (s) => requestedSteps.includes(s) && pendingMilestones.includes(s)
    );

    if (stepsToProcess.length === 0) {
      console.log(`[GenerateImages] No pending steps for ${sessionId}`);
      return NextResponse.json({ ok: true, images: data.assets?.images || {}, cached: true });
    }

    // Check spend limits based on actual steps to process (not hardcoded all 3)
    const estimatedCost = estimateSessionCost(stepsToProcess);
    console.log(`[GenerateImages] Estimated cost for ${stepsToProcess.join(",")}: $${estimatedCost.toFixed(3)}`);

    const spendCheck = await checkSpendLimit(estimatedCost);
    if (!spendCheck.allowed) {
      console.error(`[GenerateImages] Spend limit exceeded: ${spendCheck.reason}`);
      telemetry.spendLimitBlocked(sessionId, spendCheck.reason);
      return NextResponse.json(
        {
          error: "Service temporarily unavailable due to high demand. Please try again later.",
          reason: spendCheck.reason,
          retryAfter: 3600,
        },
        { status: 503 }
      );
    }

    // Acquire job lock after spend check
    const lock = await acquireJobLock(sessionId, "image_generation");
    if (!lock.acquired) {
      telemetry.jobLockDenied(sessionId, "image_generation");
      return NextResponse.json({ ok: true, status: "in_progress" }, { status: 202 });
    }

    const photoPath = data.photo?.originalStoragePath;
    if (!photoPath) {
      return NextResponse.json({ error: "Missing photo" }, { status: 400 });
    }

    await ref.set({ status: "generating", updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    // Get model from config
    const MODEL_ID = imageConfig.default.model;

    // Track start
    await telemetry.imageGenerationStarted(sessionId, MODEL_ID);

    // Get signed URL for original photo
    const imageUrl = await getSignedUrl(photoPath, { expiresInSeconds: 3600 });

    // Initialize images record (include any existing)
    const images: Record<string, string> = { ...(data.assets?.images || {}) };

    // Extract Identity Chain data from AI analysis
    const aiData = data.ai as AnalysisOutput | InsightsResult | null;
    const userVisualAnchor = extractVisualAnchor(aiData);
    const styleProfile = extractStyleProfile(aiData);

    console.log(`[GenerateImages] Identity Chain enabled`);
    console.log(
      `[GenerateImages] Visual anchor: ${userVisualAnchor ? `${userVisualAnchor.length} chars` : "none"}`
    );

    let completedCount = 0;
    const failedSteps: string[] = [];
    const qualityScores: Record<string, number> = {};
    const degradedSteps: string[] = [];

    // Process steps in order (important for Identity Chain)
    for (const step of stepsToProcess) {
      const stepTimer = startTimer();

      try {
        // Get AI prompt for this step
        const aiPrompt =
          aiData && "timeline" in aiData
            ? (aiData.timeline as Record<string, { image_prompt?: string }>)?.[step]?.image_prompt
            : undefined;

        // Get previous step URL for Identity Chain (if available)
        const prevStep = PREVIOUS_STEP[step];
        let previousStepUrl: string | undefined;

        if (prevStep && images[prevStep]) {
          try {
            previousStepUrl = await getSignedUrl(images[prevStep], { expiresInSeconds: 3600 });
            console.log(`[GenerateImages] Using ${prevStep} as reference for ${step}`);
          } catch (err) {
            console.warn(`[GenerateImages] Could not get URL for ${prevStep}:`, err);
          }
        }

        // Generate image with retry
        const result: GenerationResult = await withRetry(
          async () => {
            return await generateTransformedImage({
              imageUrl,
              profile: data.input,
              step,
              aiPrompt,
              userVisualAnchor,
              styleProfile,
              previousStepUrl,
            });
          },
          {
            maxRetries: MAX_RETRIES,
            baseDelayMs: 2000,
            maxDelayMs: 15000,
          },
          (attempt, error) => {
            console.log(`[GenerateImages] Retry ${attempt} for ${step}: ${error.message}`);
          }
        );

        // Track quality
        qualityScores[step] = result.qualityScore;
        if (result.degraded) {
          degradedSteps.push(step);
        }

        // Apply watermark
        const { buffer: watermarkedBuffer, contentType: finalContentType } = await applyWatermark(
          result.buffer,
          result.contentType
        );

        // Upload to storage
        const ext = finalContentType.includes("png") ? "png" : "jpg";
        const storagePath = `sessions/${sessionId}/generated/${step}.${ext}`;
        await uploadBuffer(storagePath, watermarkedBuffer, finalContentType);

        images[step] = storagePath;
        completedCount++;

        // Update job progress
        await updateJobProgress(`${sessionId}_image_generation`, step, true);

        // Track milestone completed
        const stepLatency = stepTimer.stop();
        await telemetry.imageMilestoneReady(
          sessionId,
          step,
          stepLatency,
          result.model,
          imageConfig.byStep[step].imageSize
        );

        // Record spend for this step
        const stepCost = estimateSessionCost([step]);
        await recordSpend(stepCost, `image_generation_${step}`);

        console.log(
          `[GenerateImages] ${step} completed for ${sessionId} in ${stepLatency}ms ` +
          `(quality: ${result.qualityScore}, chain: ${result.usedIdentityChain})`
        );

        // Save partial progress without overwriting other steps
        await ref.set(
          {
            assets: { images: { [step]: storagePath } },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (stepError) {
        const errorMsg = stepError instanceof Error ? stepError.message : "Unknown error";
        console.error(`[GenerateImages] Failed ${step} for ${sessionId}:`, errorMsg);
        failedSteps.push(step);

        // Fast-fail on systemic errors (auth, network) - don't waste time on remaining steps
        const isSystemic = errorMsg.includes("UNAUTHENTICATED") ||
          errorMsg.includes("PERMISSION_DENIED") ||
          errorMsg.includes("network") ||
          errorMsg.includes("ECONNREFUSED") ||
          errorMsg.includes("API key");
        if (isSystemic) {
          console.error(`[GenerateImages] Systemic error detected, aborting remaining steps`);
          break;
        }
        // Continue with next step for transient/step-specific errors (graceful degradation)
      }
    }

    // Determine final status
    const allRequestedComplete = stepsToProcess.every((s) => images[s]);
    let finalStatus: "ready" | "partial" | "failed" = "ready";

    if (!allRequestedComplete) {
      finalStatus = failedSteps.length === stepsToProcess.length ? "failed" : "partial";
    }

    // Update session with final state (assets already persisted per step)
    await ref.set(
      {
        status: finalStatus,
        generatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Mark job according to result and trigger referral completion
    if (allRequestedComplete) {
      await markJobCompleted(`${sessionId}_image_generation`);
      // Trigger referral completion when session is ready (viral loop)
      completeReferral(sessionId).catch((err) =>
        console.warn("[GenerateImages] Referral completion failed (non-blocking):", err)
      );
    } else if (failedSteps.length === stepsToProcess.length) {
      await markJobFailed(
        `${sessionId}_image_generation`,
        `All steps failed: ${failedSteps.join(", ")}`
      );
      await telemetry.imageGenerationFailed(sessionId, `Failed: ${failedSteps.join(", ")}`);
    }

    const totalLatency = timer.stop();
    console.log(
      `[GenerateImages] Completed ${sessionId} in ${totalLatency}ms ` +
      `(${completedCount}/${stepsToProcess.length} steps, ${degradedSteps.length} degraded)`
    );

    return NextResponse.json({
      ok: true,
      images,
      latency_ms: totalLatency,
      completed: completedCount,
      failed: failedSteps,
      status: finalStatus,
      quality: qualityScores,
      degraded: degradedSteps,
      model: MODEL_ID,
      estimatedCost,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";

    // Return 401 for auth failures
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[GenerateImages] Error:", e);

    if (parsedSessionId) {
      await telemetry.imageGenerationFailed(parsedSessionId, message);
      await markJobFailed(`${parsedSessionId}_image_generation`, message);

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
        console.error("[GenerateImages] Failed to update session status:", updateError);
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
