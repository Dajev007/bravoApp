import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Star, Clock, MapPin, Heart, Plus, UtensilsCrossed } from 'lucide-react-native';
import { getRestaurantById, getMenuItems, toggleFavorite, getTableById, type Restaurant, type MenuItem } from '@/lib/database';
import { useCart } from '@/contexts/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import { OrderTypeSelector } from '@/components/ui/OrderTypeSelector';

export default function RestaurantScreen() {
  const { id, tableId, tableNumber, orderType } = useLocalSearchParams<{ 
    id: string; 
    tableId?: string; 
    tableNumber?: string; 
    orderType?: string; 
  }>();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showOrderTypeSelector, setShowOrderTypeSelector] = useState(false);
  
  const { 
    addItem, 
    orderType: cartOrderType, 
    setOrderType: setCartOrderType,
    setTableId: setCartTableId,
    setTableNumber: setCartTableNumber
  } = useCart();

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  useEffect(() => {
    // Set order context from URL params
    if (orderType) {
      setCartOrderType(orderType as 'delivery' | 'takeaway' | 'dine_in');
    }
    if (tableId) {
      setCartTableId(tableId);
    }
    if (tableNumber) {
      setCartTableNumber(parseInt(tableNumber));
    }
  }, [orderType, tableId, tableNumber]);

  const loadRestaurantData = async () => {
    try {
      const [restaurantData, menuData] = await Promise.all([
        getRestaurantById(id!),
        getMenuItems(id!),
      ]);
      
      setRestaurant(restaurantData);
      setMenuItems(menuData);

      // If we have a table ID, verify it exists and is active
      if (tableId) {
        try {
          const tableData = await getTableById(tableId);
          if (!tableData.is_active) {
            Alert.alert(
              'Table Unavailable',
              'This table is currently occupied. Please contact restaurant staff.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
          }
        } catch (error) {
          console.error('Error loading table data:', error);
          Alert.alert(
            'Table Error',
            'Unable to verify table availability. Please contact restaurant staff.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      Alert.alert('Error', 'Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const favorited = await toggleFavorite(id!);
      setIsFavorite(favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    
    // If no order type is selected, show the selector
    if (!cartOrderType) {
      setShowOrderTypeSelector(true);
      return;
    }
    
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    });
    
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  };

  const handleOrderTypeSelect = (type: 'delivery' | 'takeaway' | 'dine_in') => {
    setCartOrderType(type);
    
    // If selecting dine-in but no table is set, clear table info
    if (type !== 'dine_in') {
      setCartTableId(null);
      setCartTableNumber(null);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category?.name).filter(Boolean))];
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category?.name === selectedCategory);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={styles.loadingText}>Loading restaurant...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: restaurant.image_url }} style={styles.headerImage} />
        <LinearGradient
          colors={['transparent', 'rgba(3,4,94,0.8)']}
          style={styles.headerOverlay}
        />
        
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite}>
            <Heart
              color={isFavorite ? '#FF6B6B' : '#FFFFFF'}
              size={24}
              fill={isFavorite ? '#FF6B6B' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Star color="#48cae4" size={16} fill="#48cae4" />
              <Text style={styles.metaText}>{restaurant.rating} ({restaurant.review_count})</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock color="#FFFFFF" size={16} />
              <Text style={styles.metaText}>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin color="#FFFFFF" size={16} />
              <Text style={styles.metaText}>${restaurant.delivery_fee} delivery</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Order Type Banner */}
      {cartOrderType && (
        <View style={styles.orderTypeBanner}>
          <View style={styles.orderTypeInfo}>
            <UtensilsCrossed color="#0077b6" size={20} />
            <Text style={styles.orderTypeText}>
              {cartOrderType === 'delivery' && 'Delivery Order'}
              {cartOrderType === 'takeaway' && 'Takeaway Order'}
              {cartOrderType === 'dine_in' && tableNumber && `Dine In - Table ${tableNumber}`}
              {cartOrderType === 'dine_in' && !tableNumber && 'Dine In Order'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowOrderTypeSelector(true)}>
            <Text style={styles.changeOrderType}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.description}>{restaurant.description}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Minimum Order:</Text>
            <Text style={styles.detailValue}>${restaurant.minimum_order}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{restaurant.address}</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.activeCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.menuItemMeta}>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  {item.is_popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                  {item.is_vegetarian && (
                    <View style={styles.dietaryBadge}>
                      <Text style={styles.dietaryText}>🌱</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.menuItemImage} />
              )}
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Plus color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Order Type Selector Modal */}
      <OrderTypeSelector
        visible={showOrderTypeSelector}
        onClose={() => setShowOrderTypeSelector(false)}
        onSelectType={handleOrderTypeSelect}
        isDineInAvailable={!!tableId || cartOrderType === 'dine_in'}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#caf0f8',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  headerContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  headerControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  restaurantInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  orderTypeBanner: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
  },
  orderTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
  },
  changeOrderType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  content: {
    flex: 1,
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryFilter: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#ade8f4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeCategoryChip: {
    backgroundColor: '#0077b6',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
    position: 'relative',
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    lineHeight: 20,
    marginBottom: 8,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  popularBadge: {
    backgroundColor: '#48cae4',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  dietaryBadge: {
    backgroundColor: '#90e0ef',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  dietaryText: {
    fontSize: 12,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#0077b6',
    borderRadius: 16,
    padding: 8,
  },
});