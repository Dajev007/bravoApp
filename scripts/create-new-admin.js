const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function createNewAdmin() {
  const phoneNumber = '0771525093';
  const password = '0771525093';
  const email = `${phoneNumber}@bravonest.com`;
  
  console.log('🚀 CREATING NEW ADMIN USER');
  console.log('==========================');
  console.log(`📱 Phone: ${phoneNumber}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('');

  try {
    // Step 1: Register the new user
    console.log('Step 1: Registering new user...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          phone: phoneNumber,
          full_name: `Admin User ${phoneNumber}`
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User already exists, proceeding to admin setup...');
      } else {
        console.error('❌ Error creating user:', signUpError.message);
        return false;
      }
    } else {
      console.log('✅ User created successfully!');
      console.log(`👤 User ID: ${signUpData.user?.id}`);
    }

    // Step 2: Get available restaurants
    console.log('\nStep 2: Getting available restaurants...');
    
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, cuisine_type')
      .limit(5);

    if (restaurantError) {
      console.error('❌ Error fetching restaurants:', restaurantError.message);
      return false;
    }

    console.log('🏪 Available restaurants:');
    restaurants.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.cuisine_type})`);
      console.log(`     ID: ${r.id}`);
    });

    // Use Green Leaf restaurant (or first available)
    const targetRestaurant = restaurants.find(r => r.name === 'Green Leaf') || restaurants[0];
    
    if (!targetRestaurant) {
      console.error('❌ No restaurants found');
      return false;
    }

    console.log(`\n🎯 Selected restaurant: ${targetRestaurant.name}`);

    // Step 3: Create admin record via SQL (since we need to join with auth.users)
    console.log('\nStep 3: Creating admin record...');
    
    // We need to create SQL that will be executed manually
    const adminSQL = `
-- Create admin record for user ${email}
INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
SELECT 
    au.id as user_id,
    '${targetRestaurant.id}'::uuid as restaurant_id,
    'admin' as role,
    true as is_active
FROM auth.users au
WHERE au.email = '${email}'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Verify the admin was created
SELECT 
    'SUCCESS: Admin access granted!' as status,
    au.email,
    r.name as restaurant_name,
    ra.role,
    ra.created_at
FROM restaurant_admins ra
JOIN auth.users au ON au.id = ra.user_id  
JOIN restaurants r ON r.id = ra.restaurant_id
WHERE au.email = '${email}';
    `;

    console.log('✅ User registration completed!');
    console.log('\n📋 MANUAL STEP REQUIRED:');
    console.log('=======================');
    console.log('To complete the admin setup, run this SQL in your Supabase Dashboard:');
    console.log('');
    console.log(adminSQL);
    console.log('');
    console.log('OR copy and run the SQL file: NEW_ADMIN_SETUP.sql');

    // Save the SQL to a file
    require('fs').writeFileSync('NEW_ADMIN_SETUP.sql', adminSQL);
    console.log('✅ SQL saved to NEW_ADMIN_SETUP.sql');

    console.log('\n🎉 SUMMARY:');
    console.log('============');
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🏪 Restaurant: ${targetRestaurant.name}`);
    console.log(`👑 Role: admin`);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Run the SQL in NEW_ADMIN_SETUP.sql in Supabase Dashboard');
    console.log('2. Test login in your app with the new credentials');

    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the script
createNewAdmin()
  .then(success => {
    if (success) {
      console.log('\n✅ Admin creation process completed!');
    } else {
      console.log('\n❌ Admin creation failed. Please check the errors above.');
    }
  })
  .catch(error => {
    console.error('Script error:', error);
  }); 