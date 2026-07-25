export type Mode = "topic" | "interview";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type Question = {
  id: string;
  prompt: string;
  difficulty: Difficulty;
};

export type Feedback = {
  score: number;
  strengths: string[];
  gaps: string[];
  resource: { title: string; url: string };
  nextDifficulty: Difficulty;
};
