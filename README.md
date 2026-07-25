# CoachIQ

Coach is a Gen AI-powered study and interview prep tool that takes a topic or job role, generates dynamic practice questions, evaluates your answers in real time, and delivers structured, personalized feedback — adapting difficulty as you go. It also supports booking 1:1 mentor sessions via Google Calendar.

Built for **InnovaHack Chapter-1**.

Stack: **Vite + React** (frontend) · **Express** (backend) · **Firebase Auth** (Google sign-in + ID token verification) · **Google Calendar API** (mentor scheduling).

---

## Project structure

```
coachiq/
├── src/                     # React frontend
│   ├── components/
│   │   └── MentorScheduler.jsx
│   ├── lib/
│   │   ├── api.js           # calls backend, falls back to mock-api if no backend configured
│   │   └── mock-api.js      # local mock responses (no backend needed for demo)
│   └── pages/
│       └── Recap.jsx
├── backend/
│   ├── scripts/
│   │   └── getGoogleRefreshToken.js   # one-time OAuth setup for mentor's Calendar
│   ├── src/
│   │   ├── firebaseAdmin.js           # Firebase Admin init + requireAuth middleware
│   │   ├── googleCalendar.js          # Calendar freebusy + event creation
│   │   ├── server.js
│   │   └── routes/
│   │       ├── mentorAvailability.js
│   │       └── scheduleMentorSession.js
│   ├── package.json
│   └── .env                 # NOT committed — see below
├── .env                     # frontend env vars — NOT committed
└── README.md
```

---

## 1. Clone & install

```bash
git clone https://github.com/Akshita1140/coachIQ.git
cd coachIQ

# frontend deps
npm install

# backend deps
cd backend
npm install
cd ..
```

---

## 2. Frontend setup

Copy the example env file and fill it in:

```bash
cp .env.example .env
```

**Firebase (Google sign-in)**
1. Go to the [Firebase Console](https://console.firebase.google.com/) → create a project → add a **Web app**.
2. Copy the generated config values into `.env` (`VITE_FIREBASE_*` keys, matching whatever names `.env.example` uses).
3. In **Authentication → Sign-in method**, enable **Google**.
4. In **Authentication → Settings → Authorized domains**, add `localhost` (for dev) and your production domain (for deploy).

**Backend connection**
```
VITE_API_BASE_URL=http://localhost:5000
```
If this is left unset, the app runs entirely on local mock responses (`src/lib/mock-api.js`) — the full journey (login → home → 6 questions → recap) works end-to-end without a backend, which is useful for quick demos.

Run the frontend:
```bash
npm run dev
```

---

## 3. Backend setup

### 3a. Firebase Admin (verifies ID tokens sent from the frontend)

1. Firebase Console → **Project settings** → **Service accounts** tab → **Generate new private key**. This downloads a JSON file.
2. From that JSON, set these three vars in `backend/.env` — **do not** paste the whole JSON blob as one variable, it's fragile across hosting platforms:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
```

Notes on `FIREBASE_PRIVATE_KEY`:
- Copy it **exactly** from the JSON file, keeping `\n` as literal two-character escapes.
- Wrap it in double quotes.
- If pasting into a hosting platform's dashboard (Vercel/Render/Railway/etc.), paste it as a single line — some UIs "helpfully" convert `\n` into real line breaks, which breaks PEM parsing. If that happens, `backend/src/firebaseAdmin.js` normalizes `\n` back into real newlines at runtime, but the source value in `.env` should stay as literal `\n`.

On successful init you'll see in the backend logs:
```
[firebaseAdmin] Initialized successfully for project: <your-project-id>
```

### 3b. Google Calendar (mentor scheduling)

The backend acts **as the mentor** using a long-lived OAuth refresh token — students never need their own Google account or consent flow.

1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Library** → enable **Google Calendar API**.
2. **APIs & Services → Credentials** → create an **OAuth Client ID** (type: Desktop app is fine for this one-time script).
3. **APIs & Services → OAuth consent screen** → add the mentor's Google account under **Test users** (required while the app is unverified).
4. Set in `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
   ```
5. Run the one-time setup script:
   ```bash
   cd backend
   node scripts/getGoogleRefreshToken.js
   ```
6. Open the printed URL, sign in with the **mentor's** Google account, approve access.
   - You'll see an "unverified app" warning — click **Advanced → Go to [app name] (unsafe)**. This is expected and safe since you're the developer authorizing your own app.
7. Copy the `code` param from the redirected URL, paste it into the terminal prompt.
8. Copy the printed `GOOGLE_REFRESH_TOKEN` into `backend/.env`.

```
GOOGLE_REFRESH_TOKEN=1//...
MENTOR_TIMEZONE=Asia/Kolkata
```

**Scope note:** the script requests `https://www.googleapis.com/auth/calendar` (full access). This is required because the backend uses both `freebusy.query` (to compute open slots) and `events.insert` (to book sessions + generate Meet links) — a narrower scope like `calendar.events` alone will fail on the free/busy lookup with an "Insufficient Permission" error.

### 3c. Run the backend

```bash
cd backend
npm run dev    # or: node src/server.js
```

You should see it listening on port 5000 (or whatever `PORT` is set to).

---

## 4. Environment files checklist

| File | Committed? | Contains |
|---|---|---|
| `.env` (root) | ❌ No | Firebase web config, `VITE_API_BASE_URL` |
| `backend/.env` | ❌ No | Firebase Admin credentials, Google OAuth credentials/refresh token |
| `.env.example` | ✅ Yes | Placeholder keys only, no real secrets |

Confirm both `.env` files are actually ignored before pushing:
```bash
git check-ignore .env backend/.env
```
Both paths should print. If not, add them to `.gitignore` immediately.

---

## API endpoints (backend)

All authenticated endpoints expect `Authorization: Bearer <firebase-id-token>`.

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `/api/generate-questions` | `{ mode, topic, difficulty, index, history }` | `{ id, prompt, difficulty }` |
| POST | `/api/evaluate-answer` | `{ question, answer, mode, topic }` | `{ score (1–10), strengths[], gaps[], resource: {title, url}, nextDifficulty }` |
| GET | `/api/mentor-availability` | — | `{ slots: [{ start, end }] }` |
| POST | `/api/schedule-mentor-session` | `{ start, end, topic }` | `{ eventId, meetLink, calendarLink, start, end }` |

---

## App screens

1. **Login** — Google sign-in gate
2. **Home** — pick Topic or Interview + enter subject/role
3. **Session** — 6-question adaptive journey with progress checkpoints
4. **Feedback** — per-question score, strengths, gaps, resource
5. **Recap** — overall score, growth arc, resources, restart
6. **Mentor scheduling** — view open slots, book a session (creates a Calendar event + Meet link, emails the student an invite)

---

## Deploying

Before deploying, make sure your hosting platform's environment has **all** of the following set (not just your local `.env` files):

- `VITE_FIREBASE_*` / `VITE_API_BASE_URL` (frontend build env)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (backend)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_REDIRECT_URI`, `MENTOR_TIMEZONE` (backend)
- Update Firebase **Authorized domains** and `GOOGLE_REDIRECT_URI` to reflect your production URL, not `localhost`.