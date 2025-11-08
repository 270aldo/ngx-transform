import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

type ClientServices = {
  app: FirebaseApp;
  auth: Auth;
  storage: FirebaseStorage;
};

let cached: ClientServices | null = null;

function getConfig() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!cfg.apiKey) {
    console.warn("Firebase client no configurado: faltan variables NEXT_PUBLIC_FIREBASE_*");
  }

  return cfg;
}

function ensureApp() {
  if (cached) return cached;
  const apps = getApps();
  const app = apps.length ? apps[0] : initializeApp(getConfig());
  const auth = getAuth(app);
  const storage = getStorage(app);
  cached = { app, auth, storage };
  return cached;
}

export function getClientApp() {
  return ensureApp().app;
}

export function getClientAuth() {
  return ensureApp().auth;
}

export function getClientStorage() {
  return ensureApp().storage;
}
