/**
 * CSP Violation Report Endpoint
 *
 * Receives Content-Security-Policy violation reports for security monitoring.
 * Reports are logged for analysis and can be forwarded to external services.
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CSPViolationReport;
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

    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
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
