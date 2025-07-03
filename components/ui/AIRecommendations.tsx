import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Sparkles, X, Send, Star, Clock, MapPin, ChefHat, Heart, Filter, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { geminiService } from '@/lib/gemini';
import { getRestaurants, getUserProfile, getUserFavorites, type Restaurant, type UserProfile } from '@/lib/database';

interface AIRecommendationsProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: Restaurant[];
}

// Define styles function before component
const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  preferencesButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.accentLight,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.accentLight,
  },
  quickPromptsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 12,
  },
  quickPrompt: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickPromptText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    opacity: 0.7,
    marginTop: 4,
  },
  userMessageTime: {
    color: '#FFFFFF',
  },
  aiMessageTime: {
    color: colors.textSecondary,
  },
  restaurantCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  restaurantCuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  restaurantDetails: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  restaurantAddress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 4,
  },
  restaurantActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    backgroundColor: colors.inputBackground,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: 0.6,
  },
  preferencesPanel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferencesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferencesSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  preferenceGroup: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginBottom: 8,
  },
  preferenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preferenceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  preferenceChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  preferenceChipTextSelected: {
    color: '#FFFFFF',
  },
  recommendationsScroll: {
    marginTop: 12,
  },
  recommendationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cuisineType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: colors.textTertiary,
  },
});

export function AIRecommendations({ visible, onClose }: AIRecommendationsProps) {
  const { colors, isDark } = useTheme();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPreferences, setCustomPreferences] = useState({
    taste: '',
    environment: '',
    priceRange: '',
    otherFeatures: [] as string[],
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const quickPrompts = [
    "I want something healthy and quick",
    "Best pizza places near me",
    "Something romantic for date night",
    "Cheap and cheerful comfort food",
    "I'm feeling adventurous, surprise me!",
    "Best rated restaurants for lunch",
    "Show me spicy food options",
    "Find me a family-friendly restaurant",
    "I want fine dining experience"
  ];

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get user data for personalization
      const [restaurants, userProfile, favoriteRestaurants] = await Promise.all([
        getRestaurants(),
        getUserProfile().catch(() => null),
        getUserFavorites().catch(() => [])
      ]);

      // Parse user preferences from the message
      const userPreferences = parseUserPreferences(messageText);

      // Get AI recommendations
      const recommendationContext = {
        userPreferences,
        availableRestaurants: restaurants,
        userProfile: userProfile || undefined,
        favoriteRestaurants: favoriteRestaurants?.map(fav => fav.restaurant) || [],
        userQuery: messageText,
      };

      const result = await geminiService.getPersonalizedRecommendations(recommendationContext);

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.explanation,
        isUser: false,
        timestamp: new Date(),
        recommendations: result.recommendations,
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting recommendations:', error);
      }
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble getting recommendations right now. Please try again later!",
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseUserPreferences = (query: string): any => {
    const preferences: any = {
      // Include custom preferences from state
      taste: customPreferences.taste,
      environment: customPreferences.environment,
      priceRange: customPreferences.priceRange,
      otherFeatures: customPreferences.otherFeatures,
    };
    
    // Extract cuisine preferences
    const cuisines = ['italian', 'japanese', 'chinese', 'indian', 'mexican', 'thai', 'american', 'pizza', 'sushi', 'burger'];
    for (const cuisine of cuisines) {
      if (query.toLowerCase().includes(cuisine)) {
        preferences.cuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
        break;
      }
    }
    
    // Extract budget preferences (if not set in custom preferences)
    if (!preferences.priceRange) {
      if (query.toLowerCase().includes('cheap') || query.toLowerCase().includes('budget')) {
        preferences.priceRange = 'cheap';
      } else if (query.toLowerCase().includes('expensive') || query.toLowerCase().includes('fine dining')) {
        preferences.priceRange = 'expensive';
      }
    }
    
    // Extract timing preferences
    if (query.toLowerCase().includes('quick') || query.toLowerCase().includes('fast')) {
      preferences.deliveryTime = 'fast';
    }
    
    // Extract mood preferences
    if (query.toLowerCase().includes('romantic') || query.toLowerCase().includes('date')) {
      preferences.mood = 'romantic';
    } else if (query.toLowerCase().includes('comfort') || query.toLowerCase().includes('cozy')) {
      preferences.mood = 'comfort';
    } else if (query.toLowerCase().includes('healthy')) {
      preferences.mood = 'healthy';
    }
    
    // Extract taste preferences (if not set in custom preferences)
    if (!preferences.taste) {
      if (query.toLowerCase().includes('spicy')) {
        preferences.taste = 'spicy';
      } else if (query.toLowerCase().includes('sweet')) {
        preferences.taste = 'sweet';
      } else if (query.toLowerCase().includes('mild')) {
        preferences.taste = 'mild';
      }
    }
    
    // Extract environment preferences (if not set in custom preferences)
    if (!preferences.environment) {
      if (query.toLowerCase().includes('casual')) {
        preferences.environment = 'casual';
      } else if (query.toLowerCase().includes('fine dining')) {
        preferences.environment = 'fine dining';
      } else if (query.toLowerCase().includes('family')) {
        preferences.environment = 'family-friendly';
      }
    }
    
    // Extract rating preferences
    if (query.toLowerCase().includes('best') || query.toLowerCase().includes('top rated')) {
      preferences.rating = 4.0;
    }
    
    return preferences;
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    onClose();
    router.push(`/restaurant/${restaurant.id}`);
  };

  const toggleOtherFeature = (feature: string) => {
    setCustomPreferences(prev => ({
      ...prev,
      otherFeatures: prev.otherFeatures.includes(feature)
        ? prev.otherFeatures.filter(f => f !== feature)
        : [...prev.otherFeatures, feature]
    }));
  };

  const resetPreferences = () => {
    setCustomPreferences({
      taste: '',
      environment: '',
      priceRange: '',
      otherFeatures: [],
    });
  };

  const initializeChat = async () => {
    if (chatMessages.length === 0) {
      try {
        const userProfile = await getUserProfile();
        const welcomeMessage = userProfile?.name 
          ? `Hi ${userProfile.name}! I'm your AI restaurant assistant. What are you in the mood for today?`
          : "Hi! I'm your AI restaurant assistant. What are you in the mood for today?";
        
        setChatMessages([{
          id: 'welcome',
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
        }]);
      } catch (error) {
        setChatMessages([{
          id: 'welcome',
          text: "Hi! I'm your AI restaurant assistant. What are you in the mood for today?",
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    }
  };

  React.useEffect(() => {
    if (visible) {
      initializeChat();
    }
  }, [visible]);

  const renderMessage = (message: ChatMessage) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.text}
      </Text>
      
      {message.recommendations && message.recommendations.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
          {message.recommendations.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.recommendationCard}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star color="#48cae4" size={12} fill="#48cae4" />
                  <Text style={styles.ratingText}>{restaurant.rating}</Text>
                </View>
              </View>
              
              <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
              
              <View style={styles.restaurantDetails}>
                <View style={styles.detailItem}>
                  <Clock color="#666" size={12} />
                  <Text style={styles.detailText}>
                    {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MapPin color="#666" size={12} />
                  <Text style={styles.detailText}>${restaurant.delivery_fee}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const styles = createStyles(colors, isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles color="#0077b6" size={24} />
            <Text style={styles.title}>AI Restaurant Assistant</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={() => setShowPreferences(!showPreferences)} 
              style={styles.preferencesButton}
            >
              <Filter color="#0077b6" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#0077b6" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Preferences Panel */}
        {showPreferences && (
          <View style={styles.preferencesPanel}>
            <View style={styles.preferencesSectionHeader}>
              <Text style={styles.preferencesSectionTitle}>Custom Preferences</Text>
              <TouchableOpacity onPress={resetPreferences} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Taste Preference */}
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Taste Preference</Text>
              <View style={styles.preferenceOptions}>
                {['spicy', 'salty', 'sweet', 'mild'].map((taste) => (
                  <TouchableOpacity
                    key={taste}
                    style={[
                      styles.preferenceChip,
                      customPreferences.taste === taste && styles.preferenceChipSelected,
                    ]}
                    onPress={() => setCustomPreferences(prev => ({ 
                      ...prev, 
                      taste: prev.taste === taste ? '' : taste 
                    }))}
                  >
                    <Text
                      style={[
                        styles.preferenceChipText,
                        customPreferences.taste === taste && styles.preferenceChipTextSelected,
                      ]}
                    >
                      {taste.charAt(0).toUpperCase() + taste.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Environment Preference */}
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Environment</Text>
              <View style={styles.preferenceOptions}>
                {['casual', 'fine dining', 'outdoor', 'family-friendly'].map((env) => (
                  <TouchableOpacity
                    key={env}
                    style={[
                      styles.preferenceChip,
                      customPreferences.environment === env && styles.preferenceChipSelected,
                    ]}
                    onPress={() => setCustomPreferences(prev => ({ 
                      ...prev, 
                      environment: prev.environment === env ? '' : env 
                    }))}
                  >
                    <Text
                      style={[
                        styles.preferenceChipText,
                        customPreferences.environment === env && styles.preferenceChipTextSelected,
                      ]}
                    >
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Price Range</Text>
              <View style={styles.preferenceOptions}>
                {['cheap', 'moderate', 'expensive'].map((price) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.preferenceChip,
                      customPreferences.priceRange === price && styles.preferenceChipSelected,
                    ]}
                    onPress={() => setCustomPreferences(prev => ({ 
                      ...prev, 
                      priceRange: prev.priceRange === price ? '' : price 
                    }))}
                  >
                    <Text
                      style={[
                        styles.preferenceChipText,
                        customPreferences.priceRange === price && styles.preferenceChipTextSelected,
                      ]}
                    >
                      {price.charAt(0).toUpperCase() + price.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Other Features */}
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Other Features</Text>
              <View style={styles.preferenceOptions}>
                {['vegan', 'halal', 'kid-friendly', 'delivery available', 'outdoor seating'].map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={[
                      styles.preferenceChip,
                      customPreferences.otherFeatures.includes(feature) && styles.preferenceChipSelected,
                    ]}
                    onPress={() => toggleOtherFeature(feature)}
                  >
                    <Text
                      style={[
                        styles.preferenceChipText,
                        customPreferences.otherFeatures.includes(feature) && styles.preferenceChipTextSelected,
                      ]}
                    >
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Quick Prompts */}
        {chatMessages.length <= 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick suggestions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPrompt}
                  onPress={() => handleSendMessage(prompt)}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chat Messages */}
        <ScrollView 
          style={styles.chatContainer} 
          showsVerticalScrollIndicator={false}
          ref={ref => {
            if (ref) {
              ref.scrollToEnd({ animated: true });
            }
          }}
        >
          {chatMessages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0077b6" size="small" />
              <Text style={styles.loadingText}>Getting recommendations...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Ask me about restaurants..."
            placeholderTextColor="#90e0ef"
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Send color="#FFFFFF" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}