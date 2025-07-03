import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  Bell,
  Shield,
  Eye,
  Smartphone,
  Globe,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newRestaurants: false,
    emailMarketing: false,
    pushNotifications: true,
  });

  const [privacy, setPrivacy] = useState({
    locationTracking: true,
    dataSharing: false,
    analytics: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const styles = createStyles(colors, isDark);

  // Gradient colors based on theme
  const gradientColors = isDark 
    ? ['#1a1a1a', '#2d2d2d'] as const // Dark ash colors
    : [colors.primary, colors.primaryLight] as const; // Light theme

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color={colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Order Updates</Text>
              <Text style={styles.settingDescription}>
                Get notified about your order status
              </Text>
            </View>
            <Switch
              value={notifications.orderUpdates}
              onValueChange={() => toggleNotification('orderUpdates')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={notifications.orderUpdates ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Promotions & Offers</Text>
              <Text style={styles.settingDescription}>
                Receive special deals and discounts
              </Text>
            </View>
            <Switch
              value={notifications.promotions}
              onValueChange={() => toggleNotification('promotions')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={notifications.promotions ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>New Restaurants</Text>
              <Text style={styles.settingDescription}>
                Know when new restaurants join BravoNest
              </Text>
            </View>
            <Switch
              value={notifications.newRestaurants}
              onValueChange={() => toggleNotification('newRestaurants')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={notifications.newRestaurants ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Email Marketing</Text>
              <Text style={styles.settingDescription}>
                Receive marketing emails and newsletters
              </Text>
            </View>
            <Switch
              value={notifications.emailMarketing}
              onValueChange={() => toggleNotification('emailMarketing')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={notifications.emailMarketing ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Allow push notifications on this device
              </Text>
            </View>
            <Switch
              value={notifications.pushNotifications}
              onValueChange={() => toggleNotification('pushNotifications')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={notifications.pushNotifications ? colors.primaryLight : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color={colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Location Tracking</Text>
              <Text style={styles.settingDescription}>
                Allow location access for better delivery experience
              </Text>
            </View>
            <Switch
              value={privacy.locationTracking}
              onValueChange={() => togglePrivacy('locationTracking')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={privacy.locationTracking ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Data Sharing</Text>
              <Text style={styles.settingDescription}>
                Share anonymized data to improve our services
              </Text>
            </View>
            <Switch
              value={privacy.dataSharing}
              onValueChange={() => togglePrivacy('dataSharing')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={privacy.dataSharing ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Analytics</Text>
              <Text style={styles.settingDescription}>
                Help us improve the app with usage analytics
              </Text>
            </View>
            <Switch
              value={privacy.analytics}
              onValueChange={() => togglePrivacy('analytics')}
              trackColor={{ false: colors.accent, true: colors.primary }}
              thumbColor={privacy.analytics ? colors.primaryLight : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity style={styles.linkItem}>
            <Eye color={colors.primary} size={20} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Shield color={colors.primary} size={20} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone color={colors.primary} size={20} />
            <Text style={styles.sectionTitle}>App Preferences</Text>
          </View>

          <TouchableOpacity style={styles.linkItem}>
            <Globe color={colors.primary} size={20} />
            <View style={styles.linkInfo}>
              <Text style={styles.linkText}>Language</Text>
              <Text style={styles.linkSubtext}>English</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkIcon}>🌍</Text>
            <View style={styles.linkInfo}>
              <Text style={styles.linkText}>Region</Text>
              <Text style={styles.linkSubtext}>United States</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkIcon}>💰</Text>
            <View style={styles.linkInfo}>
              <Text style={styles.linkText}>Currency</Text>
              <Text style={styles.linkSubtext}>USD ($)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerItem}>
            <Text style={styles.dangerText}>Delete Account</Text>
            <Text style={styles.dangerSubtext}>
              Permanently delete your account and all data
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: 8,
    paddingVertical: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  linkIcon: {
    fontSize: 20,
    width: 20,
    textAlign: 'center',
  },
  linkInfo: {
    flex: 1,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  linkSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  dangerItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: isDark ? '#ff6b6b' : '#d32f2f',
    marginBottom: 4,
  },
  dangerSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
});