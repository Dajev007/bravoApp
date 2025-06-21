import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl
} from 'react-native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getDashboardStats,
  getAdminNotifications,
  getOrderRequests,
  markNotificationAsRead
} from '@/lib/admin-database';
import {
  DollarSignIcon,
  ShoppingBagIcon,
  UsersIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrendingUpIcon
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface DashboardStats {
  todayStats: any;
  totalOrders: number;
  pendingRequests: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const { restaurantId, adminData } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [orderRequests, setOrderRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardData = async () => {
    if (!restaurantId) return;

    try {
      const [dashboardStats, adminNotifications, pendingRequests] = await Promise.all([
        getDashboardStats(restaurantId),
        getAdminNotifications(restaurantId, 10),
        getOrderRequests(restaurantId, 'pending')
      ]);

      setStats(dashboardStats);
      setNotifications(adminNotifications);
      setOrderRequests(pendingRequests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [restaurantId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'table_request':
        router.push('/admin/requests');
        break;
      case 'new_order':
      case 'order_update':
        router.push('/admin/orders');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const todayRevenue = stats?.todayStats?.total_revenue || 0;
  const todayOrders = stats?.todayStats?.total_orders || 0;
  const todayCustomers = stats?.todayStats?.customer_count || 0;
  const avgOrderValue = stats?.todayStats?.avg_order_value || 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.restaurantName}>
            {adminData?.restaurant?.name || 'Restaurant Admin'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/admin/requests')}
        >
          <BellIcon size={24} color="#64748b" />
          {orderRequests.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {orderRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.revenueCard]}>
          <View style={styles.statCardHeader}>
            <DollarSignIcon size={24} color="#10b981" />
            <Text style={styles.statCardTitle}>Today's Revenue</Text>
          </View>
          <Text style={styles.statCardValue}>${todayRevenue.toFixed(2)}</Text>
          <View style={styles.statCardChange}>
            <TrendingUpIcon size={16} color="#10b981" />
            <Text style={styles.changeText}>+12% from yesterday</Text>
          </View>
        </View>

        <View style={[styles.statCard, styles.ordersCard]}>
          <View style={styles.statCardHeader}>
            <ShoppingBagIcon size={24} color="#3b82f6" />
            <Text style={styles.statCardTitle}>Orders Today</Text>
          </View>
          <Text style={styles.statCardValue}>{todayOrders}</Text>
          <View style={styles.statCardChange}>
            <TrendingUpIcon size={16} color="#3b82f6" />
            <Text style={styles.changeText}>+5% from yesterday</Text>
          </View>
        </View>

        <View style={[styles.statCard, styles.customersCard]}>
          <View style={styles.statCardHeader}>
            <UsersIcon size={24} color="#f59e0b" />
            <Text style={styles.statCardTitle}>Customers</Text>
          </View>
          <Text style={styles.statCardValue}>{todayCustomers}</Text>
          <View style={styles.statCardChange}>
            <TrendingUpIcon size={16} color="#f59e0b" />
            <Text style={styles.changeText}>+8% from yesterday</Text>
          </View>
        </View>

        <View style={[styles.statCard, styles.avgOrderCard]}>
          <View style={styles.statCardHeader}>
            <ClockIcon size={24} color="#8b5cf6" />
            <Text style={styles.statCardTitle}>Avg Order Value</Text>
          </View>
          <Text style={styles.statCardValue}>${avgOrderValue.toFixed(2)}</Text>
          <View style={styles.statCardChange}>
            <TrendingUpIcon size={16} color="#8b5cf6" />
            <Text style={styles.changeText}>+3% from yesterday</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/menu')}
          >
            <Text style={styles.quickActionTitle}>Manage Menu</Text>
            <Text style={styles.quickActionSubtitle}>Add or edit menu items</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/tables')}
          >
            <Text style={styles.quickActionTitle}>Configure Tables</Text>
            <Text style={styles.quickActionSubtitle}>Manage restaurant tables</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/orders')}
          >
            <Text style={styles.quickActionTitle}>View Orders</Text>
            <Text style={styles.quickActionSubtitle}>Track active orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/analytics')}
          >
            <Text style={styles.quickActionTitle}>View Analytics</Text>
            <Text style={styles.quickActionSubtitle}>Restaurant insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Requests */}
      {orderRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <TouchableOpacity onPress={() => router.push('/admin/requests')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {orderRequests.slice(0, 3).map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestCustomer}>{request.customer_name}</Text>
                <Text style={styles.requestType}>
                  {request.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                </Text>
              </View>
              
              <Text style={styles.requestDetails}>
                {request.order_type === 'dine_in' 
                  ? `Table for ${request.guest_count} guests`
                  : 'Takeaway order'
                }
              </Text>
              
              <Text style={styles.requestTime}>
                {new Date(request.created_at).toLocaleTimeString()}
              </Text>
              
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.approveButton}>
                  <CheckCircleIcon size={16} color="#10b981" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.rejectButton}>
                  <XCircleIcon size={16} color="#ef4444" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/admin/orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {stats?.recentOrders.slice(0, 5).map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Order #{order.id.slice(-8)}</Text>
              <View style={[styles.orderStatus, getStatusStyle(order.status)]}>
                <Text style={[styles.orderStatusText, getStatusTextStyle(order.status)]}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.orderDetails}>
              {order.order_type === 'dine_in' ? 'Dine In' : 
               order.order_type === 'takeaway' ? 'Takeaway' : 'Delivery'}
              {order.table?.table_number && ` • Table ${order.table.table_number}`}
            </Text>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
              <Text style={styles.orderTime}>
                {new Date(order.created_at).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {notifications.slice(0, 5).map((notification) => (
          <TouchableOpacity 
            key={notification.id}
            style={[styles.notificationCard, !notification.is_read && styles.unreadNotification]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(notification.created_at).toLocaleString()}
              </Text>
            </View>
            
            {!notification.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { backgroundColor: '#fef3c7' };
    case 'confirmed':
    case 'preparing':
      return { backgroundColor: '#dbeafe' };
    case 'ready':
      return { backgroundColor: '#d1fae5' };
    case 'delivered':
      return { backgroundColor: '#dcfce7' };
    case 'cancelled':
      return { backgroundColor: '#fee2e2' };
    default:
      return { backgroundColor: '#f3f4f6' };
  }
};

const getStatusTextStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { color: '#d97706' };
    case 'confirmed':
    case 'preparing':
      return { color: '#2563eb' };
    case 'ready':
      return { color: '#059669' };
    case 'delivered':
      return { color: '#16a34a' };
    case 'cancelled':
      return { color: '#dc2626' };
    default:
      return { color: '#6b7280' };
  }
};

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
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    flex: isWeb ? 1 : undefined,
    minWidth: isWeb ? 200 : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statCardChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  customersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  avgOrderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  
  // Quick Actions
  quickActionsContainer: {
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flex: isWeb ? 1 : undefined,
    minWidth: isWeb ? 200 : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  
  // Sections
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  
  // Request Cards
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  requestType: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requestDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  approveButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  rejectButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  
  // Order Cards
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
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  
  // Notification Cards
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
}); 