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
import { ArrowLeft, Plus, CreditCard, Smartphone, DollarSign, Star } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
  icon: string;
}

export default function PaymentScreen() {
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa ending in 4242',
      details: 'Expires 12/25',
      isDefault: true,
      icon: '💳',
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

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return CreditCard;
      case 'digital':
        return Smartphone;
      case 'cash':
        return DollarSign;
      default:
        return CreditCard;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#0077b6" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
          <Plus color="#0077b6" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          
          {paymentMethods.map((method) => {
            const IconComponent = getPaymentIcon(method.type);
            return (
              <View key={method.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentIconContainer}>
                      <IconComponent color="#0077b6" size={20} />
                    </View>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentName}>{method.name}</Text>
                      <Text style={styles.paymentSubtext}>{method.details}</Text>
                    </View>
                  </View>
                  
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Star color="#48cae4" size={12} fill="#48cae4" />
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.paymentActions}>
                  {!method.isDefault && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={[styles.actionButtonText, styles.removeText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Add Payment Method */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.addPaymentCard} onPress={handleAddPaymentMethod}>
            <View style={styles.addPaymentIcon}>
              <Plus color="#0077b6" size={24} />
            </View>
            <Text style={styles.addPaymentText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Security</Text>
          <View style={styles.securityCard}>
            <Text style={styles.securityTitle}>🔒 Your payments are secure</Text>
            <Text style={styles.securityText}>
              We use industry-standard encryption to protect your payment information. 
              Your card details are never stored on our servers.
            </Text>
          </View>
        </View>

        {/* Billing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <TouchableOpacity style={styles.billingCard}>
            <View style={styles.billingInfo}>
              <Text style={styles.billingTitle}>Billing Address</Text>
              <Text style={styles.billingText}>123 Main St, San Francisco, CA 94102</Text>
            </View>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ade8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  paymentSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ade8f4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  removeText: {
    color: '#023e8a',
  },
  addPaymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ade8f4',
    borderStyle: 'dashed',
  },
  addPaymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ade8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPaymentText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0077b6',
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  securityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    lineHeight: 20,
  },
  billingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  billingInfo: {
    flex: 1,
  },
  billingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  billingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  editText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
});