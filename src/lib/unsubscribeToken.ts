import { createHmac } from "crypto";
import { secureCompare } from "@/lib/crypto";

const TOKEN_VERSION = "v1";

function getUnsubscribeSecret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_API_KEY || null;
}

export function createUnsubscribeToken(shareId: string): string {
  const secret = getUnsubscribeSecret();
  if (!secret) return "";

  const digest = createHmac("sha256", secret)
    .update(`${TOKEN_VERSION}:unsubscribe:${shareId}`)
    .digest("base64url");

  return `${TOKEN_VERSION}.${digest}`;
}

export function verifyUnsubscribeToken(shareId: string, token: string | null | undefined): boolean {
  const expected = createUnsubscribeToken(shareId);
  if (!expected) return false;
  return secureCompare(token, expected);
}

export function buildUnsubscribeUrl(baseUrl: string, shareId: string): string {
  const normalizedBaseUrl = /^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
  const url = new URL("/unsubscribe", normalizedBaseUrl);
  url.searchParams.set("shareId", shareId);
  const token = createUnsubscribeToken(shareId);
  if (token) {
    url.searchParams.set("token", token);
  }
  return url.toString();
}
