// Seed the Firebase Auth + Firestore emulators with fixtures for the local
// P1/P2 validation gate. Refuses to run unless the emulator host env vars are
// set, so it can never touch a real project.
//
// Run: node --env-file=.env.emulator.local scripts/seed-emulator.mjs

import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { PROJECT_ID, USERS, SESSIONS, DELETE_TOKEN } from "./gate-fixtures.mjs";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error(
    "[seed] Refusing to run: FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST not set.\n" +
      "       Run with: node --env-file=.env.emulator.local scripts/seed-emulator.mjs"
  );
  process.exit(1);
}

const app = getApps().length ? getApps()[0] : initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
const auth = getAuth(app);

async function ensureUser(u) {
  try {
    await auth.deleteUser(u.uid);
  } catch {
    // not present yet — fine
  }
  await auth.createUser({
    uid: u.uid,
    email: u.email,
    password: u.password,
    emailVerified: true,
  });
}

function sessionDoc({ shareId, ownerUid, email, extra = {} }) {
  return {
    shareId,
    ownerUid,
    email,
    status: "ready",
    consents: { tos: true, privacy: true, marketing: false },
    // Private scope — nothing shared publicly.
    shareScope: { shareOriginal: false, shareInsights: false, shareProfile: false },
    shareOriginal: false,
    // Realistic profile so owner-success paths render; NO storage paths so
    // getSignedUrl (which cannot sign against the emulator) is never invoked.
    input: {
      age: 30,
      sex: "male",
      heightCm: 178,
      weightKg: 80,
      level: "intermedio",
      goal: "mixto",
      weeklyTime: 5,
      bodyType: "mesomorph",
      focusZone: "full",
      stressLevel: 5,
      sleepQuality: 6,
      disciplineRating: 7,
    },
    createdAt: FieldValue.serverTimestamp(),
    lastActivityAt: FieldValue.serverTimestamp(),
    ...extra,
  };
}

await ensureUser(USERS.A);
await ensureUser(USERS.B);

await db
  .collection("sessions")
  .doc(SESSIONS.ownerReady)
  .set(
    sessionDoc({
      shareId: SESSIONS.ownerReady,
      ownerUid: USERS.A.uid,
      email: USERS.A.email,
      extra: { ai: { insightsText: "Gate fixture insights." } },
    })
  );

await db
  .collection("sessions")
  .doc(SESSIONS.disposableOwner)
  .set(
    sessionDoc({
      shareId: SESSIONS.disposableOwner,
      ownerUid: USERS.A.uid,
      email: USERS.A.email,
    })
  );

await db
  .collection("sessions")
  .doc(SESSIONS.disposableToken)
  .set(
    sessionDoc({
      shareId: SESSIONS.disposableToken,
      ownerUid: USERS.A.uid,
      email: USERS.A.email,
      extra: { deleteToken: DELETE_TOKEN },
    })
  );

console.log(
  JSON.stringify(
    { ok: true, projectId: PROJECT_ID, users: USERS, sessions: SESSIONS, deleteToken: DELETE_TOKEN },
    null,
    2
  )
);
process.exit(0);
