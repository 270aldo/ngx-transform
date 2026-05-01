"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth, type User } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let app: FirebaseApp | null = null;
export function getClientApp(): FirebaseApp {
  if (app) return app;
  const existing = getApps();
  app = existing.length ? existing[0]! : initializeApp(config);
  return app;
}

export function getClientAuth(): Auth {
  return getAuth(getClientApp());
}

export function getClientStorage(): FirebaseStorage {
  return getStorage(getClientApp());
}

/**
 * Lead-magnet flow: returns the current Firebase user if signed in,
 * otherwise signs in anonymously. Wizard uses this to get an auth.uid
 * for Storage uploads without forcing a login UI.
 */
export async function ensureAnonymousSession(): Promise<User> {
  const auth = getClientAuth();
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

