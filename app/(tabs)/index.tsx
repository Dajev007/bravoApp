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
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, Clock, Sparkles, Heart, Package } from 'lucide-react-native';
import { AIRecommendations } from '@/components/ui/AIRecommendations';
import { getRestaurants, getCategories, type Restaurant, type Category } from '@/lib/database';

export default function HomeScreen() {
  const { user } = useAuth();
  const [showAI, setShowAI] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featured, all, categoriesData] = await Promise.all([
        getRestaurants({ featured: true }),
        getRestaurants(),
        getCategories(),
      ]);
      
      setFeaturedRestaurants(featured);
      setAllRestaurants(all);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#03045e', '#023e8a', '#0077b6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.user_metadata?.name || 'Guest'}! 👋</Text>
            <View style={styles.locationContainer}>
              <MapPin color="#FFFFFF" size={16} />
              <Text style={styles.location}>Downtown, San Francisco</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.aiButton} onPress={() => setShowAI(true)}>
            <Sparkles color="#0077b6" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push('/(tabs)/restaurants')}
        >
          <Search color="#999" size={20} />
          <Text style={styles.searchPlaceholder}>Search restaurants, cuisines...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/orders')}
        >
          <Package color="#0077b6" size={24} />
          <Text style={styles.actionText}>Your Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/favorites')}
        >
          <Heart color="#0077b6" size={24} />
          <Text style={styles.actionText}>Favorites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/scanner')}
        >
          <Text style={styles.actionIcon}>📱</Text>
          <Text style={styles.actionText}>QR Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
              onPress={() => router.push({
                pathname: '/(tabs)/restaurants',
                params: { category: category.name }
              })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Restaurants</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/restaurants')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.restaurantsContainer}
        >
          {featuredRestaurants.map((restaurant) => (
            <TouchableOpacity 
              key={restaurant.id} 
              style={styles.featuredCard}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            >
              <Image source={{ uri: restaurant.image_url }} style={styles.featuredImage} />
              <LinearGradient
                colors={['transparent', 'rgba(3,4,94,0.8)']}
                style={styles.featuredOverlay}
              >
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredName}>{restaurant.name}</Text>
                  <Text style={styles.featuredCuisine}>{restaurant.cuisine_type}</Text>
                  <View style={styles.featuredInfo}>
                    <View style={styles.ratingContainer}>
                      <Star color="#48cae4" size={14} fill="#48cae4" />
                      <Text style={styles.rating}>{restaurant.rating}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Clock color="#FFFFFF" size={14} />
                      <Text style={styles.deliveryTime}>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Popular Near You */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/restaurants')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {allRestaurants.slice(0, 5).map((restaurant) => (
          <TouchableOpacity 
            key={restaurant.id} 
            style={styles.restaurantCard}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          >
            <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
              <View style={styles.restaurantMeta}>
                <View style={styles.ratingContainer}>
                  <Star color="#48cae4" size={16} fill="#48cae4" />
                  <Text style={styles.rating}>{restaurant.rating}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock color="#666" size={16} />
                  <Text style={styles.deliveryTime}>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</Text>
                </View>
                <Text style={styles.deliveryFee}>${restaurant.delivery_fee} delivery</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <AIRecommendations visible={showAI} onClose={() => setShowAI(false)} />
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  aiButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#90e0ef',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 80,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#90e0ef',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
    textAlign: 'center',
  },
  restaurantsContainer: {
    flexDirection: 'row',
  },
  featuredCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#90e0ef',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredCuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  featuredInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  deliveryFee: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
});