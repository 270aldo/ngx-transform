import * as Sentry from "@sentry/nextjs";
import { sanitizeEvent } from "./sentry.before-send";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  beforeSend: sanitizeEvent,
});
