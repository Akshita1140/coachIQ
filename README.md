# CoachIQ (JavaScript)

Warm, mentor-like AI coach for exam & interview prep. Vite + React + Firebase Auth.

## Setup

```bash
npm install       # or: bun install / pnpm install
cp .env.example .env   # fill in Firebase + optional backend URL
npm run dev
```

## What to plug in

**Firebase (Google sign-in)** — Firebase console → create Web app → copy config into `.env`. In Authentication → Sign-in method, enable Google. Add your dev domain (e.g. `localhost`) to authorized domains.

**Express backend** — set `VITE_API_BASE_URL` to your API root. If unset, the app runs on local mock responses so the full journey (login → home → 6 questions → recap) works end-to-end.

Endpoints expected:

- `POST /api/generate-questions` — body `{ mode, topic, difficulty, index, history }` → `{ id, prompt, difficulty }`
- `POST /api/evaluate-answer` — body `{ question, answer, mode, topic }` → `{ score (1–10), strengths[], gaps[], resource: {title, url}, nextDifficulty }`

Requests include `Authorization: Bearer <firebase-id-token>` when signed in.

## Screens

1. **Login** — Google sign-in gate
2. **Home** — pick Topic or Interview + enter subject/role
3. **Session** — 6-question adaptive journey with progress checkpoints
4. **Feedback** — per-question score, strengths, gaps, resource
5. **Recap** — overall score, growth arc, resources, restart
