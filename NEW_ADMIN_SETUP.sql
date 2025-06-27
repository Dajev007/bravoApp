
-- Create admin record for user 0771525093@bravonest.com
INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
SELECT 
    au.id as user_id,
    '4608828b-a335-4b34-808c-53cb743cf1e1'::uuid as restaurant_id,
    'admin' as role,
    true as is_active
FROM auth.users au
WHERE au.email = '0771525093@bravonest.com'
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
WHERE au.email = '0771525093@bravonest.com';
    