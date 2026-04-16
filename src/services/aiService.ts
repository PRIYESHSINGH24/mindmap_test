import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const aiService = {
  detectPatterns: async (title: string, description?: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this DSA problem: "${title}". ${description ? `Description: ${description}` : ''}
        Identify common patterns (e.g., Sliding Window, Two Pointers, DP, Dijkstra) and suggest tags.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patterns: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              explanation: { type: Type.STRING }
            },
            required: ["patterns", "suggestedTags"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('AI Error:', error);
      return { patterns: [], suggestedTags: [], explanation: "Could not analyze patterns." };
    }
  },

  generateOptimizedSolution: async (title: string, language: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Provide an optimized solution for "${title}" in ${language}. Include time and space complexity analysis.`,
      });

      return response.text;
    } catch (error) {
      console.error('AI Error:', error);
      return "Could not generate solution.";
    }
  }
};
