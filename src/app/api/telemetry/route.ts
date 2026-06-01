import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryEventSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/telemetry";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";

function sanitizePublicMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (key.toLowerCase().includes("email")) continue;
    if (typeof value === "string") safe[key] = value.slice(0, 500);
    else if (typeof value === "number" || typeof value === "boolean" || value === null) safe[key] = value;
  }
  return safe;
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const limit = await checkRateLimit("api:telemetry", clientIP);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const body = await req.json();
    const payload = TelemetryEventSchema.parse(body);
    await trackEvent({
      ...payload,
      metadata: {
        ...sanitizePublicMetadata(payload.metadata),
        publicApi: true,
      },
      trusted: false,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[TELEMETRY_ROUTE]", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
