import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Generate nonce for inline scripts (CSP)
function generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Buffer.from(array).toString("base64");
}

// Build Content Security Policy
function buildCSP(nonce: string, isDev: boolean): string {
    const directives: Record<string, string[]> = {
        "default-src": ["'self'"],
        "script-src": [
            "'self'",
            `'nonce-${nonce}'`,
            "'strict-dynamic'",
            // Next.js requires unsafe-eval in dev mode
            ...(isDev ? ["'unsafe-eval'"] : []),
        ],
        "style-src": [
            "'self'",
            "'unsafe-inline'", // Required for styled-jsx and inline styles
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
            // Vercel analytics
            "https://vitals.vercel-insights.com",
            ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
        ],
        "frame-src": [
            "'self'",
            "https://*.firebaseapp.com",
        ],
        "frame-ancestors": ["'self'"],
        "form-action": ["'self'"],
        "base-uri": ["'self'"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
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
    const nonce = generateNonce();

    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Content Security Policy
    const csp = buildCSP(nonce, isDev);
    response.headers.set("Content-Security-Policy", csp);

    // Pass nonce to the page for inline scripts
    response.headers.set("x-nonce", nonce);

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
                // Uncomment to enforce:
                // return new NextResponse("Forbidden", { status: 403 });
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
