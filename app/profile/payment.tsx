import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, CreditCard, Smartphone, DollarSign, Star, Check, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital' | 'cash' | 'paypal' | 'apple_pay';
  name: string;
  details: string;
  isDefault: boolean;
  icon: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export default function PaymentScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa ending in 4242',
      details: 'Expires 12/25',
      isDefault: true,
      icon: '💳',
      lastFour: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      brand: 'Visa',
    },
    {
      id: '2',
      type: 'digital',
      name: 'Apple Pay',
      details: 'Touch ID or Face ID',
      isDefault: false,
      icon: '📱',
    },
    {
      id: '3',
      type: 'cash',
      name: 'Cash on Delivery',
      details: 'Pay when your order arrives',
      isDefault: false,
      icon: '💵',
    },
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'To add payment methods, you\'ll need to export this project and integrate RevenueCat for mobile subscriptions and in-app purchases, or Stripe for one-time payments.\n\nRevenueCat handles billing, entitlements, and receipt validation out of the box.',
      [
        {
          text: 'Learn More',
          onPress: () => {
            console.log('Opening RevenueCat documentation...');
          },
        },
        {
          text: 'OK',
        },
      ]
    );
  };

  const handleDeletePaymentMethod = (methodId: string, methodName: string) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${methodName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            Alert.alert('Success', 'Payment method deleted successfully');
          },
        },
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return CreditCard;
      case 'digital':
        return Smartphone;
      case 'cash':
        return DollarSign;
      case 'paypal':
        return () => <Text style={styles.paypalIcon}>PayPal</Text>;
      case 'apple_pay':
        return () => <Text style={styles.applePayIcon}>Apple Pay</Text>;
      default:
        return CreditCard;
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return `${method.brand} •••• ${method.lastFour}`;
    } else if (method.type === 'paypal') {
      return 'PayPal';
    } else if (method.type === 'apple_pay') {
      return 'Apple Pay';
    }
    return 'Unknown';
  };

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    if (method.type === 'card' && method.expiryMonth && method.expiryYear) {
      return `Expires ${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear}`;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b8dba', '#a2c7e7']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard color="#a2c7e7" size={80} />
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptyText}>
              Add your first payment method to make checkout faster and easier.
            </Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddPaymentMethod}>
              <Plus color="#ffffff" size={20} />
              <Text style={styles.addFirstButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.paymentMethodsList}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
              <Text style={styles.sectionDescription}>
                Manage your payment options for faster checkout
              </Text>
            </View>

            {paymentMethods.map((method) => {
              const IconComponent = getPaymentIcon(method.type);
              return (
                <View key={method.id} style={styles.paymentMethodCard}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <View style={styles.methodIcon}>
                        <IconComponent color="#3b8dba" size={24} />
                      </View>
                      <View style={styles.methodDetails}>
                        <View style={styles.methodNameContainer}>
                          <Text style={styles.methodName}>
                            {getPaymentMethodName(method)}
                          </Text>
                          {method.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Star color="#3b8dba" size={12} fill="#3b8dba" />
                              <Text style={styles.defaultText}>Default</Text>
                            </View>
                          )}
                        </View>
                        {getPaymentMethodDetails(method) && (
                          <Text style={styles.methodExpiryText}>
                            {getPaymentMethodDetails(method)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeletePaymentMethod(method.id, getPaymentMethodName(method))
                      }
                    >
                      <Trash2 color="#ffffff" size={20} />
                    </TouchableOpacity>
                  </View>

                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.setDefaultButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Check color="#3b8dba" size={16} />
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            <TouchableOpacity style={styles.addNewButton} onPress={handleAddPaymentMethod}>
              <Plus color="#3b8dba" size={24} />
              <Text style={styles.addNewText}>Add New Payment Method</Text>
            </TouchableOpacity>

            <View style={styles.securitySection}>
              <Text style={styles.securityTitle}>Security & Privacy</Text>
              <Text style={styles.securityText}>
                Your payment information is encrypted and stored securely. We never share your
                financial details with restaurants or third parties.
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 100,
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
    color: '#3b8dba',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b8dba',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  paymentMethodsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    lineHeight: 22,
  },
  paymentMethodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  methodInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodDetails: {
    flex: 1,
  },
  methodNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginRight: 12,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  methodExpiryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b8dba',
    gap: 8,
  },
  setDefaultText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#b1e0e7',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 32,
  },
  addNewText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  securitySection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    lineHeight: 20,
  },
  paypalIcon: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
  },
  applePayIcon: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#3b8dba',
  },
});