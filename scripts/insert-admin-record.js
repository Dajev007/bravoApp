const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function insertAdminRecord() {
  const email = '0771525093@bravonest.com';
  const userId = 'fceca404-2178-4ac1-aa35-9aee21ba44c1';
  const restaurantId = '4608828b-a335-4b34-808c-53cb743cf1e1'; // Green Leaf
  
  console.log('🔧 INSERTING ADMIN RECORD DIRECTLY');
  console.log('==================================');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 User ID: ${userId}`);
  console.log(`🏪 Restaurant ID: ${restaurantId}`);
  console.log('');

  try {
    // Step 1: Try to insert the admin record using raw SQL
    console.log('Step 1: Attempting to insert admin record...');
    
    const { data, error } = await supabase.rpc('insert_admin_record', {
      p_user_id: userId,
      p_restaurant_id: restaurantId,
      p_role: 'admin',
      p_is_active: true
    });

    if (error) {
      console.log('RPC method not available, trying direct insert...');
      
      // Try direct insert
      const { data: insertData, error: insertError } = await supabase
        .from('restaurant_admins')
        .insert([
          {
            user_id: userId,
            restaurant_id: restaurantId,
            role: 'admin',
            is_active: true
          }
        ])
        .select();

      if (insertError) {
        console.error('❌ Direct insert failed:', insertError.message);
        
        // Check if record already exists
        const { data: existingData, error: checkError } = await supabase
          .from('restaurant_admins')
          .select('*')
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId);

        if (checkError) {
          console.error('❌ Error checking existing records:', checkError.message);
          return false;
        }

        if (existingData && existingData.length > 0) {
          console.log('✅ Admin record already exists!');
          console.log('Existing record:', existingData[0]);
          return true;
        }

        return false;
      }

      console.log('✅ Admin record inserted successfully!');
      console.log('New record:', insertData[0]);
    } else {
      console.log('✅ Admin record inserted via RPC!');
      console.log('Result:', data);
    }

    // Step 2: Verify the record
    console.log('\nStep 2: Verifying admin record...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('restaurant_admins')
      .select(`
        *,
        restaurants (
          name,
          cuisine_type
        )
      `)
      .eq('user_id', userId);

    if (verifyError) {
      console.error('❌ Error verifying record:', verifyError.message);
      return false;
    }

    if (!verifyData || verifyData.length === 0) {
      console.error('❌ No admin records found for user');
      return false;
    }

    console.log('✅ Admin record verified!');
    console.log('Admin details:', verifyData[0]);

    console.log('\n🎉 SUCCESS!');
    console.log('============');
    console.log(`📱 Phone: 0771525093`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: 0771525093`);
    console.log(`🏪 Restaurant: ${verifyData[0].restaurants?.name || 'Green Leaf'}`);
    console.log(`👑 Role: ${verifyData[0].role}`);
    console.log('');
    console.log('✅ You can now access http://localhost:8084/admin');
    console.log('');
    console.log('🔄 Please restart your Expo app to refresh the authentication state');

    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the script
insertAdminRecord()
  .then(success => {
    if (success) {
      console.log('\n✅ Admin record insertion completed!');
    } else {
      console.log('\n❌ Admin record insertion failed. Please check the errors above.');
      console.log('\n📋 MANUAL ALTERNATIVE:');
      console.log('Run this SQL in your Supabase Dashboard:');
      console.log(`
INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
VALUES (
    'fceca404-2178-4ac1-aa35-9aee21ba44c1'::uuid,
    '4608828b-a335-4b34-808c-53cb743cf1e1'::uuid,
    'admin',
    true
) ON CONFLICT (user_id, restaurant_id) DO UPDATE SET 
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
      `);
    }
  })
  .catch(error => {
    console.error('Script error:', error);
  }); 