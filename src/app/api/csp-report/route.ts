/**
 * CSP Violation Report Endpoint
 *
 * Receives Content-Security-Policy violation reports for security monitoring.
 * Reports are logged for analysis and can be forwarded to external services.
 */

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

interface CSPViolationReport {
  "csp-report"?: {
    "document-uri"?: string;
    referrer?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "original-policy"?: string;
    "blocked-uri"?: string;
    "status-code"?: number;
    "source-file"?: string;
    "line-number"?: number;
    "column-number"?: number;
  };
}

const MAX_CSP_REPORT_BYTES = 10 * 1024;
const CSP_REPORT_SAMPLE_RATE = Number(process.env.CSP_REPORT_SAMPLE_RATE || "0.1");

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const limit = await checkRateLimit("api:csp-report", clientIP);
    if (!limit.success) {
      return new NextResponse(null, { status: 204 });
    }

    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength > MAX_CSP_REPORT_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_CSP_REPORT_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    const body = JSON.parse(rawBody) as CSPViolationReport;
    const report = body["csp-report"];

    if (!report) {
      return NextResponse.json({ error: "Invalid CSP report format" }, { status: 400 });
    }

    // Log the violation for monitoring
    console.warn("[CSP-Violation]", {
      documentUri: report["document-uri"],
      violatedDirective: report["violated-directive"],
      effectiveDirective: report["effective-directive"],
      blockedUri: report["blocked-uri"],
      sourceFile: report["source-file"],
      lineNumber: report["line-number"],
      timestamp: new Date().toISOString(),
    });

    if (
      (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) &&
      Math.random() < CSP_REPORT_SAMPLE_RATE
    ) {
      Sentry.captureMessage("CSP Violation", {
        level: "warning",
        tags: {
          security: "csp",
          directive: report["effective-directive"] || report["violated-directive"] || "unknown",
        },
        extra: {
          documentUri: report["document-uri"],
          violatedDirective: report["violated-directive"],
          effectiveDirective: report["effective-directive"],
          blockedUri: report["blocked-uri"],
          sourceFile: report["source-file"],
          lineNumber: report["line-number"],
          statusCode: report["status-code"],
        },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // CSP reports can have malformed bodies, just acknowledge
    console.error("[CSP-Report] Failed to parse report:", error);
    return new NextResponse(null, { status: 204 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
