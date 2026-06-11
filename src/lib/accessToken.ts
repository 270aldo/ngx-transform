import { createHmac } from "crypto";
import { secureCompare } from "@/lib/crypto";

/**
 * HMAC-signed, per-shareId access token (fix-08). Carried in the `?access=`
 * query of email links so a returning lead on a new device / after ITP purged
 * the anonymous credential can re-anchor ownership of their session. Same shape
 * as unsubscribeToken; secret falls back to CRON_API_KEY.
 */
const TOKEN_VERSION = "v1";

function getAccessSecret(): string | null {
  return process.env.ACCESS_TOKEN_SECRET || process.env.CRON_API_KEY || null;
}

export function generateAccessToken(shareId: string): string {
  const secret = getAccessSecret();
  if (!secret) return "";

  const digest = createHmac("sha256", secret)
    .update(`${TOKEN_VERSION}:access:${shareId}`)
    .digest("base64url");

  return `${TOKEN_VERSION}.${digest}`;
}

export function verifyAccessToken(
  shareId: string,
  token: string | null | undefined,
): boolean {
  const expected = generateAccessToken(shareId);
  if (!expected) return false;
  return secureCompare(token, expected);
}
