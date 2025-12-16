/**
 * PR-3: Social Pack Generator API
 *
 * GET /api/social-pack/[shareId]?format=story|post|square
 *
 * Generates and returns an image in the requested social format.
 * Requires unlock to be granted first.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getSignedUrl } from "@/lib/storage";
import { getFormatConfig, isValidFormat } from "@/lib/viral/socialPackGenerator";
import { recordDownload } from "@/lib/viral/shareUnlock";

// Feature flag
const FF_SHARE_TO_UNLOCK = process.env.FF_SHARE_TO_UNLOCK !== "false";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await context.params;
    const format = request.nextUrl.searchParams.get("format");

    // Validate format
    if (!format || !isValidFormat(format)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid format. Use: story, post, or square",
        },
        { status: 400 }
      );
    }

    const formatConfig = getFormatConfig(format);
    if (!formatConfig) {
      return NextResponse.json(
        { success: false, message: "Format config not found" },
        { status: 500 }
      );
    }

    // Get session data
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const data = snap.data() as {
      status?: string;
      assets?: { images?: Record<string, string> };
      unlockState?: { unlocked?: boolean };
    };

    // Check session is ready
    if (data.status !== "ready") {
      return NextResponse.json(
        { success: false, message: "Session not ready" },
        { status: 400 }
      );
    }

    // Check unlock status (if feature enabled)
    if (FF_SHARE_TO_UNLOCK && !data.unlockState?.unlocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Social pack locked. Share to unlock.",
          locked: true,
        },
        { status: 403 }
      );
    }

    // Get best image (prefer m12)
    const imagePath =
      data.assets?.images?.m12 ||
      data.assets?.images?.m8 ||
      data.assets?.images?.m4;

    if (!imagePath) {
      return NextResponse.json(
        { success: false, message: "No images available" },
        { status: 404 }
      );
    }

    // Get signed URL
    const signedUrl = await getSignedUrl(imagePath, {
      expiresInSeconds: 3600, // 1 hour
    });

    // Record download
    await recordDownload(shareId, "social_pack");

    // Return redirect to image with format hint
    // Note: For full implementation, we'd use sharp to resize
    // For now, we return the URL with format metadata
    return NextResponse.json({
      success: true,
      format: formatConfig,
      imageUrl: signedUrl,
      message: `Download ${format} format`,
      // In production, this would be a processed image URL
      // For now, client can use CSS object-fit to display correctly
    });
  } catch (error) {
    console.error("[SocialPack API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
