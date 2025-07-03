import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator
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
  TrendingUpIcon,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  Calendar,
  ChevronRight,
  BarChart3,
  AlertCircle,
  Settings,
  LogOut,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface DashboardStats {
  todayStats: any;
  totalOrders: number;
  pendingRequests: number;
  recentOrders: any[];
  totalRevenue: number;
  newCustomers: number;
  averageRating: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const { restaurantId, adminData } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [orderRequests, setOrderRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors, isDark } = useTheme();

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
      Alert.alert('Error', 'Failed to load dashboard data');
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

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const todayRevenue = stats?.todayStats?.total_revenue || 0;
  const todayOrders = stats?.todayStats?.total_orders || 0;
  const todayCustomers = stats?.todayStats?.customer_count || 0;
  const avgOrderValue = stats?.todayStats?.avg_order_value || 0;

  // Gradient colors based on theme
  const gradientColors = isDark 
    ? ['#1a1a1a', '#2d2d2d'] as const // Dark ash colors
    : [colors.primary, colors.primaryLight] as const; // Light theme

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.adminName}>{adminData?.restaurant?.name || 'Admin'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/admin/requests')}>
              <BellIcon size={24} color="#ffffff" />
              {orderRequests.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {orderRequests.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/admin/settings')}>
              <Settings color="#ffffff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <LogOut color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.todayStatsGrid}>
            <View style={styles.todayStatCard}>
              <View style={styles.statIcon}>
                <ShoppingBagIcon size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{todayOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.todayStatCard}>
              <View style={styles.statIcon}>
                <DollarSignIcon size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>${todayRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <ShoppingBagIcon size={20} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>{stats?.totalOrders || 0}</Text>
              <Text style={styles.metricLabel}>Total Orders</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <DollarSignIcon size={20} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>${(stats?.totalRevenue || 0).toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <UsersIcon size={20} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>{todayCustomers}</Text>
              <Text style={styles.metricLabel}>New Customers</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Star size={20} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>{stats?.averageRating || 0}</Text>
              <Text style={styles.metricLabel}>Average Rating</Text>
            </View>
          </View>
        </View>

        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.orderStatusGrid}>
            <View style={[styles.orderStatusCard, { borderLeftColor: '#ff6b6b' }]}>
              <View style={styles.orderStatusHeader}>
                <AlertCircle size={20} color="#ff6b6b" />
                <Text style={styles.orderStatusValue}>{stats?.pendingRequests || 0}</Text>
              </View>
              <Text style={styles.orderStatusLabel}>Pending Orders</Text>
            </View>
            <View style={[styles.orderStatusCard, { borderLeftColor: colors.primary }]}>
              <View style={styles.orderStatusHeader}>
                <Clock size={20} color={colors.primary} />
                <Text style={styles.orderStatusValue}>{stats?.recentOrders.length || 0}</Text>
              </View>
              <Text style={styles.orderStatusLabel}>Completed Today</Text>
            </View>
          </View>
        </View>

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

        {/* Quick Actions */}
        <View style={styles.section}>
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
              onPress={() => router.push('/admin/orders')}
            >
              <Text style={styles.quickActionTitle}>View Analytics</Text>
              <Text style={styles.quickActionSubtitle}>Restaurant insights</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: '#f0f8ff',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e3a8a',
    marginTop: 12,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    flex: 1,
  },
  
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    opacity: 0.9,
  },
  
  adminName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
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
  
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  
  viewAllText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  
  todayStatsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  
  todayStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  statValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  metricCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  metricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  
  orderStatusGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  
  orderStatusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    borderLeftWidth: 4,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  
  orderStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  orderStatusValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginLeft: 12,
  },
  
  orderStatusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  orderNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
  },
  
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  orderStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  
  orderDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    marginBottom: 8,
  },
  
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  orderTotal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
  },
  
  orderTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  
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
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    marginBottom: 4,
  },
  
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b8dba',
  },
  
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  quickActionButton: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e3a8a',
    marginTop: 12,
    textAlign: 'center',
  },
  
  quickActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    textAlign: 'center',
  },
}); 