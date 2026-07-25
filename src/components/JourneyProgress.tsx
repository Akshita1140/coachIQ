import type { Difficulty } from "../lib/types";

type Props = {
  total: number;
  current: number; // 0-based index of current question
  tier: Difficulty;
  completed?: boolean;
};

export function JourneyProgress({ total, current, tier, completed }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your journey
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--coach-teal-soft)] text-[var(--coach-teal-ink)]">
          {tier}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const isPast = completed || i < current;
          const isCurrent = !completed && i === current;
          return (
            <div key={i} className="flex-1 flex items-center gap-1.5">
              <div
                className={[
                  "h-3 w-3 rounded-full transition-all shrink-0",
                  isPast
                    ? "bg-[var(--coach-teal)] scale-100"
                    : isCurrent
                      ? "bg-[var(--coach-coral)] ring-4 ring-[var(--coach-coral)]/25 scale-110"
                      : "bg-border scale-90",
                ].join(" ")}
              />
              {i < total - 1 && (
                <div
                  className={[
                    "h-0.5 flex-1 rounded-full",
                    isPast ? "bg-[var(--coach-teal)]" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {completed
          ? `Journey complete · ${total} of ${total}`
          : `Checkpoint ${Math.min(current + 1, total)} of ${total}`}
      </div>
    </div>
  );
}
