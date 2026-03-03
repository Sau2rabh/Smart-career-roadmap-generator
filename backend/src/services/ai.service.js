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
 * Generate a personalized career roadmap in JSON format.
 */
const generateRoadmap = async (profile) => {
  const ai = getOpenAIClient();

  const prompt = `You are a senior career development expert. Generate a detailed, actionable career roadmap in STRICT JSON for a ${profile.targetRole}.
Return strictly valid JSON only.

User Profile:
- Target Role: ${profile.targetRole}
- Skills: ${profile.currentSkills.map((s) => s.name).join(', ')}
- Level: ${profile.experienceLevel}

Return a JSON object with this exact structure:
{
  "title": "Roadmap title",
  "summary": "overview",
  "totalDurationMonths": 6,
  "monthlyPlan": [
    {
      "month": 1,
      "title": "Month title",
      "weeks": [
        {
          "week": 1,
          "title": "Week title",
          "tasks": [
            {
              "id": "w1t1",
              "title": "Task title",
              "resource": "resource",
              "estimatedHours": 3
            }
          ]
        }
      ]
    }
  ]
}`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

/**
 * Analyze skill gaps
 */
const analyzeSkillGap = async (resumeText, targetRole) => {
  const ai = getOpenAIClient();
  const prompt = `Analyze resume for ${targetRole} and return JSON.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

/**
 * Context-aware career mentor chat.
 */
const chatWithMentor = async (messageHistory, userProfile) => {
  const ai = getOpenAIClient();
  const contents = messageHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
    });
    return { content: response.text, tokens: 0 };
  });
};

/**
 * Recommend projects
 */
const recommendProjects = async (profile) => {
  const ai = getOpenAIClient();
  const prompt = `Recommend projects for ${profile.targetRole} as JSON.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

/**
 * Optimize resume
 */
const optimizeResume = async (resumeText, targetRole) => {
  const ai = getOpenAIClient();
  const prompt = `Optimize resume for ${targetRole} as JSON.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

/**
 * Generate mock interview questions.
 */
const generateInterviewQuestions = async (targetRole, difficulty = 'medium') => {
  const ai = getOpenAIClient();
  const prompt = `Generate interview questions for ${targetRole} as JSON.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

/**
 * Grade an interview answer
 */
const gradeInterviewAnswer = async (question, answer, targetRole) => {
  const ai = getOpenAIClient();
  const prompt = `Grade answer for ${targetRole} as JSON.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  });
};

module.exports = {
  generateRoadmap,
  analyzeSkillGap,
  chatWithMentor,
  recommendProjects,
  optimizeResume,
  generateInterviewQuestions,
  gradeInterviewAnswer,
};
