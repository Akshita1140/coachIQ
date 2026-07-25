import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JourneyProgress } from "../components/JourneyProgress";
import { evaluateAnswer, generateQuestion } from "../lib/api";
import { SESSION_LENGTH, useSession } from "../lib/session-store";
import type { Feedback, Question } from "../lib/types";

export const Route = createFileRoute("/session")({
  head: () => ({
    meta: [
      { title: "Coaching session · CoachIQ" },
      { name: "description", content: "Your live coaching session — one question at a time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SessionPage,
});

type Phase = "loading" | "answering" | "evaluating" | "feedback";

function SessionPage() {
  const navigate = useNavigate();
  const { mode, topic, currentTier, questions, feedbacks, addQuestion, submitAnswer } = useSession();

  const [phase, setPhase] = useState<Phase>("loading");
  const [current, setCurrent] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const index = feedbacks.length; // 0-based

  useEffect(() => {
    if (!mode || !topic) {
      navigate({ to: "/" });
      return;
    }
    if (current || phase !== "loading") return;
    (async () => {
      try {
        const q = await generateQuestion({
          mode,
          topic,
          difficulty: currentTier,
          index,
          history: [],
        });
        addQuestion(q);
        setCurrent(q);
        setPhase("answering");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load question");
      }
    })();
  }, [mode, topic, currentTier, index, current, phase, addQuestion, navigate]);

  const handleSubmit = async () => {
    if (!current || !mode || !answer.trim()) return;
    setPhase("evaluating");
    try {
      const fb = await evaluateAnswer({ question: current, answer, mode, topic });
      submitAnswer(answer, fb);
      setFeedback(fb);
      setPhase("feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
      setPhase("answering");
    }
  };

  const handleNext = async () => {
    if (index + 1 >= SESSION_LENGTH) {
      navigate({ to: "/recap" });
      return;
    }
    setCurrent(null);
    setFeedback(null);
    setAnswer("");
    setPhase("loading");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 sm:py-12">
      <div className="mb-8">
        <JourneyProgress total={SESSION_LENGTH} current={index} tier={currentTier} />
      </div>

      {error && (
        <div className="rounded-2xl bg-destructive/10 text-destructive px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {phase === "loading" && (
        <div className="rounded-3xl bg-card border border-border/60 p-8 shadow-[var(--shadow-warm)]">
          <div className="animate-pulse text-muted-foreground">Coach is thinking…</div>
        </div>
      )}

      {(phase === "answering" || phase === "evaluating") && current && (
        <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-[var(--shadow-warm)]">
          <div className="flex items-start gap-3 mb-5">
            <div className="h-9 w-9 shrink-0 rounded-2xl bg-[var(--coach-indigo)] grid place-items-center text-white font-display font-bold">
              C
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Your coach asks
              </div>
              <p className="mt-1 font-display text-2xl leading-snug">{current.prompt}</p>
            </div>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Take your time. Think out loud…"
            rows={6}
            disabled={phase === "evaluating"}
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--coach-coral)]/40 focus:border-[var(--coach-coral)] transition resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || phase === "evaluating"}
            className="mt-4 w-full rounded-2xl bg-[var(--coach-coral)] text-white py-3.5 font-medium hover:brightness-105 transition disabled:opacity-40"
          >
            {phase === "evaluating" ? "Reviewing your answer…" : "Submit Answer"}
          </button>
        </div>
      )}

      {phase === "feedback" && feedback && current && (
        <FeedbackCard
          feedback={feedback}
          isLast={index + 1 >= SESSION_LENGTH}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

function FeedbackCard({
  feedback,
  isLast,
  onNext,
}: {
  feedback: Feedback;
  isLast: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-[var(--shadow-warm)]">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
          Here's what I noticed
        </div>

        <div className="space-y-4">
          <Section
            label="Strengths"
            emoji="🌱"
            color="var(--coach-sage)"
            bg="var(--coach-sage-soft)"
            items={feedback.strengths}
          />
          <Section
            label="Gaps to work on"
            emoji="🎯"
            color="var(--coach-amber-ink)"
            bg="var(--coach-amber-soft)"
            items={feedback.gaps}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-border/60 p-4 bg-[var(--coach-teal-soft)]/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--coach-teal-ink)] mb-1">
            Suggested resource
          </div>
          <a
            href={feedback.resource.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-foreground font-medium hover:underline"
          >
            {feedback.resource.title} ↗
          </a>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-2xl bg-[var(--coach-coral)] text-white py-3.5 font-medium hover:brightness-105 transition"
      >
        {isLast ? "See your recap →" : "Next Question →"}
      </button>
    </div>
  );
}

function Section({
  label,
  emoji,
  color,
  bg,
  items,
}: {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: bg }}>
      <div className="flex items-center gap-2 mb-2">
        <span>{emoji}</span>
        <span className="text-sm font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-foreground/85 leading-relaxed">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
