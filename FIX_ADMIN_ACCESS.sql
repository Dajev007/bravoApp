-- Fix Admin Access Issues
-- This script will temporarily disable RLS, insert the admin record, and fix policies

-- Step 1: Temporarily disable RLS on restaurant_admins to avoid recursion
ALTER TABLE restaurant_admins DISABLE ROW LEVEL SECURITY;

-- Step 2: Insert the admin record for the new user
INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
SELECT 
    au.id as user_id,
    '4608828b-a335-4b34-808c-53cb743cf1e1'::uuid as restaurant_id,
    'admin' as role,
    true as is_active
FROM auth.users au
WHERE au.email = '0771525093@bravonest.com'
ON CONFLICT (user_id, restaurant_id) DO UPDATE SET 
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Step 3: Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view restaurant_admins" ON restaurant_admins;
DROP POLICY IF EXISTS "Admins can insert restaurant_admins" ON restaurant_admins;
DROP POLICY IF EXISTS "Admins can update restaurant_admins" ON restaurant_admins;
DROP POLICY IF EXISTS "Admins can delete restaurant_admins" ON restaurant_admins;

-- Step 4: Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" ON restaurant_admins
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access for authenticated users" ON restaurant_admins
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access for authenticated users" ON restaurant_admins
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete access for authenticated users" ON restaurant_admins
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 5: Re-enable RLS
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the admin record was created
SELECT 
    'SUCCESS: Admin access granted!' as status,
    au.email,
    au.id as user_id,
    r.name as restaurant_name,
    ra.role,
    ra.is_active,
    ra.created_at
FROM restaurant_admins ra
JOIN auth.users au ON au.id = ra.user_id  
JOIN restaurants r ON r.id = ra.restaurant_id
WHERE au.email = '0771525093@bravonest.com';

-- Step 7: Show all admin records for verification
SELECT 
    au.email,
    r.name as restaurant,
    ra.role,
    ra.is_active,
    ra.created_at
FROM restaurant_admins ra
JOIN auth.users au ON au.id = ra.user_id  
JOIN restaurants r ON r.id = ra.restaurant_id
ORDER BY ra.created_at DESC; 