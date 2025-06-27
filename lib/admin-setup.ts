import { supabase } from './supabase';

/**
 * Admin Setup Utilities
 * Use these functions to create and manage restaurant admins
 */

// Create a restaurant admin account
export async function createRestaurantAdmin(
  userPhone: string,
  restaurantId: string,
  role: 'admin' | 'manager' | 'staff' = 'admin'
) {
  try {
    // First, find the user by phone (converted to email format)
    const userEmail = `${userPhone.replace(/\D/g, '')}@bravo.app`;
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      throw new Error(`User with phone ${userPhone} not found. Please ensure they have signed up first.`);
    }

    // Check if restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      throw new Error(`Restaurant with ID ${restaurantId} not found.`);
    }

    // Create restaurant admin record
    const { data: adminRecord, error: adminError } = await supabase
      .from('restaurant_admins')
      .insert({
        user_id: user.id,
        restaurant_id: restaurantId,
        role: role,
        is_active: true
      })
      .select()
      .single();

    if (adminError) {
      if (adminError.code === '23505') { // Unique constraint violation
        throw new Error(`User is already an admin for this restaurant.`);
      }
      throw adminError;
    }

    console.log('✅ Restaurant admin created successfully!');
    console.log(`📱 Phone: ${userPhone}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`👤 Role: ${role}`);
    
    return adminRecord;
  } catch (error) {
    console.error('❌ Error creating restaurant admin:', error);
    throw error;
  }
}

// List all restaurant admins
export async function listRestaurantAdmins(restaurantId?: string) {
  try {
    let adminQuery = supabase
      .from('restaurant_admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (restaurantId) {
      adminQuery = adminQuery.eq('restaurant_id', restaurantId);
    }

    const { data: adminData, error: adminError } = await adminQuery;

    if (adminError) throw adminError;

    // Get user and restaurant data for each admin
    const enrichedData = await Promise.all(
      adminData.map(async (admin) => {
        const [userResult, restaurantResult] = await Promise.all([
          supabase.from('users').select('id, full_name, phone, email').eq('id', admin.user_id).single(),
          supabase.from('restaurants').select('id, name').eq('id', admin.restaurant_id).single()
        ]);

        return {
          ...admin,
          user: userResult.data,
          restaurant: restaurantResult.data
        };
      })
    );

    console.log('📋 Restaurant Admins:');
    enrichedData.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.user?.full_name || 'Unknown'}`);
      console.log(`   📱 Phone: ${admin.user?.phone || 'N/A'}`);
      console.log(`   🏪 Restaurant: ${admin.restaurant?.name || 'N/A'}`);
      console.log(`   👤 Role: ${admin.role}`);
      console.log(`   ✅ Active: ${admin.is_active ? 'Yes' : 'No'}`);
    });

    return enrichedData;
  } catch (error) {
    console.error('❌ Error listing restaurant admins:', error);
    throw error;
  }
}

// Remove restaurant admin access
export async function removeRestaurantAdmin(userPhone: string, restaurantId: string) {
  try {
    const userEmail = `${userPhone.replace(/\D/g, '')}@bravo.app`;
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      throw new Error(`User with phone ${userPhone} not found.`);
    }

    const { error } = await supabase
      .from('restaurant_admins')
      .delete()
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId);

    if (error) throw error;

    console.log('✅ Restaurant admin access removed successfully!');
    console.log(`📱 Phone: ${userPhone}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error removing restaurant admin:', error);
    throw error;
  }
}

// Create a new restaurant (useful for testing)
export async function createTestRestaurant(
  name: string,
  description: string = 'Test restaurant for admin panel',
  cuisineType: string = 'International'
) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name,
        description,
        cuisine_type: cuisineType,
        address: '123 Test Street, Test City',
        phone: '+1234567890',
        is_open: true,
        total_tables: 10
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Test restaurant created successfully!');
    console.log(`🏪 Name: ${name}`);
    console.log(`🆔 ID: ${data.id}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error creating test restaurant:', error);
    throw error;
  }
}

// Quick setup function for development
export async function quickAdminSetup(
  userPhone: string,
  restaurantName: string = 'Test Restaurant'
) {
  try {
    console.log('🚀 Starting quick admin setup...');
    
    // Create test restaurant
    const restaurant = await createTestRestaurant(restaurantName);
    
    // Create admin account
    await createRestaurantAdmin(userPhone, restaurant.id, 'admin');
    
    console.log('\n✅ Quick admin setup completed!');
    console.log(`🔗 You can now access the admin panel at /admin`);
    console.log(`📱 Login with phone: ${userPhone}`);
    console.log(`🏪 Restaurant: ${restaurantName}`);
    
    return { restaurant, userPhone };
  } catch (error) {
    console.error('❌ Quick admin setup failed:', error);
    throw error;
  }
}

// Check if user is admin for any restaurant
export async function checkUserAdminStatus(userPhone: string) {
  try {
    const userEmail = `${userPhone.replace(/\D/g, '')}@bravo.app`;
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.log(`❌ User with phone ${userPhone} not found.`);
      return null;
    }

    const { data: adminRecords, error: adminError } = await supabase
      .from('restaurant_admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (adminError) throw adminError;

    if (adminRecords.length === 0) {
      console.log(`ℹ️ User ${userPhone} is not an admin for any restaurant.`);
      return null;
    }

    // Get restaurant data for each admin record
    const enrichedRecords = await Promise.all(
      adminRecords.map(async (record) => {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', record.restaurant_id)
          .single();

        return {
          ...record,
          restaurant: restaurantData
        };
      })
    );

    console.log(`✅ User ${userPhone} is admin for ${adminRecords.length} restaurant(s):`);
    enrichedRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.restaurant?.name || 'Unknown'} (${record.role})`);
    });

    return enrichedRecords;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    throw error;
  }
} 