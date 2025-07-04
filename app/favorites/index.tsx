import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Star, Clock, MapPin } from 'lucide-react-native';
import { getUserFavorites, toggleFavorite } from '@/lib/database';
import { LinearGradient } from 'expo-linear-gradient';

interface FavoriteRestaurant {
  id: string;
  restaurant: {
    id: string;
    name: string;
    description: string;
    cuisine_type: string;
    image_url: string;
    rating: number;
    review_count: number;
    delivery_time_min: number;
    delivery_time_max: number;
    delivery_fee: number;
    address: string;
  };
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesData = await getUserFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (restaurantId: string) => {
    try {
      await toggleFavorite(restaurantId);
      setFavorites(prev => prev.filter(fav => fav.restaurant.id !== restaurantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b8dba" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#3b8dba', '#a2c7e7']}
          style={styles.header}
        >
          <Text style={styles.title}>Your Favorites</Text>
        </LinearGradient>
        
        <View style={styles.emptyContainer}>
          <Heart color="#a2c7e7" size={80} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Start adding restaurants to your favorites by tapping the heart icon.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/restaurants')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b8dba', '#a2c7e7']}
        style={styles.header}
      >
        <Text style={styles.title}>Your Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} restaurant{favorites.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.favoritesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {favorites.map((favorite) => (
          <TouchableOpacity
            key={favorite.id}
            style={styles.restaurantCard}
            onPress={() => router.push(`/restaurant/${favorite.restaurant.id}`)}
          >
            <Image
              source={{ uri: favorite.restaurant.image_url }}
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName}>{favorite.restaurant.name}</Text>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(favorite.restaurant.id)}
                  style={styles.favoriteButton}
                >
                  <Heart color="#FF6B6B" size={20} fill="#FF6B6B" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cuisine}>{favorite.restaurant.cuisine_type}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {favorite.restaurant.description}
              </Text>
              
              <View style={styles.restaurantMeta}>
                <View style={styles.metaItem}>
                  <Star color="#3b8dba" size={16} fill="#3b8dba" />
                  <Text style={styles.metaText}>
                    {favorite.restaurant.rating} ({favorite.restaurant.review_count})
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Clock color="#3b8dba" size={16} />
                  <Text style={styles.metaText}>
                    {favorite.restaurant.delivery_time_min}-{favorite.restaurant.delivery_time_max} min
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Text style={styles.deliveryFee}>
                    ${favorite.restaurant.delivery_fee} delivery
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    fontFamily: 'Inter-Medium',
    color: '#1e3a8a',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e3a8a',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#3b8dba',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  browseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  favoritesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#b1e0e7',
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 16,
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
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  cuisine: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
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
    fontFamily: 'Inter-Medium',
    color: '#1e3a8a',
  },
  deliveryFee: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
});