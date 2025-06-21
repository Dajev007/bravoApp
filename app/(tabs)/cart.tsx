import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react-native';
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
        <View style={styles.header}>
          <Text style={styles.title}>Your Cart</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <ShoppingBag color="#90e0ef" size={80} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some delicious items from our restaurants to get started!
          </Text>
        </View>
      </View>
    );
  }

  const deliveryFee = orderType === 'delivery' ? 2.99 : 0;
  const serviceFee = 1.50;
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + deliveryFee + serviceFee + tax;

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
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        tax: tax,
        tip: 0,
        total: finalTotal,
        order_type: orderType,
        table_id: tableId,
      };

      // Create the order
      const order = await createOrder(orderData);
      
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
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Order Type Info */}
      {orderType && (
        <View style={styles.orderTypeInfo}>
          <Text style={styles.orderTypeText}>
            {orderType === 'delivery' && '🚚 Delivery Order'}
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
                  <Minus color="#0077b6" size={16} />
                </TouchableOpacity>
                
                <Text style={styles.quantity}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus color="#0077b6" size={16} />
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
                <Trash2 color="#023e8a" size={20} />
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
        
        {orderType === 'delivery' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
        )}
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service Fee</Text>
          <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${finalTotal.toFixed(2)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.checkoutButton, isProcessing && styles.checkoutButtonDisabled]} 
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          <CreditCard color="#FFFFFF" size={20} />
          <Text style={styles.checkoutButtonText}>
            {isProcessing ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>

      <OrderTracking
        visible={showTracking}
        onClose={() => setShowTracking(false)}
        orderId={orderId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ade8f4',
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  orderTypeInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
  },
  orderTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
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
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#90e0ef',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: '#ade8f4',
    borderRadius: 6,
    padding: 8,
  },
  quantity: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#90e0ef',
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
    color: '#0077b6',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
  },
  divider: {
    height: 1,
    backgroundColor: '#90e0ef',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  checkoutButton: {
    backgroundColor: '#0077b6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});