import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth-context.jsx";

export default function AppHeader() {
  const { user, signOut } = useAuth();
  return (
    <motion.div
      className="header"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <motion.div
          className="brand-mark"
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Sparkles size={16} strokeWidth={2.4} />
        </motion.div>
        <span className="font-display" style={{ fontSize: 18 }}>CoachIQ</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {user && (
          <span className="p" style={{ fontSize: 13 }}>
            {user.displayName || user.email}
          </span>
        )}
        <motion.button
          className="btn btn-ghost"
          onClick={signOut}
          style={{ padding: "8px 14px", fontSize: 13 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <LogOut size={14} />
          Sign out
        </motion.button>
      </div>
    </motion.div>
  );
}
