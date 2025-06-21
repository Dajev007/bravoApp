#!/usr/bin/env node

/**
 * Admin Setup Script
 * 
 * This script helps you create restaurant admin accounts quickly.
 * 
 * Usage:
 * node scripts/setup-admin.js [phone-number] [restaurant-name]
 * 
 * Example:
 * node scripts/setup-admin.js +1234567890 "My Restaurant"
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to update these with your actual Supabase credentials
const SUPABASE_URL = 'http://localhost:54321'; // Local development URL
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // Local service key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createRestaurantAdmin(userPhone, restaurantId, role = 'admin') {
  try {
    // Convert phone to email format
    const userEmail = `${userPhone.replace(/\D/g, '')}@bravo.app`;
    
    // Find user
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
      if (adminError.code === '23505') {
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
    console.error('❌ Error creating restaurant admin:', error.message);
    throw error;
  }
}

async function createTestRestaurant(name, description = 'Test restaurant for admin panel') {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name,
        description,
        cuisine_type: 'International',
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
    console.error('❌ Error creating test restaurant:', error.message);
    throw error;
  }
}

async function quickSetup(userPhone, restaurantName = 'Test Restaurant') {
  try {
    console.log('🚀 Starting quick admin setup...');
    console.log(`📱 Phone: ${userPhone}`);
    console.log(`🏪 Restaurant: ${restaurantName}`);
    console.log('');
    
    // Create test restaurant
    const restaurant = await createTestRestaurant(restaurantName);
    console.log('');
    
    // Create admin account
    await createRestaurantAdmin(userPhone, restaurant.id, 'admin');
    
    console.log('');
    console.log('✅ Quick admin setup completed!');
    console.log('🔗 You can now access the admin panel at /admin');
    console.log(`📱 Login with phone: ${userPhone}`);
    console.log(`🏪 Restaurant: ${restaurantName}`);
    
    return { restaurant, userPhone };
  } catch (error) {
    console.error('❌ Quick admin setup failed:', error.message);
    process.exit(1);
  }
}

async function listExistingRestaurants() {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, cuisine_type')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data.length === 0) {
      console.log('ℹ️ No restaurants found.');
      return [];
    }

    console.log('🏪 Existing restaurants:');
    data.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} (ID: ${restaurant.id})`);
      console.log(`   Cuisine: ${restaurant.cuisine_type}`);
    });

    return data;
  } catch (error) {
    console.error('❌ Error listing restaurants:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Restaurant Admin Setup');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/setup-admin.js [phone] [restaurant-name]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/setup-admin.js +1234567890 "My Restaurant"');
    console.log('  node scripts/setup-admin.js +1234567890');
    console.log('');
    
    // Show existing restaurants
    await listExistingRestaurants();
    
    process.exit(0);
  }

  const userPhone = args[0];
  const restaurantName = args[1] || 'Test Restaurant';

  if (!userPhone) {
    console.error('❌ Please provide a phone number');
    process.exit(1);
  }

  await quickSetup(userPhone, restaurantName);
}

if (require.main === module) {
  main().catch(console.error);
} 