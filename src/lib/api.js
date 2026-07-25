import { getFirebaseAuth } from "./firebase.js";
import { mockEvaluate, mockGenerateQuestion } from "./mock-api.js";

const BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeaders() {
  const auth = getFirebaseAuth();
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generateQuestion(params) {
  if (!BASE) return mockGenerateQuestion(params.mode, params.topic, params.difficulty, params.index);
  const res = await fetch(`${BASE}/api/generate-questions`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`generate-questions failed: ${res.status}`);
  return res.json();
}

export async function evaluateAnswer(params) {
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
