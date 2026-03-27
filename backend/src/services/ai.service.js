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
  const prompt = `You are a senior technical recruiter and career coach.
Analyze the following resume against the target role: "${targetRole}".
Identify matching skills, missing skills, and provide actionable recommendations.

Resume Content:
${resumeText}

Return a STRICT JSON object with this exact structure:
{
  "matchScore": 85, // percentage integer 0-100
  "estimatedTimeToReady": "2-3 months", // estimated time to gain missing skills
  "strengths": ["Skill 1", "Skill 2"], // list of top matching skills
  "missingSkills": [
    {
      "name": "Skill Name",
      "importance": "must" | "recommended" | "nice_to_have",
      "learningResources": ["URL 1", "URL 2"]
    }
  ],
  "extractedSkills": [
    { "name": "Skill Name", "level": "Expert" | "Intermediate" | "Beginner" }
  ],
  "recommendations": ["Actionable step 1", "Actionable step 2"]
}

Return ONLY the JSON object.`;

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

  const skills = profile.currentSkills?.map((s) => s.name).join(', ') || 'Not specified';
  const prompt = `You are a senior software engineering mentor. Based on the user profile below, recommend 6 hands-on portfolio projects that will help them reach their target role.

User Profile:
- Target Role: ${profile.targetRole}
- Current Skills: ${skills}
- Experience Level: ${profile.experienceLevel}
- Learning Style: ${profile.preferredLearningStyle || 'mixed'}
- Weekly Hours Available: ${profile.timeCommitmentHoursPerWeek || 10}

Return a STRICT JSON object with this EXACT structure. No extra text, just JSON:
{
  "projects": [
    {
      "id": "proj_1",
      "title": "Project Name",
      "description": "2-3 sentence description of what this project does and why it helps their career",
      "techStack": ["Tech1", "Tech2", "Tech3"],
      "difficulty": "beginner" | "intermediate" | "advanced",
      "category": "frontend" | "backend" | "fullstack" | "mobile" | "ml" | "devops",
      "estimatedHours": 20,
      "keyLearnings": ["Learning 1", "Learning 2", "Learning 3"]
    }
  ]
}

Make projects progressively harder (2 beginner, 2 intermediate, 2 advanced).
Tailor them specifically to the user's target role and existing skills.
Return ONLY the JSON object.`;

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
  const prompt = `You are an expert career coach and ATS optimization specialist.
Optimize the following resume for the target role: ${targetRole}.

Guidelines:
1. Improve the language to be more professional and impact-oriented.
2. Ensure it is ATS-friendly.
3. Add relevant keywords for the ${targetRole} position.
4. Calculate an ATS compatibility score (0-100).
5. Provide specific suggestions for further improvement.

Resume Text:
${resumeText}

Return strictly valid JSON only with this exact structure:
{
  "optimizedResume": "full text of the optimized resume",
  "atsScore": 85,
  "keywordsAdded": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
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
 * Generate mock interview questions.
 */
const generateInterviewQuestions = async (targetRole, difficulty = 'medium') => {
  const ai = getOpenAIClient();
  const prompt = `You are an elite technical interviewer. Generate a structured mock interview for a ${targetRole} position at a top-tier tech company.
Difficulty Level: ${difficulty}

Return a STRICT JSON object with this exact structure:
{
  "title": "Interview Title",
  "description": "Short description of the interview focus",
  "questions": [
    {
      "id": "q1",
      "type": "technical" | "behavioral" | "situational" | "coding",
      "question": "The actual question text",
      "hint": "A helpful hint if the user gets stuck",
      "expectedPoints": ["Point 1", "Point 2"],
      "interviewerNote": "A short instruction for the AI to speak before the question (e.g., 'Let's move to a technical topic.')"
    }
  ]
}

Return ONLY the JSON.`;

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
const gradeInterviewAnswer = async (question, answer, targetRole, metadata = {}) => {
  const ai = getOpenAIClient();
  const { confidenceScore = 80, emotionsDetected = ['Calm', 'Focused'] } = metadata;

  const prompt = `You are a senior hiring manager. Grade the following interview answer for a ${targetRole} role.
Consider the content of the answer, and also the observed metadata (confidence and emotions).

Question: ${question}
Answer: ${answer}
Confidence Score (observed): ${confidenceScore}/100
Emotions Detected: ${emotionsDetected.join(', ')}

Return a STRICT JSON object with this exact structure:
{
  "score": 8, // score out of 10
  "feedback": "Concise summary of performance",
  "strengths": ["What they did well"],
  "weaknesses": ["What they missed"],
  "improvements": ["Specific actionable steps to improve"],
  "analyticalFeedback": "Detailed analysis of their non-verbal/confidence performance",
  "sampleAnswer": "What a perfect answer would look like"
}

Return ONLY the JSON.`;

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
 * Generate a step-by-step guide for a project
 */
const getProjectGuide = async (projectTitle, projectDescription, targetRole) => {
  const ai = getOpenAIClient();

  const prompt = `You are a senior technical lead. Provide a comprehensive, easy-to-follow, step-by-step guide on how to build and complete the following project.
The guide should be practical, workable, and tailored for a ${targetRole}.

Project Title: ${projectTitle}
Description: ${projectDescription}

Return a STRICT JSON object with this EXACT structure. No extra text, just JSON:
{
  "projectTitle": "${projectTitle}",
  "overview": "Short summary of the build approach",
  "steps": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed explanation of what to do in this step",
      "tips": ["Pro tip 1", "Pro tip 2"]
    }
  ],
  "resources": [
    { "name": "Resource Name", "url": "Search query or URL" }
  ],
  "estimatedCompletionTime": "e.g., 2 weeks"
}

Ensure the steps are logical (Setup -> Development -> Testing -> Deployment).
Return ONLY the JSON object.`;

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
  getProjectGuide,
};
