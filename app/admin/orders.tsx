import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  RefreshControl,
  FlatList
} from 'react-native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getRestaurantOrders, updateOrderStatus } from '@/lib/admin-database';
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  FilterIcon,
  UserIcon,
  MapPinIcon
} from 'lucide-react-native';

interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  order_type: 'delivery' | 'takeaway' | 'dine_in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  special_instructions?: string;
  delivery_address?: string;
  table_id?: string;
  created_at: string;
  updated_at: string;
  user?: { 
    id: string;
    full_name?: string;
    phone?: string;
  };
  table?: {
    table_number: number;
  };
  order_items?: Array<{
    id: string;
    quantity: number;
    price: number;
    menu_item: {
      name: string;
      category: { name: string; };
    };
  }>;
}

export default function OrdersManagement() {
  const { restaurantId } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [restaurantId, selectedStatus]);

  const fetchOrders = async () => {
    if (!restaurantId) return;

    try {
      const ordersData = await getRestaurantOrders(
        restaurantId, 
        selectedStatus === 'all' ? undefined : selectedStatus
      );
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'preparing':
        return '#8b5cf6';
      case 'ready':
        return '#10b981';
      case 'delivered':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'pending':
        return '#fef3c7';
      case 'confirmed':
        return '#dbeafe';
      case 'preparing':
        return '#e9d5ff';
      case 'ready':
        return '#d1fae5';
      case 'delivered':
        return '#dcfce7';
      case 'cancelled':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { status: 'confirmed', label: 'Confirm', color: '#3b82f6' },
          { status: 'cancelled', label: 'Cancel', color: '#ef4444' }
        ];
      case 'confirmed':
        return [
          { status: 'preparing', label: 'Start Preparing', color: '#8b5cf6' },
          { status: 'cancelled', label: 'Cancel', color: '#ef4444' }
        ];
      case 'preparing':
        return [
          { status: 'ready', label: 'Mark Ready', color: '#10b981' }
        ];
      case 'ready':
        return [
          { status: 'delivered', label: 'Mark Delivered', color: '#059669' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const statusOptions = [
    { key: 'all', label: 'All Orders', count: orders.length },
    { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ShoppingBagIcon size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Orders Management</Text>
        </View>
        
        <Text style={styles.headerSubtitle}>
          {orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length} active orders
        </Text>
      </View>

      {/* Status Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.statusFilter,
              selectedStatus === option.key && styles.statusFilterActive
            ]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text style={[
              styles.statusFilterText,
              selectedStatus === option.key && styles.statusFilterTextActive
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.statusCount,
              selectedStatus === option.key && styles.statusCountActive
            ]}>
              <Text style={[
                styles.statusCountText,
                selectedStatus === option.key && styles.statusCountTextActive
              ]}>
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: order }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>Order #{order.id.slice(-8)}</Text>
                <View style={styles.orderType}>
                  <Text style={styles.orderTypeText}>
                    {order.order_type === 'dine_in' ? 'Dine In' : 
                     order.order_type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                  </Text>
                  {order.table && (
                    <Text style={styles.tableNumber}>• Table {order.table.table_number}</Text>
                  )}
                </View>
              </View>
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusBackground(order.status) }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) }
                ]}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.customerInfo}>
              <UserIcon size={16} color="#64748b" />
              <Text style={styles.customerName}>
                {order.user?.full_name || `Customer #${order.user_id.slice(-8)}`}
              </Text>
              {order.user?.phone && (
                <Text style={styles.customerPhone}>• {order.user.phone}</Text>
              )}
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {order.order_items?.slice(0, 3).map((item, index) => (
                <Text key={index} style={styles.orderItem}>
                  {item.quantity}x {item.menu_item.name}
                </Text>
              ))}
              {order.order_items && order.order_items.length > 3 && (
                <Text style={styles.moreItems}>
                  +{order.order_items.length - 3} more items
                </Text>
              )}
            </View>

            {/* Special Instructions */}
            {order.special_instructions && (
              <View style={styles.specialInstructions}>
                <AlertCircleIcon size={16} color="#f59e0b" />
                <Text style={styles.instructionsText}>
                  {order.special_instructions}
                </Text>
              </View>
            )}

            {/* Delivery Address */}
            {order.delivery_address && (
              <View style={styles.deliveryAddress}>
                <MapPinIcon size={16} color="#64748b" />
                <Text style={styles.addressText}>
                  {order.delivery_address}
                </Text>
              </View>
            )}

            <View style={styles.orderFooter}>
              <View style={styles.orderTotal}>
                <Text style={styles.totalLabel}>Total: </Text>
                <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
              </View>
              
              <View style={styles.orderTime}>
                <ClockIcon size={16} color="#64748b" />
                <Text style={styles.timeText}>
                  {new Date(order.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            {getNextStatusOptions(order.status).length > 0 && (
              <View style={styles.actionButtons}>
                {getNextStatusOptions(order.status).map((action) => (
                  <TouchableOpacity
                    key={action.status}
                    style={[styles.actionButton, { backgroundColor: action.color }]}
                    onPress={() => handleStatusUpdate(order.id, action.status)}
                  >
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShoppingBagIcon size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'all' 
                ? 'No orders have been placed yet'
                : `No ${selectedStatus} orders found`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Status Filters
  statusFilters: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    gap: 8,
  },
  statusFilterActive: {
    backgroundColor: '#3b82f6',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#ffffff',
  },
  statusCount: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  statusCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  statusCountTextActive: {
    color: '#ffffff',
  },

  // Orders List
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  orderType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTypeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tableNumber: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    color: '#94a3b8',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    marginBottom: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontStyle: 'italic',
  },
  deliveryAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
}); 