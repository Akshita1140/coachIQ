import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "../lib/session-store";
import type { Mode } from "../lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoachIQ — Your AI coach for exams & interviews" },
      {
        name: "description",
        content:
          "Warm, journey-style AI coaching for students. Master a topic or crack an interview, one conversational question at a time.",
      },
      { property: "og:title", content: "CoachIQ — Your AI coach" },
      {
        property: "og:description",
        content: "Warm, journey-style AI coaching for exams and interviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [topic, setTopic] = useState("");
  const start = useSession((s) => s.startSession);
  const navigate = useNavigate();

  const canStart = mode && topic.trim().length > 1;

  const handleStart = () => {
    if (!canStart || !mode) return;
    start(mode, topic.trim());
    navigate({ to: "/session" });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 sm:py-16">
      <div className="mb-10">
        <p className="text-sm font-medium text-[var(--coach-coral)] mb-2">Hey there 👋</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          What are we training for today?
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Pick a path, tell me the specifics, and I'll meet you at your level.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <PathCard
          selected={mode === "topic"}
          onClick={() => setMode("topic")}
          emoji="📚"
          title="Master a Topic"
          subtitle="Build understanding for exams, coursework, or curiosity"
          accent="teal"
        />
        <PathCard
          selected={mode === "interview"}
          onClick={() => setMode("interview")}
          emoji="💼"
          title="Crack an Interview"
          subtitle="Practice questions for a role you're chasing"
          accent="coral"
        />
      </div>

      <div className="rounded-3xl bg-card border border-border/60 p-6 shadow-[var(--shadow-warm)]">
        <label className="block text-sm font-medium mb-2">
          {mode === "interview"
            ? "What role are you interviewing for?"
            : mode === "topic"
              ? "What topic do you want to master?"
              : "What are you focusing on?"}
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={
            mode === "interview"
              ? "e.g. Frontend engineer at a startup"
              : "e.g. Organic chemistry basics"
          }
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--coach-coral)]/40 focus:border-[var(--coach-coral)] transition"
        />
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="mt-5 w-full rounded-2xl bg-[var(--coach-coral)] text-white py-3.5 font-medium hover:brightness-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Session →
        </button>
      </div>
    </div>
  );
}

function PathCard({
  selected,
  onClick,
  emoji,
  title,
  subtitle,
  accent,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  subtitle: string;
  accent: "teal" | "coral";
}) {
  const ring =
    accent === "teal"
      ? "ring-[var(--coach-teal)]/60 bg-[var(--coach-teal-soft)]"
      : "ring-[var(--coach-coral)]/50 bg-[var(--coach-coral-soft)]";
  return (
    <button
      onClick={onClick}
      className={[
        "text-left rounded-3xl p-6 border transition-all",
        selected
          ? `ring-4 ${ring} border-transparent shadow-[var(--shadow-warm)]`
          : "bg-card border-border/60 hover:border-foreground/20 hover:shadow-[var(--shadow-warm)]",
      ].join(" ")}
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="font-display font-semibold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{subtitle}</div>
    </button>
  );
}
