import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryEventSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/telemetry";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const limit = await checkRateLimit("api:general", clientIP);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const body = await req.json();
    const payload = TelemetryEventSchema.parse(body);
    await trackEvent(payload);

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

