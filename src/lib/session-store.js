import { create } from "zustand";

export const SESSION_LENGTH = 6;

export const useSession = create((set) => ({
  mode: null,
  topic: "",
  currentTier: "Beginner",
  questions: [],
  answers: [],
  feedbacks: [],
  startSession: (mode, topic) =>
    set({ mode, topic, currentTier: "Beginner", questions: [], answers: [], feedbacks: [] }),
  addQuestion: (q) => set((s) => ({ questions: [...s.questions, q] })),
  submitAnswer: (answer, feedback) =>
    set((s) => ({
      answers: [...s.answers, answer],
      feedbacks: [...s.feedbacks, feedback],
      currentTier: feedback.nextDifficulty,
    })),
  reset: () =>
    set({ mode: null, topic: "", currentTier: "Beginner", questions: [], answers: [], feedbacks: [] }),
}));
