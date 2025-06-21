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
import { ArrowLeft, Bell, Shield, Eye, Globe, Smartphone } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newRestaurants: true,
    emailMarketing: false,
    pushNotifications: true,
  });

  const [privacy, setPrivacy] = useState({
    locationTracking: true,
    dataSharing: false,
    analytics: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#0077b6" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color="#0077b6" size={20} />
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={notifications.orderUpdates ? '#48cae4' : '#FFFFFF'}
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={notifications.promotions ? '#48cae4' : '#FFFFFF'}
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={notifications.newRestaurants ? '#48cae4' : '#FFFFFF'}
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={notifications.emailMarketing ? '#48cae4' : '#FFFFFF'}
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={notifications.pushNotifications ? '#48cae4' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color="#0077b6" size={20} />
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={privacy.locationTracking ? '#48cae4' : '#FFFFFF'}
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={privacy.dataSharing ? '#48cae4' : '#FFFFFF'}
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
              trackColor={{ false: '#90e0ef', true: '#0077b6' }}
              thumbColor={privacy.analytics ? '#48cae4' : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity style={styles.linkItem}>
            <Eye color="#0077b6" size={20} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Shield color="#0077b6" size={20} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone color="#0077b6" size={20} />
            <Text style={styles.sectionTitle}>App Preferences</Text>
          </View>

          <TouchableOpacity style={styles.linkItem}>
            <Globe color="#0077b6" size={20} />
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 20,
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
    color: '#03045e',
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
    color: '#03045e',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
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
    color: '#03045e',
  },
  linkSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginTop: 2,
  },
  dangerItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#023e8a',
    marginBottom: 4,
  },
  dangerSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
});