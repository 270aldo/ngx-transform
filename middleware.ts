/**
 * Security Middleware — Next.js 16 (Edge runtime)
 *
 * Implements:
 * - Nonce-based CSP with `'strict-dynamic'`
 * - HSTS, X-Frame-Options, X-Content-Type-Options
 * - Referrer-Policy, Permissions-Policy
 *
 * Rollout strategy (controlled by CSP_ENFORCE env var):
 * - default (CSP_ENFORCE !== "true"): Content-Security-Policy-Report-Only
 *   so violations are reported via /api/csp-report without breaking the page.
 * - CSP_ENFORCE=true: Content-Security-Policy enforced.
 *
 * Tracked in docs/AUDIT_2026_05_BACKLOG.md AUDIT-001. Replaces the
 * orphan src/proxy.ts that was never loaded by Next.js.
 */
import { NextRequest, NextResponse } from "next/server";

function generateNonce(): string {
  // Edge-runtime safe: Web Crypto is available globally.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

const isProd = process.env.NODE_ENV === "production";
const enforceCSP = process.env.CSP_ENFORCE === "true";

function buildCSP(nonce: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],

    // Scripts: nonce + strict-dynamic; allow Sentry CDN.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://browser.sentry-cdn.com",
      "https://js.sentry-cdn.com",
      // Dev: Vite/Next HMR uses inline eval
      ...(isProd ? [] : ["'unsafe-eval'"]),
    ],

    // Styles: nonce-based; Tailwind v4 emits no inline by default,
    // but Next.js + react-dom use inline style attributes which CSP
    // permits via 'unsafe-inline' for `style` (style-src) without
    // weakening script-src.
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],

    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://storage.googleapis.com",
      "https://firebasestorage.googleapis.com",
      "https://*.firebasestorage.app",
      "https://images.unsplash.com",
      "https://grainy-gradients.vercel.app",
      "https://*.googleusercontent.com",
    ],

    "connect-src": [
      "'self'",
      // Google Cloud + Gemini
      "https://*.googleapis.com",
      "https://generativelanguage.googleapis.com",
      // Firebase
      "https://*.firebaseio.com",
      "https://firebasestorage.googleapis.com",
      "https://*.firebasestorage.app",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
      // Upstash Redis (rate limiting)
      "https://*.upstash.io",
      // Vercel Insights
      "https://vitals.vercel-insights.com",
      // Sentry
      "https://*.sentry.io",
      "https://*.ingest.sentry.io",
      // ElevenLabs (voice)
      "https://api.elevenlabs.io",
      // Dev only
      ...(isProd ? [] : ["ws://localhost:*", "http://localhost:*"]),
    ],

    "frame-src": [
      "'self'",
      "https://*.firebaseapp.com",
      "https://accounts.google.com",
      "https://calendly.com",
    ],

    "font-src": [
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
    ],

    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length === 0 ? key : `${key} ${values.join(" ")}`))
    .join("; ");
}

function applySecurityHeaders(response: NextResponse, nonce: string) {
  // Expose nonce to RSC via request header (read with `headers().get('x-nonce')`)
  response.headers.set("x-nonce", nonce);

  // HSTS — 2 years, includeSubDomains, preload-ready
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  const csp = buildCSP(nonce);
  const cspWithReport = `${csp}; report-uri /api/csp-report`;

  if (enforceCSP) {
    response.headers.set("Content-Security-Policy", cspWithReport);
  } else {
    // Default: report-only so we collect violations without breaking the
    // page during the 7-day observation window described in AUDIT-001.
    response.headers.set("Content-Security-Policy-Report-Only", cspWithReport);
  }
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce();

  // Propagate the nonce into request headers so Server Components
  // can read it via `headers().get('x-nonce')`.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  applySecurityHeaders(response, nonce);
  return response;
}

export const config = {
  // Skip static assets and the Next image optimizer to keep cold-paths fast.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.well-known|robots.txt|sitemap.xml).*)",
  ],
};
