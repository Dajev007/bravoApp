import { supabase } from './supabase';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image_url: string;
  rating: number;
  review_count: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: number;
  minimum_order: number;
  is_open: boolean;
  is_featured: boolean;
  address: string;
  phone: string;
  qr_code_url?: string;
  total_tables: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_popular: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  calories?: number;
  prep_time_minutes: number;
  restaurant?: Restaurant;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'completed' | 'cancelled';
  subtotal: number;
  service_fee: number;
  tax: number;
  tip: number;
  total: number;
  payment_method: string;
  special_instructions?: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  created_at: string;
  order_type: 'takeaway' | 'dine_in';
  table_id?: string;
  restaurant?: Restaurant;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item?: MenuItem;
}

export interface Review {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  comment?: string;
  food_rating?: number;
  delivery_rating?: number;
  service_rating?: number;
  created_at: string;
  user_profiles?: {
    name: string;
  };
}

export interface UserProfile {
  id: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  dietary_preferences?: string[];
  favorite_cuisines?: string[];
}



export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  qr_code_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Restaurant functions
export async function getRestaurants(options?: {
  featured?: boolean;
  cuisine?: string;
  search?: string;
}) {
  let query = supabase
    .from('restaurants')
    .select('*')
    .eq('is_open', true)
    .order('rating', { ascending: false });

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.cuisine && options.cuisine !== 'All') {
    query = query.eq('cuisine_type', options.cuisine);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,cuisine_type.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Restaurant[];
}

export async function getRestaurantById(id: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Restaurant;
}

// Table functions
export async function getRestaurantTables(restaurantId: string) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('table_number');

  if (error) throw error;
  return data as RestaurantTable[];
}

export async function getTableByNumber(restaurantId: string, tableNumber: number) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select(`
      *,
      restaurants!restaurant_id(*)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('table_number', tableNumber)
    .single();

  if (error) throw error;
  
  // Transform the data to match the expected interface
  const transformedData = {
    ...data,
    restaurant: data.restaurants
  };
  delete transformedData.restaurants;
  
  return transformedData as RestaurantTable & { restaurant: Restaurant };
}

export async function getTableById(tableId: string) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select(`
      *,
      restaurants!restaurant_id(*)
    `)
    .eq('id', tableId)
    .single();

  if (error) throw error;
  
  // Transform the data to match the expected interface
  const transformedData = {
    ...data,
    restaurant: data.restaurants
  };
  delete transformedData.restaurants;
  
  return transformedData as RestaurantTable & { restaurant: Restaurant };
}

export async function markTableAsOccupied(tableId: string) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', tableId)
    .select()
    .single();

  if (error) throw error;
  return data as RestaurantTable;
}

export async function markTableAsAvailable(tableId: string) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({ 
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', tableId)
    .select()
    .single();

  if (error) throw error;
  return data as RestaurantTable;
}

// Menu functions
export async function getMenuItems(restaurantId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('is_popular', { ascending: false });

  if (error) throw error;
  return data as MenuItem[];
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Category[];
}

// Order functions
export async function createOrder(orderData: {
  restaurant_id: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }>;
  subtotal: number;
  service_fee: number;
  tax: number;
  tip: number;
  total: number;
  special_instructions?: string;
  order_type: 'takeaway' | 'dine_in';
  table_id?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // If it's a dine-in order with a table, mark the table as occupied
  if (orderData.order_type === 'dine_in' && orderData.table_id) {
    await markTableAsOccupied(orderData.table_id);
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      restaurant_id: orderData.restaurant_id,
      subtotal: orderData.subtotal,
      service_fee: orderData.service_fee,
      tax: orderData.tax,
      tip: orderData.tip,
      total: orderData.total,
      special_instructions: orderData.special_instructions,
      estimated_ready_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      order_type: orderData.order_type,
      table_id: orderData.table_id,
    })
    .select()
    .single();

  if (orderError) {
    // If order creation fails and we marked a table as occupied, revert it
    if (orderData.order_type === 'dine_in' && orderData.table_id) {
      await markTableAsAvailable(orderData.table_id);
    }
    throw orderError;
  }

  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity,
    special_instructions: item.special_instructions,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // If order items creation fails, clean up the order and table status
    await supabase.from('orders').delete().eq('id', order.id);
    if (orderData.order_type === 'dine_in' && orderData.table_id) {
      await markTableAsAvailable(orderData.table_id);
    }
    throw itemsError;
  }

  return order as Order;
}

export async function getUserOrders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      restaurants!restaurant_id(*),
      order_items:order_items(
        *,
        menu_item:menu_items(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform the data to match the expected interface
  const transformedData = data.map(order => ({
    ...order,
    restaurant: order.restaurants
  }));
  
  return transformedData as Order[];
}

export async function completeOrder(orderId: string) {
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('table_id, order_type')
    .eq('id', orderId)
    .single();

  if (fetchError) throw fetchError;

  // Update order status
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'completed',
      actual_ready_time: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;

  // If it was a dine-in order with a table, mark the table as available again
  if (order.order_type === 'dine_in' && order.table_id) {
    await markTableAsAvailable(order.table_id);
  }

  return data as Order;
}

// Review functions
export async function getRestaurantReviews(restaurantId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user_profiles(name)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Review[];
}

export async function createReview(reviewData: {
  restaurant_id: string;
  rating: number;
  comment?: string;
  food_rating?: number;
  delivery_rating?: number;
  service_rating?: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      ...reviewData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// User profile functions
export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserProfile | null;
}

export async function updateUserProfile(profileData: Partial<UserProfile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// Favorites functions
export async function getUserFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      restaurants!restaurant_id(*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  
  // Transform the data to match the expected interface
  const transformedData = data.map(favorite => ({
    ...favorite,
    restaurant: favorite.restaurants
  }));
  
  return transformedData;
}

export async function toggleFavorite(restaurantId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('restaurant_id', restaurantId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    
    if (error) throw error;
    return false;
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        restaurant_id: restaurantId,
      });
    
    if (error) throw error;
    return true;
  }
}

