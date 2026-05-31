import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Build Content Security Policy (Static/SSG Compatible)
//
// `strictScripts` produces the hardened variant used ONLY for the
// Content-Security-Policy-Report-Only header: it drops 'unsafe-inline' from
// script-src so the browser reports (without blocking) which inline scripts
// would violate a strict policy. The enforced header keeps 'unsafe-inline' so
// that statically-rendered pages (/, /privacy, /terms, /j, /m) keep working and
// stay fast. This is the standard observe-then-enforce migration path.
function buildCSP(isDev: boolean, strictScripts = false): string {
    const scriptSrc = strictScripts
        ? ["'self'", "https://*.google.com", "https://*.gstatic.com"]
        : [
              "'self'",
              "'unsafe-inline'", // Needed for Next.js inline scripts in static render
              ...(isDev ? ["'unsafe-eval'"] : []),
              "https://*.google.com",
              "https://*.gstatic.com",
          ];

    const directives: Record<string, string[]> = {
        "default-src": ["'self'"],
        "script-src": scriptSrc,
        "script-src-elem": scriptSrc,
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
        ],
        "font-src": [
            "'self'",
            "data:",
            "https://fonts.gstatic.com",
        ],
        "connect-src": [
            "'self'",
            "https://*.googleapis.com",
            "https://*.firebaseio.com",
            "https://*.firebasestorage.app",
            "https://firebasestorage.googleapis.com",
            "https://*.upstash.io",
            "https://generativelanguage.googleapis.com",
            "https://vitals.vercel-insights.com",
            "https://*.ingest.sentry.io",
            ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
        ],
        "media-src": [
            "'self'",
            "blob:",
            "data:",
            "https://storage.googleapis.com",
            "https://firebasestorage.googleapis.com",
            "https://*.firebasestorage.app",
            "https://*.googleusercontent.com",
            "https://*.vercel.app",
        ],
        "frame-src": [
            "'self'",
            "https://*.firebaseapp.com",
            "https://accounts.google.com",
            "https://calendly.com",
            "https://*.calendly.com",
            "https://www.youtube.com",
            "https://*.youtube.com",
            "https://www.youtube-nocookie.com",
            "https://player.vimeo.com",
            "https://*.vimeo.com",
            "https://*.mercadopago.com",
        ],
        "frame-ancestors": ["'self'"],
        "form-action": ["'self'"],
        "base-uri": ["'self'"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
        "report-uri": ["/api/csp-report"],
    };

    return Object.entries(directives)
        .map(([key, values]) => {
            if (values.length === 0) return key;
            return `${key} ${values.join(" ")}`;
        })
        .join("; ");
}

export function proxy(request: NextRequest) {
    const response = NextResponse.next();
    const isDev = process.env.NODE_ENV === "development";

    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Content Security Policy.
    // Enforced policy keeps 'unsafe-inline' so statically-rendered pages keep
    // working. In production we ALSO ship a stricter Report-Only policy (no
    // 'unsafe-inline' in scripts) so violations are reported to /api/csp-report
    // without breaking anything — data to drive a future move to strict CSP.
    response.headers.set("Content-Security-Policy", buildCSP(isDev));
    if (!isDev) {
        response.headers.set(
            "Content-Security-Policy-Report-Only",
            buildCSP(isDev, /* strictScripts */ true)
        );
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

            let normalizedOrigin: string;
            try {
                normalizedOrigin = new URL(origin).origin;
            } catch {
                console.warn(`[Middleware] Blocked malformed origin: ${origin}`);
                return new NextResponse("Forbidden", { status: 403 });
            }

            if (!allowedOrigins.includes(normalizedOrigin)) {
                console.warn(`[Middleware] Blocked request from origin: ${origin}`);
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
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
