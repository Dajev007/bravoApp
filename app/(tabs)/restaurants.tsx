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
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#0077b6" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color="#999" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

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
                    color={favorites.has(restaurant.id) ? '#FF6B6B' : '#90e0ef'}
                    size={20}
                    fill={favorites.has(restaurant.id) ? '#FF6B6B' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>
              <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text>
              
              <View style={styles.restaurantMeta}>
                <View style={styles.metaItem}>
                  <Star color="#48cae4" size={16} fill="#48cae4" />
                  <Text style={styles.metaText}>{restaurant.rating} ({restaurant.review_count})</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Clock color="#0077b6" size={16} />
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
    backgroundColor: '#caf0f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#caf0f8',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#90e0ef',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ade8f4',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#90e0ef',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#90e0ef',
  },
  activeFilterChip: {
    backgroundColor: '#0077b6',
    borderColor: '#0077b6',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  restaurantsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  cuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#90e0ef',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  deliveryFee: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
});