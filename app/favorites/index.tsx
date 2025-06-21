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
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Favorites</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Heart color="#90e0ef" size={80} />
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
      <View style={styles.header}>
        <Text style={styles.title}>Your Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} restaurant{favorites.length !== 1 ? 's' : ''}</Text>
      </View>

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
                  <Star color="#48cae4" size={16} fill="#48cae4" />
                  <Text style={styles.metaText}>
                    {favorite.restaurant.rating} ({favorite.restaurant.review_count})
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Clock color="#0077b6" size={16} />
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
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
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
    color: '#03045e',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  favoritesList: {
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
});