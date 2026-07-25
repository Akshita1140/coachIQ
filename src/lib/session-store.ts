import { create } from "zustand";
import type { Difficulty, Feedback, Mode, Question } from "./types";

export const SESSION_LENGTH = 6;

type State = {
  mode: Mode | null;
  topic: string;
  currentTier: Difficulty;
  questions: Question[];
  answers: string[];
  feedbacks: Feedback[];
  startSession: (mode: Mode, topic: string) => void;
  addQuestion: (q: Question) => void;
  submitAnswer: (answer: string, feedback: Feedback) => void;
  reset: () => void;
};

export const useSession = create<State>((set) => ({
  mode: null,
  topic: "",
  currentTier: "Beginner",
  questions: [],
  answers: [],
  feedbacks: [],
  startSession: (mode, topic) =>
    set({
      mode,
      topic,
      currentTier: "Beginner",
      questions: [],
      answers: [],
      feedbacks: [],
    }),
  addQuestion: (q) => set((s) => ({ questions: [...s.questions, q] })),
  submitAnswer: (answer, feedback) =>
    set((s) => ({
      answers: [...s.answers, answer],
      feedbacks: [...s.feedbacks, feedback],
      currentTier: feedback.nextDifficulty,
    })),
  reset: () =>
    set({
      mode: null,
      topic: "",
      currentTier: "Beginner",
      questions: [],
      answers: [],
      feedbacks: [],
    }),
}));
