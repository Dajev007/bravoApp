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
import { useLocation } from '@/contexts/LocationContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, Clock, Sparkles, Heart, Package } from 'lucide-react-native';
import { AIRecommendations } from '@/components/ui/AIRecommendations';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { getRestaurants, getCategories, type Restaurant, type Category } from '@/lib/database';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const { location, isLoading: locationLoading } = useLocation();
  const { colors, isDark } = useTheme();
  const [showAI, setShowAI] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocationDisplay = () => {
    if (locationLoading) return 'Loading location...';
    if (!location) return 'Set your location';
    return `${location.address}, ${location.city}`;
  };

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

  const styles = createStyles(colors, isDark);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? [colors.primary, colors.primaryDark] : [colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.user_metadata?.name || 'Guest'}! 👋</Text>
            <TouchableOpacity 
              style={styles.locationContainer}
              onPress={() => setShowLocationPicker(true)}
            >
              <MapPin color="#FFFFFF" size={16} />
              <Text style={styles.location}>{getLocationDisplay()}</Text>
              {location?.isManuallySet && (
                <View style={styles.manualLocationDot} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.aiButton} onPress={() => setShowAI(true)}>
            <Sparkles color="#3b8dba" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push('/(tabs)/restaurants')}
        >
          <Search color="#a2c7e7" size={20} />
          <Text style={styles.searchPlaceholder}>Search restaurants, cuisines...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/orders')}
        >
          <Package color="#3b8dba" size={24} />
          <Text style={styles.actionText}>Your Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/favorites')}
        >
          <Heart color="#3b8dba" size={24} />
          <Text style={styles.actionText}>Favorites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setShowAI(true)}
        >
          <Sparkles color="#3b8dba" size={24} />
          <Text style={styles.actionText}>AI Picks</Text>
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
                colors={['transparent', 'rgba(59, 141, 186, 0.8)']}
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
      <LocationPicker 
        visible={showLocationPicker} 
        onClose={() => setShowLocationPicker(false)} 
      />
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
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
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.95,
    flex: 1,
  },
  manualLocationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentLight,
    marginLeft: 4,
  },
  aiButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    textAlign: 'center',
  },
  restaurantsContainer: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a2c7e7',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  restaurantDistance: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#a2c7e7',
  },
  deliveryFee: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
});