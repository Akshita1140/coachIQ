import { getFirebaseAuth } from "./firebase";
import { mockEvaluate, mockGenerateQuestion } from "./mock-api";
import type { Difficulty, Feedback, Mode, Question } from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

async function authHeaders(): Promise<Record<string, string>> {
  const auth = getFirebaseAuth();
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generateQuestion(params: {
  mode: Mode;
  topic: string;
  difficulty: Difficulty;
  index: number;
  history: { prompt: string; answer: string }[];
}): Promise<Question> {
  if (!BASE) return mockGenerateQuestion(params.mode, params.topic, params.difficulty, params.index);
  const res = await fetch(`${BASE}/api/generate-questions`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`generate-questions failed: ${res.status}`);
  return res.json();
}

export async function evaluateAnswer(params: {
  question: Question;
  answer: string;
  mode: Mode;
  topic: string;
}): Promise<Feedback> {
  if (!BASE) return mockEvaluate(params.question, params.answer);
  const res = await fetch(`${BASE}/api/evaluate-answer`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`evaluate-answer failed: ${res.status}`);
  return res.json();
}

export const isBackendConfigured = Boolean(BASE);
