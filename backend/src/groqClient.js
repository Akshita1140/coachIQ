import Groq from "groq-sdk";

let client = null;

export function getGroqClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables.");
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

const MODEL = "llama-3.3-70b-versatile";

/**
 * Calls Groq's chat completion and returns parsed JSON.
 * Prompts instruct the model to respond ONLY with JSON.
 */
export async function askGroqForJSON(systemPrompt, userPrompt) {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text);
}
