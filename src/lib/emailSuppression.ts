import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isEmailSuppressed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const db = getDb();
  const doc = await db.collection("email_suppressions").doc(normalizeEmail(email)).get();
  return doc.exists;
}

export async function suppressEmail(
  email: string,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = getDb();
  const normalized = normalizeEmail(email);
  await db.collection("email_suppressions").doc(normalized).set(
    {
      email: normalized,
      reason,
      metadata: metadata || null,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
