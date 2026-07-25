import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JourneyProgress } from "../components/JourneyProgress";
import { SESSION_LENGTH, useSession } from "../lib/session-store";

export const Route = createFileRoute("/recap")({
  head: () => ({
    meta: [
      { title: "Session recap · CoachIQ" },
      { name: "description", content: "Milestone summary of your coaching session." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecapPage,
});

function RecapPage() {
  const navigate = useNavigate();
  const { mode, topic, feedbacks, currentTier, reset } = useSession();

  useEffect(() => {
    if (!mode || feedbacks.length === 0) navigate({ to: "/" });
  }, [mode, feedbacks.length, navigate]);

  const allStrengths = Array.from(new Set(feedbacks.flatMap((f) => f.strengths))).slice(0, 4);
  const allGaps = Array.from(new Set(feedbacks.flatMap((f) => f.gaps))).slice(0, 4);
  const resources = feedbacks.map((f) => f.resource);
  const avg = feedbacks.reduce((s, f) => s + f.score, 0) / Math.max(1, feedbacks.length);

  const handleNew = () => {
    reset();
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 sm:py-16">
      <div className="mb-8">
        <JourneyProgress
          total={SESSION_LENGTH}
          current={feedbacks.length}
          tier={currentTier}
          completed
        />
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--coach-coral-soft)] px-4 py-1.5 text-sm font-medium text-[var(--coach-coral-ink)] mb-4">
          🏁 Milestone reached
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
          Nice work on{" "}
          <span className="text-[var(--coach-coral)]">{topic || "your session"}</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          You reached <span className="font-semibold text-foreground">{currentTier}</span> tier ·
          Average score {avg.toFixed(1)}/10
        </p>
      </div>

      <div className="grid gap-4">
        <Panel title="Overall strengths" emoji="🌱" bg="var(--coach-sage-soft)" items={allStrengths} />
        <Panel title="Topics to revisit" emoji="🎯" bg="var(--coach-amber-soft)" items={allGaps} />

        <div className="rounded-3xl bg-card border border-border/60 p-6 shadow-[var(--shadow-warm)]">
          <div className="flex items-center gap-2 mb-4">
            <span>📚</span>
            <span className="font-semibold">Resources for next time</span>
          </div>
          <ul className="space-y-2">
            {resources.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-foreground hover:text-[var(--coach-coral)] hover:underline"
                >
                  → {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={handleNew}
        className="mt-8 w-full rounded-2xl bg-[var(--coach-coral)] text-white py-3.5 font-medium hover:brightness-105 transition"
      >
        Start New Session
      </button>
    </div>
  );
}

function Panel({
  title,
  emoji,
  bg,
  items,
}: {
  title: string;
  emoji: string;
  bg: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl p-6 shadow-[var(--shadow-warm)]" style={{ backgroundColor: bg }}>
      <div className="flex items-center gap-2 mb-3">
        <span>{emoji}</span>
        <span className="font-semibold">{title}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing to note here.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
