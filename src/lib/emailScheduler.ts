/**
 * Email Scheduler - Viral Optimization Sprint v2.1
 *
 * Manages the nurture email sequence:
 * D0 - Results ready (immediate)
 * D1 - Reminder (24h after)
 * D3 - Plan available (72h after)
 * D7 - Conversion (168h after)
 */

import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type EmailStage = "D0" | "D1" | "D3" | "D7";

export interface EmailSequence {
  id: string;
  email: string;
  shareId: string;
  name?: string;
  status: "active" | "completed" | "unsubscribed";
  stage: EmailStage;
  sentEmails: EmailStage[];
  nextSend: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Days to wait before each email
const STAGE_DELAYS: Record<EmailStage, number> = {
  D0: 0,
  D1: 1,
  D3: 3,
  D7: 7,
};

// Next stage mapping
const NEXT_STAGE: Record<EmailStage, EmailStage | null> = {
  D0: "D1",
  D1: "D3",
  D3: "D7",
  D7: null,
};

/**
 * Start a new email sequence for a user
 */
export async function startEmailSequence(
  email: string,
  shareId: string,
  name?: string
): Promise<string> {
  const db = getDb();
  const sequenceRef = db.collection("email_sequences").doc(shareId);

  const existing = await sequenceRef.get();
  if (existing.exists) {
    // Already has a sequence, return existing
    return shareId;
  }

  const sequence: Omit<EmailSequence, "createdAt" | "updatedAt" | "nextSend"> & {
    createdAt: FieldValue;
    updatedAt: FieldValue;
    nextSend: Date;
  } = {
    id: shareId,
    email,
    shareId,
    name,
    status: "active",
    stage: "D0",
    sentEmails: [],
    nextSend: new Date(), // Send D0 immediately
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await sequenceRef.set(sequence);
  return shareId;
}

/**
 * Get current sequence status
 */
export async function getSequenceStatus(
  shareId: string
): Promise<EmailSequence | null> {
  const db = getDb();
  const doc = await db.collection("email_sequences").doc(shareId).get();

  if (!doc.exists) return null;
  return doc.data() as EmailSequence;
}

/**
 * Advance sequence to next stage after sending email
 */
export async function advanceSequence(shareId: string): Promise<EmailStage | null> {
  const db = getDb();
  const sequenceRef = db.collection("email_sequences").doc(shareId);

  const doc = await sequenceRef.get();
  if (!doc.exists) return null;

  const sequence = doc.data() as EmailSequence;
  const nextStage = NEXT_STAGE[sequence.stage];

  if (!nextStage) {
    // Sequence complete
    await sequenceRef.update({
      status: "completed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return null;
  }

  // Calculate next send time
  const delayDays = STAGE_DELAYS[nextStage];
  const nextSend = new Date();
  nextSend.setDate(nextSend.getDate() + delayDays);

  await sequenceRef.update({
    stage: nextStage,
    sentEmails: FieldValue.arrayUnion(sequence.stage),
    nextSend,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return nextStage;
}

/**
 * Mark email as sent for current stage
 */
export async function markEmailSent(shareId: string, stage: EmailStage): Promise<void> {
  const db = getDb();
  const sequenceRef = db.collection("email_sequences").doc(shareId);

  await sequenceRef.update({
    sentEmails: FieldValue.arrayUnion(stage),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Unsubscribe from sequence
 */
export async function unsubscribeSequence(shareId: string): Promise<void> {
  const db = getDb();
  const sequenceRef = db.collection("email_sequences").doc(shareId);

  await sequenceRef.update({
    status: "unsubscribed",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Get all sequences due for sending
 * (for cron job / background worker)
 */
export async function getDueSequences(): Promise<EmailSequence[]> {
  const db = getDb();
  const now = new Date();

  const snapshot = await db
    .collection("email_sequences")
    .where("status", "==", "active")
    .where("nextSend", "<=", Timestamp.fromDate(now))
    .limit(100) // Process in batches
    .get();

  return snapshot.docs.map((doc) => doc.data() as EmailSequence);
}

/**
 * Get email subject for stage
 */
export function getEmailSubject(stage: EmailStage): string {
  const subjects: Record<EmailStage, string> = {
    D0: "Tu transformación de 12 meses está lista 🔥",
    D1: "¿Ya viste tu transformación completa? 👀",
    D3: "Tu plan personalizado de 7 días está listo 📋",
    D7: "¿Listo para hacer esto real? 🚀",
  };
  return subjects[stage];
}

/**
 * Check if a stage has been sent
 */
export function hasSentStage(sequence: EmailSequence, stage: EmailStage): boolean {
  return sequence.sentEmails.includes(stage);
}
