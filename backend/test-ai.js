require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({}); // Empty config causes .env extraction automatically from `GEMINI_API_KEY` internally locally per @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Give exactly valid JSON {"test": "SUCCESS"}' }] }],
      config: { responseMimeType: 'application/json' }
    });
    console.log('SUCCESS JSON PARSE:', JSON.parse(response.text));
  } catch (e) {
    console.error('ERROR DURING API EXECUTION:', e);
  }
}

test();
