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
import { User, Settings, CreditCard, MapPin, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Clock, Moon, CreditCard as Edit, Shield, Gift, Package } from 'lucide-react-native';
import { getUserProfile, getUserOrders, type UserProfile } from '@/lib/database';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function ProfileTabScreen() {
  const { user, signOut } = useAuth();
  const { theme, setTheme, isDark, colors } = useTheme();
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

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.primary, colors.primaryDark] : [colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImage}>
            <User color="#ffffff" size={32} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.name || 'Food Lover'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'Welcome to BravoNest'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
                         <View style={styles.statIconContainer}>
               <Package color={colors.primary} size={24} />
             </View>
            <Text style={styles.statValue}>{orderStats.count}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Star color={colors.primary} size={24} fill={colors.primary} />
            </View>
            <Text style={styles.statValue}>${orderStats.totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock color={colors.primary} size={24} />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/orders')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <Image source={{ uri: order.image }} style={styles.orderImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderRestaurant}>{order.restaurant}</Text>
                <Text style={styles.orderItems}>{order.items}</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
              </View>
              <ChevronRight color={colors.textTertiary} size={20} />
            </View>
          ))}
        </View>

        {/* Dark Mode Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Moon color={colors.primary} size={20} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Switch to dark theme</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={isDark ? colors.surface : '#FFFFFF'}
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
                  <item.icon color={colors.primary} size={20} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
              </View>
              <ChevronRight color={colors.textTertiary} size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut color={colors.error} size={20} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>BravoNest</Text>
          <Text style={styles.appInfoText}>
            Version 1.0.0{'\n'}
            Making food delivery simple and delightful.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderRestaurant: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textTertiary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});