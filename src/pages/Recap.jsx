import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, TrendingDown, TrendingUp } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { useSession } from "../lib/session-store.js";

export default function Recap() {
  const nav = useNavigate();
  const { questions, feedbacks, topic, mode, reset } = useSession();

  const avg = feedbacks.length
    ? Math.round((feedbacks.reduce((a, f) => a + f.score, 0) / feedbacks.length) * 10) / 10
    : 0;
  const first = feedbacks[0]?.score ?? 0;
  const last = feedbacks[feedbacks.length - 1]?.score ?? 0;
  const growth = last - first;

  const restart = () => { reset(); nav("/"); };

  return (
    <>
      <AppHeader />
      <div className="container stack">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge badge-teal">Journey complete</span>
          <h1 className="h1" style={{ marginTop: 12 }}>You showed up — that matters.</h1>
          <p className="p">Here's a snapshot of your session on <b style={{ color: "var(--coach-ink)" }}>{topic || (mode === "topic" ? "your subject" : "your role")}</b>.</p>
        </motion.div>

        <motion.div
          className="card"
          style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="score-ring"
            initial={{ "--v": 0 }}
            animate={{ "--v": avg * 10 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>{avg}<span style={{ fontSize: 12, color: "var(--coach-muted)" }}>/10</span></div>
          </motion.div>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              Overall score
              {growth > 0 && <TrendingUp size={16} style={{ color: "var(--coach-accent-light)" }} />}
              {growth < 0 && <TrendingDown size={16} style={{ color: "#c4b5fd" }} />}
            </div>
            <p className="p" style={{ fontSize: 14 }}>
              {growth > 0 ? `You grew ${growth} point${growth === 1 ? "" : "s"} from your first to last answer.`
                : growth < 0 ? "Some questions stretched you — that's where real learning lives."
                : "Steady performance across the journey."}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="card stack"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Question-by-question</div>
          {questions.map((q, i) => {
            const f = feedbacks[i];
            if (!f) return null;
            return (
              <motion.div
                key={q.id}
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--coach-border)", paddingTop: i === 0 ? 0 : 14 }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div className="p" style={{ fontSize: 13 }}>Q{i + 1} · {q.difficulty}</div>
                  <div className="p font-mono" style={{ fontSize: 13 }}><b style={{ color: "var(--coach-accent-light)" }}>{f.score}/10</b></div>
                </div>
                <div style={{ marginTop: 4, fontWeight: 500 }}>{q.prompt}</div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="card stack"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Resources to keep going</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {feedbacks.map((f, i) => (
              <li key={i} className="p" style={{ margin: "6px 0" }}>
                <a href={f.resource.url} target="_blank" rel="noreferrer">{f.resource.title}</a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="row"
          style={{ justifyContent: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.button
            className="btn btn-accent"
            onClick={restart}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={15} /> Start new session
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
