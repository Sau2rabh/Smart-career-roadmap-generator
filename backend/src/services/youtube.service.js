const { getOpenAIClient } = require('../config/openai');

const MODEL = 'gemini-2.5-flash';

const HINDI_CHANNELS = [
  'CodeWithHarry', 'Apna College', 'Campus X', 'Sheryians Coding School',
  'Hitesh Choudhary (Hindi)', 'Thapa Technical', 'WsCube Tech', 'Technical Suneja',
  'Gate Smashers', 'Jenny`s Lectures CS IT', 'Bro Code Hindi'
];

const ENGLISH_CHANNELS = [
  'Traversy Media', 'Fireship', 'The Net Ninja', 'Academind', 'Kevin Powell',
  'TechWorld with Nana', 'freeCodeCamp', 'Programming with Mosh',
  'Web Dev Simplified', 'Codevolution', 'Hitesh Choudhary (English)', 'Chai aur Code'
];

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
 * Get YouTube video suggestions using Gemini AI
 */
const getYouTubeSuggestions = async (topic, skills, targetRole, language = 'english') => {
  const ai = getOpenAIClient();

  const isHindi = language === 'hindi';
  const channelList = isHindi ? HINDI_CHANNELS : ENGLISH_CHANNELS;

  const prompt = `You are a learning resource expert. Suggest exactly 5 real YouTube videos for someone learning: "${topic}" as part of their journey to become a ${targetRole}.
Skills covered: ${skills.join(', ')}
Pick ONLY from these channels: ${channelList.join(', ')}

Return a JSON array with this structure:
[
  {
    "title": "Exact video or playlist title",
    "channel": "Channel name",
    "description": "One sentence about what this covers",
    "duration": "e.g. 2 hours",
    "level": "Beginner | Intermediate",
    "searchQuery": "YouTube search term"
  }
]`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const suggestions = JSON.parse(response.text);

    return suggestions.map((video) => ({
      ...video,
      language,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`,
    }));
  });
};

module.exports = { getYouTubeSuggestions };
