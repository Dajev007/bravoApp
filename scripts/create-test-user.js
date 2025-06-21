#!/usr/bin/env node

/**
 * Test User Creation Script
 * 
 * This script helps create test user accounts for admin testing.
 * Note: In production, users should always sign up through the proper app flow.
 */

const { createClient } = require('@supabase/supabase-js');

// Local Supabase configuration
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestUser(phone, password, fullName = 'Test User') {
  try {
    console.log('🚀 Creating test user...');
    console.log(`📱 Phone: ${phone}`);
    console.log(`👤 Name: ${fullName}`);
    
    // Convert phone to email format (matching your app's auth system)
    const email = `${phone.replace(/\D/g, '')}@bravo.app`;
    
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      phone: phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone,
        onboarding_complete: true
      }
    });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    console.log('✅ Auth user created successfully!');
    console.log(`🆔 User ID: ${authUser.user.id}`);

    // Create user profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        phone: phone,
        full_name: fullName,
        onboarding_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.warn('⚠️ Profile creation warning:', profileError.message);
      // Continue anyway, auth user was created successfully
    } else {
      console.log('✅ User profile created successfully!');
    }

    console.log('');
    console.log('✅ Test user creation completed!');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`📧 Email: ${email}`);
    console.log('');
    console.log('🔗 You can now:');
    console.log('1. Login to the app with these credentials');
    console.log('2. Run the admin setup script to grant admin privileges');
    
    return { authUser, userProfile, email };
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    throw error;
  }
}

async function createAdminUser(phone, password, restaurantName = 'Test Restaurant', fullName = 'Admin User') {
  try {
    console.log('🔥 Creating complete admin setup...');
    
    // Step 1: Create test user
    const user = await createTestUser(phone, password, fullName);
    
    console.log('⏳ Waiting 2 seconds for user creation to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Create restaurant
    console.log('🏪 Creating restaurant...');
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantName,
        description: 'Admin test restaurant',
        cuisine_type: 'International',
        address: '123 Admin Street, Test City',
        phone: phone,
        is_open: true,
        total_tables: 10
      })
      .select()
      .single();

    if (restaurantError) {
      throw new Error(`Restaurant creation failed: ${restaurantError.message}`);
    }

    console.log('✅ Restaurant created successfully!');
    console.log(`🏪 Name: ${restaurant.name}`);
    console.log(`🆔 ID: ${restaurant.id}`);

    // Step 3: Create admin record
    console.log('👑 Granting admin privileges...');
    const { data: adminRecord, error: adminError } = await supabase
      .from('restaurant_admins')
      .insert({
        user_id: user.authUser.user.id,
        restaurant_id: restaurant.id,
        role: 'admin',
        is_active: true
      })
      .select()
      .single();

    if (adminError) {
      throw new Error(`Admin creation failed: ${adminError.message}`);
    }

    console.log('✅ Admin privileges granted successfully!');
    console.log('');
    console.log('🎉 COMPLETE ADMIN SETUP FINISHED!');
    console.log('================================');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🏪 Restaurant: ${restaurantName}`);
    console.log(`👑 Role: admin`);
    console.log('');
    console.log('🔗 Login Instructions:');
    console.log('1. Go to /signin in your app');
    console.log(`2. Enter phone: ${phone}`);
    console.log(`3. Enter password: ${password}`);
    console.log('4. Navigate to /admin');
    console.log('5. You now have full admin access!');

    return { user, restaurant, adminRecord };
  } catch (error) {
    console.error('❌ Complete admin setup failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Test User Creation Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/create-test-user.js [phone] [password] [name] [restaurant]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/create-test-user.js 0771234567 1234567');
    console.log('  node scripts/create-test-user.js 0771234567 1234567 "John Admin" "John\'s Restaurant"');
    console.log('');
    console.log('⚠️  Note: This is for testing only. In production, users should sign up through the app.');
    process.exit(0);
  }

  const phone = args[0];
  const password = args[1] || '1234567';
  const fullName = args[2] || 'Test Admin';
  const restaurantName = args[3] || 'Test Restaurant';

  if (!phone || !password) {
    console.error('❌ Please provide phone and password');
    process.exit(1);
  }

  await createAdminUser(phone, password, restaurantName, fullName);
}

if (require.main === module) {
  main().catch(console.error);
} 