const { GoogleGenAI } = require('@google/genai');

let genAIClient = null;

const getOpenAIClient = () => {
  if (!genAIClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
};

module.exports = { getOpenAIClient };
