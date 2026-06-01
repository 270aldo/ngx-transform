// Mint a Firebase ID token for a seeded gate user by signing in against the
// Auth emulator's REST endpoint. Prints the raw idToken to stdout (no newline)
// so it can be captured into TEST_USER_*_TOKEN.
//
// Run: node --env-file=.env.emulator.local scripts/mint-token.mjs A
//      node --env-file=.env.emulator.local scripts/mint-token.mjs B

import { API_KEY, AUTH_EMULATOR_HOST, USERS } from "./gate-fixtures.mjs";

const which = (process.argv[2] || "A").toUpperCase();
const user = USERS[which];
if (!user) {
  console.error(`[mint] Unknown user "${which}". Use A or B.`);
  process.exit(1);
}

const url = `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: user.email,
    password: user.password,
    returnSecureToken: true,
  }),
});

const json = await res.json().catch(() => ({}));
if (!res.ok || !json.idToken) {
  console.error(`[mint] Sign-in failed for ${which}:`, JSON.stringify(json));
  console.error("[mint] Is the Auth emulator running and seeded? (pnpm emulators + pnpm seed:emulator)");
  process.exit(1);
}

process.stdout.write(json.idToken);
