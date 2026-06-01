import test from "node:test";
import assert from "node:assert/strict";

// Runtime coverage for the owner-only DELETE gate (P1/P2). Complements the
// static invariant test by exercising the actual route against disposable
// fixtures. Skips cleanly when fixture env vars are absent.
//
// Expects two disposable sessions owned by user A:
//   TEST_DELETE_SHARE_ID         — deleted via owner auth (Bearer)
//   TEST_DELETE_TOKEN_SHARE_ID   — deleted via legacy X-Delete-Token
//   TEST_DELETE_TOKEN            — the matching plaintext delete token

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const userAToken = process.env.TEST_USER_A_TOKEN; // owner
const userBToken = process.env.TEST_USER_B_TOKEN; // other user
const ownerDeleteShareId = process.env.TEST_DELETE_SHARE_ID;
const tokenDeleteShareId = process.env.TEST_DELETE_TOKEN_SHARE_ID;
const deleteToken = process.env.TEST_DELETE_TOKEN;

function bearer(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test("anonymous cannot delete a session", async (t) => {
  if (!ownerDeleteShareId) {
    t.skip("TEST_DELETE_SHARE_ID not set");
    return;
  }
  const res = await fetch(`${baseUrl}/api/sessions/${ownerDeleteShareId}`, {
    method: "DELETE",
  });
  assert.ok([401, 403].includes(res.status), `expected 401/403, got ${res.status}`);
});

test("non-owner cannot delete a session", async (t) => {
  if (!ownerDeleteShareId || !userBToken) {
    t.skip("TEST_DELETE_SHARE_ID or TEST_USER_B_TOKEN not set");
    return;
  }
  const res = await fetch(`${baseUrl}/api/sessions/${ownerDeleteShareId}`, {
    method: "DELETE",
    headers: bearer(userBToken),
  });
  assert.equal(res.status, 403);
});

test("owner can delete own session", async (t) => {
  if (!ownerDeleteShareId || !userAToken) {
    t.skip("TEST_DELETE_SHARE_ID or TEST_USER_A_TOKEN not set");
    return;
  }
  const res = await fetch(`${baseUrl}/api/sessions/${ownerDeleteShareId}`, {
    method: "DELETE",
    headers: bearer(userAToken),
  });
  assert.equal(res.status, 200);

  // The session must be gone afterwards.
  const check = await fetch(`${baseUrl}/api/sessions/${ownerDeleteShareId}/private`, {
    headers: bearer(userAToken),
  });
  assert.equal(check.status, 404);
});

test("legacy delete token: wrong token rejected, correct token deletes", async (t) => {
  if (!tokenDeleteShareId || !deleteToken) {
    t.skip("TEST_DELETE_TOKEN_SHARE_ID or TEST_DELETE_TOKEN not set");
    return;
  }

  const bad = await fetch(`${baseUrl}/api/sessions/${tokenDeleteShareId}`, {
    method: "DELETE",
    headers: { "X-Delete-Token": "wrong-token" },
  });
  assert.ok([401, 403].includes(bad.status), `wrong token expected 401/403, got ${bad.status}`);

  const ok = await fetch(`${baseUrl}/api/sessions/${tokenDeleteShareId}`, {
    method: "DELETE",
    headers: { "X-Delete-Token": deleteToken },
  });
  assert.equal(ok.status, 200);
});
