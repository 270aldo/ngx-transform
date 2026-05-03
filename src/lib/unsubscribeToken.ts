/**
 * Signed unsubscribe tokens for email links.
 *
 * Format: `<base64url(payload)>.<hex(HMAC-SHA256(payload, secret))>`
 * Payload: `${email}:${shareId|""}:${iatUnixSeconds}`
 *
 * Why HMAC and not just opaque tokens? We need to encode the
 * unsubscribe target (email + optional shareId) WITHOUT a Firestore
 * round-trip on every click. The HMAC proves the link came from us.
 *
 * Tracked in docs/AUDIT_2026_05_BACKLOG.md AUDIT-006.
 *
 * TTL: tokens expire after `UNSUBSCRIBE_TOKEN_TTL_DAYS` (default 60).
 * Email D14 of the sequence is the latest send, +30 days for users to
 * eventually click through gives ~60-90 days as a safe upper bound.
 */
import { createHmac, timingSafeEqual } from "crypto";

const TTL_DAYS = Number(process.env.UNSUBSCRIBE_TOKEN_TTL_DAYS || "60");
const TTL_SECONDS = TTL_DAYS * 86400;

function getSecret(): string | null {
  // Prefer a dedicated secret; fall back to CRON_API_KEY so ops can
  // ship without a separate setup step.
  return (
    process.env.UNSUBSCRIBE_HMAC_SECRET ||
    process.env.CRON_API_KEY ||
    null
  );
}

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

export function signUnsubscribeToken(email: string, shareId?: string | null): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const iat = Math.floor(Date.now() / 1000);
  const payload = `${email}:${shareId || ""}:${iat}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${base64urlEncode(Buffer.from(payload))}.${sig}`;
}

export type UnsubscribeVerifyResult =
  | { ok: true; email: string; shareId: string | null; iat: number }
  | { ok: false; reason: string };

export function verifyUnsubscribeToken(token: string): UnsubscribeVerifyResult {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: "secret not configured" };
  if (!token) return { ok: false, reason: "missing token" };

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

  // payload = email:shareId:iat — split on LAST two colons since email
  // can technically contain colons (rare but legal in local-part).
  const lastColon = payloadStr.lastIndexOf(":");
  if (lastColon < 0) return { ok: false, reason: "malformed payload" };
  const iatStr = payloadStr.slice(lastColon + 1);
  const beforeIat = payloadStr.slice(0, lastColon);
  const secondColon = beforeIat.lastIndexOf(":");
  if (secondColon < 0) return { ok: false, reason: "malformed payload" };
  const email = beforeIat.slice(0, secondColon);
  const shareIdRaw = beforeIat.slice(secondColon + 1);
  const shareId = shareIdRaw === "" ? null : shareIdRaw;
  const iat = Number(iatStr);
  if (!Number.isFinite(iat)) return { ok: false, reason: "invalid iat" };

  // TTL check
  const now = Math.floor(Date.now() / 1000);
  if (iat > now + 60) return { ok: false, reason: "token from future" };
  if (now - iat > TTL_SECONDS) return { ok: false, reason: "token expired" };

  // Signature check
  const expectedSig = createHmac("sha256", secret).update(payloadStr).digest("hex");
  if (!safeEqualHex(sig, expectedSig)) {
    return { ok: false, reason: "bad signature" };
  }

  return { ok: true, email, shareId, iat };
}

/**
 * Build a full unsubscribe URL for use in email templates.
 * Returns null if no secret is configured (caller should fall back
 * to the legacy email-in-querystring URL).
 */
export function buildUnsubscribeUrl(
  baseUrl: string,
  email: string,
  shareId?: string | null
): string | null {
  const token = signUnsubscribeToken(email, shareId);
  if (!token) return null;
  const safeBase = baseUrl.replace(/\/+$/, "");
  return `${safeBase}/api/unsubscribe?u=${encodeURIComponent(token)}`;
}
