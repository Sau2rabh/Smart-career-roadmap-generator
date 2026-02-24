const { getOpenAIClient } = require('../config/openai');

const MODEL = 'gpt-4o-mini'; // Cost-effective, fast model

/**
 * Generate a personalized career roadmap in JSON format.
 */
const generateRoadmap = async (profile) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are a senior career development expert and technical mentor. 
Your task is to generate a detailed, actionable career roadmap in STRICT JSON format.
The roadmap must be realistic, specific, and tailored to the user's profile.
Always respond with valid JSON only — no markdown, no explanation.`;

  const userPrompt = `Generate a career roadmap for:
- Target Role: ${profile.targetRole}
- Current Skills: ${profile.currentSkills.map((s) => `${s.name} (${s.level})`).join(', ')}
- Experience Level: ${profile.experienceLevel}
- Time Commitment: ${profile.timeCommitmentHoursPerWeek} hours/week
- Preferred Learning Style: ${profile.preferredLearningStyle || 'mixed'}
- Years of Experience: ${profile.yearsOfExperience || 0}

Return a JSON object with this exact structure:
{
  "title": "Roadmap title",
  "summary": "2-3 sentence overview",
  "totalDurationMonths": <number>,
  "monthlyPlan": [
    {
      "month": 1,
      "title": "Month title",
      "description": "Month focus",
      "objectives": ["objective1", "objective2"],
      "skills": ["skill1", "skill2"],
      "weeks": [
        {
          "week": 1,
          "title": "Week title",
          "description": "Week focus",
          "tasks": [
            {
              "id": "w1t1",
              "title": "Task title",
              "type": "learn|build|practice|read|watch",
              "resource": "URL or resource name",
              "estimatedHours": 3
            }
          ]
        }
      ]
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  return JSON.parse(raw);
};

/**
 * Analyze skill gaps between resume text and target role.
 */
const analyzeSkillGap = async (resumeText, targetRole) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are an expert technical recruiter and career coach. 
Analyze the resume and identify skill gaps for the target role.
Respond with valid JSON only.`;

  const userPrompt = `Resume Text:
${resumeText.substring(0, 3000)}

Target Role: ${targetRole}

Return JSON with this structure:
{
  "extractedSkills": [{"name": "...", "level": "beginner|intermediate|advanced"}],
  "requiredSkills": [{"name": "...", "importance": "must|recommended|nice_to_have"}],
  "missingSkills": [{"name": "...", "importance": "...", "learningResources": ["url1", "url2"]}],
  "matchScore": <0-100>,
  "strengths": ["strength1"],
  "recommendations": ["recommendation1"],
  "estimatedTimeToReady": "X months"
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Context-aware career mentor chat.
 */
const chatWithMentor = async (messageHistory, userProfile) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are an experienced AI career mentor specializing in tech careers.
You have access to the user's profile: ${JSON.stringify({
    targetRole: userProfile?.targetRole,
    experienceLevel: userProfile?.experienceLevel,
    currentSkills: userProfile?.currentSkills?.slice(0, 10),
  })}.
Be encouraging, specific, and actionable. Keep responses concise (under 300 words).`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messageHistory,
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  return {
    content: response.choices[0].message.content,
    tokens: response.usage?.total_tokens || 0,
  };
};

/**
 * Recommend projects based on user profile.
 */
const recommendProjects = async (profile) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are a senior software engineer mentoring junior developers.
Recommend hands-on projects to build. Respond with valid JSON only.`;

  const userPrompt = `User Profile:
- Target Role: ${profile.targetRole}
- Skills: ${profile.currentSkills.map((s) => s.name).join(', ')}
- Experience Level: ${profile.experienceLevel}

Return JSON:
{
  "projects": [
    {
      "id": "unique-id",
      "title": "Project Title",
      "description": "2-3 sentence description",
      "difficulty": "beginner|intermediate|advanced",
      "techStack": ["tech1", "tech2"],
      "estimatedHours": 20,
      "keyLearnings": ["learning1"],
      "githubTopics": ["topic1"],
      "category": "frontend|backend|fullstack|mobile|ml|devops"
    }
  ]
}
Provide 6 projects of varying difficulty.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Optimize resume text for a target role.
 */
const optimizeResume = async (resumeText, targetRole) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are an expert resume writer and ATS optimization specialist.
Improve the resume to maximize chances for the target role. Respond with valid JSON only.`;

  const userPrompt = `Target Role: ${targetRole}

Original Resume:
${resumeText.substring(0, 3000)}

Return JSON:
{
  "optimizedResume": "Full improved resume text",
  "changes": ["change1", "change2"],
  "atsScore": <0-100>,
  "keywordsAdded": ["kw1"],
  "suggestions": ["suggestion1"]
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Generate mock interview questions.
 */
const generateInterviewQuestions = async (targetRole, difficulty = 'medium') => {
  const client = getOpenAIClient();

  const systemPrompt = `You are a senior technical interviewer at a top tech company.
Generate realistic interview questions. Respond with valid JSON only.`;

  const userPrompt = `Role: ${targetRole}
Difficulty: ${difficulty}

Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "behavioral|technical|situational|coding",
      "hint": "Brief hint for candidate"
    }
  ]
}
Generate 8 questions (mix of behavioral and technical).`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Grade an interview answer with AI feedback.
 */
const gradeInterviewAnswer = async (question, answer, targetRole) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are a senior technical interviewer. Grade the candidate's answer.
Respond with valid JSON only.`;

  const userPrompt = `Role: ${targetRole}
Question: ${question}
Candidate Answer: ${answer}

Return JSON:
{
  "score": <1-10>,
  "feedback": "Detailed constructive feedback",
  "strengths": ["strength1"],
  "improvements": ["improvement1"],
  "sampleAnswer": "A model answer for comparison"
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
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
