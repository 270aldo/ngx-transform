## 2024-04-06 - [Prevent Timing Attacks and Error Information Leakage]
**Vulnerability:**
1. API endpoints used standard string comparisons (`===` or `!==`) for `CRON_API_KEY` validation, which is vulnerable to timing attacks that could allow an attacker to guess the API key.
2. Several Next.js API endpoints returned `e.message` directly in 500 status responses for generic exceptions, which could unintentionally leak sensitive internal details (e.g. database schema details, downstream external API failures, or internal server state).

**Learning:**
1. While `CRON_API_KEY` might be used for internal triggers, treating it with standard security hygiene (constant-time comparison) is critical because it represents an entry point into internal processes.
2. JavaScript's `e.message` can carry internal stack or unscrubbed diagnostic strings from upstream modules, which is unsafe to surface to end users in a public API.

**Prevention:**
1. Created `secureCompare` in `src/lib/crypto.ts` which uses Node's `crypto.timingSafeEqual` and replaced standard comparisons across `src/app/api/` with this helper.
2. Replaced `return NextResponse.json({ error: message }, { status: 500 });` with `return NextResponse.json({ error: "Internal server error" }, { status: 500 });` in catch blocks across API endpoints, ensuring errors are logged internally via `console.error` but hidden from the HTTP response.
