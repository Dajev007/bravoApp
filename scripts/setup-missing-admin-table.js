const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAdminTable() {
  console.log('🚀 Creating restaurant_admins table...');
  
  // Create the table using SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create restaurant_admins table
      CREATE TABLE IF NOT EXISTS restaurant_admins (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
        role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id, restaurant_id)
      );

      -- Enable Row Level Security
      ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Restaurant admins can view their restaurant data" ON restaurant_admins
        FOR SELECT TO authenticated
        USING (
          auth.uid() = user_id OR 
          EXISTS (
            SELECT 1 FROM restaurant_admins ra 
            WHERE ra.restaurant_id = restaurant_admins.restaurant_id 
            AND ra.user_id = auth.uid() 
            AND ra.is_active = true
          )
        );

      CREATE POLICY "Only authenticated users can manage admin records" ON restaurant_admins
        FOR ALL TO authenticated
        USING (auth.uid() = user_id);
    `
  });

  if (error) {
    console.log('❌ Error creating table with RPC:', error);
    console.log('Trying alternative approach...');
    
    // Try using raw SQL endpoint (if available)
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS restaurant_admins (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
            role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(user_id, restaurant_id)
          );
        `
      })
    });

    if (response.ok) {
      console.log('✅ Table created successfully via REST API');
    } else {
      console.log('❌ Failed to create table via REST API');
      console.log('Response:', await response.text());
      return false;
    }
  } else {
    console.log('✅ Table created successfully via RPC');
  }

  return true;
}

async function setupAdminUser(userPhone, restaurantId = null) {
  console.log('👤 Setting up admin user...');
  
  // Convert phone to email format  
  const userEmail = `${userPhone.replace(/\D/g, '')}@bravonest.com`;
  console.log('📧 Looking for user:', userEmail);
  
  // Find user by email
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', userEmail);

  if (userError || !users || users.length === 0) {
    console.log('❌ User not found:', userError?.message || 'No users found');
    return false;
  }

  const user = users[0];
  console.log('✅ Found user:', user.email);

  // Get available restaurants
  const { data: restaurants, error: restError } = await supabase
    .from('restaurants')
    .select('id, name');

  if (restError || !restaurants || restaurants.length === 0) {
    console.log('❌ No restaurants found:', restError?.message);
    return false;
  }

  console.log('🏪 Available restaurants:');
  restaurants.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} (${r.id})`);
  });

  // Use provided restaurant ID or first available restaurant
  const targetRestaurant = restaurantId 
    ? restaurants.find(r => r.id === restaurantId)
    : restaurants[0];

  if (!targetRestaurant) {
    console.log('❌ Target restaurant not found');
    return false;
  }

  console.log(`🎯 Using restaurant: ${targetRestaurant.name}`);

  // Create admin record
  const { data: adminRecord, error: adminError } = await supabase
    .from('restaurant_admins')
    .insert({
      user_id: user.id,
      restaurant_id: targetRestaurant.id,
      role: 'admin',
      is_active: true
    })
    .select()
    .single();

  if (adminError) {
    if (adminError.code === '23505') {
      console.log('ℹ️ User is already an admin for this restaurant');
      return true;
    }
    console.log('❌ Error creating admin record:', adminError);
    return false;
  }

  console.log('✅ Admin record created successfully!');
  console.log(`📱 Phone: ${userPhone}`);
  console.log(`👤 Email: ${userEmail}`);  
  console.log(`🏪 Restaurant: ${targetRestaurant.name}`);
  console.log(`🔑 Role: admin`);
  
  return true;
}

async function main() {
  try {
    console.log('🏗️ Setting up restaurant admin system...\n');
    
    // Step 1: Create the table
    const tableCreated = await createAdminTable();
    if (!tableCreated) {
      console.log('❌ Failed to create admin table');
      return;
    }

    console.log('');

    // Step 2: Setup admin user  
    const userPhone = '0774986724'; // The phone number from the logs
    const success = await setupAdminUser(userPhone);
    
    if (success) {
      console.log('\n🎉 Setup completed successfully!');
      console.log('You can now access the admin features in your app.');
    } else {
      console.log('\n❌ Setup failed. Please check the errors above.');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

main(); 