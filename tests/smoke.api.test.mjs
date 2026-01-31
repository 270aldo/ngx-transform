import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const shareId = process.env.TEST_SHARE_ID;

function isValidHealthStatus(status) {
  return status === 200 || status === 207 || status === 503;
}

test("health endpoint responds", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.ok(isValidHealthStatus(res.status), `Unexpected status ${res.status}`);
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
  }
});
