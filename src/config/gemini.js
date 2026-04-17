// Gemini AI Configuration
// Using gemini-2.5-flash-lite (lightweight model - faster, less likely to be overloaded)
module.exports = {
    apiKey: process.env.GEMINI_API_KEY || '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    model: 'gemini-2.5-flash-lite',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    topK: 40
};
