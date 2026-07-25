import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Target, TrendingUp } from "lucide-react";
import { useAuth } from "../lib/auth-context.jsx";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function LoginScreen() {
  const { signInWithGoogle, configured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = async () => {
    setError(null); setLoading(true);
    try { await signInWithGoogle(); }
    catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="center-screen">
      <div style={{ width: "100%", maxWidth: 440 }}>
        <motion.div
          style={{ textAlign: "center", marginBottom: 28 }}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="brand"
            style={{ justifyContent: "center", marginBottom: 22 }}
            variants={fadeUp}
          >
            <motion.div
              className="brand-mark"
              animate={{ boxShadow: ["0 4px 16px -4px rgba(79,70,229,0.7)", "0 4px 24px -2px rgba(6,182,212,0.6)", "0 4px 16px -4px rgba(79,70,229,0.7)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={16} strokeWidth={2.4} />
            </motion.div>
            <span className="font-display" style={{ fontSize: 22 }}>CoachIQ</span>
          </motion.div>

          <motion.h1
            className="h1"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Your personal AI coach
          </motion.h1>
          <motion.p
            className="p"
            style={{ marginTop: 10 }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            For exams, interviews, and everything you're training for. One question at a time.
          </motion.p>

          <motion.div
            className="row"
            style={{ justifyContent: "center", marginTop: 18, gap: 18 }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="p" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <Target size={13} /> Adaptive difficulty
            </span>
            <span className="p" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <TrendingUp size={13} /> Tracks your growth
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            onClick={handle}
            disabled={loading || !configured}
            className="btn btn-primary"
            style={{ width: "100%" }}
            whileHover={!loading && configured ? { y: -1 } : {}}
            whileTap={!loading && configured ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <Loader2 size={18} className="spin" style={{ animation: "spin 0.9s linear infinite" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16 4 9.1 8.5 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9 39.4 16 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5c-.5.4 6.4-4.7 6.4-15.2 0-1.3-.1-2.3-.4-3.5z"/>
              </svg>
            )}
            {loading ? "Signing in…" : "Sign in with Google"}
          </motion.button>
          {!configured && (
            <p className="p" style={{ marginTop: 14, fontSize: 12, textAlign: "center" }}>
              Firebase isn't configured yet. Add your <code>VITE_FIREBASE_*</code> env vars to enable sign-in.
            </p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 14, fontSize: 14, textAlign: "center", color: "#fb7185" }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
        <motion.p
          className="p"
          style={{ marginTop: 18, fontSize: 12, textAlign: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          A warm, conversational way to prepare — no clinical quizzes.
        </motion.p>
      </div>
    </div>
  );
}
