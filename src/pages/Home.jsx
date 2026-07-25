import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Briefcase } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { useSession } from "../lib/session-store.js";

export default function Home() {
  const nav = useNavigate();
  const startSession = useSession((s) => s.startSession);
  const [mode, setMode] = useState("topic");
  const [topic, setTopic] = useState("");

  const start = () => {
    startSession(mode, topic);
    nav("/session");
  };

  return (
    <>
      <AppHeader />
      <div className="container stack">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge badge-indigo">Your journey starts here</span>
          <h1 className="h1" style={{ marginTop: 12 }}>What are we training for today?</h1>
          <p className="p">Pick a mode and tell your coach what you're preparing for. We'll begin gentle and adapt as you go.</p>
        </motion.div>

        <motion.div
          className="card stack"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid-2">
            <motion.button
              className="btn"
              onClick={() => setMode("topic")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              style={{
                justifyContent: "flex-start", padding: 18, borderRadius: 18,
                background: mode === "topic" ? "rgba(79, 70, 229, 0.14)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${mode === "topic" ? "var(--coach-primary-light)" : "var(--coach-border)"}`,
                color: "var(--coach-ink)", textAlign: "left",
                boxShadow: mode === "topic" ? "0 0 0 4px rgba(79,70,229,0.12)" : "none",
              }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BookOpen size={16} style={{ color: "var(--coach-primary-light)" }} />
                  <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Topic study</div>
                </div>
                <div className="p" style={{ fontSize: 13, marginTop: 6 }}>Deepen understanding of a subject or concept.</div>
              </div>
            </motion.button>
            <motion.button
              className="btn"
              onClick={() => setMode("interview")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              style={{
                justifyContent: "flex-start", padding: 18, borderRadius: 18,
                background: mode === "interview" ? "rgba(124, 58, 237, 0.14)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${mode === "interview" ? "var(--coach-secondary)" : "var(--coach-border)"}`,
                color: "var(--coach-ink)", textAlign: "left",
                boxShadow: mode === "interview" ? "0 0 0 4px rgba(124,58,237,0.12)" : "none",
              }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase size={16} style={{ color: "#c4b5fd" }} />
                  <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Interview prep</div>
                </div>
                <div className="p" style={{ fontSize: 13, marginTop: 6 }}>Rehearse answers for a role you're aiming for.</div>
              </div>
            </motion.button>
          </div>

          <div>
            <label className="p" style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
              {mode === "topic" ? "Subject or concept" : "Role or company"}
            </label>
            <input
              className="input"
              placeholder={mode === "topic" ? "e.g. Photosynthesis, Machine learning basics" : "e.g. Product manager at a fintech"}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <motion.button
              className="btn btn-accent"
              onClick={start}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Start the journey <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          className="p"
          style={{ fontSize: 13 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          Six adaptive questions. We'll start easy and stretch you gently based on your answers.
        </motion.p>
      </div>
    </>
  );
}
