/**
 * PR-3: Referral Tracking API
 *
 * POST /api/referral
 * Body: { action: "visit" | "complete" | "claim" | "stats", inviteeId?: string, referrerId?: string, shareId?: string }
 *
 * Actions:
 * - visit: Record referral visit (inviteeId + referrerId)
 * - complete: Mark referral as completed (inviteeId)
 * - claim: Claim referral rewards (referrerId/shareId)
 * - stats: Get referrer stats (shareId)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  recordReferralVisit,
  completeReferral,
  claimReferralReward,
  getReferrerStats,
} from "@/lib/viral/referralTracking";

// Feature flag
const FF_REFERRAL_TRACKING = process.env.FF_REFERRAL_TRACKING !== "false";

const ReferralRequestSchema = z.object({
  action: z.enum(["visit", "complete", "claim", "stats"]),
  inviteeId: z.string().min(1).optional(),
  referrerId: z.string().min(1).optional(),
  shareId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  // Check feature flag
  if (!FF_REFERRAL_TRACKING) {
    return NextResponse.json(
      { success: false, message: "Feature not enabled" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validation = ReferralRequestSchema.safeParse(body);

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

    const { action, inviteeId, referrerId, shareId } = validation.data;

    switch (action) {
      case "visit": {
        if (!inviteeId || !referrerId) {
          return NextResponse.json(
            { success: false, message: "inviteeId and referrerId required" },
            { status: 400 }
          );
        }
        const success = await recordReferralVisit(inviteeId, referrerId);
        return NextResponse.json({
          success,
          message: success ? "Referral visit recorded" : "Failed to record",
        });
      }

      case "complete": {
        if (!inviteeId) {
          return NextResponse.json(
            { success: false, message: "inviteeId required" },
            { status: 400 }
          );
        }
        const result = await completeReferral(inviteeId);
        return NextResponse.json({
          success: result.success,
          referrerId: result.referrerId,
          message: result.success
            ? "Referral completed"
            : "No pending referral found",
        });
      }

      case "claim": {
        const targetId = referrerId || shareId;
        if (!targetId) {
          return NextResponse.json(
            { success: false, message: "referrerId or shareId required" },
            { status: 400 }
          );
        }
        const result = await claimReferralReward(targetId);
        return NextResponse.json({
          success: result.success,
          rewardsAvailable: result.rewardsAvailable,
          message: result.success
            ? `Claimed ${result.rewardsAvailable} rewards`
            : "No rewards available",
        });
      }

      case "stats": {
        const targetId = shareId || referrerId;
        if (!targetId) {
          return NextResponse.json(
            { success: false, message: "shareId required" },
            { status: 400 }
          );
        }
        const stats = await getReferrerStats(targetId);
        if (!stats) {
          return NextResponse.json(
            { success: false, message: "Session not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          stats,
        });
      }

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Referral API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
