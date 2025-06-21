interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  }

  async getRecommendations(userPreferences: {
    cuisine?: string;
    dietary?: string[];
    budget?: string;
    mood?: string;
  }): Promise<string> {
    try {
      const prompt = `Based on these preferences: ${JSON.stringify(userPreferences)}, 
      recommend 3 restaurants with specific dishes. Keep it concise and engaging.
      Format as: Restaurant Name - Dish Name (brief description)`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No recommendations available';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'Unable to get AI recommendations at the moment. Please try again later.';
    }
  }

  async getChatResponse(message: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful restaurant assistant. Answer this question about food, restaurants, or dining: ${message}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I cannot provide a response right now.';
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      return 'I apologize, but I cannot provide a response right now. Please try again later.';
    }
  }
}

export const geminiService = new GeminiService();