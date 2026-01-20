/**
 * Remote kill switch for AI generation.
 *
 * Priority order:
 * 1) ENABLE_AI_GENERATION env var (hard override)
 * 2) Vercel Edge Config (if configured)
 * 3) Firestore doc (optional; set AI_FLAGS_FIRESTORE_PATH)
 * 4) Default enabled
 */

import { getDb } from "./firebaseAdmin";

const FLAG_KEY = "ENABLE_AI_GENERATION";
const DEFAULT_ENABLED = true;
const CACHE_TTL_MS = Number(process.env.AI_FLAG_CACHE_TTL_MS || "60000");

let cache:
  | {
      enabled: boolean;
      source: "env" | "edge-config" | "firestore" | "default";
      checkedAt: number;
    }
  | null = null;

function parseFlag(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  return null;
}

function envOverride(): boolean | null {
  const raw = process.env.ENABLE_AI_GENERATION;
  if (raw === undefined) return null;
  return parseFlag(raw);
}

async function fetchEdgeConfigFlag(): Promise<boolean | null> {
  const edgeConfigUrl = process.env.EDGE_CONFIG_URL;
  const edgeConfigId = process.env.EDGE_CONFIG_ID || process.env.VERCEL_EDGE_CONFIG_ID;
  const edgeToken = process.env.EDGE_CONFIG_TOKEN || process.env.VERCEL_EDGE_CONFIG_TOKEN;

  let endpoint: string | null = null;
  if (edgeConfigUrl) {
    endpoint = `${edgeConfigUrl.replace(/\/$/, "")}/${FLAG_KEY}`;
  } else if (edgeConfigId && edgeToken) {
    // Uses Vercel Edge Config REST API
    endpoint = `https://api.vercel.com/v1/edge-config/${edgeConfigId}/item/${FLAG_KEY}`;
  }

  if (!endpoint || !edgeToken) return null;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${edgeToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.value ?? data?.item ?? data;
    return parseFlag(raw);
  } catch (error) {
    console.warn("[AI KillSwitch] Edge Config fetch failed:", error);
    return null;
  }
}

async function fetchFirestoreFlag(): Promise<boolean | null> {
  const path = process.env.AI_FLAGS_FIRESTORE_PATH;
  if (!path) return null;

  try {
    const db = getDb();
    const snap = await db.doc(path).get();
    if (!snap.exists) return null;
    const value = snap.data()?.[FLAG_KEY];
    return parseFlag(value);
  } catch (error) {
    console.warn("[AI KillSwitch] Firestore flag fetch failed:", error);
    return null;
  }
}

export async function getAiGenerationFlag(): Promise<{
  enabled: boolean;
  source: "env" | "edge-config" | "firestore" | "default";
}> {
  if (cache && Date.now() - cache.checkedAt < CACHE_TTL_MS) {
    return { enabled: cache.enabled, source: cache.source };
  }

  const env = envOverride();
  if (env !== null) {
    cache = { enabled: env, source: "env", checkedAt: Date.now() };
    return { enabled: env, source: "env" };
  }

  const edge = await fetchEdgeConfigFlag();
  if (edge !== null) {
    cache = { enabled: edge, source: "edge-config", checkedAt: Date.now() };
    return { enabled: edge, source: "edge-config" };
  }

  const firestore = await fetchFirestoreFlag();
  if (firestore !== null) {
    cache = { enabled: firestore, source: "firestore", checkedAt: Date.now() };
    return { enabled: firestore, source: "firestore" };
  }

  cache = { enabled: DEFAULT_ENABLED, source: "default", checkedAt: Date.now() };
  return { enabled: DEFAULT_ENABLED, source: "default" };
}

export function clearAiGenerationFlagCache() {
  cache = null;
}
