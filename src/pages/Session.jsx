import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mic, MicOff, Send } from "lucide-react";
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
        <motion.div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <JourneyProgress total={SESSION_LENGTH} current={answers.length} />
          <span className={`badge ${currentTier === "Beginner" ? "badge-teal" : currentTier === "Advanced" ? "" : "badge-indigo"}`}>
            {currentTier}
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading && !currentQuestion && (
            <motion.div
              key="thinking"
              className="card stack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="skeleton" style={{ height: 16, width: "70%" }} />
              <div className="skeleton" style={{ height: 16, width: "45%" }} />
              <p className="p" style={{ fontSize: 13 }}>Your coach is thinking of a good starting point…</p>
            </motion.div>
          )}

          {currentQuestion && !showFeedback && (
            <motion.div
              key={`question-${questions.length}`}
              className="card stack"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
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
                  <motion.button
                    type="button"
                    className={`btn ${isListening ? "btn-accent" : "btn-ghost"}`}
                    onClick={isListening ? stop : start}
                    style={{ fontSize: 13 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isListening ? (
                      <motion.span
                        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        <Mic size={14} /> Listening… tap to stop
                      </motion.span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <MicOff size={14} /> Speak your answer
                      </span>
                    )}
                  </motion.button>
                  {speechError && (
                    <span className="p" style={{ fontSize: 12, color: "var(--coach-muted)" }}>
                      Mic error: {speechError}. Try typing instead.
                    </span>
                  )}
                </div>
              )}
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <motion.button
                  className="btn btn-primary"
                  onClick={submit}
                  disabled={loading || !answer.trim()}
                  whileHover={!loading && answer.trim() ? { y: -1 } : {}}
                  whileTap={!loading && answer.trim() ? { scale: 0.97 } : {}}
                >
                  {loading ? "Reviewing…" : (<><Send size={15} /> Submit answer</>)}
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentQuestion && showFeedback && currentFeedback && (
            <motion.div
              key={`feedback-${feedbacks.length}`}
              className="card stack"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <motion.div
                  className="score-ring"
                  initial={{ "--v": 0 }}
                  animate={{ "--v": currentFeedback.score * 10 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div>{currentFeedback.score}<span style={{ fontSize: 12, color: "var(--coach-muted)" }}>/10</span></div>
                </motion.div>
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
                <motion.button
                  className="btn btn-accent"
                  onClick={next}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {answers.length >= SESSION_LENGTH ? "See your recap" : "Next question"} <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
