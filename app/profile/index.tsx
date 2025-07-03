import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { User, Settings, CreditCard, MapPin, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Clock, Moon, CreditCard as Edit, Shield, Gift } from 'lucide-react-native';
import { getUserProfile, getUserOrders, type UserProfile } from '@/lib/database';

const menuItems = [
  {
    id: '1',
    title: 'Edit Profile',
    icon: Edit,
    route: '/profile/edit',
    description: 'Update your personal information',
  },
  {
    id: '2',
    title: 'Payment Methods',
    icon: CreditCard,
    route: '/profile/payment',
    description: 'Manage cards and payment options',
  },

  {
    id: '4',
    title: 'Notifications',
    icon: Bell,
    route: '/profile/settings',
    description: 'Control your notification preferences',
  },
  {
    id: '5',
    title: 'Privacy & Security',
    icon: Shield,
    route: '/profile/settings',
    description: 'Account security and privacy settings',
  },
  {
    id: '6',
    title: 'Promotions & Offers',
    icon: Gift,
    route: '/profile/settings',
    description: 'Manage promotional notifications',
  },
  {
    id: '7',
    title: 'Help & Support',
    icon: HelpCircle,
    route: '/profile/help',
    description: 'Get help and contact support',
  },
];

const recentOrders = [
  {
    id: '1',
    restaurant: 'Bella Vista',
    items: 'Margherita Pizza, Caesar Salad',
    total: 28.50,
    date: '2 days ago',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    restaurant: 'Sakura Sushi',
    items: 'Salmon Roll, Miso Soup',
    total: 24.99,
    date: '1 week ago',
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderStats, setOrderStats] = useState({ count: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profileData, orders] = await Promise.all([
        getUserProfile(),
        getUserOrders(),
      ]);
      
      setProfile(profileData);
      
      // Calculate order statistics
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      setOrderStats({
        count: orders.length,
        totalSpent,
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/signin');
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(profile?.name || user?.user_metadata?.name)}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Edit color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {profile?.name || user?.user_metadata?.name || 'Guest User'}
            </Text>
            <Text style={styles.userPhone}>
              {profile?.phone || user?.user_metadata?.phone || '(555) 123-4567'}
            </Text>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{orderStats.count}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${orderStats.totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/orders')}
        >
          <Clock color="#0077b6" size={24} />
          <Text style={styles.quickActionText}>Order History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/favorites')}
        >
          <Star color="#0077b6" size={24} />
          <Text style={styles.quickActionText}>Favorites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/profile/addresses')}
        >
          <MapPin color="#0077b6" size={24} />
          <Text style={styles.quickActionText}>Addresses</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/orders')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <Image source={{ uri: order.image }} style={styles.orderImage} />
            <View style={styles.orderInfo}>
              <Text style={styles.restaurantName}>{order.restaurant}</Text>
              <Text style={styles.orderItems}>{order.items}</Text>
              <View style={styles.orderMeta}>
                <Text style={styles.orderTotal}>${order.total}</Text>
                <View style={styles.orderDate}>
                  <Clock color="#0077b6" size={14} />
                  <Text style={styles.orderDateText}>{order.date}</Text>
                </View>
              </View>
            </View>
            <ChevronRight color="#90e0ef" size={20} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {/* Dark Mode Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Moon color="#0077b6" size={20} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Switch to dark theme</Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#90e0ef', true: '#0077b6' }}
            thumbColor={isDark ? '#48cae4' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem} 
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <item.icon color="#0077b6" size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
            </View>
            <ChevronRight color="#90e0ef" size={20} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color="#023e8a" size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.appVersion}>BravoNest v1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for food lovers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#90e0ef',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0077b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0077b6',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 8,
  },
  editProfileButton: {
    backgroundColor: '#ade8f4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ade8f4',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#90e0ef',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#90e0ef',
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
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
    color: '#03045e',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  orderDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ade8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ade8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
  },
  menuItemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#023e8a',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#90e0ef',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#90e0ef',
  },
});