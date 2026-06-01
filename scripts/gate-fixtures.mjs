// Shared constants for the local P1/P2 validation gate (Firebase Emulator Suite).
// Used by seed-emulator.mjs and mint-token.mjs. All values are emulator-only fakes.

export const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "demo-ngx";
export const AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
export const FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
// The Auth emulator accepts any API key.
export const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-emulator-key";

export const USERS = {
  A: { uid: "gate-user-a", email: "owner-a@gate.local", password: "GatePass123!" },
  B: { uid: "gate-user-b", email: "other-b@gate.local", password: "GatePass123!" },
};

export const SESSIONS = {
  // Owned by A, status "ready". Doubles as TEST_SHARE_ID + TEST_USER_A_SESSION_ID.
  ownerReady: "gate-session-a",
  // Owned by A, disposable — exercised by the owner DELETE path.
  disposableOwner: "gate-del-owner",
  // Owned by A, disposable — exercised by the legacy delete-token path.
  disposableToken: "gate-del-token",
};

// Plaintext delete token stored on the disposable session (matches validateDeleteToken).
export const DELETE_TOKEN = "gate-delete-token-abc123";
