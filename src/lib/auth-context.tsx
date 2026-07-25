import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth, googleProvider } from "./firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured. Add VITE_FIREBASE_* env vars.");
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await fbSignOut(auth);
  };

  const getIdToken = async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  return (
    <Ctx.Provider
      value={{ user, loading, configured: firebaseConfigured, signInWithGoogle, signOut, getIdToken }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
