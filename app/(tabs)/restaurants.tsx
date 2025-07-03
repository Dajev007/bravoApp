import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { Search, Filter, Star, Clock, MapPin, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getRestaurants, getCategories, toggleFavorite, type Restaurant, type Category } from '@/lib/database';

const cuisineFilters = ['All', 'Italian', 'Japanese', 'Indian', 'American', 'Healthy', 'Mexican', 'Chinese', 'Cafe'];

export default function RestaurantsScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(params.category as string || 'All');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [selectedCuisine, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [restaurantsData, categoriesData] = await Promise.all([
        getRestaurants({
          cuisine: selectedCuisine,
          search: searchQuery,
        }),
        getCategories(),
      ]);
      
      setRestaurants(restaurantsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (restaurantId: string) => {
    try {
      const isFavorited = await toggleFavorite(restaurantId);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFavorited) {
          newFavorites.add(restaurantId);
        } else {
          newFavorites.delete(restaurantId);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b8dba" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b8dba', '#a2c7e7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Restaurants</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#3b8dba" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#a2c7e7" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor="#a2c7e7"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Cuisine Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {cuisineFilters.map((cuisine) => (
          <TouchableOpacity
            key={cuisine}
            style={[
              styles.filterChip,
              selectedCuisine === cuisine && styles.activeFilterChip,
            ]}
            onPress={() => setSelectedCuisine(cuisine)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCuisine === cuisine && styles.activeFilterText,
              ]}
            >
              {cuisine}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Restaurant List */}
      <ScrollView style={styles.restaurantsList} showsVerticalScrollIndicator={false}>
        {restaurants.map((restaurant) => (
          <TouchableOpacity 
            key={restaurant.id} 
            style={styles.restaurantCard}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          >
            <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(restaurant.id)}
                  style={styles.favoriteButton}
                >
                  <Heart
                    color={favorites.has(restaurant.id) ? '#FF6B6B' : '#b1e0e7'}
                    size={20}
                    fill={favorites.has(restaurant.id) ? '#FF6B6B' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>
              <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text>
              
              <View style={styles.restaurantMeta}>
                <View style={styles.metaItem}>
                  <Star color="#b1e0e7" size={16} fill="#b1e0e7" />
                  <Text style={styles.metaText}>{restaurant.rating} ({restaurant.review_count})</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Clock color="#3b8dba" size={16} />
                  <Text style={styles.metaText}>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Text style={styles.deliveryFee}>${restaurant.delivery_fee} delivery</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {restaurants.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    marginTop: 12,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(59, 141, 186, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#b1e0e7',
  },
  filterChip: {
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterChip: {
    backgroundColor: '#3b8dba',
    borderColor: '#3b8dba',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  restaurantsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 160,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  cuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a2c7e7',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    lineHeight: 20,
    marginBottom: 12,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  deliveryFee: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#a2c7e7',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a2c7e7',
    textAlign: 'center',
  },
});