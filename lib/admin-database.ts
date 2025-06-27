import { supabase } from './supabase';

export interface RestaurantAdmin {
  id: string;
  user_id: string;
  restaurant_id: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: {
    id: string;
    name: string;
    description: string;
    cuisine_type: string;
    image_url: string;
    address: string;
    phone: string;
    is_open: boolean;
    total_tables: number;
  };
}

export interface AdminNotification {
  id: string;
  restaurant_id: string;
  type: 'new_order' | 'order_update' | 'table_request' | 'review' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data: any;
  created_at: string;
}

export interface OrderRequest {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone?: string;
  order_type: 'dine_in' | 'takeaway';
  table_id?: string;
  requested_time: string;
  guest_count: number;
  special_requests?: string;
  status: 'pending' | 'approved' | 'rejected' | 'seated' | 'completed';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  table?: {
    table_number: number;
  };
}

export interface RestaurantAnalytics {
  id: string;
  restaurant_id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  dine_in_orders: number;
  takeaway_orders: number;
  delivery_orders: number;
  avg_order_value: number;
  peak_hour: number;
  customer_count: number;
  created_at: string;
}

// Admin authentication functions
export async function getRestaurantAdminByUserId(userId: string) {
  // First get the admin record
  const { data: adminData, error: adminError } = await supabase
    .from('restaurant_admins')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (adminError) {
    if (adminError.code === 'PGRST116') {
      return null; // No admin record found
    }
    throw adminError;
  }

  // Then get the restaurant data separately
  const { data: restaurantData, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', adminData.restaurant_id)
    .single();

  if (restaurantError) {
    throw restaurantError;
  }

  // Combine the data
  const result = {
    ...adminData,
    restaurant: restaurantData
  };

  return result as RestaurantAdmin;
}

export async function isRestaurantAdmin(userId: string, restaurantId: string) {
  const { data, error } = await supabase
    .from('restaurant_admins')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return false;
    }
    throw error;
  }
  return !!data;
}

// Restaurant management functions
export async function updateRestaurantDetails(restaurantId: string, updates: {
  name?: string;
  description?: string;
  cuisine_type?: string;
  address?: string;
  phone?: string;
  is_open?: boolean;
  total_tables?: number;
}) {
  const { data, error } = await supabase
    .from('restaurants')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Menu management functions
export async function getRestaurantMenuItems(restaurantId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('restaurant_id', restaurantId)
    .order('name');

  if (error) throw error;
  return data;
}

export async function createMenuItem(restaurantId: string, item: {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available?: boolean;
  is_popular?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  calories?: number;
  prep_time_minutes?: number;
}) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: restaurantId,
      ...item
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(itemId: string, updates: any) {
  const { data, error } = await supabase
    .from('menu_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(itemId: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// Table management functions
export async function getRestaurantTablesAdmin(restaurantId: string) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('table_number');

  if (error) throw error;
  return data;
}

export async function createRestaurantTable(restaurantId: string, tableNumber: number) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert({
      restaurant_id: restaurantId,
      table_number: tableNumber,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRestaurantTable(tableId: string, updates: {
  table_number?: number;
  is_active?: boolean;
  qr_code_url?: string;
}) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', tableId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRestaurantTable(tableId: string) {
  const { error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', tableId);

  if (error) throw error;
}

// Notification functions
export async function getAdminNotifications(restaurantId: string, limit = 50) {
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AdminNotification[];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function getUnreadNotificationCount(restaurantId: string) {
  const { count, error } = await supabase
    .from('admin_notifications')
    .select('id', { count: 'exact' })
    .eq('restaurant_id', restaurantId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

// Order request functions
export async function getOrderRequests(restaurantId: string, status?: string) {
  let query = supabase
    .from('order_requests')
    .select(`
      *,
      table:restaurant_tables(table_number)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as OrderRequest[];
}

export async function approveOrderRequest(requestId: string, approvedBy: string) {
  const { data, error } = await supabase
    .from('order_requests')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectOrderRequest(requestId: string, rejectionReason: string) {
  const { data, error } = await supabase
    .from('order_requests')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeOrderRequest(requestId: string) {
  const { data, error } = await supabase
    .from('order_requests')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Analytics functions
export async function getRestaurantAnalytics(restaurantId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('restaurant_analytics')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;
  return data as RestaurantAnalytics[];
}

export async function getDashboardStats(restaurantId: string) {
  // Get today's stats
  const today = new Date().toISOString().split('T')[0];
  
  const [todayStats, totalOrders, pendingRequests, recentOrders] = await Promise.all([
    supabase
      .from('restaurant_analytics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('date', today)
      .single(),
    
    supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('restaurant_id', restaurantId),
    
    supabase
      .from('order_requests')
      .select('id', { count: 'exact' })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending'),
    
    supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  return {
    todayStats: todayStats.data,
    totalOrders: totalOrders.count || 0,
    pendingRequests: pendingRequests.count || 0,
    recentOrders: recentOrders.data || []
  };
}

// Order management functions
export async function getRestaurantOrders(restaurantId: string, status?: string, limit = 50) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        menu_item:menu_items(name, price)
      ),
      table:restaurant_tables(table_number)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
} 