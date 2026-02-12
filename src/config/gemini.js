// Gemini AI Configuration
// Using gemini-2.5-flash (latest model - June 2025)
module.exports = {
    apiKey: process.env.GEMINI_API_KEY || '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    model: 'gemini-2.5-flash',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    topK: 40
};
