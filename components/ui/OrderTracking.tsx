import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { X, Clock, CircleCheck as CheckCircle, Truck, MapPin } from 'lucide-react-native';

interface OrderTrackingProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
}

interface OrderStatus {
  id: string;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'completed';
  timestamp: string;
  message: string;
}

export function OrderTracking({ visible, onClose, orderId }: OrderTrackingProps) {
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([
    {
      id: '1',
      status: 'confirmed',
      timestamp: '2:30 PM',
      message: 'Order confirmed by restaurant',
    },
    {
      id: '2',
      status: 'preparing',
      timestamp: '2:35 PM',
      message: 'Kitchen is preparing your order',
    },
  ]);

  const [currentStatus, setCurrentStatus] = useState<OrderStatus['status']>('preparing');
  const [estimatedTime, setEstimatedTime] = useState('25-30 min');

  // Simulate real-time updates
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      // Simulate status updates
      const random = Math.random();
      if (random > 0.7 && currentStatus === 'preparing') {
        setCurrentStatus('ready');
        setOrderStatuses(prev => [...prev, {
          id: Date.now().toString(),
          status: 'ready',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: 'Order is ready for pickup',
        }]);
        setEstimatedTime('5-10 min');
      } else if (random > 0.8 && currentStatus === 'ready') {
        setCurrentStatus('picked_up');
        setOrderStatuses(prev => [...prev, {
          id: Date.now().toString(),
          status: 'picked_up',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: 'Driver has picked up your order',
        }]);
        setEstimatedTime('10-15 min');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [visible, currentStatus]);

  const getStatusIcon = (status: OrderStatus['status'], isActive: boolean) => {
    const color = isActive ? '#48cae4' : '#90e0ef';
    const size = 24;

    switch (status) {
      case 'confirmed':
        return <CheckCircle color={color} size={size} fill={isActive ? color : 'transparent'} />;
      case 'preparing':
        return <Clock color={color} size={size} />;
      case 'ready':
        return <CheckCircle color={color} size={size} fill={isActive ? color : 'transparent'} />;
      case 'picked_up':
        return <Truck color={color} size={size} />;
      case 'completed':
        return <MapPin color={color} size={size} />;
      default:
        return <Clock color={color} size={size} />;
    }
  };

  const getStatusColor = (status: OrderStatus['status']) => {
    const statusOrder = ['confirmed', 'preparing', 'ready', 'picked_up', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    
    return statusIndex <= currentIndex ? '#48cae4' : '#90e0ef';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order Tracking</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#0077b6" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{orderId}</Text>
            <Text style={styles.estimatedTime}>Estimated: {estimatedTime}</Text>
          </View>

          <View style={styles.statusContainer}>
            {orderStatuses.map((status, index) => (
              <View key={status.id} style={styles.statusItem}>
                <View style={styles.statusIconContainer}>
                  {getStatusIcon(status.status, status.status === currentStatus)}
                  {index < orderStatuses.length - 1 && (
                    <View 
                      style={[
                        styles.statusLine,
                        { backgroundColor: getStatusColor(status.status) }
                      ]} 
                    />
                  )}
                </View>
                <View style={styles.statusContent}>
                  <Text style={styles.statusMessage}>{status.message}</Text>
                  <Text style={styles.statusTime}>{status.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Order Information</Text>
            <View style={styles.deliveryDetails}>
              <View style={styles.deliveryRow}>
                <MapPin color="#0077b6" size={20} />
                <Text style={styles.deliveryText}>Your order is being prepared</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ade8f4',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusLine: {
    width: 2,
    height: 40,
    marginTop: 8,
  },
  statusContent: {
    flex: 1,
    paddingTop: 2,
  },
  statusMessage: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  deliveryInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  deliveryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 16,
  },
  deliveryDetails: {
    gap: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
});