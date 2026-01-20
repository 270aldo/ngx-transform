import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const userAToken = process.env.TEST_USER_A_TOKEN;
const userBToken = process.env.TEST_USER_B_TOKEN;
const userASessionId = process.env.TEST_USER_A_SESSION_ID;

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test("owner can access private session", async () => {
  assert.ok(userAToken, "TEST_USER_A_TOKEN is required");
  assert.ok(userASessionId, "TEST_USER_A_SESSION_ID is required");

  const res = await fetch(`${baseUrl}/api/sessions/${userASessionId}/private`, {
    headers: authHeaders(userAToken),
  });

  assert.equal(res.status, 200);
});

test("other user is forbidden", async () => {
  assert.ok(userBToken, "TEST_USER_B_TOKEN is required");
  assert.ok(userASessionId, "TEST_USER_A_SESSION_ID is required");

  const res = await fetch(`${baseUrl}/api/sessions/${userASessionId}/private`, {
    headers: authHeaders(userBToken),
  });

  assert.equal(res.status, 403);
});

test("anonymous is unauthorized", async () => {
  assert.ok(userASessionId, "TEST_USER_A_SESSION_ID is required");

  const res = await fetch(`${baseUrl}/api/sessions/${userASessionId}/private`);
  assert.equal(res.status, 401);
});
