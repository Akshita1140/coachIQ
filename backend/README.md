# CoachIQ Backend

Express API for CoachIQ — handles AI question generation and answer evaluation via Groq,
protected by Firebase Authentication.

## Endpoints

- `POST /api/generate-questions` — body: `{ mode, topic, difficulty, index }` → returns `{ id, prompt, difficulty }`
- `POST /api/evaluate-answer` — body: `{ question, answer }` → returns `{ score, strengths, gaps, resource, nextDifficulty }`
- `GET /health` — no auth, returns `{ status: "ok" }`

Both `/api/*` routes require an `Authorization: Bearer <Firebase ID token>` header.
This matches exactly what the CoachIQ frontend (`src/lib/api.js`) sends.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Get your Groq API key
Go to https://console.groq.com/keys → create a key.

### 3. Get your Firebase service account JSON
1. Go to Firebase Console → your project (CoachIQ) → gear icon → **Project settings**
2. Go to the **Service accounts** tab
3. Click **Generate new private key** → a JSON file downloads
4. Open that file, copy its entire contents as one line

### 4. Create your `.env` file
```bash
cp .env.example .env
```
Then fill in:
- `GROQ_API_KEY` — from step 2
- `FIREBASE_SERVICE_ACCOUNT_JSON` — the full JSON from step 3, pasted as a single-line string
- `ALLOWED_ORIGINS` — your frontend URL(s), comma-separated (e.g. `http://localhost:5173,https://your-app.vercel.app`)

### 5. Run locally
```bash
npm run dev
```
Server starts on `http://localhost:5000` (or whatever `PORT` you set).

### 6. Connect the frontend
In the CoachIQ frontend's `.env`, set:
```
VITE_API_BASE_URL=http://localhost:5000
```
(or your deployed Render URL once deployed)

## Deploy to Render

1. Push this backend to its own GitHub repo (or a `backend/` folder in your main repo)
2. On Render: New → Web Service → connect the repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add the same environment variables from `.env` in Render's dashboard (Environment tab)
6. Once deployed, copy the Render URL and set it as `VITE_API_BASE_URL` in your frontend's Vercel environment variables
7. Add your Vercel frontend URL to `ALLOWED_ORIGINS` in Render's env vars

## Notes

- If `GROQ_API_KEY` or `FIREBASE_SERVICE_ACCOUNT_JSON` are missing, requests will fail with clear error logs — check server console.
- The frontend already falls back to `mock-api.js` if `VITE_API_BASE_URL` is unset, so you can test the UI without this backend running if needed.
