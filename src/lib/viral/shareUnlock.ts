/**
 * PR-3: Share-to-Unlock Logic
 *
 * Manages the unlock flow:
 * 1. User clicks share button
 * 2. Share intent opens (native or fallback)
 * 3. After delay (configurable), unlock is granted
 * 4. User can download Social Pack or 4K Hero
 *
 * Honor system with server-side validation
 */

import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Default delay before unlocking (in seconds)
const SHARE_UNLOCK_DELAY = parseInt(process.env.SHARE_UNLOCK_DELAY_SECONDS || "5", 10);

export type UnlockType = "social_pack" | "4k_hero";

export interface UnlockState {
  shareIntentOpened: boolean;
  shareTimestamp: number | null;
  unlocked: boolean;
  unlockType: UnlockType | null;
  downloadCount: number;
}

export interface UnlockResult {
  success: boolean;
  unlockType?: UnlockType;
  message: string;
  remainingSeconds?: number;
}

/**
 * Initialize unlock state for a session
 */
export function getInitialUnlockState(): UnlockState {
  return {
    shareIntentOpened: false,
    shareTimestamp: null,
    unlocked: false,
    unlockType: null,
    downloadCount: 0,
  };
}

/**
 * Calculate if enough time has passed for unlock
 */
export function canUnlock(shareTimestamp: number | null): {
  canUnlock: boolean;
  remainingSeconds: number;
} {
  if (!shareTimestamp) {
    return { canUnlock: false, remainingSeconds: SHARE_UNLOCK_DELAY };
  }

  const elapsedSeconds = Math.floor((Date.now() - shareTimestamp) / 1000);
  const remainingSeconds = Math.max(0, SHARE_UNLOCK_DELAY - elapsedSeconds);

  return {
    canUnlock: remainingSeconds === 0,
    remainingSeconds,
  };
}

/**
 * Validate and process unlock request (server-side)
 */
export async function processUnlockRequest(
  shareId: string,
  unlockType: UnlockType
): Promise<UnlockResult> {
  const db = getDb();
  const sessionRef = db.collection("sessions").doc(shareId);

  try {
    const snap = await sessionRef.get();
    if (!snap.exists) {
      return { success: false, message: "Sesión no encontrada" };
    }

    const data = snap.data() as {
      unlockState?: UnlockState;
      status?: string;
    };

    // Check if session is ready
    if (data.status !== "ready") {
      return { success: false, message: "La sesión aún no está lista" };
    }

    const unlockState = data.unlockState || getInitialUnlockState();

    // Check if already unlocked with same type
    if (unlockState.unlocked && unlockState.unlockType === unlockType) {
      return {
        success: true,
        unlockType,
        message: "Ya desbloqueado",
      };
    }

    // Check if share was initiated
    if (!unlockState.shareIntentOpened || !unlockState.shareTimestamp) {
      return {
        success: false,
        message: "Primero debes compartir tu transformación",
      };
    }

    // Check timing
    const { canUnlock: ready, remainingSeconds } = canUnlock(
      unlockState.shareTimestamp
    );

    if (!ready) {
      return {
        success: false,
        message: `Espera ${remainingSeconds} segundos más`,
        remainingSeconds,
      };
    }

    // Grant unlock
    await sessionRef.update({
      "unlockState.unlocked": true,
      "unlockState.unlockType": unlockType,
      "unlockState.unlockedAt": FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      unlockType,
      message: "¡Desbloqueado!",
    };
  } catch (error) {
    console.error("[ShareUnlock] Error processing unlock:", error);
    return { success: false, message: "Error interno" };
  }
}

/**
 * Record share intent (server-side)
 */
export async function recordShareIntent(shareId: string): Promise<boolean> {
  const db = getDb();
  const sessionRef = db.collection("sessions").doc(shareId);

  try {
    await sessionRef.update({
      "unlockState.shareIntentOpened": true,
      "unlockState.shareTimestamp": Date.now(),
    });
    return true;
  } catch (error) {
    console.error("[ShareUnlock] Error recording share intent:", error);
    return false;
  }
}

/**
 * Record download (server-side, for analytics)
 */
export async function recordDownload(
  shareId: string,
  downloadType: UnlockType | "single_image"
): Promise<boolean> {
  const db = getDb();
  const sessionRef = db.collection("sessions").doc(shareId);

  try {
    await sessionRef.update({
      "unlockState.downloadCount": FieldValue.increment(1),
      "unlockState.lastDownloadAt": FieldValue.serverTimestamp(),
      "unlockState.lastDownloadType": downloadType,
    });
    return true;
  } catch (error) {
    console.error("[ShareUnlock] Error recording download:", error);
    return false;
  }
}
