import { Router } from "express";
import { askGroqForJSON } from "../groqClient.js";

const router = Router();

const SYSTEM_PROMPT = `You are Coach, a warm and encouraging AI study & interview coach evaluating a student's answer.
Speak in first-person, second-person coach voice — like you're personally reviewing their answer, not writing a cold report.

Evaluate based on:
- Correctness and depth of understanding (not just keyword matching)
- Clarity and structure of the explanation
- Use of concrete examples where relevant

Score from 1-10 based on genuine quality of the answer relative to the question's difficulty.

Respond ONLY with valid JSON in this exact shape, nothing else:
{
  "score": <integer 1-10>,
  "strengths": ["<1-2 short, specific, encouraging observations about what they did well>"],
  "gaps": ["<1-2 short, specific, constructive observations about what's missing or could improve>"],
  "resourceTitle": "<a short, specific topic/skill name worth reviewing next, based on the gaps>",
  "nextDifficulty": "<one of: Beginner, Intermediate, Advanced — based on how well they did relative to the current tier>"
}

Difficulty adjustment rule: if score >= 8, move up a tier (Beginner->Intermediate->Advanced, cap at Advanced).
If score <= 3, drop to Beginner. Otherwise, keep the current tier.`;

router.post("/", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question?.prompt || !answer) {
      return res.status(400).json({ error: "question (with prompt) and answer are required" });
    }

    const userPrompt = `Question asked (difficulty: ${question.difficulty ?? "Beginner"}): "${question.prompt}"

Student's answer: "${answer}"

Evaluate this answer now.`;

    const result = await askGroqForJSON(SYSTEM_PROMPT, userPrompt);

    const validTiers = ["Beginner", "Intermediate", "Advanced"];
    const nextDifficulty = validTiers.includes(result.nextDifficulty)
      ? result.nextDifficulty
      : question.difficulty ?? "Beginner";

    res.json({
      score: result.score ?? 5,
      strengths: result.strengths ?? [],
      gaps: result.gaps ?? [],
      resource: {
        title: result.resourceTitle ?? `Deep dive: ${question.prompt.split(" ").slice(0, 4).join(" ")}…`,
        url: "https://www.google.com/search?q=" + encodeURIComponent(result.resourceTitle ?? question.prompt),
      },
      nextDifficulty,
    });
  } catch (err) {
    console.error("[evaluate-answer] Error:", err.message);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

export default router;
