const { getOpenAIClient } = require('../config/openai');

const MODEL = 'gemini-2.5-flash';

/**
 * Retry a Gemini call with exponential backoff on 429 rate limit errors
 */
const withRetry = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('quota');

      if (isRateLimit && attempt < maxRetries) {
        const waitMs = attempt * 5000;
        console.log(`[AI] Rate limited. Retrying in ${waitMs / 1000}s... (attempt ${attempt}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, waitMs));
      } else {
        throw err;
      }
    }
  }
};

/**
 * Generate a detailed study guide for a task topic
 */
const generateStudyContent = async (taskTitle, taskType, targetRole) => {
  const ai = getOpenAIClient();

  const prompt = `You are an expert technical educator. Generate a thorough study guide for the following topic.

Task: "${taskTitle}"
Type: ${taskType}
Learner Goal: Become a ${targetRole}

Return a JSON object with EXACTLY this structure:
{
  "title": "Study guide title",
  "overview": "2-3 sentence introduction to this topic",
  "estimatedReadTime": "e.g. 15 min",
  "featuredVideo": { "title": "...", "searchQuery": "Exact YouTube search term to find a tutorial for this topic" },
  "sections": [
    {
      "heading": "Section heading",
      "content": "Detailed explanation (2-4 paragraphs). Use plain text only, no markdown.",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "codeExample": {
    "language": "javascript or relevant language, or null if not applicable",
    "code": "A practical code snippet demonstrating the concept, or null",
    "explanation": "What this code demonstrates, or null"
  },
  "summary": ["Point 1", "Point 2"],
  "practiceIdeas": ["Practice idea 1", "Practice idea 2", "Practice idea 3"]
}

Rules:
- If the task title implies watching a video/tutorial, provide a "featuredVideo" with a title and a "searchQuery".
- Include 3-5 sections with real depth
- All content must be accurate and educational`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    
    const parsed = JSON.parse(response.text);
    if (parsed.featuredVideo && parsed.featuredVideo.searchQuery) {
      parsed.featuredVideo.url = `https://www.youtube.com/results?search_query=${encodeURIComponent(parsed.featuredVideo.searchQuery)}`;
    }
    return parsed;
  });
};

/**
 * Generate 5 MCQ questions for a task topic
 */
const generateMCQQuiz = async (taskTitle, targetRole) => {
  const ai = getOpenAIClient();

  const prompt = `You are an expert educator. Create exactly 5 multiple-choice quiz questions about:
"${taskTitle}" for someone becoming a ${targetRole}.

Return a JSON array with EXACTLY this structure:
[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this answer is correct"
  }
]`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

module.exports = { generateStudyContent, generateMCQQuiz };
