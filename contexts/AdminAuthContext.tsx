import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getRestaurantAdminByUserId } from '@/lib/admin-database';
import type { RestaurantAdmin } from '@/lib/admin-database';

interface AdminAuthContextType {
  adminData: RestaurantAdmin | null;
  isAdminLoading: boolean;
  isRestaurantAdmin: boolean;
  restaurantId: string | null;
  refreshAdminData: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [adminData, setAdminData] = useState<RestaurantAdmin | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  const fetchAdminData = async () => {
    if (!user) {
      setAdminData(null);
      setIsAdminLoading(false);
      return;
    }

    try {
      const admin = await getRestaurantAdminByUserId(user.id);
      setAdminData(admin);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAdminData(null);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchAdminData();
    }
  }, [user, authLoading]);

  const refreshAdminData = async () => {
    setIsAdminLoading(true);
    await fetchAdminData();
  };

  const value = {
    adminData,
    isAdminLoading: isAdminLoading || authLoading,
    isRestaurantAdmin: !!adminData,
    restaurantId: adminData?.restaurant_id || null,
    refreshAdminData,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 