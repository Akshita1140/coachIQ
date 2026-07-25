const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const topicPool = (topic, mode, difficulty) => {
  const label = topic.trim() || (mode === "topic" ? "your subject" : "the role");
  if (mode === "topic") {
    return {
      Beginner: [
        `In your own words, what is ${label} and why does it matter?`,
        `Describe one everyday example where ${label} shows up.`,
      ],
      Intermediate: [
        `Compare two core concepts in ${label} and when you'd use each.`,
        `What common misconception about ${label} trips people up?`,
      ],
      Advanced: [
        `Walk through a nuanced trade-off you'd weigh when applying ${label} at scale.`,
        `Where does the conventional wisdom about ${label} start to break down?`,
      ],
    }[difficulty];
  }
  return {
    Beginner: [
      `Tell me about yourself and why you're excited about ${label}.`,
      `What draws you to this ${label} role specifically?`,
    ],
    Intermediate: [
      `Walk me through a project where you demonstrated skills relevant to ${label}.`,
      `Describe a time you disagreed with a teammate. How did you handle it?`,
    ],
    Advanced: [
      `Tell me about the hardest technical or strategic decision you've made recently.`,
      `How would you approach your first 90 days as a ${label}?`,
    ],
  }[difficulty];
};

export async function mockGenerateQuestion(mode, topic, difficulty, index) {
  await wait(350);
  const pool = topicPool(topic, mode, difficulty);
  const prompt = pool[index % pool.length];
  return { id: `q_${Date.now()}_${index}`, prompt, difficulty };
}

export async function mockEvaluate(question, answer) {
  await wait(450);
  const len = answer.trim().length;
  const score = Math.min(10, Math.max(1, Math.round(len / 30)));
  const strong = score >= 6;
  return {
    score,
    strengths: strong
      ? ["You structured your answer clearly and stayed on-topic.", "Nice use of a concrete example to ground the idea."]
      : ["You made a genuine attempt and identified the right starting point."],
    gaps: strong
      ? ["Try tightening the conclusion — one sentence that lands the takeaway."]
      : ["Add a specific example to make it tangible.", "Expand on the 'why' behind your reasoning."],
    resource: {
      title: `Deep dive: ${question.prompt.split(" ").slice(0, 4).join(" ")}…`,
      url: "https://www.google.com/search?q=" + encodeURIComponent(question.prompt),
    },
    nextDifficulty:
      score >= 8 ? (question.difficulty === "Beginner" ? "Intermediate" : "Advanced")
      : score <= 3 ? "Beginner"
      : question.difficulty,
  };
}
