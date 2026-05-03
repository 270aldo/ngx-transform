/**
 * Worker token auth for AI generation endpoints.
 *
 * v1 (legacy) — accepted as-is until 2026-06-01 with Sentry warning:
 *   token === process.env.AI_WORKER_TOKEN
 * v2 (current) — short-lived, scoped to sessionId:
 *   `<base64url(payload)>.<hex(HMAC-SHA256(payload, AI_WORKER_TOKEN))>`
 *   payload = `${sessionId}:${iatUnixSeconds}`
 *
 * Verification rules:
 *   1. HMAC must match (timing-safe compare)
 *   2. sessionId in payload must match the request's sessionId
 *   3. iat must be within WORKER_TOKEN_TTL_SECONDS (default 300 = 5 min)
 *
 * If the AI_WORKER_TOKEN secret leaks an attacker still needs to mint a
 * fresh signed token per sessionId per 5-minute window.
 *
 * Tracked in docs/AUDIT_2026_05_BACKLOG.md AUDIT-004.
 */
import { createHmac, timingSafeEqual } from "crypto";
import * as Sentry from "@sentry/nextjs";

const TTL_SECONDS = Number(process.env.WORKER_TOKEN_TTL_SECONDS || "300");

export type WorkerVerifyResult =
  | { ok: true; legacy: false }
  | { ok: true; legacy: true } // accepted via legacy path, emit warning
  | { ok: false; reason: string };

function base64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Sign a worker token for a given sessionId.
 * Use this in scripts/cron/n8n that hit /api/generate-images.
 */
export function signWorkerToken(sessionId: string, secret?: string): string {
  const key = secret || process.env.AI_WORKER_TOKEN || "";
  if (!key) throw new Error("AI_WORKER_TOKEN not configured");
  const iat = Math.floor(Date.now() / 1000);
  const payload = `${sessionId}:${iat}`;
  const sig = createHmac("sha256", key).update(payload).digest("hex");
  return `${base64urlEncode(Buffer.from(payload))}.${sig}`;
}

/**
 * Verify a token submitted via x-worker-token header.
 * `expectedSessionId` should be the sessionId parsed from the request body.
 */
export function verifyWorkerToken(
  token: string,
  expectedSessionId: string
): WorkerVerifyResult {
  const secret = process.env.AI_WORKER_TOKEN || "";
  if (!secret) return { ok: false, reason: "AI_WORKER_TOKEN not configured" };
  if (!token) return { ok: false, reason: "missing token" };

  // Legacy path: raw secret comparison. Accepted with warning until removal.
  // Constant-length compare via timingSafeEqual.
  if (token.length === secret.length) {
    let isLegacyMatch = false;
    try {
      isLegacyMatch = timingSafeEqual(Buffer.from(token), Buffer.from(secret));
    } catch {
      // length mismatch will throw; ignore
    }
    if (isLegacyMatch) {
      Sentry.captureMessage("worker_auth.legacy_token_used", {
        level: "warning",
        tags: { component: "workerAuth", path: "legacy" },
        extra: { sessionId: expectedSessionId },
      });
      return { ok: true, legacy: true };
    }
  }

  // v2 path: payload.signature
  const dot = token.indexOf(".");
  if (dot < 0) return { ok: false, reason: "malformed token" };
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payloadStr: string;
  try {
    payloadStr = base64urlDecode(payloadB64).toString("utf8");
  } catch {
    return { ok: false, reason: "invalid payload encoding" };
  }

  const colon = payloadStr.indexOf(":");
  if (colon < 0) return { ok: false, reason: "malformed payload" };
  const tokenSessionId = payloadStr.slice(0, colon);
  const iatStr = payloadStr.slice(colon + 1);
  const iat = Number(iatStr);
  if (!Number.isFinite(iat)) return { ok: false, reason: "invalid iat" };

  // Verify sessionId scope
  if (tokenSessionId !== expectedSessionId) {
    return { ok: false, reason: "session mismatch" };
  }

  // Verify TTL — also reject tokens too far in the future (clock skew abuse)
  const now = Math.floor(Date.now() / 1000);
  if (iat > now + 60) return { ok: false, reason: "token from future" };
  if (now - iat > TTL_SECONDS) return { ok: false, reason: "token expired" };

  // Verify signature
  const expectedSig = createHmac("sha256", secret).update(payloadStr).digest("hex");
  if (!safeEqualHex(sig, expectedSig)) {
    return { ok: false, reason: "bad signature" };
  }

  return { ok: true, legacy: false };
}
