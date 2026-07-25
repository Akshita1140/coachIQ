import { Router } from "express";
import { askGroqForJSON } from "../groqClient.js";

const router = Router();

// Coach-voice system prompt — warm, first-person, journey framing
const SYSTEM_PROMPT = `You are Coach, a warm and motivating AI study & interview coach speaking directly to a student.
You generate ONE practice question at a time, tailored to the mode (topic study vs job interview prep) and difficulty tier.

Rules:
- Topic mode: ask conceptual, exam-style questions that test real understanding, not just recall.
- Job Role mode: ask a mix of technical and behavioral interview questions relevant to the role.
- Match the question's depth to the difficulty tier: Beginner (foundational), Intermediate (applied/comparative), Advanced (nuanced trade-offs, edge cases, strategic thinking).
- Keep the question to 1-2 sentences, written in a friendly coach tone, as if speaking directly to the student.
- Do not repeat question phrasing patterns that feel templated — vary the angle each time.
- CRITICAL: You will be shown a list of questions already asked in this session. Never repeat one of
  those questions, never rephrase one of them, and never ask something that tests the exact same narrow
  point. Always cover new ground within the subject.

Respond ONLY with valid JSON in this exact shape, nothing else:
{ "prompt": "the question text" }`;

router.post("/", async (req, res) => {
  try {
    const { mode, topic, difficulty, index, history } = req.body;

    if (!mode || !topic || !difficulty) {
      return res.status(400).json({ error: "mode, topic, and difficulty are required" });
    }

    const historyBlock =
      Array.isArray(history) && history.length > 0
        ? `\nQuestions already asked in this session (do NOT repeat or rephrase any of these):\n` +
          history.map((h, i) => `${i + 1}. ${h.prompt}`).join("\n")
        : "";

    const userPrompt = `Mode: ${mode === "topic" ? "Topic study" : "Job interview prep"}
Subject: "${topic}"
Difficulty tier: ${difficulty}
Question number in this session: ${(index ?? 0) + 1}
${historyBlock}

Generate one NEW practice question now — distinct from anything already asked above.`;

    const result = await askGroqForJSON(SYSTEM_PROMPT, userPrompt);

    if (!result.prompt) {
      throw new Error("Groq response missing 'prompt' field");
    }

    res.json({
      id: `q_${Date.now()}_${index ?? 0}`,
      prompt: result.prompt,
      difficulty,
    });
  } catch (err) {
    console.error("[generate-questions] Error:", err.message);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

export default router;