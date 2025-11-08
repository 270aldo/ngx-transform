import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

type AdminServices = {
  app: App;
  db: Firestore;
  storage: Storage;
};

let cached: AdminServices | null = null;

function getCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin no configurado correctamente");
  }

  return { projectId, clientEmail, privateKey };
}

function ensureAdmin() {
  if (cached) return cached;
  const apps = getApps();
  const credentials = getCredentials();
  const app = apps.length
    ? apps[0]
    : initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
  const db = getFirestore(app);
  const storage = getStorage(app);
  cached = { app, db, storage };
  return cached;
}

export function getAdminApp() {
  return ensureAdmin().app;
}

export function getDb() {
  return ensureAdmin().db;
}

export function getBucket() {
  return ensureAdmin().storage.bucket();
}

export { FieldValue };
