import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack, Tabs, useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  HomeIcon, 
  ChefHatIcon, 
  TableIcon, 
  BellIcon,
  ClipboardListIcon,
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  StoreIcon
} from 'lucide-react-native';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: HomeIcon },
  { name: 'Restaurant', path: '/admin/restaurant', icon: StoreIcon },
  { name: 'Menu', path: '/admin/menu', icon: ChefHatIcon },
  { name: 'Tables', path: '/admin/tables', icon: TableIcon },
  { name: 'Orders', path: '/admin/orders', icon: ClipboardListIcon },
  { name: 'Requests', path: '/admin/requests', icon: BellIcon },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3Icon },
  { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const { isRestaurantAdmin, isAdminLoading, adminData } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isAdminLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  if (!isRestaurantAdmin) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedText}>
          You don't have permission to access the restaurant admin panel.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backButtonText}>Go Back to App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Desktop Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Restaurant Admin</Text>
          <Text style={styles.restaurantName}>
            {adminData?.restaurant?.name || 'My Restaurant'}
          </Text>
        </View>
        
        <ScrollView style={styles.sidebarContent}>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = item.icon;
            
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                onPress={() => router.push(item.path as any)}
              >
                <IconComponent 
                  size={20} 
                  color={isActive ? '#ffffff' : '#64748b'} 
                />
                <Text style={[
                  styles.sidebarItemText,
                  isActive && styles.sidebarItemTextActive
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        <View style={styles.sidebarFooter}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <LogOutIcon size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="restaurant" />
          <Stack.Screen name="menu" />
          <Stack.Screen name="tables" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="requests" />
          <Stack.Screen name="analytics" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  
  // Access Denied
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Sidebar
  sidebar: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#64748b',
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#3b82f6',
  },
  sidebarItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: '#ffffff',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
}); 