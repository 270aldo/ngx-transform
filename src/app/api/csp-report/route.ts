/**
 * CSP Violation Report Endpoint
 *
 * Receives Content-Security-Policy violation reports for security monitoring.
 * Reports are logged for analysis and can be forwarded to external services.
 */

import { NextResponse } from "next/server";

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

    // TODO: In production, forward to security monitoring service
    // Examples:
    // - Send to Sentry: Sentry.captureMessage("CSP Violation", { extra: report })
    // - Send to logging service: await logToService("csp_violation", report)
    // - Store in Firestore for analysis: await db.collection("csp_reports").add(report)

    return NextResponse.json({ received: true }, { status: 204 });
  } catch (error) {
    // CSP reports can have malformed bodies, just acknowledge
    console.error("[CSP-Report] Failed to parse report:", error);
    return NextResponse.json({ received: true }, { status: 204 });
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
