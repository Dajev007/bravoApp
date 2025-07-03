import type { Restaurant } from './database';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface UserPreferences {
  cuisine?: string;
  dietary?: string[];
  budget?: string;
  mood?: string;
  location?: string;
  preparationTime?: string;
  rating?: number;
  orderType?: 'takeaway' | 'dine_in';
  // Enhanced custom preferences
  taste?: string; // spicy, salty, sweet, mild
  environment?: string; // casual, fine dining, outdoor, family-friendly
  priceRange?: string; // cheap, moderate, expensive
  otherFeatures?: string[]; // vegan, halal, kid-friendly, etc.
}

// Using Restaurant interface from database.ts

interface UserProfile {
  name?: string;
  dietary_preferences?: string[];
  favorite_cuisines?: string[];
}

interface RecommendationContext {
  userPreferences: UserPreferences;
  availableRestaurants: Restaurant[];
  userProfile?: UserProfile;
  favoriteRestaurants?: Restaurant[];
  recentOrders?: any[];
  userQuery?: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    if (__DEV__) {
      console.log('Gemini API Key configured:', !!this.apiKey);
      console.log('Environment variables starting with EXPO_PUBLIC:', 
        Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC')));
    }
  }

  async getPersonalizedRecommendations(context: RecommendationContext): Promise<{
    recommendations: Restaurant[];
    explanation: string;
  }> {
    try {
      // Check if API key is available
      if (!this.apiKey) {
        if (__DEV__) {
          console.log('Gemini API key not configured, using fallback recommendations');
        }
        const fallbackRecommendations = this.getFallbackRecommendations(
          context.availableRestaurants,
          context.userPreferences,
          context.userProfile
        );
        
        return {
          recommendations: fallbackRecommendations,
          explanation: this.generateFallbackExplanation(context, fallbackRecommendations)
        };
      }

      // Filter restaurants based on user preferences
      const filteredRestaurants = this.filterRestaurantsByPreferences(
        context.availableRestaurants,
        context.userPreferences,
        context.userProfile
      );

      // If no restaurants match filters, use all restaurants
      const restaurantsToUse = filteredRestaurants.length > 0 ? filteredRestaurants : context.availableRestaurants;

      // Create a comprehensive prompt for AI
      const prompt = this.createRecommendationPrompt(context, restaurantsToUse);

      if (__DEV__) {
        console.log('Making Gemini API request...');
      }
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

      if (__DEV__) {
        console.log('Gemini API response status:', response.status);
      }

      if (!response.ok) {
        const errorText = await response.text();
        if (__DEV__) {
          console.error('Gemini API error response:', errorText);
        }
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      if (__DEV__) {
        console.log('Gemini API response received');
      }
      
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';

      if (!aiResponse) {
        throw new Error('No AI response received');
      }

      // Parse AI response and match with actual restaurants
      const recommendations = this.parseAndMatchRecommendations(aiResponse, restaurantsToUse);

      return {
        recommendations: recommendations.slice(0, 5), // Return top 5 recommendations
        explanation: aiResponse
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Gemini API Error:', error);
      }
      // Fallback to basic filtering if AI fails
      const fallbackRecommendations = this.getFallbackRecommendations(
        context.availableRestaurants,
        context.userPreferences,
        context.userProfile
      );
      
      return {
        recommendations: fallbackRecommendations,
        explanation: this.generateFallbackExplanation(context, fallbackRecommendations)
      };
    }
  }

  private filterRestaurantsByPreferences(
    restaurants: Restaurant[],
    preferences: UserPreferences,
    profile?: UserProfile
  ): Restaurant[] {
    return restaurants.filter(restaurant => {
      // Filter by cuisine preference
      if (preferences.cuisine && preferences.cuisine !== 'All') {
        if (restaurant.cuisine_type.toLowerCase() !== preferences.cuisine.toLowerCase()) {
          return false;
        }
      }

      // Filter by user's favorite cuisines from profile
      if (profile?.favorite_cuisines && profile.favorite_cuisines.length > 0) {
        const matchesFavoriteCuisine = profile.favorite_cuisines.some(
          fav => restaurant.cuisine_type.toLowerCase().includes(fav.toLowerCase())
        );
        if (!matchesFavoriteCuisine && !preferences.cuisine) {
          // If no specific cuisine requested, prioritize favorite cuisines
          return false;
        }
      }

      // Filter by rating preference
      if (preferences.rating && restaurant.rating < preferences.rating) {
        return false;
      }

      // Filter by preparation time preference
      if (preferences.preparationTime) {
        const maxTime = preferences.preparationTime === 'fast' ? 30 : 
                       preferences.preparationTime === 'medium' ? 45 : 60;
        if (restaurant.delivery_time_max > maxTime) {
          return false;
        }
      }

      // Filter by budget (based on delivery fee as proxy)
      if (preferences.budget) {
        const maxDeliveryFee = preferences.budget === 'low' ? 3 : 
                              preferences.budget === 'medium' ? 5 : 10;
        if (restaurant.delivery_fee > maxDeliveryFee) {
          return false;
        }
      }

      return true;
    });
  }

  private createRecommendationPrompt(context: RecommendationContext, restaurants: Restaurant[]): string {
    const { userPreferences, userProfile, userQuery } = context;
    
    let prompt = `You are a helpful restaurant recommendation assistant. `;
    
    prompt += `Based on the user's preferences below, recommend ONLY ONE restaurant and explain briefly why it matches.\n\n`;
    
    // Add enhanced user preferences with custom filters
    prompt += `USER PREFERENCES:\n`;
    if (userQuery) {
      prompt += `- Query: "${userQuery}"\n`;
    }
    if (userPreferences.taste) {
      prompt += `- Taste preference: ${userPreferences.taste}\n`;
    }
    if (userPreferences.environment) {
      prompt += `- Environment preference: ${userPreferences.environment}\n`;
    }
    if (userPreferences.location) {
      prompt += `- Location: ${userPreferences.location}\n`;
    }
    if (userPreferences.priceRange) {
      prompt += `- Price range: ${userPreferences.priceRange}\n`;
    }
    if (userPreferences.otherFeatures && userPreferences.otherFeatures.length > 0) {
      prompt += `- Other features: ${userPreferences.otherFeatures.join(', ')}\n`;
    }
    
    // Add traditional preferences
    if (userPreferences.cuisine) {
      prompt += `- Preferred cuisine: ${userPreferences.cuisine}\n`;
    }
    if (userPreferences.mood) {
      prompt += `- Mood/atmosphere: ${userPreferences.mood}\n`;
    }
    if (userPreferences.budget) {
      prompt += `- Budget: ${userPreferences.budget}\n`;
    }
    if (userPreferences.preparationTime) {
      prompt += `- Preparation time preference: ${userPreferences.preparationTime}\n`;
    }
    if (userPreferences.rating) {
      prompt += `- Minimum rating: ${userPreferences.rating}\n`;
    }
    
    // Add user profile information
    if (userProfile) {
      if (userProfile.dietary_preferences && userProfile.dietary_preferences.length > 0) {
        prompt += `- User dietary preferences: ${userProfile.dietary_preferences.join(', ')}\n`;
      }
      if (userProfile.favorite_cuisines && userProfile.favorite_cuisines.length > 0) {
        prompt += `- User's favorite cuisines: ${userProfile.favorite_cuisines.join(', ')}\n`;
      }
    }
    
    // Add available restaurants
    prompt += `\nAVAILABLE RESTAURANTS:\n`;
    restaurants.slice(0, 15).forEach((restaurant, index) => {
      prompt += `${index + 1}. ${restaurant.name} (${restaurant.cuisine_type})\n`;
      prompt += `   - Rating: ${restaurant.rating}/5\n`;
      prompt += `   - Delivery: ${restaurant.delivery_time_min}-${restaurant.delivery_time_max} min, $${restaurant.delivery_fee}\n`;
      prompt += `   - Description: ${restaurant.description}\n`;
      if (restaurant.address) {
        prompt += `   - Address: ${restaurant.address}\n`;
      }
      prompt += `\n`;
    });
    
    prompt += `IMPORTANT INSTRUCTIONS:
- Recommend ONLY ONE restaurant that best matches the user's preferences
- Explain briefly (2-3 sentences) why this restaurant matches their preferences
- If no restaurant matches well, say "No perfect match found based on your preferences. Would you like to adjust your criteria?" and suggest what to change
- Focus on matching taste, environment, location, price range, and other features specified
- Be specific about which preferences are being matched

Format your response as:
RECOMMENDATION: [Restaurant Name]
EXPLANATION: [Brief explanation of why it matches the user's preferences]`;
    
    return prompt;
  }

  private parseAndMatchRecommendations(aiResponse: string, restaurants: Restaurant[]): Restaurant[] {
    // Extract restaurant names mentioned in the AI response
    const mentioned = restaurants.filter(restaurant => 
      aiResponse.toLowerCase().includes(restaurant.name.toLowerCase())
    );
    
    // If AI mentioned specific restaurants, return those first
    if (mentioned.length > 0) {
      return mentioned;
    }
    
    // Fallback: return top-rated restaurants
    return restaurants.sort((a, b) => b.rating - a.rating).slice(0, 5);
  }

  private getFallbackRecommendations(
    restaurants: Restaurant[],
    preferences: UserPreferences,
    profile?: UserProfile
  ): Restaurant[] {
    // Filter restaurants based on preferences
    const filteredRestaurants = this.filterRestaurantsByPreferences(restaurants, preferences, profile);
    const restaurantsToScore = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;
    
    // Score restaurants
    let scored = restaurantsToScore.map(restaurant => ({
      restaurant,
      score: this.calculateRestaurantScore(restaurant, preferences, profile)
    }));
    
    // Sort by score
    scored.sort((a, b) => b.score - a.score);
    
    // Add some randomization to avoid always showing the same results
    const topTier = scored.slice(0, 8); // Get top 8 instead of just top 5
    const randomized = this.shuffleArray([...topTier]); // Shuffle the top tier
    
    return randomized.slice(0, 5).map(item => item.restaurant);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateRestaurantScore(
    restaurant: Restaurant,
    preferences: UserPreferences,
    profile?: UserProfile
  ): number {
    let score = restaurant.rating * 20; // Base score from rating
    
    // Bonus for matching cuisine preferences
    if (preferences.cuisine && restaurant.cuisine_type.toLowerCase() === preferences.cuisine.toLowerCase()) {
      score += 30;
    }
    
    // Bonus for favorite cuisines
    if (profile?.favorite_cuisines) {
      const matchesFav = profile.favorite_cuisines.some(
        fav => restaurant.cuisine_type.toLowerCase().includes(fav.toLowerCase())
      );
      if (matchesFav) score += 25;
    }
    
    // Bonus for featured restaurants
    if (restaurant.is_featured) score += 10;
    
    // Penalty for high delivery fee if budget is low
    if (preferences.budget === 'low' && restaurant.delivery_fee > 3) {
      score -= 15;
    }
    
    // Bonus for fast preparation if requested
    if (preferences.preparationTime === 'fast' && restaurant.delivery_time_max <= 30) {
      score += 20;
    }
    
    return score;
  }

  private generateFallbackExplanation(
    context: RecommendationContext,
    recommendations: Restaurant[]
  ): string {
    const { userPreferences, userProfile, userQuery } = context;
    
    let explanation = "Here are some great restaurant recommendations for you";
    
    if (userQuery) {
      explanation += ` based on your request: "${userQuery}"`;
    }
    
    explanation += "!\n\n";
    
    if (recommendations.length > 0) {
      explanation += "I've selected these restaurants because:\n";
      
      recommendations.slice(0, 3).forEach((restaurant, index) => {
        explanation += `\n${index + 1}. **${restaurant.name}** (${restaurant.cuisine_type})\n`;
        explanation += `   • ${restaurant.rating}/5 stars with great reviews\n`;
        explanation += `   • ${restaurant.delivery_time_min}-${restaurant.delivery_time_max} minute delivery\n`;
        
        if (userPreferences.budget === 'low' && restaurant.delivery_fee <= 3) {
          explanation += `   • Budget-friendly with low delivery fee\n`;
        }
        
        if (userPreferences.preparationTime === 'fast' && restaurant.delivery_time_max <= 30) {
          explanation += `   • Quick preparation as requested\n`;
        }
        
        if (userProfile?.favorite_cuisines?.some(fav => 
          restaurant.cuisine_type.toLowerCase().includes(fav.toLowerCase())
        )) {
          explanation += `   • Matches your favorite cuisine preferences\n`;
        }
        
        if (restaurant.is_featured) {
          explanation += `   • Featured restaurant with excellent quality\n`;
        }
      });
    }
    
    explanation += "\nEnjoy your meal! 🍽️";
    
    return explanation;
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