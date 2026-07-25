import { Router } from "express";
import { askGroqForJSON } from "../groqClient.js";

const router = Router();

// Fixed set of real platforms we know how to build working search URLs for.
// Groq picks from this list so every link is guaranteed real and functional —
// never a hallucinated or broken URL.
const PLATFORM_URL_BUILDERS = {
  "YouTube": (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  "Coursera": (q) => `https://www.coursera.org/search?query=${encodeURIComponent(q)}`,
  "Khan Academy": (q) => `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(q)}`,
  "freeCodeCamp": (q) => `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(q)}`,
  "GeeksforGeeks": (q) => `https://www.geeksforgeeks.org/?s=${encodeURIComponent(q)}`,
  "LeetCode": (q) => `https://leetcode.com/problemset/all/?search=${encodeURIComponent(q)}`,
  "edX": (q) => `https://www.edx.org/search?q=${encodeURIComponent(q)}`,
  "MDN Web Docs": (q) => `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(q)}`,
  "Udemy": (q) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}`,
  "W3Schools": (q) => `https://www.google.com/search?q=site:w3schools.com+${encodeURIComponent(q)}`,
};

const PLATFORM_LIST = Object.keys(PLATFORM_URL_BUILDERS);

const SYSTEM_PROMPT = `You are Coach, a warm AI mentor building a personalized learning journey for a student
based on gaps identified across their practice session.

You will be given the subject/role and a list of gap notes gathered from their answers.
Design a set of "island stops" — a small, ordered sequence of learning stages that takes the student
from where they currently are up to solid command of the subject. Each island builds on the previous one.

Rules:
- 3 to 4 islands total. Never more, never fewer than needed if gaps are thin (minimum 3).
- Order islands from foundational -> intermediate -> advanced.
- Each island needs: a short title (topic/skill name), a 1-sentence description of what to focus on
  and why it matters given their specific gaps, and a REAL platform recommendation.
- For "platform", you MUST choose exactly one value from this list (nothing else, spelled exactly as shown):
  ${PLATFORM_LIST.join(", ")}
- Choose the platform that genuinely fits the island's content: coding/CS topics suit GeeksforGeeks,
  LeetCode, freeCodeCamp, or MDN Web Docs; broader academic or conceptual topics suit Khan Academy,
  Coursera, or edX; video walkthroughs suit YouTube; structured paid courses suit Udemy or Coursera.
- Also provide "resourceQuery": a short, specific search phrase (3-6 words) that would find a genuinely
  useful result on that platform for this island's topic.
- Ground each island in the actual gaps provided — don't give generic advice unrelated to what they
  struggled with.
- Keep tone warm and encouraging, never clinical.

Respond ONLY with valid JSON in this exact shape, nothing else:
{
  "islands": [
    { "step": 1, "title": "...", "description": "...", "platform": "one of the exact platform names above", "resourceQuery": "..." }
  ]
}`;

router.post("/", async (req, res) => {
  try {
    const { mode, topic, gaps } = req.body;

    if (!topic || !Array.isArray(gaps)) {
      return res.status(400).json({ error: "topic and gaps (array) are required" });
    }

    const gapsList = gaps.length > 0
      ? gaps.map((g, i) => `${i + 1}. ${g}`).join("\n")
      : "No specific gaps recorded — build a general foundational-to-advanced path for this subject.";

    const userPrompt = `Subject/role: "${topic}" (${mode === "topic" ? "topic study" : "job interview prep"})

Gaps identified during the session:
${gapsList}

Build the island journey now.`;

    const result = await askGroqForJSON(SYSTEM_PROMPT, userPrompt);
    const islands = Array.isArray(result.islands) ? result.islands : [];

    res.json({
      islands: islands.map((island, i) => {
        const platform = PLATFORM_URL_BUILDERS[island.platform] ? island.platform : "YouTube";
        const query = island.resourceQuery || island.title || topic;
        return {
          step: island.step ?? i + 1,
          title: island.title ?? "Keep exploring",
          description: island.description ?? "",
          platform,
          resourceUrl: PLATFORM_URL_BUILDERS[platform](query),
        };
      }),
    });
  } catch (err) {
    console.error("[generate-learning-path] Error:", err.message);
    res.status(500).json({ error: "Failed to generate learning path" });
  }
});

export default router;
