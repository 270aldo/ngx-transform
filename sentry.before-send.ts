/**
 * Sentry beforeSend PII filter — shared by client/server/edge configs.
 *
 * Redacts known-PII paths before events leave the runtime. Matches GDPR
 * Art. 32 (data processor obligations) for fields we collect:
 *   - email addresses
 *   - photo paths / signed URLs (could leak per-session content)
 *   - biometric data (age, weightKg, heightCm)
 *   - auth headers (Authorization, x-cron-key, x-worker-token, X-Api-Key)
 *
 * Tracked in AUDIT-038. Heuristic, not airtight — but cuts the obvious
 * leak surface. If a future field name needs redacting, add to the
 * SENSITIVE_KEYS set below.
 */
import type { ErrorEvent, EventHint } from "@sentry/nextjs";

const SENSITIVE_KEYS = new Set<string>([
  // Identifiers
  "email",
  "ownerEmail",
  "userEmail",
  "to", // resend `to:` recipient
  // Photo / file paths
  "photo",
  "photoPath",
  "photoStoragePath",
  "originalStoragePath",
  "originalUrl",
  "imageUrl",
  // Biometrics (collected in the wizard)
  "age",
  "weightKg",
  "heightCm",
  // Tokens/secrets
  "deleteToken",
  "workerToken",
  "x-worker-token",
  "x-cron-key",
  "X-Api-Key",
  "x-api-key",
  "authorization",
  "Authorization",
  "Bearer",
]);

const REDACTED = "[REDACTED]";
const MAX_DEPTH = 6;

function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return REDACTED;
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((v) => redact(v, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = REDACTED;
      } else {
        out[k] = redact(v, depth + 1);
      }
    }
    return out;
  }
  // Primitive: also redact obvious email patterns embedded in strings
  if (typeof value === "string") {
    return value.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[email-redacted]"
    );
  }
  return value;
}

export function sanitizeEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent {
  // request body / headers
  if (event.request) {
    if (event.request.data && typeof event.request.data === "object") {
      event.request.data = redact(event.request.data) as typeof event.request.data;
    }
    if (event.request.headers) {
      event.request.headers = redact(event.request.headers) as typeof event.request.headers;
    }
    if (typeof event.request.cookies === "object" && event.request.cookies) {
      event.request.cookies = redact(event.request.cookies) as typeof event.request.cookies;
    }
    if (typeof event.request.query_string === "string") {
      // Strip ?email= and ?token= patterns from query strings
      event.request.query_string = event.request.query_string
        .replace(/([?&])(email|token|u)=[^&]*/gi, "$1$2=[REDACTED]");
    }
  }

  // user object — Sentry attaches some by default; clear it unless we
  // explicitly want it
  if (event.user) {
    event.user = redact(event.user) as typeof event.user;
  }

  // breadcrumbs (e.g., fetch URLs, console logs)
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((b) => {
      if (b.data) b.data = redact(b.data) as typeof b.data;
      if (typeof b.message === "string") {
        b.message = b.message.replace(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          "[email-redacted]"
        );
      }
      return b;
    });
  }

  // extras / tags / contexts
  if (event.extra) event.extra = redact(event.extra) as typeof event.extra;
  if (event.contexts) event.contexts = redact(event.contexts) as typeof event.contexts;

  return event;
}
