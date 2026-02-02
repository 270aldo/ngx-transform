/**
 * PR-3: Share-to-Unlock API
 *
 * POST /api/unlock
 * Body: { shareId: string, action: "share_intent" | "request_unlock", unlockType?: "social_pack" | "4k_hero" }
 *
 * Actions:
 * - share_intent: Record that user opened share dialog
 * - request_unlock: Try to unlock after delay
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  processUnlockRequest,
  recordShareIntent,
  type UnlockType,
} from "@/lib/viral/shareUnlock";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";

// Feature flag
const FF_SHARE_TO_UNLOCK = process.env.FF_SHARE_TO_UNLOCK !== "false";

const UnlockRequestSchema = z.object({
  shareId: z.string().min(1),
  action: z.enum(["share_intent", "request_unlock"]),
  unlockType: z.enum(["social_pack", "4k_hero"]).optional(),
});

export async function POST(request: NextRequest) {
  // Check feature flag
  if (!FF_SHARE_TO_UNLOCK) {
    return NextResponse.json(
      { success: false, message: "Feature not enabled" },
      { status: 403 }
    );
  }

  try {
    // Rate limit by IP to prevent abuse
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit("api:unlock", clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validation = UnlockRequestSchema.safeParse(body);

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

    const { shareId, action, unlockType } = validation.data;

    if (action === "share_intent") {
      // Record that user opened share dialog
      const success = await recordShareIntent(shareId);
      return NextResponse.json({
        success,
        message: success
          ? "Share intent recorded"
          : "Failed to record share intent",
      });
    }

    if (action === "request_unlock") {
      // Validate unlock type is provided
      if (!unlockType) {
        return NextResponse.json(
          { success: false, message: "Unlock type required" },
          { status: 400 }
        );
      }

      // Process unlock request
      const result = await processUnlockRequest(
        shareId,
        unlockType as UnlockType
      );

      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Unlock API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
