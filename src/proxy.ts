/**
 * Security Proxy (Next.js 16 middleware) — `proxy.ts` is the new
 * filename for what used to be `middleware.ts` in Next.js ≤15.
 * See https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Implements:
 * - Nonce-based CSP with `'strict-dynamic'`
 * - HSTS, X-Frame-Options, X-Content-Type-Options
 * - Referrer-Policy, Permissions-Policy
 * - Origin validation on /api/* routes
 *
 * Rollout strategy (controlled by CSP_ENFORCE env var):
 * - Default (CSP_ENFORCE != "true"): emits Content-Security-Policy-Report-Only
 *   so violations are reported via /api/csp-report without breaking the page.
 * - CSP_ENFORCE=true: enforces the policy.
 *
 * Tracked in docs/AUDIT_2026_05_BACKLOG.md AUDIT-001.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateNonce(): string {
  // Edge-runtime safe: Web Crypto is global.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function buildCSP(nonce: string, isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],

    // Scripts: nonce + strict-dynamic; whitelist Sentry CDN.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://browser.sentry-cdn.com",
      "https://js.sentry-cdn.com",
      "https://*.google.com",
      "https://*.gstatic.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "script-src-elem": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://browser.sentry-cdn.com",
      "https://js.sentry-cdn.com",
      "https://*.google.com",
      "https://*.gstatic.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],

    // Styles: 'unsafe-inline' kept here only — required by Next.js + react-dom
    // injecting inline style attributes. style-src is much less risky than
    // script-src for inline content.
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],
    "style-src-elem": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],

    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://*.googleusercontent.com",
      "https://storage.googleapis.com",
      "https://*.firebasestorage.app",
      "https://firebasestorage.googleapis.com",
      "https://*.vercel.app",
      "https://images.unsplash.com",
      "https://grainy-gradients.vercel.app",
    ],

    "font-src": [
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
    ],

    "connect-src": [
      "'self'",
      // Google Cloud + Gemini
      "https://*.googleapis.com",
      "https://generativelanguage.googleapis.com",
      // Firebase
      "https://*.firebaseio.com",
      "https://*.firebasestorage.app",
      "https://firebasestorage.googleapis.com",
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
      ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
    ],

    "frame-src": [
      "'self'",
      "https://*.firebaseapp.com",
      "https://accounts.google.com",
      "https://calendly.com",
    ],

    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
    "report-uri": ["/api/csp-report"],
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length === 0 ? key : `${key} ${values.join(" ")}`))
    .join("; ");
}

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const enforceCSP = process.env.CSP_ENFORCE === "true";

  // Generate a per-request nonce and propagate via request headers so
  // Server Components can read it with `headers().get('x-nonce')`.
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Expose nonce on the response too, for inline <script nonce={...}> usage.
  response.headers.set("x-nonce", nonce);

  // Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // Content Security Policy
  const csp = buildCSP(nonce, isDev);
  if (enforceCSP) {
    response.headers.set("Content-Security-Policy", csp);
  } else {
    // Default: report-only so we collect violations without breaking the
    // page during the 7-day observation window described in AUDIT-001.
    response.headers.set("Content-Security-Policy-Report-Only", csp);
  }

  // Origin validation for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // In production, validate origin matches host
    if (!isDev && origin) {
      const isLocalHost = Boolean(host && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host));
      const allowedOrigins = [
        `https://${host}`,
        ...(isLocalHost ? [`http://${host}`, `https://${host}`] : []),
        "https://ngx-transform.vercel.app",
        // Add your production domains here
      ];

      if (!allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        console.warn(`[Proxy] Blocked request from origin: ${origin}`);
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known
     */
    "/((?!_next/static|_next/image|favicon.ico|.well-known|robots.txt|sitemap.xml).*)",
  ],
};
