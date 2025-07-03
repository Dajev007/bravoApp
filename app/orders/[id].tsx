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
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Clock, MapPin, Phone, MessageCircle, Star, Package } from 'lucide-react-native';
import { getUserOrders, type Order } from '@/lib/database';
import { LinearGradient } from 'expo-linear-gradient';
import { OrderTracking } from '@/components/ui/OrderTracking';

export default function OrderDetailScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const orders = await getUserOrders();
      const orderData = orders.find(o => o.id === id);
      setOrder(orderData || null);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return colors.primary;
      case 'cancelled':
        return '#ff6b6b';
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
      case 'picked_up':
        return colors.primary;
      default:
        return colors.accent;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleContactRestaurant = () => {
    if (order?.restaurant?.phone) {
      Alert.alert(
        'Contact Restaurant',
        `Call ${order.restaurant.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {} }, // Would open phone dialer
        ]
      );
    }
  };

  const handleOrderHelp = () => {
    Alert.alert(
      'Order Help',
      'Choose how you\'d like to get help with this order:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Live Chat', onPress: () => {} },
        { text: 'Call Support', onPress: () => {} },
      ]
    );
  };

  const styles = createStyles(colors, isDark);

  // Gradient colors based on theme
  const gradientColors = isDark 
    ? ['#1a1a1a', '#2d2d2d'] as const // Dark ash colors
    : [colors.primary, colors.primaryLight] as const; // Light theme

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order #{order.id.slice(-8)}</Text>
          <Text style={styles.headerSubtitle}>{order.restaurant?.name}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
          
          {order.estimated_delivery_time && (
            <View style={styles.timeInfo}>
              <Clock color={colors.primary} size={20} />
              <Text style={styles.timeText}>
                Estimated: {new Date(order.estimated_delivery_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Order Tracking */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <View style={styles.trackingSection}>
            <Text style={styles.trackingText}>Order tracking in progress...</Text>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Restaurant</Text>
          </View>
          
          <View style={styles.restaurantCard}>
            <Image
              source={{ uri: order.restaurant?.image_url }}
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
              <View style={styles.restaurantMeta}>
                <View style={styles.metaItem}>
                  <Star color={colors.primary} size={16} fill={colors.primary} />
                  <Text style={styles.metaText}>{order.restaurant?.rating}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MapPin color={colors.primary} size={16} />
                  <Text style={styles.metaText}>{order.restaurant?.address}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactRestaurant}
            >
              <Phone color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <Text style={styles.itemCount}>
              {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {order.order_items?.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image
                source={{ uri: item.menu_item?.image_url }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menu_item?.name}</Text>
                <Text style={styles.itemDescription}>
                  {item.menu_item?.description}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>${item.unit_price.toFixed(2)} each</Text>
                </View>
                {item.special_instructions && (
                  <Text style={styles.specialInstructions}>
                    Note: {item.special_instructions}
                  </Text>
                )}
              </View>
              <Text style={styles.itemTotal}>${item.total_price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            
            {order.delivery_fee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>${order.delivery_fee.toFixed(2)}</Text>
              </View>
            )}
            
            {order.service_fee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Fee</Text>
                <Text style={styles.summaryValue}>${order.service_fee.toFixed(2)}</Text>
              </View>
            )}
            
            {order.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
              </View>
            )}
            
            {order.tip > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tip</Text>
                <Text style={styles.summaryValue}>${order.tip.toFixed(2)}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Special Instructions */}
        {order.special_instructions && (
          <View style={styles.instructionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
            </View>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{order.special_instructions}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOrderHelp}>
            <MessageCircle color={colors.primary} size={20} />
            <Text style={styles.actionButtonText}>Get Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => router.push(`/restaurant/${order.restaurant_id}`)}
          >
            <Package color="#ffffff" size={20} />
            <Text style={styles.primaryActionButtonText}>Order Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerBackButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  trackingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  trackingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  restaurantSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
    color: colors.text,
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 8,
  },
  restaurantMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  itemTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    alignSelf: 'center',
  },
  specialInstructions: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  instructionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  instructionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});