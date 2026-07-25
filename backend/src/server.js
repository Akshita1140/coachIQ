import "dotenv/config";
import express from "express";
import cors from "cors";
import { requireAuth } from "./firebaseAdmin.js";
import { groqRateLimiter } from "./rateLimiter.js";
import generateQuestionsRoute from "./routes/generateQuestions.js";
import evaluateAnswerRoute from "./routes/evaluateAnswer.js";
import generateLearningPathRoute from "./routes/generateLearningPath.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

// Health check — no auth required, useful for Render/uptime checks
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Protected routes — every request must carry a valid Firebase ID token,
// then is subject to per-user rate limiting before hitting Groq.
app.use("/api/generate-questions", requireAuth, groqRateLimiter, generateQuestionsRoute);
app.use("/api/evaluate-answer", requireAuth, groqRateLimiter, evaluateAnswerRoute);
app.use("/api/generate-learning-path", requireAuth, groqRateLimiter, generateLearningPathRoute);

app.listen(PORT, () => {
  console.log(`CoachIQ backend listening on port ${PORT}`);
});
