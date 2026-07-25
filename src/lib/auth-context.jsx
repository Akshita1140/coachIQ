import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth, googleProvider } from "./firebase.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured. Add VITE_FIREBASE_* env vars.");
    await signInWithPopup(auth, googleProvider);
  };
  const signOut = async () => {
    const auth = getFirebaseAuth();
    if (auth) await fbSignOut(auth);
  };
  const getIdToken = async () => {
    const auth = getFirebaseAuth();
    return auth?.currentUser ? auth.currentUser.getIdToken() : null;
  };

  return (
    <Ctx.Provider value={{ user, loading, configured: firebaseConfigured, signInWithGoogle, signOut, getIdToken }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
