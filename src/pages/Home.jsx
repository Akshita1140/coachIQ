import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <div>
          <span className="badge badge-indigo">Your journey starts here</span>
          <h1 className="h1" style={{ marginTop: 12 }}>What are we training for today?</h1>
          <p className="p">Pick a mode and tell your coach what you're preparing for. We'll begin gentle and adapt as you go.</p>
        </div>

        <div className="card stack">
          <div className="grid-2">
            <button
              className="btn"
              onClick={() => setMode("topic")}
              style={{
                justifyContent: "flex-start", padding: 18, borderRadius: 18,
                background: mode === "topic" ? "#eef0fb" : "#fff",
                border: `1px solid ${mode === "topic" ? "var(--coach-indigo)" : "var(--coach-border)"}`,
                color: "var(--coach-ink)", textAlign: "left",
              }}>
              <div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Topic study</div>
                <div className="p" style={{ fontSize: 13, marginTop: 4 }}>Deepen understanding of a subject or concept.</div>
              </div>
            </button>
            <button
              className="btn"
              onClick={() => setMode("interview")}
              style={{
                justifyContent: "flex-start", padding: 18, borderRadius: 18,
                background: mode === "interview" ? "#fff2ee" : "#fff",
                border: `1px solid ${mode === "interview" ? "var(--coach-coral)" : "var(--coach-border)"}`,
                color: "var(--coach-ink)", textAlign: "left",
              }}>
              <div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Interview prep</div>
                <div className="p" style={{ fontSize: 13, marginTop: 4 }}>Rehearse answers for a role you're aiming for.</div>
              </div>
            </button>
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
            <button className="btn btn-accent" onClick={start}>Start the journey →</button>
          </div>
        </div>

        <p className="p" style={{ fontSize: 13 }}>
          Six adaptive questions. We'll start easy and stretch you gently based on your answers.
        </p>
      </div>
    </>
  );
}
