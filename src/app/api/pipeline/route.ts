import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { POST as analyzeSession } from "@/app/api/analyze/route";
import { POST as generateSessionImages } from "@/app/api/generate-images/route";
import { POST as generateSessionReport } from "@/app/api/report/route";
import { getDb } from "@/lib/firebaseAdmin";
import { getInternalApiHeaders, hasInternalApiKey } from "@/lib/internalApiAuth";
import {
  acquireJobLock,
  getOrCreateJob,
  markJobCompleted,
  markJobFailed,
  markJobPartial,
} from "@/lib/jobManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PipelineRequestSchema = z.object({
  sessionId: z.string().min(1).max(140).regex(/^[A-Za-z0-9_-]+$/),
  forceReport: z.boolean().optional().default(false),
});

interface PipelineSessionDocument {
  report_ready?: boolean;
  report?: {
    status?: string;
    pdfStoragePath?: string;
  };
}

interface StepResult {
  status: number;
  ok: boolean;
  body: Record<string, unknown>;
}

class PipelineStepError extends Error {
  constructor(
    readonly step: "analysis" | "image_generation" | "report",
    readonly status: number,
    readonly body: unknown
  ) {
    super(`${step}_failed`);
  }
}

async function readBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function stepRequest(path: string, body: unknown, internalHeaders: Record<string, string>) {
  return new NextRequest(`https://ngx.internal${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...internalHeaders,
    },
    body: JSON.stringify(body),
  });
}

async function runStep(
  step: "analysis" | "image_generation" | "report",
  handler: (request: NextRequest) => Promise<Response>,
  path: string,
  body: unknown,
  internalHeaders: Record<string, string>
): Promise<StepResult> {
  const response = await handler(stepRequest(path, body, internalHeaders));
  const json = await response.json().catch(() => ({}));
  const result = {
    status: response.status,
    ok: response.ok,
    body: json as Record<string, unknown>,
  };

  if (!result.ok) {
    throw new PipelineStepError(step, result.status, result.body);
  }

  return result;
}

function hasAllSeasonImages(body: Record<string, unknown>): boolean {
  const images = body.images as Record<string, unknown> | undefined;
  return !!images?.m4 && !!images.m8 && !!images.m12;
}

async function loadSession(sessionId: string) {
  const db = getDb();
  const ref = db.collection("sessions").doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { db, ref, data: null };
  }
  return { db, ref, data: snap.data() as PipelineSessionDocument };
}

export async function POST(request: NextRequest) {
  if (!hasInternalApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalHeaders = getInternalApiHeaders();
  if (!internalHeaders) {
    return NextResponse.json({ error: "Internal pipeline credentials are not configured" }, { status: 503 });
  }

  const parsed = PipelineRequestSchema.safeParse(await readBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sessionId, forceReport } = parsed.data;
  const jobId = `${sessionId}_season_pipeline`;

  try {
    const { ref, data } = await loadSession(sessionId);
    if (!data) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (data.report_ready && data.report?.pdfStoragePath && !forceReport) {
      return NextResponse.json({
        ok: true,
        sessionId,
        status: "ready",
        cached: true,
        reportReady: true,
        pdfStoragePath: data.report.pdfStoragePath,
      });
    }

    const job = await getOrCreateJob(sessionId, "season_pipeline", {
      maxRetries: 2,
      generateDeleteToken: false,
    });
    if (job.status === "completed" && data.report_ready && !forceReport) {
      return NextResponse.json({
        ok: true,
        sessionId,
        status: "ready",
        cached: true,
        reportReady: true,
        pdfStoragePath: data.report?.pdfStoragePath,
      });
    }

    const lock = await acquireJobLock(sessionId, "season_pipeline", 30 * 60 * 1000);
    if (!lock.acquired) {
      return NextResponse.json(
        {
          ok: true,
          sessionId,
          status: lock.status === "failed" ? "failed" : "in_progress",
        },
        { status: lock.status === "failed" ? 409 : 202 }
      );
    }

    await ref.set(
      {
        pipeline: {
          status: "in_progress",
          startedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          steps: {
            analysis: "pending",
            image_generation: "pending",
            report: "pending",
          },
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const analysis = await runStep(
      "analysis",
      analyzeSession,
      "/api/analyze",
      { sessionId },
      internalHeaders
    );

    await ref.set(
      {
        pipeline: {
          status: "in_progress",
          updatedAt: FieldValue.serverTimestamp(),
          steps: {
            analysis: "completed",
            image_generation: "pending",
            report: "pending",
          },
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const imageGeneration = await runStep(
      "image_generation",
      generateSessionImages,
      "/api/generate-images",
      { sessionId, steps: ["m4", "m8", "m12"] },
      internalHeaders
    );

    if (!hasAllSeasonImages(imageGeneration.body)) {
      await markJobPartial(jobId, "image_generation_incomplete");
      await ref.set(
        {
          pipeline: {
            status: "partial",
            lastError: "image_generation_incomplete",
            updatedAt: FieldValue.serverTimestamp(),
            steps: {
              analysis: "completed",
              image_generation: "partial",
              report: "blocked",
            },
          },
          report_ready: false,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return NextResponse.json(
        {
          ok: false,
          sessionId,
          status: "partial",
          error: "image_generation_incomplete",
          imageGeneration: imageGeneration.body,
        },
        { status: 409 }
      );
    }

    await ref.set(
      {
        pipeline: {
          status: "in_progress",
          updatedAt: FieldValue.serverTimestamp(),
          steps: {
            analysis: "completed",
            image_generation: "completed",
            report: "pending",
          },
          quality: imageGeneration.body.quality ?? null,
          degraded: imageGeneration.body.degraded ?? [],
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const report = await runStep(
      "report",
      generateSessionReport,
      "/api/report",
      { shareId: sessionId, force: forceReport },
      internalHeaders
    );

    await ref.set(
      {
        report_ready: true,
        pipeline: {
          status: "completed",
          completedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          steps: {
            analysis: "completed",
            image_generation: "completed",
            report: "completed",
          },
          quality: imageGeneration.body.quality ?? null,
          degraded: imageGeneration.body.degraded ?? [],
          reportPdfStoragePath: report.body.pdfStoragePath ?? null,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await markJobCompleted(jobId);

    return NextResponse.json({
      ok: true,
      sessionId,
      status: "ready",
      reportReady: true,
      analysis: analysis.body,
      imageGeneration: imageGeneration.body,
      report: report.body,
    });
  } catch (error) {
    const stepError = error instanceof PipelineStepError ? error : null;
    const message = stepError?.message ?? (error instanceof Error ? error.message : "Unknown error");

    console.error("[Pipeline] Failed:", error);

    try {
      const { ref } = await loadSession(sessionId);
      await ref.set(
        {
          pipeline: {
            status: "failed",
            failedStep: stepError?.step ?? "unknown",
            lastError: message,
            upstreamStatus: stepError?.status ?? null,
            upstreamBody: stepError?.body ?? null,
            updatedAt: FieldValue.serverTimestamp(),
          },
          report_ready: false,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await markJobFailed(jobId, message);
    } catch (updateError) {
      console.error("[Pipeline] Failed to persist failure state:", updateError);
    }

    return NextResponse.json(
      {
        ok: false,
        sessionId,
        error: message,
        failedStep: stepError?.step ?? "unknown",
        upstreamStatus: stepError?.status ?? null,
        upstreamBody: stepError?.body ?? null,
      },
      { status: stepError?.status && stepError.status >= 400 ? stepError.status : 500 }
    );
  }
}
