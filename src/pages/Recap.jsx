import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Palmtree, RotateCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { useSession } from "../lib/session-store.js";
import { generateLearningPath } from "../lib/api.js";

export default function Recap() {
  const nav = useNavigate();
  const { questions, feedbacks, topic, mode, reset } = useSession();

  const [islands, setIslands] = useState([]);
  const [pathLoading, setPathLoading] = useState(true);

  useEffect(() => {
    const gaps = feedbacks.flatMap((f) => f.gaps || []);
    generateLearningPath({ mode, topic, gaps })
      .then((res) => setIslands(res.islands || []))
      .catch((err) => {
        console.error("Failed to load learning path:", err.message);
        setIslands([]);
      })
      .finally(() => setPathLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="container stack" style={{ maxWidth: 980 }}>
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

        <div className="grid-2">
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
          <div className="font-display" style={{ fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <Palmtree size={18} style={{ color: "var(--coach-accent-light)" }} />
            Your learning islands
          </div>
          <p className="p" style={{ fontSize: 13, marginTop: -6 }}>
            A journey built from what came up in your session — hop from island to island, each one
            pointing you to a real platform to learn more.
          </p>

          {pathLoading ? (
            <div className="stack">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {islands.map((island, i) => (
                <motion.div
                  key={island.step}
                  style={{ display: "flex", gap: 14 }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.24 + i * 0.08 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: 34, height: 34, borderRadius: "999px",
                        background: "var(--gradient-accent)",
                        display: "grid", placeItems: "center", flexShrink: 0,
                        boxShadow: "0 0 14px -2px rgba(6, 182, 212, 0.7)",
                      }}
                    >
                      <Palmtree size={16} color="#fff" />
                    </div>
                    {i < islands.length - 1 && (
                      <div
                        style={{
                          width: 2, flex: 1, minHeight: 32,
                          background: "repeating-linear-gradient(to bottom, var(--coach-border) 0, var(--coach-border) 4px, transparent 4px, transparent 8px)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ paddingBottom: 22 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--coach-muted-2)", fontWeight: 600 }}>
                      Island {island.step}
                    </div>
                    <div className="font-display" style={{ fontWeight: 600, fontSize: 15, marginTop: 2, color: "var(--coach-ink)" }}>
                      {island.title}
                    </div>
                    <p className="p" style={{ fontSize: 13, margin: "4px 0" }}>{island.description}</p>
                    <a
                      href={island.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="badge badge-teal"
                      style={{ textDecoration: "none" }}
                    >
                      Learn on {island.platform} <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        </div>

        <motion.div
          className="card"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.16), rgba(6,182,212,0.1))",
            borderColor: "var(--coach-border-strong)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-display" style={{ fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} style={{ color: "var(--coach-accent-light)" }} />
            Want to go further?
          </div>
          <p className="p" style={{ fontSize: 14, margin: "8px 0 16px" }}>
            A 1:1 conversation with a mentor can help you close gaps faster than practicing alone.
          </p>
          <motion.a
            href="https://calendly.com/your-mentor-link"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ width: "fit-content", textDecoration: "none" }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Connect with a mentor
          </motion.a>
        </motion.div>

        <motion.div
          className="row"
          style={{ justifyContent: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.36 }}
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
