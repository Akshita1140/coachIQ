# CoachIQ

**A Gen AI-powered study & interview coach — practice questions, real-time evaluation, and adaptive difficulty, plus live mentor booking.**

Built for **InnovaHack Chapter-1**.

---

## Why

Most exam/interview prep tools give you static question banks and no real feedback loop. CoachIQ instead behaves like a mentor: it asks you a question, evaluates *how* you answered (not just right/wrong), tells you what you're missing, and adjusts the next question's difficulty accordingly. When self-practice isn't enough, it lets you book a real 1:1 session with a human mentor — directly from the app, with a Calendar invite and Meet link generated automatically.

## What

- Pick a **topic** (e.g. "System Design") or an **interview mode** (e.g. "SDE-1 at a product company")
- Answer a 6-question adaptive session — each question's difficulty depends on how well you did on the last one
- Get structured feedback per answer: score (1–10), strengths, gaps, and a suggested resource
- See a **Recap** at the end: overall score, growth arc across the session, and consolidated resources
- Optionally, **book a mentor session**: the app shows real open slots on the mentor's calendar and books it with one click

## How — System Architecture

```
+-----------------------------+
|         Frontend            |
|   Vite + React (src/)       |
|                              |
|  Login -> Home -> Session   |
|  -> Feedback -> Recap       |
|  -> Mentor Scheduler        |
+-------------+----------------+
              | 1. Google Sign-In
              v
+-----------------------------+
|      Firebase Auth          |
|  issues ID token to client  |
+-------------+----------------+
              | 2. every API call carries
              |    Authorization: Bearer <id-token>
              v
+-------------------------------------------------+
|                Backend (Express)                 |
|                backend/src/                       |
|                                                    |
|  requireAuth middleware                           |
|   -> Firebase Admin verifies the ID token          |
|                                                    |
|  +----------------------+   +--------------------+ |
|  | /generate-questions  |   | /mentor-availability | |
|  | /evaluate-answer     |   | /schedule-mentor-     | |
|  |  (Gen AI logic)       |   |  session             | |
|  +----------------------+   +----------+----------+ |
+---------------------------------------|-------------+
                                         | 3. OAuth2 (mentor's
                                         |    refresh token --
                                         |    students never
                                         |    auth with Google)
                                         v
                            +------------------------+
                            |   Google Calendar API   |
                            |  freebusy.query          |
                            |  events.insert (+ Meet)  |
                            +------------------------+
```

**Two independent auth flows, on purpose:**
1. **Firebase Auth** -- identifies *students* using the app (Google sign-in -> ID token -> verified on every backend request).
2. **Google OAuth (server-side, one-time)** -- lets the backend act *as the mentor* to read/write the mentor's calendar. Set up once via a script; students never see or need this.

**Fallback for demos:** if `VITE_API_BASE_URL` isn't set, the frontend runs entirely on local mock responses (`src/lib/mock-api.js`) -- the full login -> session -> recap journey works with zero backend running.

---

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | UI components & state |
| Frontend | Vite | Dev server & bundler |
| Frontend | JavaScript (ESM) | App logic |
| Frontend | CSS | Styling (`styles.css`) |
| Backend | Node.js | Runtime |
| Backend | Express | REST API & routing |
| Backend | Gen AI logic | Question generation + answer evaluation |
| Auth | Firebase Auth | Google sign-in, student identity |
| Auth | Firebase Admin SDK | Verifies ID tokens server-side |
| Integration | Google Calendar API | `freebusy` lookups + event creation |
| Integration | Google OAuth2 | Mentor-side refresh token (server acts as mentor) |
| Integration | Google Meet | Auto-generated video link on booking |

## Database

**There isn't one — the app is intentionally stateless, for now.**

- Student identity is handled entirely by Firebase Auth (no user profile table).
- Questions, answers, and scores are generated per-request and held in React state on the frontend — a refresh mid-session loses progress.
- Mentor availability and bookings use **Google Calendar as the source of truth** — `freebusy.query` reads existing events, `events.insert` writes new ones. No separate slots/bookings table exists.

**Why no database yet:** for a hackathon-scope MVP, the priority was proving the core loop — adaptive questions, real-time evaluation, and mentor booking — end-to-end, without the overhead of schema design, migrations, or hosting a DB. Google Calendar already acts as a "database" for scheduling, and React state is enough to demo a single session.

**Future integration:** the plan is to add **Firestore** (natural fit since the project already runs on Firebase) to support:
- Persisting session history so users can resume or review past sessions
- Tracking progress/scores over time per user, to show real improvement trends
- A leaderboard or streaks across users
- Storing mentor session history (who booked what, with notes/outcomes) instead of relying solely on Calendar events


## Project structure

```
coachiq/
├── src/                     # React frontend
│   ├── components/MentorScheduler.jsx
│   ├── lib/api.js           # real backend calls, falls back to mock-api.js
│   ├── lib/mock-api.js      # local mock responses (no backend needed)
│   └── pages/Recap.jsx
├── backend/
│   ├── scripts/getGoogleRefreshToken.js   # one-time mentor Calendar auth
│   └── src/
│       ├── firebaseAdmin.js               # verifies student ID tokens
│       ├── googleCalendar.js              # freebusy + event creation
│       ├── server.js
│       └── routes/
│           ├── mentorAvailability.js
│           └── scheduleMentorSession.js
└── README.md
```

## API surface

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/generate-questions` | student token | generate next adaptive question |
| POST | `/api/evaluate-answer` | student token | score answer, return strengths/gaps/resource |
| GET | `/api/mentor-availability` | student token | open 30-min slots, next 7 days |
| POST | `/api/schedule-mentor-session` | student token | books slot, creates Calendar event + Meet link, emails invite |

## Quick run

```bash
# frontend
npm install && npm run dev

# backend
cd backend && npm install && npm run dev
```

Env vars needed: Firebase web config + `VITE_API_BASE_URL` (frontend); `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` + `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` (backend). See `.env.example` in each folder for the full list.
