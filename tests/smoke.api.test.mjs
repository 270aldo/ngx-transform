import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const shareId = process.env.TEST_SHARE_ID;
const cronApiKey = process.env.CRON_API_KEY || process.env.TEST_CRON_API_KEY;
const ownerIdToken = process.env.TEST_OWNER_ID_TOKEN;
const requireProdEnv = process.env.REQUIRE_SMOKE_ENV === "true";

function isValidHealthStatus(status) {
  return status === 200 || status === 207 || status === 401 || status === 503;
}

test("health endpoint responds", async () => {
  const headers = cronApiKey ? { "X-Api-Key": cronApiKey } : undefined;
  const res = await fetch(`${baseUrl}/api/health`, { headers });
  assert.ok(isValidHealthStatus(res.status), `Unexpected status ${res.status}`);
});

test("production-critical environment is configured when required", (t) => {
  if (!requireProdEnv) {
    t.skip("REQUIRE_SMOKE_ENV not set");
    return;
  }

  const required = [
    "NEXT_PUBLIC_APP_URL",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "GEMINI_API_KEY",
    "GEMINI_IMAGE_MODEL",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "CRON_API_KEY",
    "AI_WORKER_TOKEN",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "MP_ACCESS_TOKEN",
    "MP_WEBHOOK_SECRET",
    "UNSUBSCRIBE_SECRET",
  ];

  for (const key of required) {
    assert.ok(process.env[key], `${key} is required`);
  }

  assert.match(process.env.GEMINI_IMAGE_MODEL, /image/i);
  assert.doesNotMatch(process.env.RESEND_FROM_EMAIL, /@resend\.dev\b/i);
});

test("admin health probes work with cron API key", async (t) => {
  if (!cronApiKey) {
    t.skip("CRON_API_KEY or TEST_CRON_API_KEY not set");
    return;
  }

  for (const service of ["firebase", "redis", "gemini"]) {
    const res = await fetch(`${baseUrl}/api/health?service=${service}`, {
      headers: { "X-Api-Key": cronApiKey },
    });
    assert.ok(
      [200, 207, 503].includes(res.status),
      `${service} health returned ${res.status}`
    );
  }
});

test("public session response avoids private fields", async (t) => {
  if (!shareId) {
    t.skip("TEST_SHARE_ID not set");
    return;
  }

  const res = await fetch(`${baseUrl}/api/sessions/${shareId}`, { cache: "no-store" });
  assert.ok([200, 404].includes(res.status), `Unexpected status ${res.status}`);

  if (res.status === 200) {
    const json = await res.json();
    assert.equal("photo" in json, false, "photo should not be exposed");
    assert.equal("ai" in json, false, "ai should not be exposed");
    assert.equal("input" in json, false, "input should not be exposed");
    assert.equal("email" in json, false, "email should not be exposed");
    assert.equal("ownerUid" in json, false, "ownerUid should not be exposed");
  }
});

test("private session endpoint rejects anonymous access", async (t) => {
  if (!shareId) {
    t.skip("TEST_SHARE_ID not set");
    return;
  }

  const res = await fetch(`${baseUrl}/api/sessions/${shareId}/private`, {
    cache: "no-store",
  });
  assert.equal(res.status, 401);
});

test("owner can access private session when TEST_OWNER_ID_TOKEN is set", async (t) => {
  if (!shareId || !ownerIdToken) {
    t.skip("TEST_SHARE_ID or TEST_OWNER_ID_TOKEN not set");
    return;
  }

  const res = await fetch(`${baseUrl}/api/sessions/${shareId}/private`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${ownerIdToken}` },
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.urls, "private response should include signed urls object");
});
