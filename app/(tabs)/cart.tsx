import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OrderTracking } from '@/components/ui/OrderTracking';
import { createOrder } from '@/lib/database';

export default function CartScreen() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    totalPrice, 
    totalItems, 
    clearCart,
    orderType,
    tableId,
    tableNumber
  } = useCart();
  const [showTracking, setShowTracking] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#3b8dba', '#a2c7e7']}
          style={styles.header}
        >
          <Text style={styles.title}>Your Cart</Text>
        </LinearGradient>
        
        <View style={styles.emptyContainer}>
          <ShoppingBag color="#b1e0e7" size={80} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some delicious items from our restaurants to get started!
          </Text>
        </View>
      </View>
    );
  }

  const serviceFee = 1.50;
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + serviceFee + tax;

  const handleCheckout = async () => {
    if (!orderType) {
      Alert.alert('Order Type Required', 'Please select an order type before checkout.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get the restaurant ID from the first item (all items should be from the same restaurant)
      const restaurantId = items[0]?.restaurantId;
      
      if (!restaurantId) {
        throw new Error('No restaurant selected');
      }

      // Prepare order data
      const orderData = {
        restaurant_id: restaurantId,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal: totalPrice,
        service_fee: serviceFee,
        tax: tax,
        tip: 0,
        total: finalTotal,
        order_type: orderType,
        table_id: tableId,
      };

      // Create the order
      const order = await createOrder({
        ...orderData,
        table_id: orderData.table_id || undefined
      });
      
      // Clear cart and show tracking
      const newOrderId = order.id;
      setOrderId(newOrderId);
      setShowTracking(true);
      clearCart();
      
      Alert.alert(
        'Order Placed!',
        orderType === 'dine_in' && tableNumber 
          ? `Your order has been placed for Table ${tableNumber}. The restaurant will prepare your food shortly.`
          : 'Your order has been placed successfully!',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Order Failed',
        'There was an error placing your order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b8dba', '#a2c7e7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Cart</Text>
          <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Order Type Info */}
      {orderType && (
        <View style={styles.orderTypeInfo}>
          <Text style={styles.orderTypeText}>
            {orderType === 'takeaway' && '🥡 Takeaway Order'}
            {orderType === 'dine_in' && tableNumber && `🍽️ Dine In - Table ${tableNumber}`}
            {orderType === 'dine_in' && !tableNumber && '🍽️ Dine In Order'}
          </Text>
        </View>
      )}

      {/* Cart Items */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            )}
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.restaurantName}>{item.restaurantName}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus color="#3b8dba" size={16} />
                </TouchableOpacity>
                
                <Text style={styles.quantity}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus color="#3b8dba" size={16} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Trash2 color="#3b8dba" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({totalItems})</Text>
          <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
        </View>
        

        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service Fee</Text>
          <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.checkoutButton, isProcessing && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <CreditCard color="#FFFFFF" size={20} />
              <Text style={styles.checkoutText}>
                Checkout - ${finalTotal.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showTracking && orderId && (
        <OrderTracking 
          visible={showTracking}
          orderId={orderId} 
          onClose={() => setShowTracking(false)} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
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
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(59, 141, 186, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  orderTypeInfo: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  orderTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#a2c7e7',
    textAlign: 'center',
    lineHeight: 24,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a2c7e7',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#b1e0e7',
  },
  quantity: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    minWidth: 24,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#b1e0e7',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#b1e0e7',
    paddingTop: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
  },
  checkoutButton: {
    backgroundColor: '#3b8dba',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  checkoutText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});