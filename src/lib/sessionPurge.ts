/**
 * Single source of truth for deleting the data *linked to* a session — used by
 * both the user-initiated DELETE and the retention cron, so neither one leaves
 * derived copies of body-photo-derived data behind (LFPDPPP, fix-10).
 *
 * Deliberately defensive: never throws. Storage/Firestore failures are logged
 * so one bad artifact can't abort a batch cleanup.
 */
import { deletePrefix } from "@/lib/storage";

const CHUNK_SIZE = 10; // Firestore 'in' query max

/**
 * Deletes data derived from / linked to a set of sessions across Firestore +
 * Storage. Does NOT delete the `sessions` doc or the original photo / generated
 * images — the caller handles those.
 */
export async function purgeSessionLinkedData(
  db: FirebaseFirestore.Firestore,
  sessionIds: string[],
): Promise<void> {
  if (sessionIds.length === 0) return;

  try {
    for (let i = 0; i < sessionIds.length; i += CHUNK_SIZE) {
      const chunk = sessionIds.slice(i, i + CHUNK_SIZE);

      // Collections that store the sessionId as a field (not the doc id).
      for (const collection of ["jobs", "session_metrics"]) {
        const snap = await db
          .collection(collection)
          .where("sessionId", "in", chunk)
          .get();
        if (!snap.empty) {
          const batch = db.batch();
          snap.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
        }
      }

      // Collections keyed BY the shareId — delete directly (missing doc is fine).
      const batch = db.batch();
      for (const id of chunk) {
        batch.delete(db.collection("transform_reports").doc(id));
        batch.delete(db.collection("email_sequences").doc(id));
      }
      await batch.commit();

      // The report PDF lives under a different Storage prefix than sessions/.
      await Promise.allSettled(
        chunk.map((id) => deletePrefix(`reports/${id}/`)),
      );
    }
  } catch (error) {
    console.error("[sessionPurge] purgeSessionLinkedData error:", error);
  }
}

/**
 * Deletes lead/marketing records tied to an email. Only for user-initiated
 * deletion (a cancellation): someone exercising their right to be deleted
 * expects to vanish from marketing. The lead is recreated if they return to the
 * wizard. NOT added to email_suppressions (that retains the email; it is for
 * opt-out via /api/unsubscribe, not cancellation).
 */
export async function purgeLeadRecords(
  db: FirebaseFirestore.Firestore,
  email: string | undefined | null,
): Promise<void> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return;

  try {
    const batch = db.batch();
    batch.delete(db.collection("leads").doc(normalized));
    batch.delete(db.collection("remarketing_leads").doc(normalized));
    await batch.commit();
  } catch (error) {
    console.error("[sessionPurge] purgeLeadRecords error:", error);
  }
}
