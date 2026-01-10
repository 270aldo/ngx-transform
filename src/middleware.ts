import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Build Content Security Policy (Static/SSG Compatible)
function buildCSP(isDev: boolean): string {
    const directives: Record<string, string[]> = {
        "default-src": ["'self'"],
        "script-src": [
            "'self'",
            "'unsafe-inline'", // Needed for Next.js inline scripts in some modes
            ...(isDev ? ["'unsafe-eval'"] : []),
            "https://*.google.com",
            "https://*.gstatic.com",
        ],
        "script-src-elem": [
            "'self'",
            "'unsafe-inline'",
            ...(isDev ? ["'unsafe-eval'"] : []),
            "https://*.google.com",
            "https://*.gstatic.com",
        ],
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
            ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
        ],
        "frame-src": [
            "'self'",
            "https://*.firebaseapp.com",
            "https://accounts.google.com",
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

export function middleware(request: NextRequest) {
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

    // Content Security Policy
    const csp = buildCSP(isDev);
    response.headers.set("Content-Security-Policy", csp);
    if (!isDev) {
        response.headers.set("Content-Security-Policy-Report-Only", csp);
    }

    // Origin validation for API routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");

        // In production, validate origin matches host
        if (!isDev && origin) {
            const allowedOrigins = [
                `https://${host}`,
                "https://ngx-transform.vercel.app",
                // Add your production domains here
            ];

            if (!allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
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
