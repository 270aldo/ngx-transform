/**
 * PR-4: Plan Generation API
 *
 * POST /api/plan
 * Body: { shareId: string }
 *
 * Generates a personalized 7-day fitness plan based on the session analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import { generatePlan, type ProfileSummary } from "@/lib/plan";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";

// Feature flag
const FF_PLAN_7_DIAS = process.env.FF_PLAN_7_DIAS !== "false";

const PlanRequestSchema = z.object({
  shareId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // Check feature flag
  if (!FF_PLAN_7_DIAS) {
    return NextResponse.json(
      { success: false, message: "Feature not enabled" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validation = PlanRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          errors: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { shareId } = validation.data;

    // Rate limiting by IP (Upstash Redis)
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit("api:plan", clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Get session data
    const db = getDb();
    const sessionRef = db.collection("sessions").doc(shareId);
    const snap = await sessionRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const data = snap.data() as {
      status?: string;
      input?: {
        age?: number;
        sex?: string;
        goal?: string;
        level?: string;
        weeklyTime?: number;
        focusZone?: string;
        stressLevel?: number;
        sleepQuality?: number;
        disciplineRating?: number;
      };
      ai?: { insightsText?: string };
      plan?: unknown;
    };

    // Check if plan already exists
    if (data.plan) {
      return NextResponse.json({
        success: true,
        plan: data.plan,
        cached: true,
      });
    }

    // Check session is ready
    if (data.status !== "ready" && data.status !== "analyzed") {
      return NextResponse.json(
        { success: false, message: "Session not ready" },
        { status: 400 }
      );
    }

    // Build profile from session input
    const input = data.input || {};
    const profile: ProfileSummary = {
      sex: (input.sex as "male" | "female" | "other") || "other",
      age: input.age || 25,
      goal: (input.goal as "definicion" | "masa" | "mixto") || "mixto",
      bodyType: "mesomorph", // Default, could be inferred
      focusZone: (input.focusZone as "upper" | "lower" | "abs" | "full") || "full",
      level: (input.level as "novato" | "intermedio" | "avanzado") || "intermedio",
      weeklyTime: input.weeklyTime || 6,
      stressLevel: input.stressLevel,
      sleepQuality: input.sleepQuality,
      disciplineRating: input.disciplineRating,
    };

    // Generate plan
    const result = await generatePlan(
      shareId,
      profile,
      data.ai?.insightsText
    );

    if (!result.success || !result.plan) {
      return NextResponse.json(
        { success: false, message: result.error || "Plan generation failed" },
        { status: 500 }
      );
    }

    // Save plan to session
    await sessionRef.update({
      plan: result.plan,
      planGeneratedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      plan: result.plan,
      cached: false,
    });
  } catch (error) {
    console.error("[Plan API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/plan?shareId=xxx
 *
 * Get existing plan for a session
 */
export async function GET(request: NextRequest) {
  if (!FF_PLAN_7_DIAS) {
    return NextResponse.json(
      { success: false, message: "Feature not enabled" },
      { status: 403 }
    );
  }

  const shareId = request.nextUrl.searchParams.get("shareId");

  if (!shareId) {
    return NextResponse.json(
      { success: false, message: "shareId required" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const data = snap.data() as { plan?: unknown };

    if (!data.plan) {
      return NextResponse.json(
        { success: false, message: "No plan generated yet" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: data.plan,
    });
  } catch (error) {
    console.error("[Plan API] GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
