import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * Strip PII from Sentry events before they leave the browser.
 * Redacts emails everywhere and drops sensitive keys from nested objects.
 * Defense-in-depth on top of not intentionally sending PII.
 */
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function scrub(value: string): string {
  return value.replace(EMAIL_RE, "[redacted-email]");
}

function scrubDeep<T>(input: T, depth = 0): T {
  if (depth > 6 || input == null) return input;
  if (typeof input === "string") return scrub(input) as unknown as T;
  if (Array.isArray(input)) return input.map((v) => scrubDeep(v, depth + 1)) as unknown as T;
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (/email|token|authorization|cookie|password|secret/i.test(k)) {
        out[k] = "[redacted]";
      } else {
        out[k] = scrubDeep(v, depth + 1);
      }
    }
    return out as unknown as T;
  }
  return input;
}

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  replaysSessionSampleRate: 0.05,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request?.query_string && typeof event.request.query_string === "string") {
      event.request.query_string = scrub(event.request.query_string);
    }
    if (event.request?.url) event.request.url = scrub(event.request.url);
    if (event.message) event.message = scrub(event.message);
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((ex) => ({
        ...ex,
        value: ex.value ? scrub(ex.value) : ex.value,
      }));
    }
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b) => ({
        ...b,
        message: b.message ? scrub(b.message) : b.message,
        data: b.data ? scrubDeep(b.data) : b.data,
      }));
    }
    return event;
  },
});
