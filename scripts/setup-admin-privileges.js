const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function setupAdminPrivileges() {
  const email = '0771525093@bravonest.com';
  const restaurantId = '4608828b-a335-4b34-808c-53cb743cf1e1'; // Green Leaf
  
  console.log('🔧 SETTING UP ADMIN PRIVILEGES');
  console.log('===============================');
  console.log(`📧 Email: ${email}`);
  console.log(`🏪 Restaurant: Green Leaf`);
  console.log('');

  try {
    // First, let's check if the user exists in auth
    console.log('Step 1: Checking if user exists...');
    
    // Try to sign in to verify the user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: '0771525093'
    });

    if (signInError) {
      console.error('❌ User authentication failed:', signInError.message);
      return false;
    }

    console.log('✅ User authenticated successfully!');
    console.log(`👤 User ID: ${signInData.user.id}`);

    // Step 2: Check if admin record already exists
    console.log('\nStep 2: Checking existing admin records...');
    
    const { data: existingAdmin, error: checkError } = await supabase
      .from('restaurant_admins')
      .select('*')
      .eq('user_id', signInData.user.id)
      .eq('restaurant_id', restaurantId);

    if (checkError) {
      console.error('❌ Error checking admin records:', checkError.message);
      return false;
    }

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Admin record already exists!');
      console.log('Admin details:', existingAdmin[0]);
      return true;
    }

    // Step 3: Create admin record
    console.log('\nStep 3: Creating admin record...');
    
    const { data: newAdmin, error: insertError } = await supabase
      .from('restaurant_admins')
      .insert([
        {
          user_id: signInData.user.id,
          restaurant_id: restaurantId,
          role: 'admin',
          is_active: true
        }
      ])
      .select();

    if (insertError) {
      console.error('❌ Error creating admin record:', insertError.message);
      
      // If it's a foreign key error, let's check what's wrong
      if (insertError.message.includes('foreign key')) {
        console.log('\n🔍 Debugging foreign key issue...');
        
        // Check if restaurant exists
        const { data: restaurant, error: restError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId);
          
        if (restError) {
          console.error('❌ Error checking restaurant:', restError.message);
        } else if (!restaurant || restaurant.length === 0) {
          console.error('❌ Restaurant not found with ID:', restaurantId);
        } else {
          console.log('✅ Restaurant exists:', restaurant[0].name);
        }
      }
      
      return false;
    }

    console.log('✅ Admin record created successfully!');
    console.log('New admin details:', newAdmin[0]);

    // Step 4: Verify the setup
    console.log('\nStep 4: Verifying admin setup...');
    
    const { data: verification, error: verifyError } = await supabase
      .from('restaurant_admins')
      .select(`
        *,
        restaurants (
          name,
          cuisine_type
        )
      `)
      .eq('user_id', signInData.user.id);

    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError.message);
      return false;
    }

    console.log('✅ Admin setup verified!');
    console.log('Admin access:', verification);

    console.log('\n🎉 SUCCESS!');
    console.log('============');
    console.log(`📱 Phone: 0771525093`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: 0771525093`);
    console.log(`🏪 Restaurant: Green Leaf`);
    console.log(`👑 Role: Admin`);
    console.log('');
    console.log('✅ You can now access http://localhost:8084/admin');

    // Sign out
    await supabase.auth.signOut();

    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the script
setupAdminPrivileges()
  .then(success => {
    if (success) {
      console.log('\n✅ Admin privileges setup completed!');
    } else {
      console.log('\n❌ Admin privileges setup failed. Please check the errors above.');
    }
  })
  .catch(error => {
    console.error('Script error:', error);
  }); 