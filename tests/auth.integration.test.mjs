import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const userAToken = process.env.TEST_USER_A_TOKEN;
const userBToken = process.env.TEST_USER_B_TOKEN;
const userASessionId = process.env.TEST_USER_A_SESSION_ID;

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test("owner can access private session", async (t) => {
  if (!userAToken || !userASessionId) {
    t.skip("TEST_USER_A_TOKEN or TEST_USER_A_SESSION_ID not set");
    return;
  }

  const res = await fetch(`${baseUrl}/api/sessions/${userASessionId}/private`, {
    headers: authHeaders(userAToken),
  });

  assert.equal(res.status, 200);
});

test("other user is forbidden", async (t) => {
  if (!userBToken || !userASessionId) {
    t.skip("TEST_USER_B_TOKEN or TEST_USER_A_SESSION_ID not set");
    return;
  }

  const res = await fetch(`${baseUrl}/api/sessions/${userASessionId}/private`, {
    headers: authHeaders(userBToken),
  });

  assert.equal(res.status, 403);
});

test("anonymous is unauthorized", async (t) => {
  if (!userASessionId) {
    t.skip("TEST_USER_A_SESSION_ID not set");
    return;
  }

  const res = await fetch(`${baseUrl}/api/sessions/${userASessionId}/private`);
  assert.equal(res.status, 401);
});

const protectedMutationCases = [
  {
    name: "classify",
    path: (shareId) => `/api/sessions/${shareId}/classify`,
    body: {
      classification: "listo_para_diagnostico",
      consentSummary: false,
    },
  },
  {
    name: "hybrid offer event",
    path: () => "/api/events/hybrid-offer",
    body: (shareId) => ({
      shareId,
      event: "hybrid_offer_chat_click",
    }),
  },
  {
    name: "feedback",
    path: () => "/api/feedback",
    body: (shareId) => ({
      shareId,
      score: 8,
      reason: null,
      comment: null,
      category: "needs_clarity",
    }),
  },
  {
    name: "brief send",
    path: () => "/api/brief/send",
    body: (shareId) => ({ shareId }),
  },
  {
    name: "checkout preference",
    path: () => "/api/checkout/create-preference",
    body: (shareId) => ({ shareId, sku: "monthly" }),
  },
];

for (const item of protectedMutationCases) {
  test(`anonymous is unauthorized for ${item.name}`, async (t) => {
    if (!userASessionId) {
      t.skip("TEST_USER_A_SESSION_ID not set");
      return;
    }

    const body =
      typeof item.body === "function" ? item.body(userASessionId) : item.body;
    const res = await fetch(`${baseUrl}${item.path(userASessionId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    assert.equal(res.status, 401);
  });

  test(`other user is forbidden for ${item.name}`, async (t) => {
    if (!userBToken || !userASessionId) {
      t.skip("TEST_USER_B_TOKEN or TEST_USER_A_SESSION_ID not set");
      return;
    }

    const body =
      typeof item.body === "function" ? item.body(userASessionId) : item.body;
    const res = await fetch(`${baseUrl}${item.path(userASessionId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(userBToken),
      },
      body: JSON.stringify(body),
    });

    assert.equal(res.status, 403);
  });
}
