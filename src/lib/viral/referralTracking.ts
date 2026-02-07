/**
 * PR-3: Referral Tracking
 *
 * Tracks referrals via URL parameters:
 * /s/{shareId}?ref={referralId}
 *
 * When invitee completes a session:
 * 1. Attribute to referrer
 * 2. Increment referrer's counter
 * 3. Optionally unlock reward for referrer
 */

import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export interface ReferralData {
  referrerId: string; // shareId of the referrer
  inviteeId: string; // shareId of the invitee
  visitedAt: number;
  completedAt?: number;
  rewardClaimed: boolean;
}

export interface ReferrerStats {
  totalReferrals: number;
  completedReferrals: number;
  rewardsClaimed: number;
}

/**
 * Record a referral visit (when invitee lands on /s/{shareId}?ref={referralId})
 */
export async function recordReferralVisit(
  inviteeShareId: string,
  referrerShareId: string
): Promise<boolean> {
  const db = getDb();

  try {
    // Don't allow self-referral
    if (inviteeShareId === referrerShareId) {
      return false;
    }

    // Check if referrer session exists
    const referrerSnap = await db.collection("sessions").doc(referrerShareId).get();
    if (!referrerSnap.exists) {
      return false;
    }

    // Record the referral
    const referralDoc = db.collection("referrals").doc(`${referrerShareId}_${inviteeShareId}`);
    const existingReferral = await referralDoc.get();

    if (!existingReferral.exists) {
      await referralDoc.set({
        referrerId: referrerShareId,
        inviteeId: inviteeShareId,
        visitedAt: FieldValue.serverTimestamp(),
        completedAt: null,
        rewardClaimed: false,
      });

      // Increment referrer's total referral count
      await db
        .collection("sessions")
        .doc(referrerShareId)
        .update({
          "referralStats.totalReferrals": FieldValue.increment(1),
        });
    }

    return true;
  } catch (error) {
    console.error("[ReferralTracking] Error recording visit:", error);
    return false;
  }
}

/**
 * Mark a referral as completed (when invitee finishes their session)
 */
export async function completeReferral(inviteeShareId: string): Promise<{
  success: boolean;
  referrerId?: string;
}> {
  const db = getDb();

  try {
    // Find referral by invitee
    const referralsQuery = await db
      .collection("referrals")
      .where("inviteeId", "==", inviteeShareId)
      .where("completedAt", "==", null)
      .limit(1)
      .get();

    if (referralsQuery.empty) {
      return { success: false };
    }

    const referralDoc = referralsQuery.docs[0];
    const referralData = referralDoc.data() as ReferralData;

    // Update referral as completed
    await referralDoc.ref.update({
      completedAt: FieldValue.serverTimestamp(),
    });

    // Increment referrer's completed count
    await db
      .collection("sessions")
      .doc(referralData.referrerId)
      .update({
        "referralStats.completedReferrals": FieldValue.increment(1),
      });

    return {
      success: true,
      referrerId: referralData.referrerId,
    };
  } catch (error) {
    console.error("[ReferralTracking] Error completing referral:", error);
    return { success: false };
  }
}

/**
 * Claim reward for successful referral
 */
export async function claimReferralReward(
  referrerShareId: string
): Promise<{
  success: boolean;
  rewardsAvailable: number;
}> {
  const db = getDb();

  try {
    // Count unclaimed completed referrals
    const unclaimedQuery = await db
      .collection("referrals")
      .where("referrerId", "==", referrerShareId)
      .where("completedAt", "!=", null)
      .where("rewardClaimed", "==", false)
      .get();

    if (unclaimedQuery.empty) {
      return { success: false, rewardsAvailable: 0 };
    }

    // Claim all available rewards
    const batch = db.batch();
    for (const doc of unclaimedQuery.docs) {
      batch.update(doc.ref, { rewardClaimed: true });
    }
    await batch.commit();

    // Update referrer's rewards claimed count
    await db
      .collection("sessions")
      .doc(referrerShareId)
      .update({
        "referralStats.rewardsClaimed": FieldValue.increment(unclaimedQuery.size),
        // Unlock social pack as reward
        "unlockState.unlocked": true,
        "unlockState.unlockType": "social_pack",
        "unlockState.unlockedVia": "referral_reward",
      });

    return {
      success: true,
      rewardsAvailable: unclaimedQuery.size,
    };
  } catch (error) {
    console.error("[ReferralTracking] Error claiming reward:", error);
    return { success: false, rewardsAvailable: 0 };
  }
}

/**
 * Get referrer stats
 */
export async function getReferrerStats(shareId: string): Promise<ReferrerStats | null> {
  const db = getDb();

  try {
    const snap = await db.collection("sessions").doc(shareId).get();
    if (!snap.exists) {
      return null;
    }

    const data = snap.data() as { referralStats?: ReferrerStats };
    return (
      data.referralStats || {
        totalReferrals: 0,
        completedReferrals: 0,
        rewardsClaimed: 0,
      }
    );
  } catch (error) {
    console.error("[ReferralTracking] Error getting stats:", error);
    return null;
  }
}

/**
 * Generate referral URL
 */
export function generateReferralUrl(shareId: string, baseUrl?: string): string {
  const base =
    baseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";
  return `${base}/s/${shareId}?ref=${shareId}`;
}
