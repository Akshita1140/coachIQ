
## CoachIQ — Plan

An AI study/interview coach frontend. React + TanStack Start, Firebase Google Auth gating the whole app, and a clean API client that talks to your external Express backend (with local mocks so the flow is demoable now).

## Auth (Firebase, Google-only)

- Add `firebase` SDK. Create `src/lib/firebase.ts` reading config from `VITE_FIREBASE_*` env vars (apiKey, authDomain, projectId, appId, messagingSenderId, storageBucket).
- `src/lib/auth-context.tsx` — React context providing `{ user, loading, signInWithGoogle, signOut }` using `onAuthStateChanged` + `signInWithPopup(GoogleAuthProvider)`.
- Gate the whole app in `__root.tsx`: while loading show a splash, if no user show the Login screen, otherwise render `<Outlet />`. This keeps routing simple for an MVP (no protected route layer needed).
- I'll list the required env vars in a short README note; you paste your Firebase web config values into `.env` and they're picked up via `import.meta.env`.

## API layer

- `src/lib/api.ts` exports `generateQuestions({ mode, topic, difficulty, history })` and `evaluateAnswer({ question, answer, mode, topic })`.
- Base URL: `import.meta.env.VITE_API_BASE_URL`. Endpoints: `POST /api/generate-questions`, `POST /api/evaluate-answer`. Sends Firebase ID token as `Authorization: Bearer <token>` so your Express backend can verify it later.
- Mock fallback: if `VITE_API_BASE_URL` is unset, functions return canned questions/feedback (with a small artificial delay) so the full journey works end-to-end during the hackathon demo.
- Difficulty tiers ramp: Beginner → Intermediate → Advanced based on evaluation score returned by backend (mock uses a simple rule). Session length: 6 questions default.

## Screens & routing

File-based routes under `src/routes/`:

- `index.tsx` — Home / Mode Selection (post-login). Warm greeting, two path cards (Master a Topic / Crack an Interview), topic/role text input, "Start Session".
- `session.tsx` — Question screen. Reads mode+topic from a lightweight Zustand store (`src/lib/session-store.ts`), shows one question at a time, journey checkpoint progress bar with tier label, answer textarea, "Submit Answer". After submit routes to feedback view (same route, phase state) → "Next Question" advances; after final question routes to recap.
- `recap.tsx` — Milestone-styled summary: aggregated strengths, gap topics, tier reached, resource list, "Start New Session" → `/`.
- Login is not a route — it's rendered by the root gate when unauthenticated (keeps deep links working: after sign-in the user lands where they intended).

Feedback is a phase within `session.tsx` (not a separate route) so we keep session state local and avoid URL-driven state juggling for the MVP.

## Session state

Zustand store holds: `mode`, `topic`, `questions[]`, `currentIndex`, `answers[]`, `feedbacks[]`, `currentTier`. Lives in memory only — refresh returns you to Home. Good enough for a hackathon MVP; can swap to persisted later.

## Design system

Update `src/styles.css` tokens (light theme only for MVP, dark preserved):
- Base: deep indigo `oklch(~0.32 0.09 275)` as primary, teal `oklch(~0.55 0.10 200)` as secondary/accent-cool.
- Accent: warm coral `oklch(~0.72 0.17 32)` for CTAs, amber `oklch(~0.82 0.15 75)` for "gaps" highlights, sage green for "strengths".
- Radius bumped to `0.875rem`, soft shadow token `--shadow-warm`, generous section padding.
- Typography: Plus Jakarta Sans (body) + Fraunces (display headings) via `<link>` in `__root.tsx` head; register `--font-sans` / `--font-display` in `@theme`.
- Journey motif: a horizontal path of connected checkpoints (SVG dots + connectors), current node pulsing coral, past nodes filled teal, upcoming muted. Reused on Question screen (per-question progress) and Recap (as a completed trail).

## Head metadata

Set app-specific title/description/OG on `__root.tsx` ("CoachIQ — Your AI coach for exams & interviews") and per-route `head()` on `/`, `/session`, `/recap`.

## Files to add / change

New:
- `src/lib/firebase.ts`, `src/lib/auth-context.tsx`
- `src/lib/api.ts`, `src/lib/mock-api.ts`
- `src/lib/session-store.ts`
- `src/components/JourneyProgress.tsx`, `src/components/LoginScreen.tsx`, `src/components/PathCard.tsx`, `src/components/QuestionCard.tsx`, `src/components/FeedbackCard.tsx`
- `src/routes/session.tsx`, `src/routes/recap.tsx`

Change:
- `src/routes/__root.tsx` — wrap in `AuthProvider`, add auth gate, fonts, meta, top bar with user avatar + sign-out
- `src/routes/index.tsx` — replace placeholder with Home
- `src/styles.css` — new tokens, fonts

Packages: `firebase`, `zustand`.

## What's out of scope

- No backend AI logic (mocks only until you set `VITE_API_BASE_URL`).
- No persistence of past sessions (memory only).
- No email/password or providers other than Google.
- No dark-mode toggle UI (tokens preserved but not exposed).

After you approve, I'll implement, then verify build + a quick preview screenshot of the login and home screens.
