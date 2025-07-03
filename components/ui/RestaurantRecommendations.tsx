import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Sparkles, Search, Star, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { geminiService } from '@/lib/gemini';
import { getRestaurants, getUserProfile, getUserFavorites, type Restaurant, type UserProfile } from '@/lib/database';
import { useLocation } from '@/contexts/LocationContext';

interface RestaurantRecommendationsProps {
  initialQuery?: string;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  maxRecommendations?: number;
}

export function RestaurantRecommendations({ 
  initialQuery = '', 
  onRestaurantSelect,
  maxRecommendations = 5 
}: RestaurantRecommendationsProps) {
  const { location } = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const popularQueries = [
    "Best pizza near me",
    "Healthy and quick food",
    "Romantic dinner spots",
    "Best rated restaurants",
    "Cheap eats under $15",
    "Asian cuisine options"
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const parseUserPreferences = (searchQuery: string) => {
    const preferences: any = {};
    
    // Extract cuisine preferences
    const cuisines = ['italian', 'japanese', 'chinese', 'indian', 'mexican', 'thai', 'american', 'pizza', 'sushi', 'burger', 'asian'];
    for (const cuisine of cuisines) {
      if (searchQuery.toLowerCase().includes(cuisine)) {
        preferences.cuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
        break;
      }
    }
    
    // Extract budget preferences
    if (searchQuery.toLowerCase().includes('cheap') || searchQuery.toLowerCase().includes('budget') || searchQuery.toLowerCase().includes('under')) {
      preferences.budget = 'low';
    } else if (searchQuery.toLowerCase().includes('expensive') || searchQuery.toLowerCase().includes('fine dining') || searchQuery.toLowerCase().includes('premium')) {
      preferences.budget = 'high';
    }
    
    // Extract timing preferences
    if (searchQuery.toLowerCase().includes('quick') || searchQuery.toLowerCase().includes('fast')) {
      preferences.deliveryTime = 'fast';
    }
    
    // Extract mood preferences
    if (searchQuery.toLowerCase().includes('romantic') || searchQuery.toLowerCase().includes('date')) {
      preferences.mood = 'romantic';
    } else if (searchQuery.toLowerCase().includes('comfort') || searchQuery.toLowerCase().includes('cozy')) {
      preferences.mood = 'comfort';
    } else if (searchQuery.toLowerCase().includes('healthy')) {
      preferences.mood = 'healthy';
    }
    
    // Extract rating preferences
    if (searchQuery.toLowerCase().includes('best') || searchQuery.toLowerCase().includes('top rated')) {
      preferences.rating = 4.0;
    }

    // Extract location preferences
    if (location) {
      preferences.location = `${location.city}, ${location.state}`;
    }
    
    return preferences;
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setQuery(searchQuery);
    
    try {
      // Get user data for personalization
      const [restaurants, favoriteRestaurants] = await Promise.all([
        getRestaurants(),
        getUserFavorites().catch(() => [])
      ]);

      // Parse user preferences from the search query
      const userPreferences = parseUserPreferences(searchQuery);

      // Create recommendation context
      const recommendationContext = {
        userPreferences,
        availableRestaurants: restaurants,
        userProfile: userProfile || undefined,
        favoriteRestaurants: favoriteRestaurants?.map(fav => fav.restaurant) || [],
        userQuery: searchQuery,
      };

      // Get AI recommendations
      const result = await geminiService.getPersonalizedRecommendations(recommendationContext);

      setRecommendations(result.recommendations.slice(0, maxRecommendations));
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant);
    } else {
      router.push(`/restaurant/${restaurant.id}`);
    }
  };

  const handleQuickSearch = (quickQuery: string) => {
    setQuery(quickQuery);
    handleSearch(quickQuery);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search color="#0077b6" size={20} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="What are you craving today?"
            placeholderTextColor="#90e0ef"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch(query)} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#0077b6" />
              ) : (
                <Sparkles color="#0077b6" size={20} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Search Options */}
      {!query && recommendations.length === 0 && (
        <View style={styles.quickSearchSection}>
          <Text style={styles.quickSearchTitle}>Popular searches:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularQueries.map((popularQuery, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickSearchChip}
                onPress={() => handleQuickSearch(popularQuery)}
              >
                <Text style={styles.quickSearchChipText}>{popularQuery}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* AI Explanation */}
          {explanation && (
            <View style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Sparkles color="#0077b6" size={16} />
                <Text style={styles.explanationTitle}>AI Recommendation</Text>
              </View>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}

          {/* Restaurant List */}
          <View style={styles.restaurantList}>
            {recommendations.map((restaurant, index) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => handleRestaurantPress(restaurant)}
              >
                <View style={styles.restaurantContent}>
                  <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />
                  
                  <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantHeader}>
                      <Text style={styles.restaurantName}>{restaurant.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Star color="#48cae4" size={16} fill="#48cae4" />
                        <Text style={styles.ratingText}>{restaurant.rating}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
                    <Text style={styles.restaurantDescription} numberOfLines={2}>
                      {restaurant.description}
                    </Text>
                    
                    <View style={styles.restaurantMeta}>
                      <View style={styles.metaItem}>
                        <Clock color="#666" size={14} />
                        <Text style={styles.metaText}>
                          {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                        </Text>
                      </View>
                      
                      <View style={styles.metaItem}>
                        <MapPin color="#666" size={14} />
                        <Text style={styles.metaText}>${restaurant.delivery_fee} delivery</Text>
                      </View>
                    </View>
                  </View>
                  
                  <ChevronRight color="#90e0ef" size={20} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077b6" />
          <Text style={styles.loadingText}>Finding perfect restaurants for you...</Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && query && recommendations.length === 0 && (
        <View style={styles.emptyContainer}>
          <Sparkles color="#90e0ef" size={48} />
          <Text style={styles.emptyTitle}>No restaurants found</Text>
          <Text style={styles.emptyText}>Try a different search term or browse our popular options above.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#90e0ef',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
  },
  quickSearchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#90e0ef',
  },
  quickSearchTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 12,
  },
  quickSearchChip: {
    backgroundColor: '#ade8f4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  quickSearchChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0077b6',
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
    lineHeight: 20,
  },
  restaurantList: {
    gap: 12,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  cuisineType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
}); 