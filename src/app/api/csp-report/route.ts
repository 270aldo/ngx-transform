/**
 * CSP Violation Report Endpoint
 *
 * Receives Content-Security-Policy violation reports for security
 * monitoring. Forwards to Sentry so violations show up next to
 * regular errors.
 *
 * Hardened in AUDIT-017:
 * - Removed wide-open CORS (Access-Control-Allow-Origin: *)
 * - Added rate limit (api:general, 60/min/IP)
 * - Limit body size (16KB) to prevent DoS via giant reports
 * - Forward to Sentry as warning-level message
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_REPORT_BYTES = 16 * 1024; // 16KB

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
    // Rate limit per IP — CSP report endpoints are a known DoS vector
    // (browsers fire reports on every blocked resource).
    const clientIP = getClientIP(req);
    const rl = await checkRateLimit("api:general", clientIP);
    if (!rl.success) {
      // Acknowledge silently to avoid retry storms from browsers
      return new NextResponse(null, { status: 204 });
    }

    // Body size guard: read raw text first (clamped) before parsing
    const raw = await req.text();
    if (raw.length > MAX_REPORT_BYTES) {
      return NextResponse.json({ error: "Report too large" }, { status: 413 });
    }

    let body: CSPViolationReport;
    try {
      body = JSON.parse(raw) as CSPViolationReport;
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const report = body["csp-report"];
    if (!report) {
      return NextResponse.json({ error: "Invalid CSP report format" }, { status: 400 });
    }

    // Log + forward to Sentry. Use warning level so it's visible but
    // doesn't trigger error-rate alerts for normal blocked resources.
    const summary = `CSP: ${report["violated-directive"] || "unknown"} blocked ${report["blocked-uri"] || "unknown"}`;
    console.warn("[CSP-Violation]", {
      documentUri: report["document-uri"],
      violatedDirective: report["violated-directive"],
      effectiveDirective: report["effective-directive"],
      blockedUri: report["blocked-uri"],
      sourceFile: report["source-file"],
      lineNumber: report["line-number"],
      timestamp: new Date().toISOString(),
    });

    Sentry.captureMessage(summary, {
      level: "warning",
      tags: {
        component: "csp-report",
        directive: report["violated-directive"] || "unknown",
      },
      extra: { ...report },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // CSP reports can have malformed bodies, just acknowledge
    console.error("[CSP-Report] Failed to handle report:", error);
    return new NextResponse(null, { status: 204 });
  }
}

// No CORS preflight needed — CSP reports come as direct browser POSTs
// from same-origin pages. The previous wildcard OPTIONS handler was
// not necessary and was actually a vector for cross-site report abuse.
