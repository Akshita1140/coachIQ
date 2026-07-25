import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app = null;
let authInstance = null;

export function getFirebaseAuth() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfigured) return null;
  if (!app) app = getApps()[0] ?? initializeApp(config);
  if (!authInstance) authInstance = getAuth(app);
  return authInstance;
}

export const googleProvider = new GoogleAuthProvider();
