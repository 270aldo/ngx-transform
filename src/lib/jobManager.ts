/**
 * Job Manager para NGX Transform
 *
 * Proporciona jobs idempotentes y reanudables:
 * - Si un job ya está completado, no se re-ejecuta
 * - Si un job fue interrumpido, continúa donde quedó
 * - Retry automático con exponential backoff
 */

import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// ============================================================================
// Types
// ============================================================================

export type JobType = "analysis" | "image_generation";

export type JobStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "partial";

export interface JobState {
  jobId: string;
  sessionId: string;
  type: JobType;
  status: JobStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  progress?: Record<string, boolean>; // Para image_generation: { m4: true, m8: false, m12: false }
  startedAt?: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  deleteToken?: string; // Token para acciones destructivas
}

export interface JobConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  generateDeleteToken?: boolean;
}

const DEFAULT_CONFIG: Required<JobConfig> = {
  maxRetries: 3,
  retryDelayMs: 1000,
  generateDeleteToken: true,
};

// ============================================================================
// Job Creation & Management
// ============================================================================

/**
 * Obtiene o crea un job para una sesión
 * Si el job ya existe y está completo, retorna el estado sin re-crear
 */
export async function getOrCreateJob(
  sessionId: string,
  type: JobType,
  config: JobConfig = {}
): Promise<JobState> {
  const db = getDb();
  const jobId = `${sessionId}_${type}`;
  const jobRef = db.collection("jobs").doc(jobId);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const snap = await jobRef.get();

  if (snap.exists) {
    const existing = snap.data() as JobState;

    // Si está completo, no re-crear
    if (existing.status === "completed") {
      console.log(`[JobManager] Job ${jobId} already completed, skipping`);
      return existing;
    }

    // Si está en progreso por más de 10 minutos, considerar como stale
    if (existing.status === "in_progress" && existing.startedAt) {
      const startedAt = existing.startedAt.toDate();
      const staleThreshold = 10 * 60 * 1000; // 10 minutos
      if (Date.now() - startedAt.getTime() > staleThreshold) {
        console.log(`[JobManager] Job ${jobId} is stale, allowing restart`);
        // Permitir reinicio
      } else {
        console.log(`[JobManager] Job ${jobId} in progress, returning state`);
        return existing;
      }
    }

    // Si falló y tiene retries disponibles, permitir retry
    if (existing.status === "failed" && existing.retryCount < mergedConfig.maxRetries) {
      console.log(`[JobManager] Job ${jobId} failed, retry ${existing.retryCount + 1}/${mergedConfig.maxRetries}`);
    }

    // Retornar estado existente para continuar
    return existing;
  }

  // Crear nuevo job
  const newJob: JobState = {
    jobId,
    sessionId,
    type,
    status: "pending",
    retryCount: 0,
    maxRetries: mergedConfig.maxRetries,
    ...(type === "image_generation" && { progress: { m4: false, m8: false, m12: false } }),
    ...(mergedConfig.generateDeleteToken && { deleteToken: generateDeleteToken() }),
  };

  // Filtrar campos undefined antes de guardar en Firestore
  const jobData = Object.fromEntries(
    Object.entries({
      ...newJob,
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }).filter(([, v]) => v !== undefined)
  );

  await jobRef.set(jobData);

  console.log(`[JobManager] Created new job ${jobId}`);
  return newJob;
}

/**
 * Marca un job como en progreso
 */
export async function markJobInProgress(jobId: string): Promise<void> {
  const db = getDb();
  await db.collection("jobs").doc(jobId).set(
    {
      status: "in_progress",
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Actualiza el progreso de un job (para image_generation)
 */
export async function updateJobProgress(
  jobId: string,
  milestone: string,
  completed: boolean
): Promise<void> {
  const db = getDb();
  await db.collection("jobs").doc(jobId).set(
    {
      [`progress.${milestone}`]: completed,
      status: "partial",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Marca un job como completado
 */
export async function markJobCompleted(jobId: string): Promise<void> {
  const db = getDb();
  await db.collection("jobs").doc(jobId).set(
    {
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`[JobManager] Job ${jobId} completed`);
}

/**
 * Marca un job como fallido
 */
export async function markJobFailed(jobId: string, error: string): Promise<void> {
  const db = getDb();
  const jobRef = db.collection("jobs").doc(jobId);

  await db.runTransaction(async (t) => {
    const snap = await t.get(jobRef);
    const current = snap.data() as JobState | undefined;
    const retryCount = (current?.retryCount || 0) + 1;

    t.set(
      jobRef,
      {
        status: "failed",
        lastError: error,
        retryCount,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  console.log(`[JobManager] Job ${jobId} failed: ${error}`);
}

/**
 * Obtiene los milestones pendientes de un job de image_generation
 */
export async function getPendingMilestones(sessionId: string): Promise<string[]> {
  const db = getDb();
  const jobId = `${sessionId}_image_generation`;
  const snap = await db.collection("jobs").doc(jobId).get();

  if (!snap.exists) {
    return ["m4", "m8", "m12"]; // Todos pendientes
  }

  const job = snap.data() as JobState;
  const progress = job.progress || {};

  return ["m4", "m8", "m12"].filter((m) => !progress[m]);
}

// ============================================================================
// Delete Token Management
// ============================================================================

/**
 * Genera un token seguro para acciones destructivas
 */
function generateDeleteToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Valida un delete token para una sesión
 */
export async function validateDeleteToken(
  sessionId: string,
  providedToken: string
): Promise<boolean> {
  // In production, always validate delete tokens regardless of feature flag
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction && (!process.env.FF_DELETE_TOKEN_REQUIRED || process.env.FF_DELETE_TOKEN_REQUIRED === "false")) {
    // Feature flag desactivado in non-production, permitir sin token
    return true;
  }

  const db = getDb();

  // Buscar en jobs (analysis tiene el token)
  const analysisJob = await db.collection("jobs").doc(`${sessionId}_analysis`).get();
  if (analysisJob.exists) {
    const job = analysisJob.data() as JobState;
    if (job.deleteToken === providedToken) {
      return true;
    }
  }

  // También buscar en la sesión misma (fallback)
  const sessionDoc = await db.collection("sessions").doc(sessionId).get();
  if (sessionDoc.exists) {
    const session = sessionDoc.data();
    if (session?.deleteToken === providedToken) {
      return true;
    }
  }

  return false;
}

/**
 * Obtiene el delete token de una sesión (para enviarlo por email)
 */
export async function getDeleteToken(sessionId: string): Promise<string | null> {
  const db = getDb();
  const jobId = `${sessionId}_analysis`;
  const snap = await db.collection("jobs").doc(jobId).get();

  if (!snap.exists) return null;

  const job = snap.data() as JobState;
  return job.deleteToken || null;
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

/**
 * Ejecuta una función con retry y exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s... capped at maxDelayMs
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms`);

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Cleanup utilities
// ============================================================================

/**
 * Limpia jobs stale (más de 24 horas sin actualización)
 * Usar en un cron job o cloud function
 */
export async function cleanupStaleJobs(): Promise<number> {
  const db = getDb();
  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const staleJobs = await db
    .collection("jobs")
    .where("status", "in", ["in_progress", "pending"])
    .where("updatedAt", "<", staleThreshold)
    .get();

  let cleaned = 0;
  for (const doc of staleJobs.docs) {
    await doc.ref.set({ status: "failed", lastError: "Stale job cleanup" }, { merge: true });
    cleaned++;
  }

  console.log(`[JobManager] Cleaned up ${cleaned} stale jobs`);
  return cleaned;
}
