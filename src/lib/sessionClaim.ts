import type { Firestore } from "firebase-admin/firestore";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

/**
 * Server-side session claim (fix-07): reassign `ownerUid` of the sessions whose
 * email matches a VERIFIED email, but only when the current owner is an
 * anonymous account (or no longer exists). Never steals a session owned by a
 * permanent account, and never accepts a client-supplied shareId — knowing a
 * foreign shareId buys nothing.
 */
export interface ClaimResult {
  claimed: number;
  skipped: number;
  claimedShareIds: string[];
}

/** Reclamable = anonymous account (no providers) or a uid that no longer exists. */
export async function isClaimableOwner(
  adminAuth: Auth,
  ownerUid: string,
): Promise<boolean> {
  try {
    const userRecord = await adminAuth.getUser(ownerUid);
    return userRecord.providerData.length === 0;
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      (e as { code?: string }).code === "auth/user-not-found"
    ) {
      return true;
    }
    throw e;
  }
}

export async function claimSessionsForUser(
  db: Firestore,
  adminAuth: Auth,
  user: { uid: string; email: string },
): Promise<ClaimResult> {
  const emailLower = user.email.toLowerCase();

  // Candidates: the new emailLower field + the legacy `email` (Firebase Auth
  // normalizes emails to lowercase, so this covers the vast majority; legacy
  // mixed-case docs would need a backfill — out of scope).
  const [byLower, byLegacy] = await Promise.all([
    db.collection("sessions").where("emailLower", "==", emailLower).limit(50).get(),
    db
      .collection("sessions")
      .where("email", "in", [...new Set([user.email, emailLower])])
      .limit(50)
      .get(),
  ]);

  const candidates = new Map<
    string,
    FirebaseFirestore.QueryDocumentSnapshot
  >();
  for (const snap of [byLower, byLegacy]) {
    for (const doc of snap.docs) candidates.set(doc.id, doc);
  }

  const claimableCache = new Map<string, boolean>();
  let claimed = 0;
  let skipped = 0;
  const claimedShareIds: string[] = [];

  for (const doc of candidates.values()) {
    const ownerUid: string | undefined = doc.data().ownerUid;
    // Already ours (or ownerless) — doesn't count toward either tally.
    if (!ownerUid || ownerUid === user.uid) continue;

    let claimable = claimableCache.get(ownerUid);
    if (claimable === undefined) {
      claimable = await isClaimableOwner(adminAuth, ownerUid);
      claimableCache.set(ownerUid, claimable);
    }
    if (!claimable) {
      skipped++;
      continue;
    }

    const ref = doc.ref;
    const reassigned = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      if (fresh.data()?.ownerUid !== ownerUid) return false; // changed since read
      tx.update(ref, {
        ownerUid: user.uid,
        emailLower,
        // serverTimestamp() is rejected inside arrayUnion — use Timestamp.now().
        ownerHistory: FieldValue.arrayUnion({
          uid: ownerUid,
          replacedAt: Timestamp.now(),
          method: "email_claim",
        }),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });

    if (reassigned) {
      claimed++;
      claimedShareIds.push(doc.id);
    } else {
      skipped++;
    }
  }

  return { claimed, skipped, claimedShareIds };
}
