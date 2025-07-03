import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ShoppingBag, UtensilsCrossed, X } from 'lucide-react-native';

interface OrderTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: 'takeaway' | 'dine_in') => void;
  isDineInAvailable?: boolean;
}

export function OrderTypeSelector({ 
  visible, 
  onClose, 
  onSelectType, 
  isDineInAvailable = false 
}: OrderTypeSelectorProps) {
  const orderTypes = [
    {
      type: 'takeaway' as const,
      title: 'Takeaway',
      description: 'Pick up your order from the restaurant',
      icon: ShoppingBag,
      color: '#48cae4',
    },
    ...(isDineInAvailable ? [{
      type: 'dine_in' as const,
      title: 'Dine In',
      description: 'Order for dining at the restaurant',
      icon: UtensilsCrossed,
      color: '#90e0ef',
    }] : []),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How would you like your order?</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#0077b6" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {orderTypes.map((orderType) => (
            <TouchableOpacity
              key={orderType.type}
              style={[styles.optionCard, { borderColor: orderType.color }]}
              onPress={() => {
                onSelectType(orderType.type);
                onClose();
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: orderType.color }]}>
                <orderType.icon color="#FFFFFF" size={32} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{orderType.title}</Text>
                <Text style={styles.optionDescription}>{orderType.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change your order type before checkout
          </Text>
        </View>
      </View>
    </Modal>
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#90e0ef',
    textAlign: 'center',
  },
});