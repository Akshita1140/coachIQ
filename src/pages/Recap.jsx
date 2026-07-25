import { useNavigate } from "react-router-dom";
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
        <div>
          <span className="badge badge-teal">Journey complete</span>
          <h1 className="h1" style={{ marginTop: 12 }}>You showed up — that matters.</h1>
          <p className="p">Here's a snapshot of your session on <b>{topic || (mode === "topic" ? "your subject" : "your role")}</b>.</p>
        </div>

        <div className="card" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div className="score-ring" style={{ "--v": avg * 10 }}>
            <div>{avg}<span style={{ fontSize: 12, color: "var(--coach-muted)" }}>/10</span></div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>Overall score</div>
            <p className="p" style={{ fontSize: 14 }}>
              {growth > 0 ? `You grew ${growth} point${growth === 1 ? "" : "s"} from your first to last answer.`
                : growth < 0 ? "Some questions stretched you — that's where real learning lives."
                : "Steady performance across the journey."}
            </p>
          </div>
        </div>

        <div className="card stack">
          <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Question-by-question</div>
          {questions.map((q, i) => {
            const f = feedbacks[i];
            if (!f) return null;
            return (
              <div key={q.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--coach-border)", paddingTop: i === 0 ? 0 : 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div className="p" style={{ fontSize: 13 }}>Q{i + 1} · {q.difficulty}</div>
                  <div className="p" style={{ fontSize: 13 }}><b style={{ color: "var(--coach-teal)" }}>{f.score}/10</b></div>
                </div>
                <div style={{ marginTop: 4, fontWeight: 500 }}>{q.prompt}</div>
              </div>
            );
          })}
        </div>

        <div className="card stack">
          <div className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>Resources to keep going</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {feedbacks.map((f, i) => (
              <li key={i} className="p" style={{ margin: "6px 0" }}>
                <a href={f.resource.url} target="_blank" rel="noreferrer">{f.resource.title}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-accent" onClick={restart}>Start new session</button>
        </div>
      </div>
    </>
  );
}
