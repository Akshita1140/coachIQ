import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./lib/auth-context.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import Home from "./pages/Home.jsx";
import Session from "./pages/Session.jsx";
import Recap from "./pages/Recap.jsx";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 34, height: 34, borderRadius: "999px",
              border: "2.5px solid rgba(255,255,255,0.12)",
              borderTopColor: "var(--coach-accent-light)",
            }}
          />
          <p className="p">Loading…</p>
        </motion.div>
      </div>
    );
  }

  // Auth gate: require sign-in whenever Firebase is configured.
  if (configured && !user) return <LoginScreen />;
  // If Firebase isn't configured, still show login screen (with hint) so devs know.
  if (!configured && !user) return <LoginScreen />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/session" element={<PageWrapper><Session /></PageWrapper>} />
        <Route path="/recap" element={<PageWrapper><Recap /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
