import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getAuthUserAny } from "@/lib/authServer";
import { secureCompare } from "@/lib/crypto";
import { getDb } from "@/lib/firebaseAdmin";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";
import {
  buildSeasonReportPrompt,
  buildSeasonVisionReport,
  type SeasonReportAnalysisInput,
} from "@/lib/report/reportBuilder";
import { renderSeasonReportPDF } from "@/lib/report/reportPdf";
import {
  SEASON_REPORT_SCHEMA_VERSION,
  type ReportProfile,
  type SeasonVisionReport,
  type TransformReportAssetMap,
} from "@/lib/report/reportSchema";
import { getSignedUrl, uploadBuffer } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPORT_PDF_CONTENT_TYPE = "application/pdf";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const ReportRequestSchema = z.object({
  shareId: z.string().min(1).max(140).regex(/^[A-Za-z0-9_-]+$/),
  force: z.boolean().optional().default(false),
});

interface ReportSessionDocument {
  shareId?: string;
  ownerUid?: string;
  input?: ReportProfile;
  photo?: { originalStoragePath?: string };
  ai?: SeasonReportAnalysisInput | null;
  assets?: { images?: TransformReportAssetMap };
  status?: string;
}

interface StoredTransformReport {
  shareId: string;
  schemaVersion: typeof SEASON_REPORT_SCHEMA_VERSION;
  status: "ready";
  report: SeasonVisionReport;
  prompt: string;
  pdfStoragePath: string;
  pdfContentType: typeof REPORT_PDF_CONTENT_TYPE;
  pdfByteSize: number;
  generatedAt?: unknown;
  updatedAt?: unknown;
}

function hasServerApiKey(request: NextRequest): boolean {
  const expectedKey = process.env.CRON_API_KEY;
  if (!expectedKey) return false;
  const providedKey =
    request.headers.get("X-Api-Key") ||
    request.headers.get("x-api-key") ||
    request.headers.get("x-cron-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return secureCompare(providedKey, expectedKey);
}

async function canManageReport(request: NextRequest, session: ReportSessionDocument): Promise<boolean> {
  if (hasServerApiKey(request)) return true;
  const authUser = await getAuthUserAny(request);
  return !!authUser?.uid && !!session.ownerUid && authUser.uid === session.ownerUid;
}

async function parseBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function reportStoragePath(shareId: string) {
  return `reports/${shareId}/season-vision-report-v1.pdf`;
}

function reportResponse(data: StoredTransformReport, pdfUrl: string) {
  return NextResponse.json({
    ok: true,
    shareId: data.shareId,
    schemaVersion: data.schemaVersion,
    status: data.status,
    report: data.report,
    pdfStoragePath: data.pdfStoragePath,
    pdfUrl,
    pdfContentType: data.pdfContentType,
    pdfByteSize: data.pdfByteSize,
  });
}

async function fetchSession(shareId: string) {
  const db = getDb();
  const sessionRef = db.collection("sessions").doc(shareId);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) {
    return { db, sessionRef, session: null };
  }
  return {
    db,
    sessionRef,
    session: sessionSnap.data() as ReportSessionDocument,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = ReportRequestSchema.pick({ shareId: true }).safeParse({
    shareId: searchParams.get("shareId"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "shareId is required" }, { status: 400 });
  }

  try {
    const { db, session } = await fetchSession(parsed.data.shareId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (!(await canManageReport(request, session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportSnap = await db.collection("transform_reports").doc(parsed.data.shareId).get();
    if (!reportSnap.exists) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const data = reportSnap.data() as StoredTransformReport;
    const pdfUrl = await getSignedUrl(data.pdfStoragePath, { expiresInSeconds: SIGNED_URL_TTL_SECONDS });
    return reportResponse(data, pdfUrl);
  } catch (error) {
    console.error("[Report] GET failed:", error);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkRateLimit("api:report", clientIP);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many report requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const parsed = ReportRequestSchema.safeParse(await parseBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { shareId, force } = parsed.data;
    const { db, sessionRef, session } = await fetchSession(shareId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (!(await canManageReport(request, session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.ai) {
      return NextResponse.json({ error: "Session analysis is not ready" }, { status: 409 });
    }

    const reportRef = db.collection("transform_reports").doc(shareId);
    const existingSnap = await reportRef.get();
    if (existingSnap.exists && !force) {
      const existing = existingSnap.data() as StoredTransformReport;
      const pdfUrl = await getSignedUrl(existing.pdfStoragePath, { expiresInSeconds: SIGNED_URL_TTL_SECONDS });
      return reportResponse(existing, pdfUrl);
    }

    const report = buildSeasonVisionReport({
      shareId,
      ai: session.ai,
      input: session.input,
      assets: {
        originalStoragePath: session.photo?.originalStoragePath ?? null,
        images: session.assets?.images ?? {},
      },
    });
    const prompt = buildSeasonReportPrompt({
      shareId,
      ai: session.ai,
      input: session.input,
      assets: {
        originalStoragePath: session.photo?.originalStoragePath ?? null,
        images: session.assets?.images ?? {},
      },
    });
    const pdfBuffer = await renderSeasonReportPDF(report);
    const pdfStoragePath = reportStoragePath(shareId);

    await uploadBuffer(pdfStoragePath, pdfBuffer, REPORT_PDF_CONTENT_TYPE);

    const storedReport: StoredTransformReport = {
      shareId,
      schemaVersion: SEASON_REPORT_SCHEMA_VERSION,
      status: "ready",
      report,
      prompt,
      pdfStoragePath,
      pdfContentType: REPORT_PDF_CONTENT_TYPE,
      pdfByteSize: pdfBuffer.length,
    };

    await reportRef.set(
      {
        ...storedReport,
        generatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await sessionRef.set(
      {
        report: {
          status: "ready",
          schemaVersion: SEASON_REPORT_SCHEMA_VERSION,
          transformReportId: shareId,
          pdfStoragePath,
          pdfContentType: REPORT_PDF_CONTENT_TYPE,
          pdfByteSize: pdfBuffer.length,
          updatedAt: FieldValue.serverTimestamp(),
        },
        report_ready: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const pdfUrl = await getSignedUrl(pdfStoragePath, { expiresInSeconds: SIGNED_URL_TTL_SECONDS });
    return reportResponse(storedReport, pdfUrl);
  } catch (error) {
    if (error instanceof Error && error.message === "REPORT_AI_INCOMPLETE") {
      return NextResponse.json({ error: "Session analysis is incomplete" }, { status: 409 });
    }
    console.error("[Report] POST failed:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
