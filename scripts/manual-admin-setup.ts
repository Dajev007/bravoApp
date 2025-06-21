import { 
  createRestaurantAdmin, 
  quickAdminSetup, 
  checkUserAdminStatus,
  createTestRestaurant,
  listRestaurantAdmins
} from '../lib/admin-setup';

/**
 * Manual Admin Setup Examples
 * 
 * Use these functions to manually create and manage admin accounts
 */

async function exampleSetup() {
  try {
    // Example 1: Quick setup with new restaurant
    console.log('=== Example 1: Quick Setup ===');
    await quickAdminSetup('+1234567890', 'My Test Restaurant');
    
    // Example 2: Add admin to existing restaurant
    console.log('\n=== Example 2: Add Admin to Existing Restaurant ===');
    const restaurantId = '6932e569-6b87-487c-aae1-f8496075fecf'; // Taco Fiesta ID
    await createRestaurantAdmin('+0987654321', restaurantId, 'manager');
    
    // Example 3: Check admin status
    console.log('\n=== Example 3: Check Admin Status ===');
    await checkUserAdminStatus('+1234567890');
    
    // Example 4: List all admins for a restaurant
    console.log('\n=== Example 4: List Restaurant Admins ===');
    await listRestaurantAdmins(restaurantId);
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Uncomment to run examples
// exampleSetup();

export { exampleSetup }; 