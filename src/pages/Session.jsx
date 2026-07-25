import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import JourneyProgress from "../components/JourneyProgress.jsx";
import { SESSION_LENGTH, useSession } from "../lib/session-store.js";
import { evaluateAnswer, generateQuestion } from "../lib/api.js";
import { useSpeechToText } from "../lib/useSpeechToText.js";

export default function Session() {
  const nav = useNavigate();
  const {
    mode, topic, currentTier, questions, answers, feedbacks,
    addQuestion, submitAnswer,
  } = useSession();

  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const { isListening, isSupported, start, stop, error: speechError } = useSpeechToText({
    onResult: (text) => setAnswer((prev) => prev + text),
  });

  const index = questions.length - (showFeedback ? 1 : 0);
  const currentQuestion = questions[showFeedback ? questions.length - 1 : questions.length - 1];
  const currentFeedback = feedbacks[feedbacks.length - 1];

  useEffect(() => {
    if (!mode) { nav("/"); return; }
    if (questions.length === answers.length && questions.length < SESSION_LENGTH) {
      // need a new question
      setLoading(true);
      generateQuestion({
        mode, topic, difficulty: currentTier, index: questions.length,
        history: questions.map((q, i) => ({ prompt: q.prompt, answer: answers[i] ?? "" })),
      }).then((q) => { addQuestion(q); setShowFeedback(false); setAnswer(""); })
        .finally(() => setLoading(false));
    }
  }, [mode, topic, currentTier, questions.length, answers.length]);

  const submit = async () => {
    if (!currentQuestion || !answer.trim()) return;
    setLoading(true);
    try {
      const fb = await evaluateAnswer({ question: currentQuestion, answer, mode, topic });
      submitAnswer(answer, fb);
      setShowFeedback(true);
    } finally { setLoading(false); }
  };

  const next = () => {
    if (answers.length >= SESSION_LENGTH) { nav("/recap"); return; }
    setShowFeedback(false); setAnswer("");
  };

  return (
    <>
      <AppHeader />
      <div className="container stack">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <JourneyProgress total={SESSION_LENGTH} current={answers.length} />
          <span className={`badge ${currentTier === "Beginner" ? "badge-teal" : currentTier === "Advanced" ? "" : "badge-indigo"}`}>
            {currentTier}
          </span>
        </div>

        {loading && !currentQuestion && <div className="card"><p className="p">Your coach is thinking of a good starting point…</p></div>}

        {currentQuestion && !showFeedback && (
          <div className="card stack">
            <div>
              <span className="p" style={{ fontSize: 13 }}>Question {answers.length + 1} of {SESSION_LENGTH}</span>
              <h2 className="h2" style={{ marginTop: 6 }}>{currentQuestion.prompt}</h2>
            </div>
            <textarea
              className="textarea"
              placeholder="Take your time — write it in your own words."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            {isSupported && (
              <div className="row" style={{ alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${isListening ? "btn-accent" : ""}`}
                  onClick={isListening ? stop : start}
                  style={{ fontSize: 13 }}
                >
                  {isListening ? "🎙️ Listening… tap to stop" : "🎤 Speak your answer"}
                </button>
                {speechError && (
                  <span className="p" style={{ fontSize: 12, color: "var(--coach-muted)" }}>
                    Mic error: {speechError}. Try typing instead.
                  </span>
                )}
              </div>
            )}
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-primary" onClick={submit} disabled={loading || !answer.trim()}>
                {loading ? "Reviewing…" : "Submit answer"}
              </button>
            </div>
          </div>
        )}

        {currentQuestion && showFeedback && currentFeedback && (
          <div className="card stack">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="score-ring" style={{ "--v": currentFeedback.score * 10 }}>
                <div>{currentFeedback.score}<span style={{ fontSize: 12, color: "var(--coach-muted)" }}>/10</span></div>
              </div>
              <div>
                <div className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>Nice work.</div>
                <p className="p" style={{ fontSize: 13 }}>Here's what stood out and where to grow.</p>
              </div>
            </div>

            <div>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Strengths</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {currentFeedback.strengths.map((s, i) => <li key={i} className="p" style={{ margin: "4px 0" }}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Room to grow</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {currentFeedback.gaps.map((s, i) => <li key={i} className="p" style={{ margin: "4px 0" }}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Keep exploring</div>
              <a href={currentFeedback.resource.url} target="_blank" rel="noreferrer">{currentFeedback.resource.title}</a>
            </div>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-accent" onClick={next}>
                {answers.length >= SESSION_LENGTH ? "See your recap →" : "Next question →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
